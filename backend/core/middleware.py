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
        # Journalisation de la requête entrante
        logger.debug(f"[MIDDLEWARE] Requête reçue: {request.method} {request.path}")
        
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
            logger.debug(f"[MIDDLEWARE] Accès public autorisé pour: {request.path}")
            response = self.get_response(request)
            # Add CORS headers to the response
            response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response['Access-Control-Allow-Credentials'] = 'true'
            return response
            
        # Traiter la requête d'abord pour permettre l'authentification JWT
        response = self.get_response(request)
        
        # Vérifier si l'utilisateur est authentifié après traitement
        logger.debug(f"[MIDDLEWARE] Vérification de l'authentification pour: {request.path}")
        logger.debug(f"[MIDDLEWARE] Utilisateur dans la requête: {getattr(request, 'user', 'Non défini')}")
        logger.debug(f"[MIDDLEWARE] is_authenticated: {getattr(request.user, 'is_authenticated', 'Non défini')}")
        
        # Si la réponse est déjà une erreur 401, la retourner directement
        if hasattr(response, 'status_code') and response.status_code == 401:
            logger.warning(f"[MIDDLEWARE] Authentification échouée par DRF - {request.path}")
            response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response['Access-Control-Allow-Credentials'] = 'true'
            return response
            
        if not request.user.is_authenticated:
            logger.warning(f"[MIDDLEWARE] Accès refusé: utilisateur non authentifié - {request.path}")
            response = JsonResponse(
                {'detail': 'Authentification requise'}, 
                status=401
            )
            response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response['Access-Control-Allow-Credentials'] = 'true'
            return response
            
        logger.debug(f"[MIDDLEWARE] Accès administrateur autorisé - {request.path}")
        
        # Vérifier si l'utilisateur est actif
        logger.debug(f"[MIDDLEWARE] Vérification du statut actif pour l'utilisateur: {request.user.username}")
        logger.debug(f"[MIDDLEWARE] is_active: {request.user.is_active}")
        
        if not request.user.is_active:
            logger.warning(f"[MIDDLEWARE] Tentative de connexion d'un compte inactif: {request.user.username}")
            return JsonResponse(
                {
                    'detail': 'Ce compte est désactivé. Veuillez contacter un administrateur.',
                    'code': 'account_disabled',
                    'debug': {
                        'username': request.user.username,
                        'is_active': request.user.is_active
                    }
                },
                status=403,
                json_dumps_params={'ensure_ascii': False}
            )
            
        # Vérifier les autorisations basées sur le rôle
        user_role = getattr(request.user, 'role', None)
        logger.debug(f"[MIDDLEWARE] Rôle de l'utilisateur: {user_role}")
        logger.debug(f"[MIDDLEWARE] Rôles disponibles: {list(self.role_permissions.keys())}")
        
        # Si l'utilisateur n'a pas de rôle ou si le rôle n'est pas reconnu, accès refusé
        if not user_role or user_role not in self.role_permissions:
            logger.warning(
                f"[MIDDLEWARE] Rôle non reconnu pour l'utilisateur {request.user.username}: {user_role}"
                f" (Rôles valides: {list(self.role_permissions.keys())})"
            )
            return JsonResponse(
                {
                    'detail': 'Rôle non reconnu. Accès refusé.',
                    'code': 'invalid_role',
                    'debug': {
                        'user_role': user_role,
                        'valid_roles': list(self.role_permissions.keys()),
                    }
                },
                status=403,
                json_dumps_params={'ensure_ascii': False}
            )
            
        # Vérifier si le chemin correspond aux patterns d'autorisation du rôle
        role_patterns = self.role_permissions[user_role]['patterns']
        logger.debug(f"[MIDDLEWARE] Vérification de l'accès pour le rôle {user_role} sur {request.path}")
        logger.debug(f"[MIDDLEWARE] Patterns d'accès pour {user_role}: {role_patterns}")
        
        # Vérifier si au moins un pattern correspond
        has_access = any(re.match(pattern, request.path) for pattern in role_patterns)
        
        if not has_access:
            logger.warning(
                f"[MIDDLEWARE] Accès refusé pour le rôle {user_role} sur {request.path}. "
                f"Patterns requis: {role_patterns}"
            )
            return JsonResponse(
                {
                    'detail': 'Vous n\'avez pas la permission d\'accéder à cette ressource.',
                    'code': 'permission_denied',
                    'required_role': user_role,
                    'required_permission': self.role_permissions[user_role]['name'],
                    'debug': {
                        'path': request.path,
                        'role': user_role,
                        'patterns': role_patterns,
                        'method': request.method
                    }
                },
                status=403,
                json_dumps_params={'ensure_ascii': False}
            )
            
        # Journalisation de l'accès réussi
        logger.info(f"Accès autorisé pour {request.user.username} (rôle: {user_role}) sur {request.path}")
        
        # Si tout est OK, ajouter les headers CORS et retourner la réponse
        logger.debug(f"[MIDDLEWARE] Accès autorisé pour {request.user.username} (rôle: {user_role}) sur {request.path}")
        response['X-User-Role'] = user_role
        response['X-User-Id'] = str(request.user.id)
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Credentials'] = 'true'
        
        return response
