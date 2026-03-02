from django.http import JsonResponse
import re
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class RoleBasedAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # Liste des chemins qui ne nécessitent pas d'authentification
        self.public_paths = [
            r'^/$',  # Root URL
            r'^/admin/.*$',  # Admin interface
            r'^/api/auth/token/.*$',  # Token endpoint
            r'^/api/auth/token/.*$',  # Authentication endpoints
            r'^/api/auth/token/refresh/.*$',
            r'^/api/auth/refresh/.*$',  # Token refresh
            r'^/api/patient-portal/.*$',  # Patient portal
            r'^/api/patients/portal/.*$',  # Patient portal login
            r'^/api/reports/patient-login/.*$',  # Patient login for reports
            r'^/api/reports/patient-download/.*$',  # Patient report download
            r'^/media/.*$',  # Media files
            r'^/static/.*$',  # Static files
            r'^/favicon\.ico$',
            r'^/health/$',
            r'^/swagger/.*$',  # API documentation
            r'^/redoc/.*$',  # API documentation
        ]
        
        # Définition des permissions par rôle
        self.role_permissions = {
            'superuser': {
                'patterns': [r'^/.*$'],  # Accès complet
                'name': 'Superutilisateur',
            },
            'admin': {
                'patterns': [
                    r'^/api/patients/.*$',
                    r'^/api/exams/.*$',
                    r'^/api/invoices/.*$',
                    r'^/api/payments/.*$',
                    r'^/api/reports/.*$',
                    r'^/api/auth/.*$',
                    r'^/admin/.*$',
                ],
                'name': 'Administrateur',
            },
            'doctor': {
                'patterns': [
                    r'^/api/patients/.*$',
                    r'^/api/exams/.*$',
                    r'^/api/reports/.*$',
                    r'^/api/auth/.*$',
                ],
                'name': 'Docteur',
            },
            'secretary': {
                'patterns': [
                    r'^/api/patients/.*$',
                    r'^/api/exams/.*$',
                    r'^/api/invoices/.*$',
                    r'^/api/payments/.*$',
                    r'^/api/reports/.*$',
                    r'^/api/auth/.*$',
                ],
                'name': 'Secrétaire',
            },
            'accountant': {
                'patterns': [
                    r'^/api/patients/.*$',
                    r'^/api/exams/.*$',
                    r'^/api/invoices/.*$',
                    r'^/api/payments/.*$',
                    r'^/api/auth/.*$',
                ],
                'name': 'Comptable',
            }
        }

    def __call__(self, request):
        # Handle OPTIONS requests for CORS preflight
        if request.method == 'OPTIONS':
            response = JsonResponse({}, status=200)
            response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-CSRFToken'
            response['Access-Control-Allow-Credentials'] = 'true'
            return response
            
        # Vérifier si le chemin est public
        if any(re.match(path, request.path) for path in self.public_paths):
            response = self.get_response(request)
            response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response['Access-Control-Allow-Credentials'] = 'true'
            return response
            
        # Traiter la requête d'abord pour permettre l'authentification JWT
        response = self.get_response(request)
        
        # Si la réponse est déjà une erreur 401, la retourner directement
        if hasattr(response, 'status_code') and response.status_code == 401:
            response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response['Access-Control-Allow-Credentials'] = 'true'
            return response
            
        if not request.user.is_authenticated:
            logger.warning(f"Accès refusé: non authentifié - {request.path}")
            response = JsonResponse(
                {'detail': 'Authentification requise'}, 
                status=401
            )
            response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response['Access-Control-Allow-Credentials'] = 'true'
            return response
        
        if not request.user.is_active:
            logger.warning(f"Compte inactif: {request.user.username}")
            return JsonResponse(
                {
                    'detail': 'Ce compte est désactivé. Veuillez contacter un administrateur.',
                    'code': 'account_disabled',
                },
                status=403,
                json_dumps_params={'ensure_ascii': False}
            )
            
        # Vérifier les autorisations basées sur le rôle
        user_role = getattr(request.user, 'role', None)
        
        if not user_role or user_role not in self.role_permissions:
            logger.warning(f"Rôle non reconnu: {request.user.username} - {user_role}")
            return JsonResponse(
                {
                    'detail': 'Rôle non reconnu. Accès refusé.',
                    'code': 'invalid_role',
                },
                status=403,
                json_dumps_params={'ensure_ascii': False}
            )
            
        # Vérifier si le chemin correspond aux patterns d'autorisation du rôle
        role_patterns = self.role_permissions[user_role]['patterns']
        has_access = any(re.match(pattern, request.path) for pattern in role_patterns)
        
        if not has_access:
            logger.warning(f"Accès refusé: {request.user.username} ({user_role}) sur {request.path}")
            return JsonResponse(
                {
                    'detail': 'Vous n\'avez pas la permission d\'accéder à cette ressource.',
                    'code': 'permission_denied',
                },
                status=403,
                json_dumps_params={'ensure_ascii': False}
            )
        
        # Ajouter les headers et retourner la réponse
        response['X-User-Role'] = user_role
        response['X-User-Id'] = str(request.user.id)
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Credentials'] = 'true'
        
        return response
