from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Sum, Q
from patients.models import Patient, PatientAccess
from invoices.models import Invoice, InvoiceItem
from reports.models import PatientReport
from django.contrib.auth import get_user_model

User = get_user_model()

class BaseDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user_stats(self, user):
        # Statistiques communes à tous les utilisateurs
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)
        
        return {
            'user': {
                'id': user.id,
                'username': user.username,
                'full_name': user.get_full_name(),
                'role': user.get_role_display(),
                'last_login': user.last_login,
            },
            'today': today,
            'start_of_week': start_of_week,
            'start_of_month': start_of_month,
        }

class AdminDashboardView(BaseDashboardView):
    def get(self, request):
        # Statistiques pour l'administrateur
        stats = self.get_user_stats(request.user)
        
        # Nombre total d'utilisateurs par rôle
        users_by_role = User.objects.values('role').annotate(count=Count('id'))
        
        # Derniers utilisateurs inscrits
        recent_users = User.objects.order_by('-date_joined')[:5].values(
            'id', 'username', 'email', 'role', 'date_joined'
        )
        
        stats.update({
            'total_users': User.objects.count(),
            'users_by_role': {item['role']: item['count'] for item in users_by_role},
            'recent_users': list(recent_users),
            'total_patients': Patient.objects.count(),
            'total_invoices': Invoice.objects.count(),
            'total_revenue': Invoice.objects.aggregate(
                total=Sum('total_amount') or 0
            )['total'],
        })
        
        return Response(stats)

class SecretaryDashboardView(BaseDashboardView):
    def get(self, request):
        if not (request.user.is_secretary or request.user.is_admin):
            return Response(
                {"detail": "Accès non autorisé."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        stats = self.get_user_stats(request.user)
        today = stats['today']
        
        # Statistiques du jour
        
        # Derniers patients ajoutés
        recent_patients = Patient.objects.order_by('-created_at')[:5].values(
            'id', 'first_name', 'last_name', 'phone_number', 'created_at'
        )
        
        # Factures récentes
        recent_invoices = Invoice.objects.select_related('patient').order_by('-created_at')[:5].values(
            'id', 'invoice_number', 'patient__first_name', 'patient__last_name', 
            'total_amount', 'status', 'created_at'
        )
        
        stats.update({
            'total_patients': Patient.objects.count(),
            'recent_patients': list(recent_patients),
            'recent_invoices': list(recent_invoices),
        })
        
        return Response(stats)

class DoctorDashboardView(BaseDashboardView):
    def get(self, request):
        if not (request.user.is_doctor or request.user.is_admin):
            return Response(
                {"detail": "Accès non autorisé."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        stats = self.get_user_stats(request.user)
        
        # Rapports récents (tous les rapports disponibles)
        recent_reports = PatientReport.objects.all().select_related('patient_access__patient').order_by('-created_at')[:5]
        
        # Pour un docteur, on affiche toutes les données disponibles
        stats.update({
            'recent_reports': [{
                'id': report.id,
                'patient_name': report.patient_access.patient.full_name,
                'created_at': report.created_at,
                'report_type': report.report_file.name.split('.')[-1].upper() if report.report_file else 'N/A'
            } for report in recent_reports],
            'total_reports': PatientReport.objects.count(),
            'total_patients': Patient.objects.count(),
            'total_exams': PatientReport.objects.count(),
        })
        
        return Response(stats)

class AccountantDashboardView(BaseDashboardView):
    def get(self, request):
        if not (request.user.is_accountant or request.user.is_admin):
            return Response(
                {"detail": "Accès non autorisé."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        stats = self.get_user_stats(request.user)
        today = stats['today']
        start_of_month = stats['start_of_month']
        
        # Statistiques financières
        monthly_revenue = Invoice.objects.filter(
            created_at__date__gte=start_of_month
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        # Factures en attente de paiement
        pending_invoices = Invoice.objects.filter(
            status__in=['sent', 'partially_paid']
        ).order_by('-due_date')[:5]
        
        stats.update({
            'monthly_revenue': monthly_revenue,
            'pending_invoices': [{
                'id': inv.id,
                'invoice_number': inv.invoice_number,
                'patient_name': inv.patient.full_name,
                'total_amount': inv.total_amount,
                'status': inv.status,
                'due_date': inv.due_date
            } for inv in pending_invoices],
            'invoices_status': {
                'draft': Invoice.objects.filter(status='draft').count(),
                'sent': Invoice.objects.filter(status='sent').count(),
                'partially_paid': Invoice.objects.filter(status='partially_paid').count(),
                'paid': Invoice.objects.filter(status='paid').count(),
                'cancelled': Invoice.objects.filter(status='cancelled').count(),
            },
        })
        
        return Response(stats)
