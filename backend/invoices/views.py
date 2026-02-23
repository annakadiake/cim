from rest_framework import viewsets, filters, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from django.db import transaction
from .models import Invoice, InvoiceItem
from .serializers import InvoiceSerializer, InvoiceItemSerializer
from .utils import generate_pdf_invoice
from patients.models import PatientAccess
from exams.models import ExamType
from core.pagination import StandardResultsSetPagination
from core.filters import InvoiceFilter

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('patient', 'created_by').prefetch_related('items', 'payments').all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = InvoiceFilter
    search_fields = ['invoice_number', 'patient__first_name', 'patient__last_name', 'patient__phone_number']
    ordering_fields = ['created_at', 'invoice_date', 'total_amount', 'due_date']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def search_by_amount(self, request):
        """Recherche par plage de montants"""
        min_amount = request.query_params.get('min_amount')
        max_amount = request.query_params.get('max_amount')
        
        queryset = self.get_queryset()
        if min_amount:
            queryset = queryset.filter(total_amount__gte=min_amount)
        if max_amount:
            queryset = queryset.filter(total_amount__lte=max_amount)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search_by_date_range(self, request):
        """Recherche par plage de dates"""
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        queryset = self.get_queryset()
        if date_from:
            queryset = queryset.filter(invoice_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(invoice_date__lte=date_to)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        with transaction.atomic():
            # Créer la facture
            invoice = serializer.save(created_by=self.request.user)
            
            # Créer les items de facture et calculer les totaux
            items_data = self.request.data.get('items', [])
            subtotal = 0
            
            for item_data in items_data:
                if isinstance(item_data, dict):
                    try:
                        exam_type = ExamType.objects.get(id=item_data['exam_type'])
                        quantity = item_data.get('quantity', 1)
                        unit_price = item_data.get('unit_price', exam_type.price)
                        total_price = item_data.get('total_price', unit_price * quantity)
                        
                        InvoiceItem.objects.create(
                            invoice=invoice,
                            exam_type=exam_type,
                            quantity=quantity,
                            unit_price=unit_price,
                            total_price=total_price
                        )
                        
                        subtotal += total_price
                        
                    except ExamType.DoesNotExist:
                        raise serializers.ValidationError(f"Type d'examen avec l'ID {item_data['exam_type']} introuvable")
                    except KeyError as e:
                        raise serializers.ValidationError(f"Le champ 'exam_type' est requis pour chaque item: {str(e)}")
                    except Exception as e:
                        raise serializers.ValidationError(f"Erreur lors de la création de l'item: {str(e)}")
            
            # Calculer et sauvegarder les totaux
            tax_rate = self.request.data.get('tax_rate', 0)
            tax_amount = subtotal * (tax_rate / 100) if tax_rate > 0 else 0
            total_amount = subtotal + tax_amount
            
            invoice.subtotal = subtotal
            invoice.tax_rate = tax_rate
            invoice.tax_amount = tax_amount
            invoice.total_amount = total_amount
            invoice.save()
                
            # Générer ou récupérer les clés d'accès patient
            try:
                # Utiliser get_or_create pour éviter les doublons
                patient_access, created = PatientAccess.objects.get_or_create(
                    patient=invoice.patient,
                    defaults={'created_by': self.request.user}
                )
                
                # Associer l'accès à la facture
                invoice.patient_access = patient_access
                invoice.save(update_fields=['patient_access'])
                
            except Exception as e:
                print(f"Erreur lors de la gestion de l'accès patient: {e}")
                # Continue sans bloquer la création de la facture
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        invoice = self.get_object()
        serializer = InvoiceItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(invoice=invoice)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def clear_items(self, request, pk=None):
        invoice = self.get_object()
        deleted_count = invoice.items.all().delete()[0]
        # Recalculate totals after clearing items
        invoice.subtotal = 0
        invoice.save(update_fields=['subtotal', 'tax_amount', 'total_amount', 'updated_at'])
        return Response({'message': f'{deleted_count} items supprimés'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        invoice = self.get_object()
        
        # Permettre le téléchargement pour toutes les factures (pas seulement payées)
        # if invoice.status != 'paid':
        #     return Response(
        #         {'error': 'Le téléchargement PDF n\'est disponible que pour les factures payées.'},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )
        
        # Récupérer ou créer les clés d'accès patient
        patient_access_keys = None
        try:
            # Chercher une clé d'accès active existante
            patient_access = PatientAccess.objects.filter(
                patient=invoice.patient,
                is_active=True
            ).order_by('-created_at').first()
            
            # Si aucune clé active n'existe, en créer une nouvelle
            if not patient_access:
                patient_access = PatientAccess.objects.create(
                    patient=invoice.patient,
                    created_by=request.user
                )
            
            patient_access_keys = {
                'access_key': patient_access.access_key,
                'password': patient_access.password,
                'valid_until': 'Permanent'  # Clés permanentes selon la mémoire
            }
            
            print(f"DEBUG: Clés d'accès générées: {patient_access_keys}")
            
        except Exception as e:
            # En cas d'erreur, continuer sans les clés (pour debug)
            print(f"Erreur lors de la récupération des clés d'accès: {e}")
            patient_access_keys = None
        
        # Générer le PDF avec les clés d'accès
        pdf_content = generate_pdf_invoice(invoice, patient_access_keys)
        
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="facture_{invoice.invoice_number}_avec_cles.pdf"'
        return response
    
    @action(detail=False, methods=['get'])
    def unpaid(self, request):
        """Retourne uniquement les factures impayées ou partiellement payées"""
        unpaid_invoices = self.get_queryset().exclude(status='paid')
        serializer = self.get_serializer(unpaid_invoices, many=True)
        return Response(serializer.data)

class InvoiceItemViewSet(viewsets.ModelViewSet):
    queryset = InvoiceItem.objects.all()
    serializer_class = InvoiceItemSerializer
    permission_classes = [IsAuthenticated]