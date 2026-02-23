from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from patients.models import Patient, PatientAccess
from invoices.models import Invoice
from payments.models import Payment
from exams.models import ExamType


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def global_search(request):
    """Recherche globale dans toutes les entités"""
    query = request.GET.get('q', '').strip()
    
    if not query or len(query) < 2:
        return Response({
            'error': 'Requête trop courte (minimum 2 caractères)'
        }, status=400)
    
    results = {
        'patients': [],
        'invoices': [],
        'payments': [],
        'exam_types': [],
        'total_results': 0
    }
    
    # Recherche dans les patients
    patients = Patient.objects.filter(
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(phone_number__icontains=query) |
        Q(email__icontains=query)
    )[:10]
    
    for patient in patients:
        results['patients'].append({
            'id': patient.id,
            'name': patient.full_name,
            'phone': patient.phone_number,
            'type': 'patient'
        })
    
    # Recherche dans les factures
    invoices = Invoice.objects.select_related('patient').filter(
        Q(invoice_number__icontains=query) |
        Q(patient__first_name__icontains=query) |
        Q(patient__last_name__icontains=query)
    )[:10]
    
    for invoice in invoices:
        results['invoices'].append({
            'id': invoice.id,
            'invoice_number': invoice.invoice_number,
            'patient_name': invoice.patient.full_name,
            'amount': float(invoice.total_amount),
            'status': invoice.status,
            'type': 'invoice'
        })
    
    # Recherche dans les paiements
    payments = Payment.objects.select_related('invoice', 'invoice__patient').filter(
        Q(reference_number__icontains=query) |
        Q(transaction_id__icontains=query) |
        Q(receipt_number__icontains=query) |
        Q(invoice__invoice_number__icontains=query)
    )[:10]
    
    for payment in payments:
        results['payments'].append({
            'id': payment.id,
            'reference': payment.reference_number,
            'amount': float(payment.amount),
            'method': payment.payment_method,
            'invoice_number': payment.invoice.invoice_number,
            'type': 'payment'
        })
    
    # Recherche dans les types d'examens
    exam_types = ExamType.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query)
    )[:10]
    
    for exam_type in exam_types:
        results['exam_types'].append({
            'id': exam_type.id,
            'name': exam_type.name,
            'price': float(exam_type.price),
            'duration': exam_type.duration_minutes,
            'type': 'exam_type'
        })
    
    # Calculer le total
    results['total_results'] = (
        len(results['patients']) +
        len(results['invoices']) +
        len(results['payments']) +
        len(results['exam_types'])
    )
    
    return Response(results)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quick_search_patients(request):
    """Recherche rapide de patients pour l'autocomplétion"""
    query = request.GET.get('q', '').strip()
    limit = int(request.GET.get('limit', 10))
    
    if not query or len(query) < 2:
        return Response([])
    
    patients = Patient.objects.filter(
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(phone_number__icontains=query)
    ).order_by('last_name', 'first_name')[:limit]
    
    results = []
    for patient in patients:
        results.append({
            'id': patient.id,
            'label': f"{patient.full_name} - {patient.phone_number}",
            'name': patient.full_name,
            'phone': patient.phone_number,
            'email': patient.email
        })
    
    return Response(results)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_statistics(request):
    """Statistiques de recherche et utilisation"""
    from django.db.models import Count
    
    stats = {
        'total_patients': Patient.objects.count(),
        'total_invoices': Invoice.objects.count(),
        'total_payments': Payment.objects.count(),
        'total_exam_types': ExamType.objects.count(),
        'active_patient_accesses': PatientAccess.objects.filter(is_active=True).count(),
        'patients_by_gender': Patient.objects.values('gender').annotate(count=Count('id')),
        'invoices_by_status': Invoice.objects.values('status').annotate(count=Count('id')),
        'payments_by_method': Payment.objects.values('payment_method').annotate(count=Count('id'))
    }
    
    return Response(stats)
