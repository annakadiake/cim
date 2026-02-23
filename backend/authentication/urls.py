from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, 
    UserViewSet, 
    current_user,
    system_stats,
    admin_stats,
    secretary_stats,
    accountant_stats
)
from .views_dashboard import (
    AdminDashboardView,
    DoctorDashboardView,
    SecretaryDashboardView,
    AccountantDashboardView
)

# Router pour les utilisateurs
router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', current_user, name='current_user'),
    path('system-stats/', system_stats, name='system_stats'),
    path('admin-stats/', AdminDashboardView.as_view(), name='admin_stats'),
    path('doctor-stats/', DoctorDashboardView.as_view(), name='doctor_stats'),
    path('secretary-stats/', SecretaryDashboardView.as_view(), name='secretary_stats'),
    path('accountant-stats/', AccountantDashboardView.as_view(), name='accountant_stats'),
    path('', include(router.urls)),
]
