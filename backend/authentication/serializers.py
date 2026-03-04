from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import User

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Rendre le nom d'utilisateur insensible à la casse
        username = attrs.get('username', '')
        try:
            user_obj = User.objects.get(username__iexact=username)
            attrs['username'] = user_obj.username
        except User.DoesNotExist:
            pass
        
        data = super().validate(attrs)
        
        # Vérifier que l'utilisateur est actif
        if not self.user.is_active:
            raise serializers.ValidationError("Ce compte est désactivé. Veuillez contacter l'administrateur.")
        
        # Créer une notification de connexion (ne doit jamais bloquer le login)
        # Pas de notification pour les superusers
        if not self.user.is_superuser:
            try:
                from .models import LoginNotification
                request = self.context.get('request')
                ip_address = None
                if request:
                    ip_address = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip() or request.META.get('REMOTE_ADDR')
                LoginNotification.objects.create(
                    user=self.user,
                    ip_address=ip_address,
                )
            except Exception:
                pass
        
        # Informations utilisateur avec rôle
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': getattr(self.user, 'role', 'admin'),
            'department': getattr(self.user, 'department', ''),
            'is_active': self.user.is_active,
            'is_staff': self.user.is_staff,
            'is_superuser': self.user.is_superuser,
        }
        
        return data

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'role', 'department', 'phone_number', 'password', 'is_active')
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data, password=password)
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        
        if password:
            user.set_password(password)
            user.save()
        
        return user


class LoginNotificationSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    class Meta:
        from .models import LoginNotification
        model = LoginNotification
        fields = ['id', 'user', 'user_name', 'user_role', 'login_time', 'ip_address', 'is_read']
        read_only_fields = ['id', 'user', 'user_name', 'user_role', 'login_time', 'ip_address']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_user_role(self, obj):
        return obj.user.get_role_display()
