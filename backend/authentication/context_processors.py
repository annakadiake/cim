from django.conf import settings

def site_info(request):
    """
    Ajoute des informations sur le site à tous les contextes de template.
    """
    return {
        'SITE_NAME': getattr(settings, 'SITE_NAME', 'CIMEF'),
        'SITE_URL': getattr(settings, 'SITE_URL', 'http://localhost:8000'),
        'SUPPORT_EMAIL': getattr(settings, 'SUPPORT_EMAIL', 'support@cimef.sn'),
        'COMPANY_NAME': getattr(settings, 'COMPANY_NAME', 'CIMEF'),
        'COMPANY_ADDRESS': getattr(settings, 'COMPANY_ADDRESS', ''),
        'COMPANY_PHONE': getattr(settings, 'COMPANY_PHONE', ''),
    }
