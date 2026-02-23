from rest_framework import serializers
from .models import Patient, PatientAccess


class PatientLoginSerializer(serializers.Serializer):
    """Serializer pour l'authentification patient"""
    access_key = serializers.CharField(max_length=20)
    password = serializers.CharField(max_length=12)


class PatientAccessSerializer(serializers.ModelSerializer):
    """Serializer pour les accès patients"""
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    
    class Meta:
        model = PatientAccess
        fields = [
            'id', 'patient', 'patient_name', 'access_key', 'password', 'valid_from', 
            'valid_until', 'is_active', 'access_count', 'last_accessed',
            'created_by', 'created_at', 'sent_via_sms', 'sent_via_email'
        ]
        read_only_fields = ['access_key', 'password', 'access_count', 'last_accessed', 'patient_name']


# class ExamFileSerializer(serializers.ModelSerializer):
#     """Serializer pour les fichiers d'examen - DÉSACTIVÉ"""
#     # Fonctionnalité désactivée car ExamFile n'existe plus
#     pass


# class PatientFileListSerializer(serializers.ModelSerializer):
#     """Serializer simplifié pour la liste des fichiers côté patient - DÉSACTIVÉ"""
#     # Fonctionnalité désactivée car ExamFile n'existe plus
#     pass
