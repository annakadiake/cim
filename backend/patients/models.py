from django.db import models
from django.core.validators import RegexValidator
from django.conf import settings
import secrets
import string
from datetime import datetime, timedelta
from django.utils import timezone

class Patient(models.Model):
    GENDER_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]
    
    first_name = models.CharField(max_length=100, verbose_name="Prénom")
    last_name = models.CharField(max_length=100, verbose_name="Nom")
    date_of_birth = models.DateField(verbose_name="Date de naissance")
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name="Sexe")
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{8,15}$',
        message="Le numéro de téléphone doit être au format: '+999999999'. Jusqu'à 15 chiffres autorisés."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17, verbose_name="Téléphone")
    
    address = models.TextField(blank=True, verbose_name="Adresse")
    email = models.EmailField(blank=True, verbose_name="Email")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Patient"
        verbose_name_plural = "Patients"
        indexes = [
            models.Index(fields=['first_name', 'last_name']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['email']),
            models.Index(fields=['created_at']),
            models.Index(fields=['date_of_birth']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class PatientAccess(models.Model):
    """Modèle pour gérer l'accès sécurisé permanent des patients à leurs résultats"""
    
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='access')
    access_key = models.CharField(max_length=20, unique=True, verbose_name="Clé d'accès")
    password = models.CharField(max_length=12, verbose_name="Mot de passe")
    
    # Statut et utilisation
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    access_count = models.PositiveIntegerField(default=0, verbose_name="Nombre d'accès")
    last_accessed = models.DateTimeField(null=True, blank=True, verbose_name="Dernier accès")
    
    # Métadonnées
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Créé par")
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Notifications
    sent_via_sms = models.BooleanField(default=False, verbose_name="Envoyé par SMS")
    sent_via_email = models.BooleanField(default=False, verbose_name="Envoyé par Email")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Accès Patient"
        verbose_name_plural = "Accès Patients"
        indexes = [
            models.Index(fields=['access_key']),
            models.Index(fields=['is_active']),
            models.Index(fields=['access_count']),
            models.Index(fields=['last_accessed']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Accès {self.access_key} - {self.patient.full_name}"
    
    def save(self, *args, **kwargs):
        if not self.access_key:
            self.access_key = self.generate_access_key()
        if not self.password:
            self.password = self.generate_password()
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_access_key():
        """Génère une clé d'accès unique de 12 caractères"""
        while True:
            key = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(12))
            if not PatientAccess.objects.filter(access_key=key).exists():
                return key
    
    @staticmethod
    def generate_password():
        """Génère un mot de passe de 8 caractères"""
        return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))
    
    @property
    def is_valid(self):
        """Vérifie si l'accès est valide (permanent tant qu'actif)"""
        return self.is_active
    
    def record_access(self):
        """Enregistre un accès"""
        self.access_count += 1
        self.last_accessed = timezone.now()
        self.save(update_fields=['access_count', 'last_accessed'])


