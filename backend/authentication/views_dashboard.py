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
        from payments.models import Payment
        from exams.models import ExamType
        
        # Statistiques pour l'administrateur
        stats = self.get_user_stats(request.user)
        today = stats['today']
        start_of_month = stats['start_of_month']
        start_of_week = stats['start_of_week']
        
        # Nombre total d'utilisateurs par rôle
        users_by_role = User.objects.values('role').annotate(count=Count('id'))
        
        # Derniers utilisateurs inscrits
        recent_users = User.objects.order_by('-date_joined')[:5].values(
            'id', 'username', 'email', 'role', 'date_joined'
        )
        
        # Derniers patients
        recent_patients = Patient.objects.order_by('-created_at')[:5].values(
            'id', 'first_name', 'last_name', 'phone_number', 'created_at'
        )
        
        # Dernières factures
        recent_invoices = Invoice.objects.select_related('patient').order_by('-created_at')[:5]
        
        # Derniers paiements
        recent_payments = Payment.objects.select_related(
            'invoice', 'invoice__patient'
        ).order_by('-payment_date')[:5]
        
        # Revenus
        total_revenue = Invoice.objects.filter(status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        monthly_revenue = Invoice.objects.filter(
            status='paid', created_at__date__gte=start_of_month
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        weekly_revenue = Invoice.objects.filter(
            status='paid', created_at__date__gte=start_of_week
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        # Paiements totaux
        total_payments_amount = Payment.objects.filter(
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        monthly_payments = Payment.objects.filter(
            status='completed', payment_date__date__gte=start_of_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Factures par statut
        invoices_status = {
            'draft': Invoice.objects.filter(status='draft').count(),
            'sent': Invoice.objects.filter(status='sent').count(),
            'partially_paid': Invoice.objects.filter(status='partially_paid').count(),
            'paid': Invoice.objects.filter(status='paid').count(),
            'cancelled': Invoice.objects.filter(status='cancelled').count(),
        }
        
        # Patients ce mois
        patients_this_month = Patient.objects.filter(
            created_at__date__gte=start_of_month
        ).count()
        
        stats.update({
            'total_users': User.objects.count(),
            'users_by_role': {item['role']: item['count'] for item in users_by_role},
            'recent_users': list(recent_users),
            'total_patients': Patient.objects.count(),
            'patients_this_month': patients_this_month,
            'total_invoices': Invoice.objects.count(),
            'total_exams': ExamType.objects.filter(is_active=True).count(),
            'total_reports': PatientReport.objects.count(),
            'total_revenue': total_revenue,
            'monthly_revenue': monthly_revenue,
            'weekly_revenue': weekly_revenue,
            'total_payments': Payment.objects.filter(status='completed').count(),
            'total_payments_amount': total_payments_amount,
            'monthly_payments': monthly_payments,
            'invoices_status': invoices_status,
            'recent_patients': list(recent_patients),
            'recent_invoices': [{
                'id': inv.id,
                'invoice_number': inv.invoice_number,
                'patient_name': inv.patient.full_name,
                'total_amount': float(inv.total_amount),
                'status': inv.status,
                'created_at': inv.created_at,
            } for inv in recent_invoices],
            'recent_payments': [{
                'id': p.id,
                'patient_name': p.invoice.patient.full_name,
                'amount': float(p.amount),
                'payment_method': p.get_payment_method_display(),
                'payment_date': p.payment_date,
            } for p in recent_payments],
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
