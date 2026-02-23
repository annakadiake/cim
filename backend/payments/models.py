from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
from invoices.models import Invoice

class Payment(models.Model):
    PAYMENT_METHODS = [
        ('cash', 'Espèces'),
        ('check', 'Chèque'),
        ('bank_transfer', 'Virement bancaire'),
        ('mobile_money', 'Mobile Money'),
        ('orange_money', 'Orange Money'),
        ('wave', 'Wave'),
        ('free_money', 'Free Money'),
        ('credit_card', 'Carte de crédit'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('completed', 'Complété'),
        ('failed', 'Échoué'),
        ('cancelled', 'Annulé'),
        ('refunded', 'Remboursé'),
    ]
    
    # Champs principaux
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments', verbose_name="Facture")
    amount = models.DecimalField(
        max_digits=12, 
        decimal_places=0, 
        validators=[MinValueValidator(Decimal('1'))],
        verbose_name="Montant (FCFA)"
    )
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, verbose_name="Mode de paiement")
    payment_date = models.DateTimeField(verbose_name="Date de paiement")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed', verbose_name="Statut")
    
    # Références et détails
    reference_number = models.CharField(max_length=100, blank=True, verbose_name="Numéro de référence")
    transaction_id = models.CharField(max_length=100, blank=True, verbose_name="ID de transaction")
    receipt_number = models.CharField(max_length=50, unique=True, blank=True, verbose_name="Numéro de reçu")
    
    # Informations complémentaires pour mobile money
    phone_number = models.CharField(max_length=20, blank=True, verbose_name="Numéro de téléphone")
    operator_reference = models.CharField(max_length=100, blank=True, verbose_name="Référence opérateur")
    
    # Métadonnées
    notes = models.TextField(blank=True, verbose_name="Notes")
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Enregistré par")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-payment_date']
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        indexes = [
            models.Index(fields=['payment_method']),
            models.Index(fields=['status']),
            models.Index(fields=['payment_date']),
            models.Index(fields=['amount']),
            models.Index(fields=['reference_number']),
            models.Index(fields=['transaction_id']),
            models.Index(fields=['receipt_number']),
            models.Index(fields=['invoice', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Paiement {self.amount} FCFA - {self.invoice.invoice_number} ({self.get_payment_method_display()})"
    
    @property
    def remaining_amount(self):
        """Calcule le montant restant à payer sur la facture"""
        total_payments = self.invoice.payments.filter(status='completed').aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        return max(0, self.invoice.total_amount - total_payments)
    
    @property
    def is_partial_payment(self):
        """Vérifie si c'est un paiement partiel"""
        return self.amount < self.invoice.total_amount
    
    def generate_receipt_number(self):
        """Génère un numéro de reçu unique"""
        if not self.receipt_number:
            # Format: REC-YYYYMMDD-XXXXXX
            from datetime import datetime
            date_str = datetime.now().strftime('%Y%m%d')
            last_receipt = Payment.objects.filter(
                receipt_number__startswith=f'REC-{date_str}'
            ).order_by('-receipt_number').first()
            
            if last_receipt:
                last_number = int(last_receipt.receipt_number.split('-')[-1])
                number = last_number + 1
            else:
                number = 1
            
            self.receipt_number = f'REC-{date_str}-{number:06d}'
        return self.receipt_number
    
    def save(self, *args, **kwargs):
        # Générer le numéro de reçu si nécessaire
        if self.status == 'completed' and not self.receipt_number:
            self.generate_receipt_number()
        
        super().save(*args, **kwargs)
        
        # Mettre à jour le statut de la facture
        self.update_invoice_status()
    
    def update_invoice_status(self):
        """Met à jour le statut de la facture en fonction des paiements"""
        total_payments = self.invoice.payments.filter(status='completed').aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        if total_payments >= self.invoice.total_amount:
            self.invoice.status = 'paid'
        elif total_payments > 0:
            self.invoice.status = 'partially_paid'
        else:
            self.invoice.status = 'sent'
        
        self.invoice.save(update_fields=['status', 'updated_at'])