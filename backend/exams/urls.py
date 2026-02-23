from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamTypeViewSet

router = DefaultRouter()
router.register(r'', ExamTypeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]