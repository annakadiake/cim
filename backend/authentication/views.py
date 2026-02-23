from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import User
from .serializers import (
    CustomTokenObtainPairSerializer, 
    UserSerializer,
)

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour gérer les utilisateurs.
    Seuls les administrateurs peuvent créer et gérer les utilisateurs.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Les administrateurs voient tous les utilisateurs
        if self.request.user.is_admin:
            return User.objects.all()
        # Les autres utilisateurs ne voient que leur propre profil
        return User.objects.filter(id=self.request.user.id)
    
    def get_permissions(self):
        """
        Seuls les administrateurs peuvent créer, mettre à jour ou supprimer des utilisateurs
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAdminUser]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Récupérer les informations de l'utilisateur connecté"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    """
    Récupère les informations de l'utilisateur connecté
    """
    user = request.user
    data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': getattr(user, 'role', 'secretary'),
        'department': getattr(user, 'department', ''),
        'is_active': user.is_active,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'is_admin': getattr(user, 'role', 'secretary') in ['superuser', 'admin'],
        'permissions': [p.codename for p in user.user_permissions.all()],
    }
    
    return Response(data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def system_stats(request):
    """Statistiques système pour superuser"""
    if not getattr(request.user, 'role', '') == 'superuser':
        return Response({'detail': 'Accès refusé'}, status=403)
    
    from patients.models import Patient
    from invoices.models import Invoice
    
    stats = {
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'total_patients': Patient.objects.count(),
        'total_invoices': Invoice.objects.count(),
        'pending_payments': Invoice.objects.filter(status='sent').count(),
        'system_health': 'operational'
    }
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admin_stats(request):
    """Statistiques pour admin"""
    if not getattr(request.user, 'role', '') in ['superuser', 'admin']:
        return Response({'detail': 'Accès refusé'}, status=403)
    
    from patients.models import Patient
    from invoices.models import Invoice
    from django.db import models
    
    stats = {
        'total_patients': Patient.objects.count(),
        'total_invoices': Invoice.objects.count(),
        'monthly_revenue': Invoice.objects.filter(status='paid').aggregate(
            total=models.Sum('total_amount'))['total'] or 0,
        'pending_exams': 0,  # À implémenter avec le modèle Exam
        'active_users': User.objects.filter(is_active=True).count(),
    }
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def doctor_stats(request):
    """Statistiques pour docteur"""
    if not getattr(request.user, 'role', '') == 'doctor':
        return Response({'detail': 'Accès refusé'}, status=403)
    
    stats = {
        'my_patients': 0,  # À implémenter avec relation docteur-patient
        'pending_exams': 0,
        'completed_reports': 0,
        'today_appointments': 0,
    }
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def secretary_stats(request):
    """Statistiques pour secrétaire"""
    if not getattr(request.user, 'role', '') == 'secretary':
        return Response({'detail': 'Accès refusé'}, status=403)
    
    from patients.models import Patient
    from django.utils import timezone
    
    today = timezone.now().date()
    stats = {
        'new_patients_today': Patient.objects.filter(created_at__date=today).count(),
        'appointments_today': 0,  # À implémenter avec modèle Appointment
        'pending_registrations': 0,
        'total_patients': Patient.objects.count(),
    }
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def accountant_stats(request):
    """Statistiques pour comptable"""
    if not getattr(request.user, 'role', '') == 'accountant':
        return Response({'detail': 'Accès refusé'}, status=403)
    
    from invoices.models import Invoice
    from django.db import models
    
    stats = {
        'monthly_revenue': Invoice.objects.filter(status='paid').aggregate(
            total=models.Sum('total_amount'))['total'] or 0,
        'pending_invoices': Invoice.objects.filter(status='sent').count(),
        'overdue_payments': Invoice.objects.filter(status='sent').count(),  # À améliorer avec dates
        'total_invoices': Invoice.objects.count(),
        'paid_invoices': Invoice.objects.filter(status='paid').count(),
        'unpaid_amount': Invoice.objects.filter(status='sent').aggregate(
            total=models.Sum('total_amount'))['total'] or 0,
    }
    return Response(stats)
