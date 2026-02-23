from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_patient_portal import (
    PatientPortalViewSet,
    PatientAccessManagementViewSet
)

# Router pour les APIs du portail patient
router = DefaultRouter()
router.register(r'patient-portal', PatientPortalViewSet, basename='patient-portal')
router.register(r'patient-access', PatientAccessManagementViewSet, basename='patient-access')
# router.register(r'exam-files', ExamFileViewSet, basename='exam-files')  # Désactivé

urlpatterns = [
    path('', include(router.urls)),
]
