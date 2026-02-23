from django.contrib import admin
from .models import Invoice, InvoiceItem

class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'patient', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['invoice_number', 'patient__first_name', 'patient__last_name']
    readonly_fields = ['invoice_number', 'total_amount', 'created_at', 'updated_at']
    inlines = [InvoiceItemInline]
    ordering = ['-created_at']

@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = ['invoice', 'exam_type', 'quantity', 'unit_price', 'total_price']
    list_filter = ['exam_type', 'invoice__status']
    search_fields = ['invoice__invoice_number', 'exam_type__name']
    readonly_fields = ['total_price']
    
    class Media:
        js = ('admin/js/invoice_item.js',)
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Pré-remplir le prix unitaire avec le prix de l'examen sélectionné
        if 'exam_type' in form.base_fields:
            form.base_fields['exam_type'].help_text = "Le prix unitaire sera automatiquement rempli"
        return form
    
    def save_model(self, request, obj, form, change):
        # Si pas de prix unitaire défini, utiliser le prix de l'examen
        if not obj.unit_price and obj.exam_type:
            obj.unit_price = obj.exam_type.price
        super().save_model(request, obj, form, change)