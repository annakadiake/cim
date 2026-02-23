from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Modèle utilisateur personnalisé pour le système hospitalier.
    """
    ROLE_CHOICES = [
        ('superuser', 'Superutilisateur'),
        ('admin', 'Administrateur'),
        ('doctor', 'Docteur'),
        ('secretary', 'Secrétaire'),
        ('accountant', 'Comptable'),
    ]
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='secretary',
        verbose_name=_("Rôle")
    )
    
    phone_number = models.CharField(
        max_length=17,
        blank=True,
        null=True,
        verbose_name=_("Téléphone")
    )
    
    department = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Service")
    )
    
    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = 'superuser'
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = _("utilisateur")
        verbose_name_plural = _("utilisateurs")
    
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
    
    @property
    def is_admin(self):
        return self.role in ['superuser', 'admin']
    
    @property
    def is_superuser_role(self):
        return self.role == 'superuser'
    
    @property
    def is_doctor(self):
        return self.role == 'doctor'
    
    @property
    def is_secretary(self):
        return self.role == 'secretary'
    
    @property
    def is_accountant(self):
        return self.role == 'accountant'
    
    def get_dashboard_url(self):
        """Retourne l'URL du dashboard selon le rôle"""
        dashboard_urls = {
            'superuser': '/dashboard/superuser',
            'admin': '/dashboard/admin',
            'doctor': '/dashboard/doctor',
            'secretary': '/dashboard/secretary',
            'accountant': '/dashboard/accountant',
        }
        return dashboard_urls.get(self.role, '/dashboard')
    
    def get_permissions(self):
        """Retourne les permissions selon le rôle"""
        permissions = {
            'superuser': ['all'],
            'admin': ['patients', 'exams', 'invoices', 'invoices_full', 'payments', 'reports', 'users'],
            'doctor': ['patients', 'exams', 'reports'],
            'secretary': ['patients', 'appointments', 'invoices', 'exams', 'reports'],
            'accountant': ['invoices', 'invoices_full', 'payments', 'patients'],
        }
        return permissions.get(self.role, [])
