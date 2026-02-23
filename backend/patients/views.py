from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated, BasePermission, DjangoModelPermissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model

class IsSecretaryOrAccountant(BasePermission):
    """
    Permission personnalisée pour permettre aux secrétaires et comptables
    d'accéder aux patients selon leurs permissions spécifiques.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
            
        # Les secrétaires peuvent créer, lister et supprimer les patients
        if user.role == 'secretary':
            return request.method in ['GET', 'POST', 'DELETE', 'HEAD', 'OPTIONS']
            
        # Les comptables peuvent seulement lire
        if user.role == 'accountant':
            return request.method in ['GET', 'HEAD', 'OPTIONS']
            
        # Les autres rôles sont gérés par les permissions Django standard
        return True
from .models import Patient, PatientAccess
from .serializers import PatientSerializer, PatientAccessSerializer
from core.pagination import StandardResultsSetPagination
from core.filters import PatientFilter, PatientAccessFilter

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated, IsSecretaryOrAccountant]
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.request.user.role in ['secretary', 'accountant']:
            # Utiliser nos permissions personnalisées pour les secrétaires et comptables
            permission_classes = [IsAuthenticated, IsSecretaryOrAccountant]
        else:
            # Pour les autres rôles, utiliser les permissions Django standard
            permission_classes = [IsAuthenticated, DjangoModelPermissions]
            
        return [permission() for permission in permission_classes]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PatientFilter
    search_fields = ['first_name', 'last_name', 'phone_number', 'email']
    ordering_fields = ['created_at', 'last_name', 'first_name', 'date_of_birth']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def search_advanced(self, request):
        """Recherche avancée avec filtres multiples"""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
        
    def destroy(self, request, *args, **kwargs):
        """
        Permet la suppression des patients par les secrétaires et administrateurs.
        """
        if request.user.role not in ['superuser', 'admin', 'secretary']:
            return Response(
                {"detail": "Vous n'avez pas la permission de supprimer des patients."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class PatientAccessViewSet(viewsets.ModelViewSet):
    queryset = PatientAccess.objects.select_related('patient', 'created_by').all()
    serializer_class = PatientAccessSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PatientAccessFilter
    search_fields = ['access_key', 'patient__first_name', 'patient__last_name', 'patient__phone_number']
    ordering_fields = ['created_at', 'access_count', 'last_accessed']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = PatientAccess.objects.all()
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Génère un accès pour un patient"""
        patient_id = request.data.get('patient_id')
        validity_days = request.data.get('validity_days', 90)
        
        if not patient_id:
            return Response(
                {'error': 'patient_id est requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient non trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier si un accès existe déjà (clés permanentes)
        access, created = PatientAccess.objects.get_or_create(
            patient=patient,
            defaults={'created_by': request.user}
        )
        
        if not created:
            # Réactiver l'accès s'il était désactivé
            if not access.is_active:
                access.is_active = True
                access.save()
        
        serializer = self.get_serializer(access)
        return Response(serializer.data, status=status.HTTP_201_CREATED)