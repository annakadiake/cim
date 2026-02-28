from decimal import Decimal
from django.db import models
from django.conf import settings
from patients.models import Patient, PatientAccess
from exams.models import ExamType
from datetime import datetime, timedelta
from django.utils import timezone

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('sent', 'Envoyée'),
        ('partially_paid', 'Partiellement payée'),
        ('paid', 'Payée'),
        ('cancelled', 'Annulée'),
    ]
    
    invoice_number = models.CharField(max_length=20, unique=True, verbose_name="Numéro de facture")
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, verbose_name="Patient")
    patient_access = models.ForeignKey(
        PatientAccess, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        verbose_name="Accès patient",
        help_text="Clés d'accès générées pour cette facture"
    )
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Créée par")
    
    invoice_date = models.DateField(verbose_name="Date de facturation")
    due_date = models.DateField(verbose_name="Date d'échéance")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='sent', verbose_name="Statut")
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Sous-total")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00, verbose_name="Taux de taxe (%)")
    tax_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Montant de taxe")
    total_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Montant total")
    
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Facture"
        verbose_name_plural = "Factures"
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['status']),
            models.Index(fields=['invoice_date']),
            models.Index(fields=['total_amount']),
            models.Index(fields=['created_at']),
            models.Index(fields=['patient', 'status']),
        ]
    
    def __str__(self):
        return f"Facture {self.invoice_number} - {self.patient.full_name}"
    
    def save(self, *args, **kwargs):
        if not self.invoice_number:
            # Generate invoice number
            last_invoice = Invoice.objects.order_by('-id').first()
            if last_invoice:
                last_number = int(last_invoice.invoice_number.split('-')[-1])
                self.invoice_number = f"FAC-{last_number + 1:06d}"
            else:
                self.invoice_number = "FAC-000001"
        
        # Recalculer les totaux seulement si update_fields n'est pas spécifié
        # (évite d'écraser les valeurs calculées manuellement dans perform_create)
        update_fields = kwargs.get('update_fields')
        if update_fields is None and self.pk:
            # Calculate total, then extract tax (TVA incluse dans le prix)
            # Le prix de l'examen EST le prix TTC
            self.total_amount = sum(item.total_price for item in self.items.all())
            if self.total_amount > 0:
                self.subtotal = round(self.total_amount / (1 + self.tax_rate / Decimal('100')))
                self.tax_amount = self.total_amount - self.subtotal
        
        super().save(*args, **kwargs)
        
        # Créer automatiquement les clés d'accès patient si elles n'existent pas
        if not self.patient_access and self.status in ['sent', 'paid']:
            self.create_patient_access()
    
    def create_patient_access(self):
        """Crée automatiquement les clés d'accès patient pour cette facture"""
        from patients.models import PatientAccess
        from django.contrib.auth.models import User
        
        # Vérifier s'il existe déjà un accès actif pour ce patient
        existing_access = PatientAccess.objects.filter(
            patient=self.patient,
            is_active=True
        ).first()
        
        if existing_access and existing_access.is_valid:
            # Utiliser l'accès existant
            self.patient_access = existing_access
            self.save(update_fields=['patient_access'])
            return existing_access
        
        # Créer un nouvel accès
        patient_access = PatientAccess.objects.create(
            patient=self.patient,
            created_by=self.created_by,
            is_active=True
        )
        
        # Associer à cette facture
        self.patient_access = patient_access
        self.save(update_fields=['patient_access'])
        
        return patient_access
    
    def get_access_keys_info(self):
        """Retourne les informations des clés d'accès pour inclusion dans la facture PDF"""
        if self.patient_access:
            return {
                'access_key': self.patient_access.access_key,
                'password': self.patient_access.password,
                'valid_until': 'Permanent',  # Clés permanentes
                'is_valid': self.patient_access.is_valid
            }
        return None

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    exam_type = models.ForeignKey(ExamType, on_delete=models.CASCADE, verbose_name="Type d'examen")
    quantity = models.PositiveIntegerField(default=1, verbose_name="Quantité")
    unit_price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Prix unitaire")
    total_price = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Prix total")
    
    class Meta:
        verbose_name = "Article de facture"
        verbose_name_plural = "Articles de facture"
    
    def save(self, *args, **kwargs):
        # Calculer le prix total
        if self.unit_price and self.quantity:
            self.total_price = self.quantity * self.unit_price
        
        # Sauvegarder d'abord l'item
        super().save(*args, **kwargs)
        
        # Mettre à jour les totaux de la facture (TVA incluse dans le prix)
        if self.invoice_id:
            try:
                invoice = self.invoice
                invoice.total_amount = sum(item.total_price for item in invoice.items.all())
                invoice.subtotal = round(invoice.total_amount / (1 + invoice.tax_rate / Decimal('100')))
                invoice.tax_amount = invoice.total_amount - invoice.subtotal
                invoice.save(update_fields=['total_amount', 'subtotal', 'tax_amount', 'updated_at'])
            except Exception as e:
                # Log l'erreur mais ne pas faire échouer la sauvegarde de l'item
                print(f"Erreur lors de la mise à jour du sous-total: {e}")
    
    def __str__(self):
        return f"{self.exam_type.name} x{self.quantity}"