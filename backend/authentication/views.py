from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import User
from .serializers import (
    CustomTokenObtainPairSerializer, 
    UserSerializer,
    LoginNotificationSerializer,
)
from .models import LoginNotification

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
        # Les administrateurs voient tous les utilisateurs sauf les superusers
        if self.request.user.is_admin:
            if self.request.user.role == 'superuser':
                return User.objects.all()
            return User.objects.exclude(role='superuser')
        # Les autres utilisateurs ne voient que leur propre profil
        return User.objects.filter(id=self.request.user.id)
    
    def get_permissions(self):
        """
        Seuls les administrateurs et superutilisateurs peuvent créer, mettre à jour ou supprimer des utilisateurs.
        """
        return [permissions.IsAuthenticated()]
    
    def check_admin_permission(self, request):
        """Vérifie si l'utilisateur a le rôle admin ou superuser."""
        if request.user.role not in ['superuser', 'admin']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission d'effectuer cette action.")
    
    def create(self, request, *args, **kwargs):
        self.check_admin_permission(request)
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        self.check_admin_permission(request)
        target_user = self.get_object()
        if target_user.role == 'superuser' and request.user.id != target_user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seul le superutilisateur peut modifier son propre compte.")
        if target_user.role == 'superuser':
            allowed = {'username', 'password'}
            filtered = {k: v for k, v in request.data.items() if k in allowed and v}
            request._full_data = filtered
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        self.check_admin_permission(request)
        target_user = self.get_object()
        if target_user.role == 'superuser' and request.user.id != target_user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seul le superutilisateur peut modifier son propre compte.")
        if target_user.role == 'superuser':
            allowed = {'username', 'password'}
            filtered = {k: v for k, v in request.data.items() if k in allowed and v}
            request._full_data = filtered
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        self.check_admin_permission(request)
        target_user = self.get_object()
        if target_user.role == 'superuser':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Le compte superutilisateur ne peut pas être supprimé.")
        return super().destroy(request, *args, **kwargs)
    
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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def login_notifications(request):
    """Liste des notifications de connexion pour admin/superuser"""
    if request.user.role not in ['superuser', 'admin']:
        return Response({'detail': 'Accès refusé'}, status=403)
    
    notifications = LoginNotification.objects.select_related('user').all()[:50]
    serializer = LoginNotificationSerializer(notifications, many=True)
    unread_count = LoginNotification.objects.filter(is_read=False).count()
    return Response({
        'results': serializer.data,
        'unread_count': unread_count,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, pk):
    """Marquer une notification comme lue"""
    if request.user.role not in ['superuser', 'admin']:
        return Response({'detail': 'Accès refusé'}, status=403)
    try:
        notif = LoginNotification.objects.get(pk=pk)
        notif.is_read = True
        notif.save()
        return Response({'status': 'ok'})
    except LoginNotification.DoesNotExist:
        return Response({'detail': 'Notification introuvable'}, status=404)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_notifications_read(request):
    """Marquer toutes les notifications comme lues"""
    if request.user.role not in ['superuser', 'admin']:
        return Response({'detail': 'Accès refusé'}, status=403)
    LoginNotification.objects.filter(is_read=False).update(is_read=True)
    return Response({'status': 'ok'})
