from rest_framework import serializers
from .models import Invoice, InvoiceItem
from patients.serializers import PatientSerializer
from exams.serializers import ExamTypeSerializer

class InvoiceItemSerializer(serializers.ModelSerializer):
    exam_type_details = ExamTypeSerializer(source='exam_type', read_only=True)
    
    class Meta:
        model = InvoiceItem
        fields = [
            'id', 'exam_type', 'exam_type_details', 
            'quantity', 'unit_price', 'total_price'
        ]
        read_only_fields = ['total_price']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    patient_details = PatientSerializer(source='patient', read_only=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'patient', 'patient_details', 'patient_name',
            'created_by', 'created_by_name', 'invoice_date', 'due_date',
            'status', 'subtotal', 'tax_rate', 'tax_amount', 'total_amount', 
            'notes', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'invoice_number', 'subtotal', 'tax_amount', 'total_amount', 
            'created_by', 'created_at', 'updated_at'
        ]