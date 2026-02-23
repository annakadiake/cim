from rest_framework import serializers
from .models import ExamType

class ExamTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamType
        fields = [
            'id', 'name', 'description', 'price', 
            'duration_minutes', 'is_active', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']