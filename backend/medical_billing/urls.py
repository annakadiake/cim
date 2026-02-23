from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponseRedirect
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.search import global_search, quick_search_patients, search_statistics

# Router pour PatientAccess (supprimé - géré dans patients/urls.py)

def redirect_to_admin(request):
    return HttpResponseRedirect('/admin/')

urlpatterns = [
    path('', redirect_to_admin, name='home'),
    path('admin/', admin.site.urls),
    # Authentification et gestion des utilisateurs
    path('api/auth/', include('authentication.urls')),  # Inclut login, refresh, et les tableaux de bord
    # Autres endpoints API
    path('api/patients/', include('patients.urls')),
    path('api/exams/', include('exams.urls')),
    path('api/invoices/', include('invoices.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/reports/', include('reports.urls')),
    # Endpoints de recherche globale
    path('api/search/', global_search, name='global-search'),
    path('api/search/patients/', quick_search_patients, name='quick-search-patients'),
    path('api/search/stats/', search_statistics, name='search-statistics'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)