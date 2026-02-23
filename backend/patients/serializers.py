from rest_framework import serializers
from .models import Patient, PatientAccess

class PatientSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 
            'date_of_birth', 'gender', 'phone_number', 
            'address', 'email', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PatientAccessSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    is_valid = serializers.ReadOnlyField()
    
    class Meta:
        model = PatientAccess
        fields = [
            'id', 'patient', 'patient_name', 'access_key', 'password',
            'is_active', 'access_count', 'last_accessed', 'sent_via_sms', 
            'sent_via_email', 'is_valid', 'created_at'
        ]
        read_only_fields = ['access_key', 'password', 'created_at', 'access_count', 'last_accessed']