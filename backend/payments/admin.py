from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.http import HttpResponse
from .models import Payment
from .utils import generate_payment_receipt_pdf

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'receipt_number', 'invoice_link', 'patient_name', 'amount_display', 
        'payment_method', 'payment_date', 'status_display', 'recorded_by'
    ]
    list_filter = ['status', 'payment_method', 'payment_date', 'created_at']
    search_fields = [
        'invoice__invoice_number', 'invoice__patient__full_name',
        'reference_number', 'transaction_id', 'receipt_number', 'phone_number'
    ]
    readonly_fields = ['receipt_number', 'created_at', 'updated_at', 'remaining_amount', 'is_partial_payment']
    date_hierarchy = 'payment_date'
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('invoice', 'amount', 'payment_method', 'payment_date', 'status')
        }),
        ('Références et identifiants', {
            'fields': ('reference_number', 'transaction_id', 'receipt_number')
        }),
        ('Mobile Money (si applicable)', {
            'fields': ('phone_number', 'operator_reference'),
            'classes': ('collapse',)
        }),
        ('Informations complémentaires', {
            'fields': ('notes', 'recorded_by')
        }),
        ('Calculs automatiques', {
            'fields': ('remaining_amount', 'is_partial_payment'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['generate_receipts']
    
    def invoice_link(self, obj):
        url = reverse('admin:invoices_invoice_change', args=[obj.invoice.id])
        return format_html('<a href="{}">{}</a>', url, obj.invoice.invoice_number)
    invoice_link.short_description = 'Facture'
    
    def patient_name(self, obj):
        return obj.invoice.patient.full_name
    patient_name.short_description = 'Patient'
    
    def amount_display(self, obj):
        if obj.amount is None:
            return format_html('<strong>-</strong>')
        try:
            # Convertir en float puis en int pour s'assurer que c'est un nombre
            amount = float(obj.amount)
            return format_html('<strong>{:,.0f} FCFA</strong>', amount)
        except (ValueError, TypeError):
            return format_html('<strong>Invalide</strong>')
    amount_display.short_description = 'Montant'
    amount_display.admin_order_field = 'amount'
    
    def status_display(self, obj):
        colors = {
            'completed': 'green',
            'pending': 'orange',
            'failed': 'red',
            'cancelled': 'grey',
            'refunded': 'blue'
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_display.short_description = 'Statut'
    
    def generate_receipts(self, request, queryset):
        """Action pour générer les reçus PDF des paiements sélectionnés"""
        completed_payments = queryset.filter(status='completed')
        
        if completed_payments.count() == 1:
            # Un seul paiement : télécharger directement le PDF
            payment = completed_payments.first()
            try:
                pdf_content = generate_payment_receipt_pdf(payment)
                response = HttpResponse(pdf_content, content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="recu_{payment.receipt_number}.pdf"'
                return response
            except Exception as e:
                self.message_user(request, f'Erreur lors de la génération du PDF: {str(e)}', level='ERROR')
        else:
            # Plusieurs paiements : créer un ZIP avec tous les PDFs
            import zipfile
            from io import BytesIO
            
            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
                for payment in completed_payments:
                    try:
                        pdf_content = generate_payment_receipt_pdf(payment)
                        zip_file.writestr(f'recu_{payment.receipt_number}.pdf', pdf_content)
                    except Exception as e:
                        self.message_user(request, f'Erreur pour le paiement {payment.id}: {str(e)}', level='WARNING')
            
            response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
            response['Content-Disposition'] = 'attachment; filename="reçus_paiements.zip"'
            return response
    
    generate_receipts.short_description = "Générer les reçus PDF"