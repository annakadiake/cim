from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from django.http import HttpResponse
from .models import Payment
from .serializers import PaymentSerializer, PaymentSummarySerializer
from core.pagination import StandardResultsSetPagination
from core.filters import PaymentFilter

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('invoice', 'invoice__patient', 'recorded_by').all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PaymentFilter
    search_fields = ['reference_number', 'transaction_id', 'invoice__invoice_number', 'invoice__patient__first_name', 'invoice__patient__last_name']
    ordering_fields = ['payment_date', 'amount', 'created_at']
    ordering = ['-payment_date']
    
    def perform_create(self, serializer):
        try:
            serializer.save(recorded_by=self.request.user)
        except Exception as e:
            print(f"Erreur lors de la création du paiement: {e}")
            print(f"Données reçues: {self.request.data}")
            raise
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Statistiques des paiements avec filtrage par période"""
        # Paramètres de filtrage
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Définir la période par défaut (30 derniers jours)
        if not start_date:
            start_date = timezone.now() - timedelta(days=30)
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            
        if not end_date:
            end_date = timezone.now()
        else:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
            end_date = end_date.replace(hour=23, minute=59, second=59)
        
        # Filtrer les paiements complétés dans la période
        payments = Payment.objects.filter(
            status='completed',
            payment_date__range=[start_date, end_date]
        )
        
        # Calculer les statistiques
        summary_data = payments.aggregate(
            total_payments=Sum('amount'),
            payment_count=Count('id'),
            total_cash=Sum('amount', filter=Q(payment_method='cash')),
            total_mobile_money=Sum('amount', filter=Q(payment_method__in=['mobile_money', 'orange_money', 'wave', 'free_money'])),
            total_bank_transfer=Sum('amount', filter=Q(payment_method='bank_transfer')),
            total_check=Sum('amount', filter=Q(payment_method='check'))
        )
        
        # Remplacer les None par 0
        for key, value in summary_data.items():
            if value is None:
                summary_data[key] = 0
        
        summary_data['period_start'] = start_date
        summary_data['period_end'] = end_date
        
        serializer = PaymentSummarySerializer(summary_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_invoice(self, request):
        """Récupère tous les paiements d'une facture spécifique"""
        invoice_id = request.query_params.get('invoice_id')
        if not invoice_id:
            return Response(
                {'error': 'L\'ID de la facture est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payments = self.get_queryset().filter(invoice_id=invoice_id)
        serializer = self.get_serializer(payments, many=True)
        
        # Calculer les totaux
        total_paid = payments.filter(status='completed').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        return Response({
            'payments': serializer.data,
            'total_paid': total_paid,
            'payment_count': payments.count()
        })