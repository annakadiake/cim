from django.db import models

class ExamType(models.Model):
    name = models.CharField(max_length=200, unique=True, verbose_name="Nom de l'examen")
    description = models.TextField(blank=True, verbose_name="Description")
    price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Prix (FCFA)")
    duration_minutes = models.PositiveIntegerField(default=30, verbose_name="Durée (minutes)")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = "Type d'examen"
        verbose_name_plural = "Types d'examens"
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['price']),
            models.Index(fields=['is_active']),
            models.Index(fields=['duration_minutes']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.price} FCFA"