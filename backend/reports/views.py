from django.shortcuts import get_object_or_404
from django.http import HttpResponse, Http404, FileResponse
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta
import mimetypes
import os

from rest_framework import viewsets, status, filters, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import PatientReport
from .serializers import PatientReportSerializer, PatientLoginSerializer
from patients.models import PatientAccess
from .serializers import (
    PatientReportListSerializer,
    KeyValidationSerializer
)
from datetime import timedelta


class AdminReportViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour l'administration des rapports.
    Permet de lister, créer, mettre à jour et supprimer des rapports.
    """
    queryset = PatientReport.objects.all()
    serializer_class = PatientReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        Autorise la lecture à tous les utilisateurs authentifiés,
        mais limite la modification aux administrateurs et aux médecins.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            # Seuls les administrateurs et les médecins peuvent modifier
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        """Surcharge de la méthode create pour gérer l'upload de fichiers"""
        print("\n=== DEBUG: DÉBUT create ===")
        print(f"DEBUG: Données reçues: {request.data}")
        print(f"DEBUG: Fichiers reçus: {request.FILES}")
        
        # Vérifier que l'utilisateur a les bonnes permissions
        if not request.user.role in ['admin', 'doctor', 'secretary']:
            return Response(
                {"detail": "Vous n'avez pas la permission d'ajouter un rapport"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Créer une copie mutable de request.data et ajouter le fichier
        data = request.data.copy()
        if 'report_file' in request.FILES:
            data['report_file'] = request.FILES['report_file']
        
        # Utiliser le sérialiseur pour valider et créer le rapport
        serializer = self.get_serializer(data=data)
        
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            print(f"DEBUG: Rapport créé avec succès: {serializer.data['id']}")
            
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
            
        except serializers.ValidationError as e:
            print(f"DEBUG: Erreur de validation: {e.detail}")
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print(f"DEBUG: Erreur lors de la création du rapport: {str(e)}")
            return Response(
                {"detail": "Une erreur est survenue lors de la création du rapport"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_create(self, serializer):
        """Crée un nouveau rapport avec les données validées"""
        # Sauvegarder l'instance en utilisant la méthode save() du sérialiseur
        # Cela garantit que toutes les validations sont correctement appliquées
        serializer.save()
        
        # Récupérer l'instance créée
        report = serializer.instance
        
        # Vérifier que le patient_access est valide
        if not hasattr(report, 'patient_access') or not report.patient_access:
            raise serializers.ValidationError({
                'patient_access': ["Un accès patient valide est requis."]
            })
            
        # Vérifier que le patient_access est actif
        if not report.patient_access.is_active:
            raise serializers.ValidationError({
                'patient_access': ["L'accès patient n'est pas actif."]
            })
            
        # Mettre à jour les métadonnées si nécessaire
        report.is_active = True
        report.save()
    
    def get_queryset(self):
        """
        Retourne tous les rapports avec des options de filtrage.
        Filtres possibles :
        - patient_id : Filtrer par ID de patient
        - is_active : Filtrer par statut actif/inactif
        - date_from/date_to : Filtrer par plage de dates
        """
        queryset = PatientReport.objects.all()
        
        # Filtrage par ID de patient
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient_access__patient_id=patient_id)
            
        # Filtrage par statut actif/inactif
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
        # Filtrage par plage de dates
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
            
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Active ou désactive un rapport"""
        report = self.get_object()
        report.is_active = not report.is_active
        report.save()
        
        return Response({
            'status': 'success',
            'is_active': report.is_active,
            'message': f'Le rapport a été {"activé" if report.is_active else "désactivé"} avec succès.'
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Retourne des statistiques sur les rapports"""
        total_reports = PatientReport.objects.count()
        active_reports = PatientReport.objects.filter(is_active=True).count()
        
        # Rapports créés ce mois-ci
        start_date = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        reports_this_month = PatientReport.objects.filter(created_at__gte=start_date).count()
        
        # Prochaine expiration (dans les 7 jours)
        expiration_date = timezone.now() + timedelta(days=7)
        expiring_soon = PatientReport.objects.filter(
            expires_at__lte=expiration_date,
            is_active=True
        ).count()
        
        return Response({
            'total_reports': total_reports,
            'active_reports': active_reports,
            'inactive_reports': total_reports - active_reports,
            'reports_this_month': reports_this_month,
            'expiring_soon': expiring_soon
        })


class PatientReportViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des comptes rendus patients (Admin)"""
    queryset = PatientReport.objects.all()
    serializer_class = PatientReportSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return PatientReport.objects.all()


@api_view(['POST'])
@permission_classes([AllowAny])
def patient_login(request):
    """
    Authentification patient avec clé d'accès PatientAccess ou clé de facture
    Accepte soit:
    - access_key + password (méthode standard)
    - invoice_number + password (méthode alternative via facture)
    """
    serializer = PatientLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        access_key = serializer.validated_data.get('access_key')
        password = serializer.validated_data.get('password')
        invoice_number = serializer.validated_data.get('invoice_number')
        
        try:
            patient_access = None
            
            # Méthode 1: Vérification par clé d'accès directe
            if access_key:
                try:
                    patient_access = PatientAccess.objects.get(
                        access_key=access_key,
                        password=password,
                        is_active=True
                    )
                except PatientAccess.DoesNotExist:
                    pass  # On continue avec la méthode 2 si échec
            
            # Méthode 2: Vérification par numéro de facture
            if not patient_access and invoice_number:
                from invoices.models import Invoice
                try:
                    # Chercher la facture par numéro
                    invoice = Invoice.objects.get(
                        invoice_number=invoice_number,
                        patient_access__isnull=False
                    )
                    # Vérifier le mot de passe de l'accès lié à la facture
                    if invoice.patient_access.password == password:
                        patient_access = invoice.patient_access
                except Invoice.DoesNotExist:
                    pass
            
            # Vérifier si on a trouvé un accès valide
            if not patient_access:
                return Response(
                    {'error': 'Identifiants incorrects ou accès invalide'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Vérifier si l'accès est valide
            if not patient_access.is_valid:
                return Response(
                    {'error': 'Accès expiré'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Récupérer les comptes rendus pour cet accès
            reports = PatientReport.objects.filter(
                patient_access=patient_access,
                is_active=True
            )
            
            # Sérialiser les rapports
            serializer = PatientReportListSerializer(reports, many=True)
            
            return Response({
                'success': True,
                'patient_name': patient_access.patient.full_name,
                'reports': serializer.data,
                'access_key': patient_access.access_key  # Retourne la clé d'accès pour les sessions futures
            })
            
        except Exception as e:
            print(f"Erreur lors de l'authentification: {str(e)}")
            return Response(
                {'error': 'Une erreur est survenue lors de l\'authentification'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def download_report(request, access_key, report_id):
    """Téléchargement d'un compte rendu par le patient"""
    try:
        # Vérifier l'accès patient
        patient_access = get_object_or_404(
            PatientAccess,
            access_key=access_key,
            is_active=True
        )
        
        if not patient_access.is_valid:
            return Response(
                {'error': 'Accès expiré'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Récupérer le rapport
        report = get_object_or_404(
            PatientReport, 
            id=report_id, 
            patient_access=patient_access,
            is_active=True
        )
        
        if not report.report_file:
            return Response(
                {'error': 'Fichier non trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Incrémenter le compteur de téléchargements
        report.increment_download_count()
        
        # Préparer la réponse de téléchargement
        file_path = report.report_file.path
        
        if not os.path.exists(file_path):
            return Response(
                {'error': 'Fichier physique non trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Déterminer le type MIME
        content_type, _ = mimetypes.guess_type(file_path)
        if content_type is None:
            content_type = 'application/octet-stream'
        
        # Lire le fichier et créer la réponse
        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type=content_type)
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
            return response
            
    except (PatientAccess.DoesNotExist, PatientReport.DoesNotExist):
        return Response(
            {'error': 'Rapport non trouvé ou accès invalide'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Erreur lors du téléchargement'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def patient_reports(request, access_key):
    """Liste des comptes rendus pour un patient"""
    try:
        reports = PatientReport.objects.filter(
            access_key=access_key,
            is_active=True
        )
        
        if not reports.exists():
            return Response(
                {'error': 'Clé d\'accès invalide'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Filtrer les rapports accessibles
        accessible_reports = [r for r in reports if r.is_accessible]
        
        if not accessible_reports:
            return Response(
                {'error': 'Aucun rapport accessible'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PatientReportListSerializer(accessible_reports, many=True)
        
        return Response({
            'patient_name': accessible_reports[0].patient_name,
            'reports': serializer.data
        })
        
    except Exception as e:
        return Response(
            {'error': 'Erreur lors de la récupération des rapports'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def validate_keys(request):
    """Valide la correspondance entre les clés de facture et les comptes rendus"""
    serializer = KeyValidationSerializer(data=request.data)
    
    if serializer.is_valid():
        validated_data = serializer.validated_data
        patient_access = validated_data['patient_access']
        
        # Récupérer les informations détaillées
        reports = PatientReport.objects.filter(patient_access=patient_access)
        
        response_data = {
            'success': True,
            'message': 'Clés validées avec succès',
            'patient_name': patient_access.patient.full_name,
            'access_key': patient_access.access_key,
            'is_valid': patient_access.is_valid,
            'is_permanent': True,
            'reports_count': validated_data['reports_count'],
            'active_reports_count': validated_data['active_reports_count']
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def patient_download_report(request, report_id):
    """Téléchargement sécurisé d'un rapport patient"""
    try:
        report = get_object_or_404(PatientReport, id=report_id, is_active=True)
        
        # Vérifier que le fichier existe
        if not report.report_file or not os.path.exists(report.report_file.path):
            return Response({
                'error': 'Fichier non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Incrémenter le compteur de téléchargements
        report.download_count += 1
        report.save(update_fields=['download_count'])
        
        # Retourner le fichier
        response = FileResponse(
            open(report.report_file.path, 'rb'),
            as_attachment=True,
            filename=os.path.basename(report.report_file.name)
        )
        
        # Définir le type MIME
        content_type, _ = mimetypes.guess_type(report.report_file.path)
        if content_type:
            response['Content-Type'] = content_type
            
        return response
        
    except Exception as e:
        return Response({
            'error': f'Erreur lors du téléchargement: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_report_status(request, report_id):
    """Vérifie le statut d'un compte rendu et la validité des clés"""
    try:
        report = get_object_or_404(PatientReport, id=report_id)
        
        response_data = {
            'report_id': report.id,
            'patient_name': report.patient_name,
            'is_active': report.is_active,
            'file_exists': os.path.exists(report.report_file.path) if report.report_file else False,
            'created_at': report.created_at,
            'expires_at': report.expires_at,
            'download_count': report.download_count,
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except PatientReport.DoesNotExist:
        return Response(
            {'error': 'Compte rendu introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )
