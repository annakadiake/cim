from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, BasePermission, DjangoModelPermissions
from django.contrib.auth import get_user_model
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ExamType
from .serializers import ExamTypeSerializer
from core.pagination import StandardResultsSetPagination
from core.filters import ExamTypeFilter

class ExamTypeViewSet(viewsets.ModelViewSet):
    queryset = ExamType.objects.all()
    serializer_class = ExamTypeSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        print(f"[EXAMS] Données reçues: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"[EXAMS] Erreurs de validation: {serializer.errors}")
        return super().create(request, *args, **kwargs)

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        user = self.request.user
        
        # Si l'utilisateur est un comptable ou secrétaire
        if hasattr(user, 'role') and user.role in ['accountant', 'secretary']:
            # Lecture seule pour les comptables et secrétaires
            if self.action in ['list', 'retrieve', 'active_only', 'search_by_price_range']:
                permission_classes = [IsAuthenticated]
            else:
                # Pour les autres actions, refuser par défaut
                permission_classes = [IsAuthenticated]
        else:
            # Pour les autres rôles, utiliser les permissions Django standard
            permission_classes = [IsAuthenticated, DjangoModelPermissions]
            
        return [permission() for permission in permission_classes]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ExamTypeFilter
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at', 'duration_minutes']
    ordering = ['name']
    
    @action(detail=False, methods=['get'])
    def search_by_price_range(self, request):
        """Recherche par plage de prix"""
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        
        queryset = self.get_queryset()
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active_only(self, request):
        """Retourne seulement les examens actifs"""
        queryset = self.get_queryset().filter(is_active=True)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)