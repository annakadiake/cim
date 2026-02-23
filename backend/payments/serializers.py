from rest_framework import serializers
from django.db.models import Sum
from .models import Payment
from invoices.serializers import InvoiceSerializer

class PaymentSerializer(serializers.ModelSerializer):
    invoice_details = InvoiceSerializer(source='invoice', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    remaining_amount = serializers.ReadOnlyField()
    is_partial_payment = serializers.ReadOnlyField()
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'invoice', 'invoice_details', 'amount', 
            'payment_method', 'payment_method_display', 'payment_date', 'status', 'status_display',
            'reference_number', 'transaction_id', 'receipt_number',
            'phone_number', 'operator_reference', 'notes', 
            'recorded_by', 'recorded_by_name', 'remaining_amount', 'is_partial_payment',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'receipt_number', 'recorded_by']
    
    def validate_amount(self, value):
        """Valide que le montant ne dépasse pas le montant restant de la facture"""
        if self.instance:
            # En cas de modification
            invoice = self.instance.invoice
            current_payment_amount = self.instance.amount if self.instance.status == 'completed' else 0
        else:
            # En cas de création
            invoice_id = self.initial_data.get('invoice')
            if not invoice_id:
                raise serializers.ValidationError("La facture est requise.")
            
            try:
                from invoices.models import Invoice
                invoice = Invoice.objects.get(id=invoice_id)
                current_payment_amount = 0
            except Invoice.DoesNotExist:
                raise serializers.ValidationError("Facture introuvable.")
        
        # Calculer le montant déjà payé (excluant le paiement actuel)
        total_payments = invoice.payments.filter(status='completed').exclude(
            id=self.instance.id if self.instance else None
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        remaining = invoice.total_amount - total_payments
        
        if value > remaining:
            raise serializers.ValidationError(
                f"Le montant ({value} FCFA) dépasse le montant restant à payer ({remaining} FCFA)."
            )
        
        return value

class PaymentSummarySerializer(serializers.Serializer):
    """Serializer pour les statistiques de paiement"""
    total_payments = serializers.DecimalField(max_digits=15, decimal_places=0)
    total_cash = serializers.DecimalField(max_digits=15, decimal_places=0)
    total_mobile_money = serializers.DecimalField(max_digits=15, decimal_places=0)
    total_bank_transfer = serializers.DecimalField(max_digits=15, decimal_places=0)
    total_check = serializers.DecimalField(max_digits=15, decimal_places=0)
    payment_count = serializers.IntegerField()
    period_start = serializers.DateTimeField()
    period_end = serializers.DateTimeField()