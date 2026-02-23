from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import mimetypes
import os

from .models import Patient, PatientAccess
from .serializers_patient_portal import (
    PatientAccessSerializer,
    PatientLoginSerializer
)


class PatientPortalViewSet(viewsets.ViewSet):
    """API pour le portail patient sécurisé"""
    permission_classes = [AllowAny]  # Gestion de l'auth via clé/mot de passe
    
    @action(detail=False, methods=['post'], url_path='login')
    def patient_login(self, request):
        """Authentification patient avec clé d'accès et mot de passe"""
        print(f"DEBUG: Données reçues: {request.data}")
        
        serializer = PatientLoginSerializer(data=request.data)
        if serializer.is_valid():
            access_key = serializer.validated_data['access_key']
            password = serializer.validated_data['password']
            
            print(f"DEBUG: Recherche avec access_key={access_key}, password={password}")
            
            # Vérifier d'abord si la clé existe
            try:
                patient_access_check = PatientAccess.objects.get(access_key=access_key)
                print(f"DEBUG: Clé trouvée - Mot de passe stocké: '{patient_access_check.password}'")
                print(f"DEBUG: Mot de passe reçu: '{password}'")
                print(f"DEBUG: Comparaison: {patient_access_check.password == password}")
                
                # Afficher les caractères pour debug
                print(f"DEBUG: Caractères stockés: {[ord(c) for c in patient_access_check.password]}")
                print(f"DEBUG: Caractères reçus: {[ord(c) for c in password]}")
                
            except PatientAccess.DoesNotExist:
                print(f"DEBUG: Clé d'accès {access_key} n'existe pas")
            
            try:
                # Recherche insensible à la casse temporairement pour tester
                patient_access = PatientAccess.objects.get(
                    access_key=access_key,
                    password__iexact=password
                )
                
                print(f"DEBUG: PatientAccess trouvé: {patient_access}")
                
                # Récupérer les rapports du patient
                from reports.models import PatientReport
                from reports.serializers import PatientReportSerializer
                
                patient_reports = PatientReport.objects.filter(
                    patient_access=patient_access,
                    is_active=True
                ).order_by('-created_at')
                
                print(f"DEBUG: {patient_reports.count()} rapports trouvés pour ce patient")
                
                reports_data = []
                for report in patient_reports:
                    reports_data.append({
                        'id': report.id,
                        'filename': report.report_file.name.split('/')[-1] if report.report_file else 'N/A',
                        'created_at': report.created_at,
                        'download_url': f'/api/reports/patient-download/{report.id}/',
                        'is_active': report.is_active
                    })
                
                return Response({
                    'success': True,
                    'patient': {
                        'id': patient_access.patient.id,
                        'full_name': patient_access.patient.full_name,
                        'phone_number': patient_access.patient.phone_number,
                    },
                    'access_info': {
                        'access_key': patient_access.access_key,
                        'is_permanent': True,
                        'access_count': patient_access.access_count,
                        'last_accessed': patient_access.last_accessed,
                    },
                    'files': reports_data
                })
                
            except PatientAccess.DoesNotExist:
                print(f"DEBUG: Aucun PatientAccess trouvé avec access_key={access_key}")
                return Response({
                    'error': 'Clé d\'accès ou mot de passe incorrect'
                }, status=status.HTTP_401_UNAUTHORIZED)
        else:
            print(f"DEBUG: Erreurs de validation: {serializer.errors}")
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # @action(detail=False, methods=['get'], url_path='download/(?P<file_id>[^/.]+)')
    # def download_file(self, request, file_id=None):
    #     """Téléchargement sécurisé d'un fichier d'examen - DÉSACTIVÉ"""
    #     # Fonctionnalité désactivée car ExamFile n'existe plus
    #     raise Http404("Fonctionnalité non disponible")


class PatientAccessManagementViewSet(viewsets.ModelViewSet):
    """Gestion des accès patients (pour le personnel médical)"""
    queryset = PatientAccess.objects.all()
    serializer_class = PatientAccessSerializer
    
    @action(detail=False, methods=['post'], url_path='generate')
    def generate_access(self, request):
        """Générer un nouvel accès pour un patient"""
        patient_id = request.data.get('patient_id')
        validity_days = request.data.get('validity_days', 30)
        
        try:
            patient = Patient.objects.get(id=patient_id)
            
            # Créer ou récupérer l'accès existant (un seul par patient)
            patient_access, created = PatientAccess.objects.get_or_create(
                patient=patient,
                defaults={'created_by': request.user}
            )
            
            if not created:
                # Réactiver l'accès existant si nécessaire
                patient_access.is_active = True
                patient_access.save()
            
            # Envoyer les identifiants
            self.send_access_credentials(patient_access)
            
            return Response({
                'success': True,
                'access': PatientAccessSerializer(patient_access).data,
                'message': 'Accès généré et envoyé au patient'
            })
            
        except Patient.DoesNotExist:
            return Response({
                'error': 'Patient non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def send_access_credentials(self, patient_access):
        """Envoyer les identifiants d'accès au patient"""
        patient = patient_access.patient
        
        # Message pour SMS/Email
        message = f"""
Bonjour {patient.full_name},

Vos résultats d'examen sont disponibles.

Accédez à vos résultats sur : {settings.PATIENT_PORTAL_URL}

Clé d'accès : {patient_access.access_key}
Mot de passe : {patient_access.password}

⚠️ IMPORTANT : Ces identifiants sont permanents et réutilisables.
Conservez-les précieusement pour vos futurs accès.

CIMEF - Rufisque
        """
        
        # Envoi par email si disponible
        if patient.email:
            try:
                send_mail(
                    subject='Vos résultats d\'examen - CIMEF',
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[patient.email],
                    fail_silently=False,
                )
                patient_access.sent_via_email = True
            except Exception as e:
                print(f"Erreur envoi email: {e}")
        
        # TODO: Intégration SMS (Twilio, etc.)
        # if patient.phone_number:
        #     send_sms(patient.phone_number, message)
        #     patient_access.sent_via_sms = True
        
        patient_access.save()



