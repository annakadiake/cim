from django.contrib import admin
from django.contrib import messages
from django.utils.html import format_html
from .models import PatientReport, PatientAccess


@admin.register(PatientReport)
class PatientReportAdmin(admin.ModelAdmin):
    list_display = [
        'patient_name', 
        'access_key', 
        'report_file', 
        'created_at', 
        'get_expires_at',
        'is_active', 
        'download_count'
    ]
    
    list_filter = [
        'is_active', 
        'created_at'
    ]
    
    search_fields = [
        'patient_access__patient__full_name', 
        'patient_access__access_key'
    ]
    
    readonly_fields = [
        'patient_name',
        'access_key', 
        'created_at', 
        'download_count',
        'get_expires_at'
    ]
    
    def get_expires_at(self, obj):
        return "Accès permanent"
    get_expires_at.short_description = 'Type d\'accès'
    
    fieldsets = (
        ('Informations Patient', {
            'fields': ('patient_access', 'patient_name', 'access_key')
        }),
        ('Fichier', {
            'fields': ('report_file',)
        }),
        ('Paramètres', {
            'fields': ('is_active',)
        }),
        ('Statistiques', {
            'fields': ('created_at', 'download_count'),
            'classes': ('collapse',)
        }),
    )
    
    def is_accessible(self, obj):
        return obj.is_accessible
    is_accessible.boolean = True
    is_accessible.short_description = 'Accessible'
    
    actions = ['make_active', 'make_inactive', 'extend_expiry', 'validate_keys_action', 'check_invoice_match']
    
    def make_active(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f'{queryset.count()} comptes rendus activés.')
    make_active.short_description = 'Activer les comptes rendus sélectionnés'
    
    def make_inactive(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f'{queryset.count()} comptes rendus désactivés.')
    make_inactive.short_description = 'Désactiver les comptes rendus sélectionnés'
    
    def extend_expiry(self, request, queryset):
        from datetime import datetime, timedelta
        new_expiry = datetime.now() + timedelta(days=90)
        queryset.update(expires_at=new_expiry)
        self.message_user(request, f'Expiration prolongée de 3 mois pour {queryset.count()} comptes rendus.')
    extend_expiry.short_description = 'Prolonger l\'expiration de 3 mois'
    
    def validate_keys_action(self, request, queryset):
        """Valide les clés pour les comptes rendus sélectionnés"""
        valid_count = 0
        invalid_count = 0
        
        for report in queryset:
            try:
                # Forcer la validation lors de la sauvegarde
                report.save()
                valid_count += 1
            except Exception as e:
                invalid_count += 1
                messages.error(request, f'Erreur pour {report.patient_name}: {str(e)}')
        
        if valid_count > 0:
            messages.success(request, f'{valid_count} comptes rendus validés et activés.')
        if invalid_count > 0:
            messages.warning(request, f'{invalid_count} comptes rendus ont des erreurs de validation.')
    
    validate_keys_action.short_description = 'Valider les clés et activer automatiquement'
    
    def check_invoice_match(self, request, queryset):
        """Vérifie la correspondance avec les factures"""
        matched_count = 0
        unmatched_count = 0
        
        for report in queryset:
            is_valid, message = report.validate_invoice_key_match()
            if is_valid:
                matched_count += 1
                messages.success(request, f'{report.patient_name}: {message}')
            else:
                unmatched_count += 1
                messages.warning(request, f'{report.patient_name}: {message}')
        
        if matched_count > 0:
            messages.info(request, f'{matched_count} comptes rendus correspondent à une facture.')
        if unmatched_count > 0:
            messages.warning(request, f'{unmatched_count} comptes rendus sans facture correspondante.')
    
    check_invoice_match.short_description = 'Vérifier la correspondance avec les factures'
    
    def get_list_display(self, request):
        """Ajoute des colonnes dynamiques pour afficher le statut de validation"""
        return self.list_display + ['invoice_status', 'key_validation_status']
    
    def invoice_status(self, obj):
        """Affiche le statut de la facture associée"""
        from invoices.models import Invoice
        invoice = Invoice.objects.filter(patient_access=obj.patient_access).first()
        if invoice:
            color = 'green' if invoice.status == 'paid' else 'orange' if invoice.status == 'partially_paid' else 'red'
            return format_html(
                '<span style="color: {};">\u2022 {} ({})</span>',
                color,
                invoice.invoice_number,
                invoice.get_status_display()
            )
        return format_html('<span style="color: red;">\u2717 Aucune facture</span>')
    
    invoice_status.short_description = 'Statut Facture'
    invoice_status.allow_tags = True
    
    def key_validation_status(self, obj):
        """Affiche le statut de validation des clés"""
        try:
            is_valid, message = obj.validate_invoice_key_match()
            if is_valid:
                return format_html('<span style="color: green;">\u2713 Validé</span>')
            else:
                return format_html('<span style="color: red;">\u2717 Invalide</span>')
        except Exception:
            return format_html('<span style="color: orange;">\u26A0 Erreur</span>')
    
    key_validation_status.short_description = 'Validation Clés'
    key_validation_status.allow_tags = True
