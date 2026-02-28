from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.lib.units import cm
from io import BytesIO
import os
from django.conf import settings


def generate_pdf_invoice(invoice, patient_access_keys=None):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm)
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#3F4A1F'),
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#374151'),
        alignment=TA_LEFT
    )
    
    # Content
    content = []
    
    # Header avec logo
    try:
        # Essayer d'abord le logo personnalisé depuis les paramètres
        custom_logo_path = getattr(settings, 'CUSTOM_INVOICE_LOGO_PATH', None)
        if custom_logo_path and os.path.exists(custom_logo_path):
            logo = Image(custom_logo_path, width=3.5*cm, height=3.5*cm)
        else:
            # Fallback vers le logo dans assets/images
            logo_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'src', 'assets', 'images', 'logo-invoice.png')
            if os.path.exists(logo_path):
                logo = Image(logo_path, width=3.5*cm, height=3.5*cm)
            else:
                # Dernier fallback vers l'ancien logo
                old_logo_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'src', 'assets', 'images', 'cimef.png')
                if os.path.exists(old_logo_path):
                    logo = Image(old_logo_path, width=3.5*cm, height=3.5*cm)
                else:
                    logo = None
    except:
        logo = None
    
    if logo:
        header_data = [
            [logo, f'Facture N°: {invoice.invoice_number}'],
            ['CIMEF', f'Date: {invoice.invoice_date.strftime("%d/%m/%Y")}'],
            ['Tivaouane, Senegal', f'Échéance: {invoice.due_date.strftime("%d/%m/%Y")}'],
            ['Tél: +221 77 300 26 97/+221 76 655 55 56', ''],
            ['Email: cimeftivaouane@gmail.com', '']
        ]
    else:
        header_data = [
            ['CIMEF', ''],
            ['CIMEF', f'Facture N°: {invoice.invoice_number}'],
            ['Tivaouane, Senegal', f'Date: {invoice.invoice_date.strftime("%d/%m/%Y")}'],
            ['Tél: +221 77 300 26 97/+221 76 655 55 56', f'Échéance: {invoice.due_date.strftime("%d/%m/%Y")}'],
            ['Email: cimeftivaouane@gmail.sn', '']
        ]
    
    header_table = Table(header_data, colWidths=[10*cm, 8*cm])
    header_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (0, 0), 16),
        ('TEXTCOLOR', (0, 0), (0, 0), colors.HexColor('#636B2F')),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    
    content.append(header_table)
    content.append(Spacer(1, 1*cm))
    
    # Patient info
    patient_title = Paragraph('<b>INFORMATIONS PATIENT</b>', header_style)
    content.append(patient_title)
    
    patient_data = [
        ['Nom:', invoice.patient.full_name],
        ['Téléphone:', invoice.patient.phone_number],
        ['Date de naissance:', invoice.patient.date_of_birth.strftime('%d/%m/%Y')],
    ]
    
    patient_table = Table(patient_data, colWidths=[4*cm, 10*cm])
    patient_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
    ]))
    
    content.append(patient_table)
    content.append(Spacer(1, 1*cm))
    
    # Section clés d'accès patient (TOUJOURS affichée pour debug)
    print(f"DEBUG PDF: patient_access_keys = {patient_access_keys}")
    
    # Forcer l'affichage des clés même si None pour debug
    keys_title = Paragraph('<b>🔑 CLÉS D\'ACCÈS PATIENT</b>', 
                          ParagraphStyle(
                              'KeysTitle',
                              parent=styles['Normal'],
                              fontSize=14,
                              textColor=colors.HexColor('#3F4A1F'),
                              alignment=TA_LEFT,
                              fontName='Helvetica-Bold'
                          ))
    content.append(keys_title)
    content.append(Spacer(1, 0.3*cm))
    
    if patient_access_keys:
        keys_data = [
            ['Identifiant:', patient_access_keys.get('access_key', 'N/A')],
            ['Mot de passe:', patient_access_keys.get('password', 'N/A')],
            ['Valide jusqu\'au:', patient_access_keys.get('valid_until', 'N/A')]
        ]
    else:
        keys_data = [
            ['Identifiant:', 'ERREUR - Clés non générées'],
            ['Mot de passe:', 'ERREUR - Clés non générées'],
            ['Valide jusqu\'au:', 'ERREUR - Clés non générées']
        ]
    
    keys_table = Table(keys_data, colWidths=[4*cm, 10*cm])
    keys_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f6f8f0')),
        ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#3F4A1F')),
        ('INNERGRID', (0, 0), (-1, -1), 1, colors.HexColor('#3F4A1F')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    content.append(keys_table)
    content.append(Spacer(1, 1*cm))
    
    # Items table
    items_title = Paragraph('<b>DÉTAIL DES EXAMENS</b>', header_style)
    content.append(items_title)
    content.append(Spacer(1, 0.5*cm))
    
    # Table headers
    items_data = [['Examen', 'Quantité', 'Prix unitaire (FCFA)', 'Total (FCFA)']]
    
    # Table data
    for item in invoice.items.all():
        items_data.append([
            item.exam_type.name,
            str(item.quantity),
            f'{int(item.unit_price):,}',
            f'{int(item.total_price):,}'
        ])
    
    items_table = Table(items_data, colWidths=[8*cm, 2*cm, 4*cm, 4*cm])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#636B2F')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
    ]))
    
    content.append(items_table)
    content.append(Spacer(1, 1*cm))
    
    # Totals
    totals_data = [
        ['Sous-total:', f'{int(invoice.subtotal):,} FCFA'],
        [f'TVA ({invoice.tax_rate}%):', f'{int(invoice.tax_amount):,} FCFA'],
        ['TOTAL:', f'{int(invoice.total_amount):,} FCFA']
    ]
    
    totals_table = Table(totals_data, colWidths=[12*cm, 6*cm])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -2), 'Helvetica'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#3F4A1F')),
        ('LINEABOVE', (0, -1), (-1, -1), 2, colors.HexColor('#3F4A1F')),
    ]))
    
    content.append(totals_table)
    content.append(Spacer(1, 2*cm))
    
    # Footer
    footer = Paragraph(
        '<b>Merci de votre confiance!</b><br/>'
        'Paiement par espèces, chèque ou virement bancaire.<br/>'
        ,
        ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#6b7280')
        )
    )
    content.append(footer)
    
    # Build PDF
    doc.build(content)
    buffer.seek(0)
    return buffer.getvalue()