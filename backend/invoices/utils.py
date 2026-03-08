from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.lib.units import cm, mm
from reportlab.platypus import Table, TableStyle, Paragraph, Spacer, Image, Frame, KeepInFrame
from reportlab.pdfgen import canvas
from io import BytesIO
import os
from datetime import date
from django.conf import settings


def _get_logo():
    """Récupère le logo pour la facture"""
    try:
        custom_logo_path = getattr(settings, 'CUSTOM_INVOICE_LOGO_PATH', None)
        if custom_logo_path and os.path.exists(custom_logo_path):
            return Image(custom_logo_path, width=2.5*cm, height=2.5*cm)
        logo_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'src', 'assets', 'images', 'logo-invoice.png')
        if os.path.exists(logo_path):
            return Image(logo_path, width=2.5*cm, height=2.5*cm)
        old_logo_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'src', 'assets', 'images', 'cimef.png')
        if os.path.exists(old_logo_path):
            return Image(old_logo_path, width=2.5*cm, height=2.5*cm)
    except:
        pass
    return None


def _build_invoice_story(invoice, patient_access_keys=None):
    """Construit le contenu d'une copie de facture (compact pour demi-page A4)"""
    styles = getSampleStyleSheet()
    
    header_style = ParagraphStyle(
        'Header', parent=styles['Normal'], fontSize=8,
        textColor=colors.HexColor('#374151'), alignment=TA_LEFT, leading=10
    )
    small_style = ParagraphStyle(
        'Small', parent=styles['Normal'], fontSize=7,
        textColor=colors.HexColor('#6b7280'), leading=9
    )
    
    story = []
    logo = _get_logo()
    
    # Header compact avec alignement parfait
    right_info = (
        f'<b>Facture N°:</b> {invoice.invoice_number}<br/>'
        f'<b>Date:</b> {invoice.invoice_date.strftime("%d/%m/%Y")}'
    )
    right_para = Paragraph(right_info, ParagraphStyle(
        'RightInfo', parent=styles['Normal'], fontSize=8, alignment=TA_RIGHT, leading=10
    ))
    
    left_info = (
        '<b>CIMEF</b><br/>'
        'Tivaouane, Senegal<br/>'
        'Tél: +221 77 300 26 97 / +221 76 655 55 56<br/>'
        'Email: cimeftivaouane@gmail.com'
    )
    left_para = Paragraph(left_info, ParagraphStyle(
        'LeftInfo', parent=styles['Normal'], fontSize=7, leading=9,
        textColor=colors.HexColor('#374151')
    ))
    
    if logo:
        header_data = [[logo, left_para, right_para]]
        header_table = Table(header_data, colWidths=[3*cm, 8*cm, 7*cm])
    else:
        header_data = [[left_para, right_para]]
        header_table = Table(header_data, colWidths=[10*cm, 8*cm])
    
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),  # Alignement vertical au milieu
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),   # Logo centré
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),     # Infos CIMEF à gauche
        ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),  # Numéro/date à droite
        ('TOPPADDING', (0, 0), (-1, -1), 8),    # Padding supérieur
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8), # Padding inférieur
    ]))
    story.append(header_table)
    story.append(Spacer(1, 4*mm))
    
    # Ligne séparatrice
    line_data = [['', '']]
    line_table = Table(line_data, colWidths=[18*cm])
    line_table.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor('#636B2F')),
    ]))
    story.append(line_table)
    story.append(Spacer(1, 3*mm))
    
    # Patient info compact
    age = invoice.patient.age or 0
    patient_info = Paragraph(
        f'<b>Patient:</b> {invoice.patient.full_name} &nbsp;&nbsp; '
        f'<b>Tél:</b> {invoice.patient.phone_number or "—"} &nbsp;&nbsp; '
        f'<b>Âge:</b> {age} ans',
        ParagraphStyle('PatientInfo', parent=styles['Normal'], fontSize=8, leading=10)
    )
    story.append(patient_info)
    story.append(Spacer(1, 4*mm))
    
    # Items table compact
    items_data = [['Examen', 'Qté', 'Prix unit. (FCFA)', 'Remise (FCFA)', 'Total (FCFA)']]
    
    # Récupérer la remise totale une seule fois
    from payments.models import Payment
    payments_with_discount = Payment.objects.filter(invoice=invoice.id, discount__gt=0, status='completed')
    total_discount = sum(p.discount for p in payments_with_discount) if payments_with_discount else 0
    
    # Calculer la répartition de la remise
    items_list = list(invoice.items.all())
    remaining_discount = total_discount
    
    for i, item in enumerate(items_list):
        # Calculer la remise pour cet article
        discount = 0
        try:
            if total_discount > 0 and invoice.total_amount > 0:
                invoice_total = float(invoice.total_amount)
                item_total = float(item.total_price)
                
                # Pour le dernier article, mettre toute la remise restante
                if i == len(items_list) - 1:
                    discount = remaining_discount
                else:
                    # Calcul proportionnel pour les autres articles
                    discount = round((item_total / invoice_total) * total_discount)
                    remaining_discount -= discount
                    
        except Exception:
            pass
        
        items_data.append([
            Paragraph(item.description or (item.exam_type.name if item.exam_type else 'Article'),
                      ParagraphStyle('ItemDesc', parent=styles['Normal'], fontSize=7, leading=9)),
            str(item.quantity),
            f'{int(item.unit_price):,}',
            f'{discount:,}' if discount > 0 else '0',
            f'{int(item.total_price):,}'
        ])
    
    items_table = Table(items_data, colWidths=[6*cm, 1.5*cm, 3.5*cm, 3.5*cm, 3.5*cm])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#636B2F')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 3),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 3*mm))
    
    # Coverage
    coverage = 0
    coverage_name = ''
    total_discount = 0
    try:
        last_payment = invoice.payments.filter(status='completed', coverage_percentage__gt=0).order_by('-created_at').first()
        if last_payment:
            coverage = float(last_payment.coverage_percentage)
            coverage_name = last_payment.coverage_name or ''
        
        # Calculer la remise totale
        discount_payments = invoice.payments.filter(status='completed', discount__gt=0)
        total_discount = sum(p.discount for p in discount_payments) if discount_payments else 0
    except Exception:
        pass
    
    coverage_amount = int(float(invoice.total_amount) * coverage / 100) if coverage > 0 else 0
    patient_amount = int(float(invoice.total_amount)) - coverage_amount - total_discount
    
    # Totals compact
    totals_data = [
        ['Montant HT:', f'{int(invoice.subtotal):,} FCFA'],
        [f'TVA ({invoice.tax_rate}%) incluse:', f'{int(invoice.tax_amount):,} FCFA'],
        ['TOTAL TTC:', f'{int(invoice.total_amount):,} FCFA'],
    ]
    
    # Ajouter la remise avec style spécial
    if total_discount > 0:
        totals_data.append(['💰 REMISE APPLIQUÉE:', f'-{total_discount:,} FCFA'])
    
    if coverage > 0:
        coverage_label = f'Prise en charge ({int(coverage)}%)'
        if coverage_name:
            coverage_label += f' - {coverage_name}'
        totals_data.append([f'{coverage_label}:', f'-{coverage_amount:,} FCFA'])
    
    # Toujours afficher le montant à payer
    totals_data.append(['MONTANT À PAYER:', f'{patient_amount:,} FCFA'])
    
    # Calculer l'index de la ligne de remise pour le style spécial
    discount_row_index = -1
    if total_discount > 0:
        discount_row_index = 3  # Après Montant HT, TVA, TOTAL TTC
    
    totals_table = Table(totals_data, colWidths=[12*cm, 6*cm])
    totals_style = [
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -2), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]
    
    # Style spécial pour la ligne de remise
    if discount_row_index >= 0:
        totals_style.extend([
            ('TEXTCOLOR', (0, discount_row_index), (-1, discount_row_index), colors.white),
            ('FONTNAME', (0, discount_row_index), (-1, discount_row_index), 'Helvetica-Bold'),
            ('BACKGROUND', (0, discount_row_index), (-1, discount_row_index), colors.HexColor('#7a8345')),
        ])
    
    # Style pour la dernière ligne (MONTANT À PAYER)
    totals_style.extend([
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#3F4A1F')),
        ('LINEABOVE', (0, -1), (-1, -1), 1.5, colors.HexColor('#3F4A1F')),
    ])
    totals_table.setStyle(TableStyle(totals_style))
    story.append(totals_table)
    story.append(Spacer(1, 3*mm))
    
    # Footer compact
    footer = Paragraph(
        '<b>Merci de votre confiance!</b> — Paiement par espèces, chèque ou virement bancaire.<br/>'
        '<b>RCCM:</b> SN.THIES.2025.B.6374 &nbsp;&nbsp; <b>NINEA:</b> 012704070',
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=7, alignment=TA_CENTER,
                       textColor=colors.HexColor('#6b7280'))
    )
    story.append(footer)
    
    return story


def generate_pdf_invoice(invoice, patient_access_keys=None):
    """Génère un PDF avec 2 copies de la facture sur la même page A4 (haut et bas)"""
    buffer = BytesIO()
    page_w, page_h = A4
    margin = 1.2 * cm
    half_h = page_h / 2
    frame_w = page_w - 2 * margin
    frame_h = half_h - margin - 5*mm  # espace pour la ligne de coupe
    
    c = canvas.Canvas(buffer, pagesize=A4)
    
    # Construire le contenu une seule fois
    story = _build_invoice_story(invoice, patient_access_keys)
    
    # Dessiner la copie du haut
    top_frame = Frame(margin, half_h + 3*mm, frame_w, frame_h, showBoundary=0)
    top_frame.addFromList(list(story), c)
    
    # Ligne de coupe (pointillée au milieu)
    c.saveState()
    c.setStrokeColor(colors.HexColor('#9ca3af'))
    c.setLineWidth(0.5)
    c.setDash(4, 4)
    c.line(margin, half_h, page_w - margin, half_h)
    # Texte "✂ Couper ici"
    c.setFont('Helvetica', 7)
    c.setFillColor(colors.HexColor('#9ca3af'))
    c.drawCentredString(page_w / 2, half_h + 2, '- - - - - - - - - -  Couper ici  - - - - - - - - - -')
    c.restoreState()
    
    # Dessiner la copie du bas (recréer le story car addFromList consomme la liste)
    story2 = _build_invoice_story(invoice, patient_access_keys)
    bottom_frame = Frame(margin, margin, frame_w, frame_h, showBoundary=0)
    bottom_frame.addFromList(list(story2), c)
    
    c.save()
    buffer.seek(0)
    return buffer.getvalue()