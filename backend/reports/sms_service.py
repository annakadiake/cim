"""
Service d'envoi SMS via Orange API Sénégal
Documentation: https://developer.orange.com/apis/sms-sn

Prérequis:
1. Créer un compte sur https://developer.orange.com
2. Créer une application et souscrire à l'API "SMS Senegal"
3. Récupérer le Client ID et Client Secret
4. Acheter un bundle SMS avec votre numéro Orange
"""

import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class OrangeSMSService:
    """Service pour envoyer des SMS via l'API Orange Sénégal"""
    
    TOKEN_URL = 'https://api.orange.com/oauth/v3/token'
    SMS_URL = 'https://api.orange.com/smsmessaging/v1/outbound/tel:+221{sender}/requests'
    
    @property
    def client_id(self):
        return getattr(settings, 'ORANGE_SMS_CLIENT_ID', '')
    
    @property
    def client_secret(self):
        return getattr(settings, 'ORANGE_SMS_CLIENT_SECRET', '')
    
    @property
    def sender_number(self):
        return getattr(settings, 'ORANGE_SMS_SENDER_NUMBER', '')
    
    @property
    def enabled(self):
        return getattr(settings, 'ORANGE_SMS_ENABLED', False)
    
    def get_access_token(self):
        """Obtenir un token OAuth2 depuis l'API Orange"""
        try:
            response = requests.post(
                self.TOKEN_URL,
                headers={
                    'Authorization': f'Basic {self._get_basic_auth()}',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data={'grant_type': 'client_credentials'},
                timeout=10,
            )
            response.raise_for_status()
            return response.json().get('access_token')
        except requests.RequestException as e:
            logger.error(f"Erreur lors de l'obtention du token Orange SMS: {e}")
            print(f"[SMS] Erreur token: {e}")
            return None
    
    def _get_basic_auth(self):
        """Encode les credentials en Base64 pour l'auth Basic"""
        import base64
        credentials = f"{self.client_id}:{self.client_secret}"
        return base64.b64encode(credentials.encode()).decode()
    
    def format_phone_number(self, phone_number):
        """Formate le numéro de téléphone au format international sénégalais"""
        phone = phone_number.strip().replace(' ', '').replace('-', '')
        
        # Déjà au format +221XXXXXXXXX
        if phone.startswith('+221'):
            return phone
        # Format 221XXXXXXXXX
        if phone.startswith('221') and len(phone) >= 12:
            return f'+{phone}'
        # Format 7XXXXXXXX (numéro local sénégalais)
        if phone.startswith('7') and len(phone) == 9:
            return f'+221{phone}'
        # Format 07XXXXXXXX
        if phone.startswith('07') and len(phone) == 10:
            return f'+221{phone[1:]}'
        
        # Par défaut, ajouter +221
        if not phone.startswith('+'):
            return f'+221{phone}'
        
        return phone
    
    def send_sms(self, phone_number, message):
        """
        Envoyer un SMS via l'API Orange
        
        Args:
            phone_number: Numéro du destinataire
            message: Contenu du SMS (max 160 caractères pour 1 SMS)
        
        Returns:
            (success: bool, detail: str)
        """
        print(f"[SMS] send_sms appelé - enabled={self.enabled}, phone={phone_number}")
        if not self.enabled:
            print(f"[SMS] DESACTIVE. Message pour {phone_number}: {message}")
            return False, "SMS désactivé dans la configuration"
        
        if not self.client_id or not self.client_secret:
            logger.error("Orange SMS: Client ID ou Client Secret manquant")
            return False, "Configuration Orange SMS incomplète"
        
        # Obtenir le token
        token = self.get_access_token()
        if not token:
            return False, "Impossible d'obtenir le token Orange SMS"
        
        # Formater le numéro
        formatted_phone = self.format_phone_number(phone_number)
        sender = self.sender_number.replace('+221', '').replace('+', '')
        
        # Construire la requête
        url = self.SMS_URL.format(sender=sender)
        payload = {
            "outboundSMSMessageRequest": {
                "address": f"tel:{formatted_phone}",
                "senderAddress": f"tel:+221{sender}",
                "outboundSMSTextMessage": {
                    "message": message
                }
            }
        }
        
        try:
            response = requests.post(
                url,
                json=payload,
                headers={
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json',
                },
                timeout=10,
            )
            response.raise_for_status()
            print(f"[SMS] SMS envoyé avec succès à {formatted_phone} - Status: {response.status_code}")
            return True, "SMS envoyé avec succès"
            
        except requests.RequestException as e:
            logger.error(f"Erreur envoi SMS à {formatted_phone}: {e}")
            error_detail = str(e)
            try:
                error_detail = response.json().get('message', str(e))
            except Exception:
                pass
            return False, f"Erreur envoi SMS: {error_detail}"
    
    def send_report_notification(self, patient_report):
        """
        Envoyer une notification SMS au patient quand son compte rendu est uploadé
        
        Args:
            patient_report: Instance de PatientReport
        
        Returns:
            (success: bool, detail: str)
        """
        try:
            patient = patient_report.patient_access.patient
            access = patient_report.patient_access
            phone_number = patient.phone_number
            
            if not phone_number:
                return False, "Le patient n'a pas de numéro de téléphone"
            
            # Construire le lien du portail patient
            portal_url = getattr(settings, 'PATIENT_PORTAL_URL', 'http://localhost:5173/patient')
            
            # Message SMS
            message = (
                f"CIMEF - Bonjour {patient.first_name}, "
                f"votre compte rendu est disponible. "
                f"Connectez-vous sur {portal_url} "
                f"avec votre cle: {access.access_key} "
                f"et mot de passe: {access.password}"
            )
            
            # Tronquer si trop long (160 chars max par SMS, mais Orange gère le multi-part)
            if len(message) > 459:
                message = message[:456] + "..."
            
            success, detail = self.send_sms(phone_number, message)
            
            if success:
                # Marquer comme envoyé par SMS
                access.sent_via_sms = True
                access.save(update_fields=['sent_via_sms'])
            
            return success, detail
            
        except Exception as e:
            logger.error(f"Erreur notification SMS compte rendu: {e}")
            return False, f"Erreur: {str(e)}"


# Instance singleton
sms_service = OrangeSMSService()
