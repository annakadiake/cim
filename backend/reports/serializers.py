from rest_framework import serializers
from .models import PatientReport
from patients.models import PatientAccess


class PatientReportSerializer(serializers.ModelSerializer):
    """Serializer pour les comptes rendus patients"""
    patient_name = serializers.SerializerMethodField()
    access_key = serializers.SerializerMethodField()
    patient_access = serializers.PrimaryKeyRelatedField(
        queryset=PatientAccess.objects.all(),
        error_messages={
            'does_not_exist': 'Aucun accès patient trouvé avec cet ID',
            'required': 'Le champ patient_access est obligatoire.'
        }
    )
    
    class Meta:
        model = PatientReport
        fields = [
            'id', 'patient_access', 'patient_name', 'access_key', 'report_file',
            'created_at', 'expires_at', 'is_active', 'download_count'
        ]
        read_only_fields = ['id', 'patient_name', 'access_key', 'created_at', 'download_count']
    
    def get_patient_name(self, obj):
        return obj.patient_access.patient.full_name if obj.patient_access and hasattr(obj.patient_access, 'patient') else 'Inconnu'
    
    def get_access_key(self, obj):
        return obj.patient_access.access_key if obj.patient_access else None
    
    def validate(self, attrs):
        # Vérifier que le fichier est présent
        if 'report_file' not in self.context['request'].FILES:
            raise serializers.ValidationError({"report_file": ["Aucun fichier n'a été fourni"]})
        return attrs


class PatientLoginSerializer(serializers.Serializer):
    """
    Serializer pour la connexion patient.
    Accepte soit:
    - access_key + password (méthode standard)
    - invoice_number + password (méthode alternative via facture)
    """
    access_key = serializers.CharField(
        max_length=20, 
        required=False,
        allow_blank=True,
        help_text="Clé d'accès patient (12 caractères alphanumériques)"
    )
    invoice_number = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
        help_text="Numéro de facture (alternative à la clé d'accès)"
    )
    password = serializers.CharField(
        max_length=12, 
        required=True,
        help_text="Mot de passe d'accès (8 caractères alphanumériques)"
    )
    
    def validate(self, data):
        # Vérifier qu'au moins un identifiant est fourni
        if not data.get('access_key') and not data.get('invoice_number'):
            raise serializers.ValidationError({
                'non_field_errors': ['Une clé d\'accès ou un numéro de facture est requis']
            })
            
        # Vérifier que les deux ne sont pas fournis en même temps
        if data.get('access_key') and data.get('invoice_number'):
            raise serializers.ValidationError({
                'non_field_errors': ['Utilisez soit la clé d\'accès, soit le numéro de facture, pas les deux']
            })
            
        return data


class PatientReportListSerializer(serializers.ModelSerializer):
    """Serializer pour lister les comptes rendus d'un patient"""
    file_name = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientReport
        fields = [
            'id', 'patient_name', 'file_name', 'file_size',
            'created_at', 'expires_at', 'download_count'
        ]
    
    def get_file_name(self, obj):
        """Retourne le nom du fichier"""
        if obj.report_file:
            return obj.report_file.name.split('/')[-1]
        return None
    
    def get_file_size(self, obj):
        """Retourne la taille du fichier en bytes"""
        if obj.report_file:
            try:
                return obj.report_file.size
            except:
                return None
        return None


class KeyValidationSerializer(serializers.Serializer):
    """Serializer pour valider la correspondance des clés entre factures et comptes rendus"""
    access_key = serializers.CharField(max_length=20, help_text="Clé d'accès patient")
    
    def validate(self, data):
        access_key = data.get('access_key')
        
        # Vérifier que la clé d'accès existe
        try:
            patient_access = PatientAccess.objects.get(access_key=access_key)
            data['patient_access'] = patient_access
            
            # Compter les rapports actifs
            reports = PatientReport.objects.filter(patient_access=patient_access)
            data['reports_count'] = reports.count()
            data['active_reports_count'] = reports.filter(is_active=True).count()
            
            return data
            
        except PatientAccess.DoesNotExist:
            raise serializers.ValidationError({
                'access_key': 'Clé d\'accès invalide'
            })
