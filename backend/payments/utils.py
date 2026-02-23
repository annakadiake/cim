from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from django.conf import settings
from datetime import datetime

def generate_payment_receipt_pdf(payment):
    """
    Génère un reçu de paiement en PDF
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72,
                           topMargin=72, bottomMargin=18)
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#3F4A1F')
    )
    
    header_style = ParagraphStyle(
        'CustomHeader',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=12,
        textColor=colors.HexColor('#3F4A1F')
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=6
    )
    
    # Contenu du PDF
    story = []
    
    # En-tête
    story.append(Paragraph("REÇU DE PAIEMENT", title_style))
    story.append(Spacer(1, 20))
    
    # Informations du cabinet
    cabinet_info = [
        ["Cabinet Médical CIMEF", ""],
        [f"Reçu N°: {payment.receipt_number}", f"Date: {payment.payment_date.strftime('%d/%m/%Y %H:%M')}"],
    ]
    
    cabinet_table = Table(cabinet_info, colWidths=[3*inch, 3*inch])
    cabinet_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    
    story.append(cabinet_table)
    story.append(Spacer(1, 20))
    
    # Informations patient
    story.append(Paragraph("INFORMATIONS PATIENT", header_style))
    
    patient_info = [
        ["Nom complet:", payment.invoice.patient.full_name],
        ["Téléphone:", payment.invoice.patient.phone or "Non renseigné"],
        ["Facture N°:", payment.invoice.invoice_number],
        ["Date facture:", payment.invoice.invoice_date.strftime('%d/%m/%Y')],
    ]
    
    patient_table = Table(patient_info, colWidths=[2*inch, 4*inch])
    patient_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    
    story.append(patient_table)
    story.append(Spacer(1, 20))
    
    # Détails du paiement
    story.append(Paragraph("DÉTAILS DU PAIEMENT", header_style))
    
    payment_details = [
        ["Mode de paiement:", payment.get_payment_method_display()],
        ["Montant payé:", f"{payment.amount:,.0f} FCFA"],
        ["Statut:", payment.get_status_display()],
    ]
    
    if payment.reference_number:
        payment_details.append(["Référence:", payment.reference_number])
    
    if payment.transaction_id:
        payment_details.append(["ID Transaction:", payment.transaction_id])
    
    if payment.phone_number:
        payment_details.append(["Téléphone (Mobile Money):", payment.phone_number])
    
    if payment.operator_reference:
        payment_details.append(["Référence opérateur:", payment.operator_reference])
    
    payment_table = Table(payment_details, colWidths=[2*inch, 4*inch])
    payment_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    
    story.append(payment_table)
    story.append(Spacer(1, 20))
    
    # Résumé financier
    story.append(Paragraph("RÉSUMÉ FINANCIER", header_style))
    
    # Calculer les totaux
    from django.db import models
    total_payments = payment.invoice.payments.filter(status='completed').aggregate(
        total=models.Sum('amount')
    )['total'] or 0
    
    remaining = payment.invoice.total_amount - total_payments
    
    financial_summary = [
        ["Montant total facture:", f"{payment.invoice.total_amount:,.0f} FCFA"],
        ["Total payé:", f"{total_payments:,.0f} FCFA"],
        ["Montant restant:", f"{remaining:,.0f} FCFA"],
        ["Statut facture:", payment.invoice.get_status_display()],
    ]
    
    financial_table = Table(financial_summary, colWidths=[2*inch, 4*inch])
    financial_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, -1), (1, -1), 'Helvetica-Bold'),  # Montant restant en gras
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (-1, -1), (-1, -1), colors.lightgrey if remaining > 0 else colors.lightgreen),
    ]))
    
    story.append(financial_table)
    story.append(Spacer(1, 30))
    
    # Notes
    if payment.notes:
        story.append(Paragraph("NOTES", header_style))
        story.append(Paragraph(payment.notes, normal_style))
        story.append(Spacer(1, 20))
    
    # Pied de page
    footer_text = f"""
    <para align="center">
    <b>Merci pour votre confiance</b><br/>
    Reçu généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}<br/>
    Par: {payment.recorded_by.get_full_name() or payment.recorded_by.username}
    </para>
    """
    
    story.append(Spacer(1, 20))
    story.append(Paragraph(footer_text, normal_style))
    
    # Construire le PDF
    doc.build(story)
    
    # Récupérer le contenu
    pdf_content = buffer.getvalue()
    buffer.close()
    
    return pdf_content

def calculate_payment_statistics(start_date=None, end_date=None):
    """
    Calcule les statistiques de paiement pour une période donnée
    """
    from django.db.models import Sum, Count, Q
    from django.utils import timezone
    from datetime import timedelta
    from .models import Payment
    
    if not start_date:
        start_date = timezone.now() - timedelta(days=30)
    if not end_date:
        end_date = timezone.now()
    
    payments = Payment.objects.filter(
        status='completed',
        payment_date__range=[start_date, end_date]
    )
    
    stats = payments.aggregate(
        total_amount=Sum('amount'),
        total_count=Count('id'),
        cash_amount=Sum('amount', filter=Q(payment_method='cash')),
        cash_count=Count('id', filter=Q(payment_method='cash')),
        mobile_money_amount=Sum('amount', filter=Q(
            payment_method__in=['mobile_money', 'orange_money', 'wave', 'free_money']
        )),
        mobile_money_count=Count('id', filter=Q(
            payment_method__in=['mobile_money', 'orange_money', 'wave', 'free_money']
        )),
        bank_transfer_amount=Sum('amount', filter=Q(payment_method='bank_transfer')),
        bank_transfer_count=Count('id', filter=Q(payment_method='bank_transfer')),
        check_amount=Sum('amount', filter=Q(payment_method='check')),
        check_count=Count('id', filter=Q(payment_method='check')),
    )
    
    # Remplacer les None par 0
    for key, value in stats.items():
        if value is None:
            stats[key] = 0
    
    return stats
