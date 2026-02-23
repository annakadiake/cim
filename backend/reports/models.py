import uuid
import secrets
from django.db import models
from django.core.files.storage import default_storage
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta
from patients.models import PatientAccess


class PatientReport(models.Model):
    """Modèle pour les comptes rendus patients"""
    
    # Lien vers l'accès patient (qui contient la clé et les infos patient)
    patient_access = models.ForeignKey(
        PatientAccess, 
        on_delete=models.CASCADE, 
        related_name='reports',
        verbose_name="Accès patient",
        null=True, blank=True  # Temporaire pour la migration
    )
    
    # Fichier du compte rendu
    report_file = models.FileField(
        upload_to='reports/', 
        verbose_name="Fichier du compte rendu"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name="Date d'expiration")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    download_count = models.IntegerField(default=0, verbose_name="Nombre de téléchargements")
    
    class Meta:
        verbose_name = "Compte rendu patient"
        verbose_name_plural = "Comptes rendus patients"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.patient_access.patient.full_name} - {self.patient_access.access_key}"
    
    def save(self, *args, **kwargs):
        # Validation des clés et activation automatique
        self.validate_and_activate()
        super().save(*args, **kwargs)
    
    @property
    def is_expired(self):
        """Vérifie si l'accès a expiré"""
        return not self.patient_access.is_valid
    
    @property
    def is_accessible(self):
        """Vérifie si le compte rendu est accessible"""
        return self.is_active and self.patient_access.is_valid
    
    @property
    def patient_name(self):
        """Nom du patient via PatientAccess"""
        return self.patient_access.patient.full_name
    
    @property
    def access_key(self):
        """Clé d'accès via PatientAccess"""
        return self.patient_access.access_key
    
    def validate_and_activate(self):
        """Valide les clés et active automatiquement le compte rendu"""
        if not self.patient_access:
            raise ValidationError("Un accès patient doit être associé au compte rendu")
        
        # Vérifier que l'accès patient est valide
        if not self.patient_access.is_valid:
            raise ValidationError("L'accès patient associé n'est pas valide ou a expiré")
        
        # Vérifier s'il y a une facture associée avec les mêmes clés
        from invoices.models import Invoice
        matching_invoice = Invoice.objects.filter(
            patient=self.patient_access.patient,
            patient_access=self.patient_access
        ).first()
        
        if not matching_invoice:
            # Créer un warning mais ne pas bloquer
            print(f"ATTENTION: Aucune facture trouvée avec les clés d'accès {self.patient_access.access_key}")
        
        # Activer automatiquement le compte rendu
        self.is_active = True
        
        # Définir la date d'expiration si elle n'existe pas (clés permanentes)
        if not self.expires_at:
            self.expires_at = None  # Clés permanentes sans expiration
    
    def validate_invoice_key_match(self):
        """Vérifie que les clés de la facture correspondent aux clés du patient report"""
        from invoices.models import Invoice
        
        # Chercher une facture avec le même patient et les mêmes clés d'accès
        matching_invoices = Invoice.objects.filter(
            patient=self.patient_access.patient,
            patient_access=self.patient_access
        )
        
        if not matching_invoices.exists():
            return False, f"Aucune facture trouvée avec les clés d'accès {self.patient_access.access_key}"
        
        return True, f"Clés validées avec la facture {matching_invoices.first().invoice_number}"
    
    def increment_download_count(self):
        """Incrémente le compteur de téléchargements"""
        self.download_count += 1
        self.save(update_fields=['download_count'])
