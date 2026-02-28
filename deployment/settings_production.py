"""
CIMEF - Settings de production
Copier ce fichier dans backend/medical_billing/settings_production.py
puis dans le .env mettre DJANGO_SETTINGS_MODULE=medical_billing.settings_production
OU simplement modifier settings.py avec ces valeurs.
"""

# Importer tous les settings de base
from .settings import *

# ============================================
# MODIFICATIONS POUR LA PRODUCTION
# ============================================

DEBUG = False

# Mettre votre domaine et IP ici
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost').split(',')

# Sécurité HTTPS (activer quand vous aurez un domaine + SSL)
# SECURE_SSL_REDIRECT = True
# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True
# SECURE_HSTS_SECONDS = 31536000
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True

# CORS
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    'http://147.182.252.89',
]
CSRF_TRUSTED_ORIGINS = [
    'http://147.182.252.89',
]

# Logging production
LOGGING['handlers']['file']['filename'] = '/var/log/cimef/django.log'
LOGGING['loggers']['django']['level'] = 'WARNING'
LOGGING['loggers']['core']['level'] = 'INFO'
LOGGING['loggers']['authentication']['level'] = 'INFO'
