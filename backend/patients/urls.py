from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, PatientAccessViewSet
from .views_patient_portal import (
    PatientPortalViewSet, 
    PatientAccessManagementViewSet
)

# Router principal pour les patients
router = DefaultRouter()
router.register(r'', PatientViewSet, basename='patients')
router.register(r'access', PatientAccessViewSet, basename='patient-access')
router.register(r'portal', PatientPortalViewSet, basename='patient-portal')

urlpatterns = [
    path('', include(router.urls)),
]