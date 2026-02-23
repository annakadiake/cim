import django_filters
from django.db import models
from patients.models import Patient, PatientAccess
from invoices.models import Invoice, InvoiceItem
from exams.models import ExamType
from payments.models import Payment


class PatientFilter(django_filters.FilterSet):
    """Filtres avancés pour la recherche de patients"""
    
    # Recherche par nom complet
    name = django_filters.CharFilter(method='filter_by_name', label='Nom complet')
    
    # Filtres par date
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='gte', label='Créé après')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='lte', label='Créé avant')
    
    # Filtre par âge
    age_min = django_filters.NumberFilter(method='filter_age_min', label='Âge minimum')
    age_max = django_filters.NumberFilter(method='filter_age_max', label='Âge maximum')
    
    # Recherche par téléphone partiel
    phone = django_filters.CharFilter(field_name='phone_number', lookup_expr='icontains', label='Téléphone')
    
    class Meta:
        model = Patient
        fields = ['gender', 'name', 'phone', 'created_after', 'created_before', 'age_min', 'age_max']
    
    def filter_by_name(self, queryset, name, value):
        """Recherche dans le nom complet (prénom + nom)"""
        return queryset.filter(
            models.Q(first_name__icontains=value) |
            models.Q(last_name__icontains=value)
        )
    
    def filter_age_min(self, queryset, name, value):
        """Filtre par âge minimum"""
        from django.utils import timezone
        from datetime import date, timedelta
        max_birth_date = date.today() - timedelta(days=value * 365)
        return queryset.filter(date_of_birth__lte=max_birth_date)
    
    def filter_age_max(self, queryset, name, value):
        """Filtre par âge maximum"""
        from django.utils import timezone
        from datetime import date, timedelta
        min_birth_date = date.today() - timedelta(days=value * 365)
        return queryset.filter(date_of_birth__gte=min_birth_date)


class InvoiceFilter(django_filters.FilterSet):
    """Filtres avancés pour la recherche de factures"""
    
    # Recherche par patient
    patient_name = django_filters.CharFilter(method='filter_by_patient_name', label='Nom patient')
    
    # Filtres par montant
    amount_min = django_filters.NumberFilter(field_name='total_amount', lookup_expr='gte', label='Montant minimum')
    amount_max = django_filters.NumberFilter(field_name='total_amount', lookup_expr='lte', label='Montant maximum')
    
    # Filtres par date
    date_from = django_filters.DateFilter(field_name='invoice_date', lookup_expr='gte', label='Date début')
    date_to = django_filters.DateFilter(field_name='invoice_date', lookup_expr='lte', label='Date fin')
    
    # Filtre par statut avec support des valeurs multiples
    status = django_filters.CharFilter(method='filter_by_status', label='Statut')
    
    # Filtre par statut de paiement
    payment_status = django_filters.ChoiceFilter(
        choices=[
            ('paid', 'Payée'),
            ('partially_paid', 'Partiellement payée'),
            ('pending', 'En attente'),
            ('overdue', 'En retard')
        ],
        field_name='status',
        label='Statut de paiement'
    )
    
    class Meta:
        model = Invoice
        fields = ['status', 'patient_name', 'amount_min', 'amount_max', 'date_from', 'date_to', 'payment_status']
    
    def filter_by_status(self, queryset, name, value):
        """Filtre par statut avec support des valeurs multiples séparées par des virgules"""
        if ',' in value:
            statuses = [status.strip() for status in value.split(',')]
            return queryset.filter(status__in=statuses)
        return queryset.filter(status=value)
    
    def filter_by_patient_name(self, queryset, name, value):
        """Recherche par nom de patient"""
        return queryset.filter(
            models.Q(patient__first_name__icontains=value) |
            models.Q(patient__last_name__icontains=value)
        )


class PaymentFilter(django_filters.FilterSet):
    """Filtres avancés pour la recherche de paiements"""
    
    # Filtres par montant
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte', label='Montant minimum')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte', label='Montant maximum')
    
    # Filtres par date
    date_from = django_filters.DateFilter(field_name='payment_date', lookup_expr='gte', label='Date début')
    date_to = django_filters.DateFilter(field_name='payment_date', lookup_expr='lte', label='Date fin')
    
    # Recherche par référence
    reference = django_filters.CharFilter(field_name='reference_number', lookup_expr='icontains', label='Référence')
    
    # Recherche par patient via facture
    patient_name = django_filters.CharFilter(method='filter_by_patient_name', label='Nom patient')
    
    class Meta:
        model = Payment
        fields = ['payment_method', 'amount_min', 'amount_max', 'date_from', 'date_to', 'reference', 'patient_name']
    
    def filter_by_patient_name(self, queryset, name, value):
        """Recherche par nom de patient via la facture"""
        return queryset.filter(
            models.Q(invoice__patient__first_name__icontains=value) |
            models.Q(invoice__patient__last_name__icontains=value)
        )


class ExamTypeFilter(django_filters.FilterSet):
    """Filtres avancés pour la recherche de types d'examens"""
    
    # Filtres par prix
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte', label='Prix minimum')
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte', label='Prix maximum')
    
    # Filtre par durée
    duration_min = django_filters.NumberFilter(field_name='duration_minutes', lookup_expr='gte', label='Durée minimum (min)')
    duration_max = django_filters.NumberFilter(field_name='duration_minutes', lookup_expr='lte', label='Durée maximum (min)')
    
    # Recherche dans nom et description
    search = django_filters.CharFilter(method='filter_search', label='Recherche globale')
    
    class Meta:
        model = ExamType
        fields = ['is_active', 'price_min', 'price_max', 'duration_min', 'duration_max', 'search']
    
    def filter_search(self, queryset, name, value):
        """Recherche globale dans nom et description"""
        return queryset.filter(
            models.Q(name__icontains=value) |
            models.Q(description__icontains=value)
        )


class PatientAccessFilter(django_filters.FilterSet):
    """Filtres avancés pour la recherche d'accès patients"""
    
    # Recherche par patient
    patient_name = django_filters.CharFilter(method='filter_by_patient_name', label='Nom patient')
    
    # Filtres par utilisation
    access_count_min = django_filters.NumberFilter(field_name='access_count', lookup_expr='gte', label='Accès minimum')
    access_count_max = django_filters.NumberFilter(field_name='access_count', lookup_expr='lte', label='Accès maximum')
    
    # Filtres par date de création
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='gte', label='Créé après')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='lte', label='Créé avant')
    
    # Filtre par dernier accès
    last_accessed_after = django_filters.DateFilter(field_name='last_accessed', lookup_expr='gte', label='Dernier accès après')
    
    class Meta:
        model = PatientAccess
        fields = ['is_active', 'patient_name', 'access_count_min', 'access_count_max', 
                 'created_after', 'created_before', 'last_accessed_after', 'sent_via_email', 'sent_via_sms']
    
    def filter_by_patient_name(self, queryset, name, value):
        """Recherche par nom de patient"""
        return queryset.filter(
            models.Q(patient__first_name__icontains=value) |
            models.Q(patient__last_name__icontains=value)
        )
