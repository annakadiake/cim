from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Routeur pour les vues d'administration
admin_router = DefaultRouter()
admin_router.register(r'admin', views.AdminReportViewSet, basename='admin-report')

urlpatterns = [
    # Authentification patient
    path('patient-login/', views.patient_login, name='patient-login'),
    
    # Téléchargement de rapports pour patients
    path('patient-download/<int:report_id>/', views.patient_download_report, name='patient-download-report'),
    
    # Gestion des rapports patients (legacy)
    path('patient/<str:access_key>/', views.patient_reports, name='patient-reports'),
    path('patient/<str:access_key>/download/<int:report_id>/', views.download_report, name='download-report'),
    
    # Validation des clés (utilisé par l'administration)
    path('admin/check-status/<int:report_id>/', views.check_report_status, name='check-report-status'),
    path('admin/validate-keys/', views.validate_keys, name='validate-keys'),
    
    # Endpoints d'administration
    path('', include(admin_router.urls)),
]
