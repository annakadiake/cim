from django.contrib import admin
from .models import Patient, PatientAccess
from core.admin_search import AdvancedSearchMixin, BulkActionsMixin, SearchStatsAdmin

@admin.register(Patient)
class PatientAdmin(AdvancedSearchMixin, BulkActionsMixin, SearchStatsAdmin, admin.ModelAdmin):
    list_display = ['full_name', 'phone_number', 'gender', 'date_of_birth', 'created_at']
    list_filter = ['gender', 'created_at']
    search_fields = ['first_name', 'last_name', 'phone_number', 'email', 'address']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(PatientAccess)
class PatientAccessAdmin(AdvancedSearchMixin, BulkActionsMixin, SearchStatsAdmin, admin.ModelAdmin):
    list_display = ['patient', 'access_key', 'password', 'is_active', 'access_count', 'last_accessed', 'created_at']
    list_filter = ['is_active', 'created_at', 'sent_via_email', 'sent_via_sms']
    search_fields = ['patient__first_name', 'patient__last_name', 'access_key', 'patient__phone_number']
    readonly_fields = ['access_key', 'password', 'access_count', 'last_accessed', 'created_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Informations Patient', {
            'fields': ('patient', 'created_by')
        }),
        ('Accès', {
            'fields': ('access_key', 'password', 'is_active')
        }),
        ('Utilisation', {
            'fields': ('access_count', 'last_accessed')
        }),
        ('Notifications', {
            'fields': ('sent_via_email', 'sent_via_sms')
        }),
    )

