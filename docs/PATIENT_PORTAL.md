# 🔐 Portail Patient et Accès Sécurisé CIMEF

## 🎯 Vue d'Ensemble du Portail Patient

Le portail patient CIMEF offre un **accès sécurisé permanent** aux résultats d'examens via un système de clés d'accès uniques et réutilisables.

## 🔑 Système de Clés d'Accès Permanentes

### **Modèle PatientAccess**
```python
class PatientAccess(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE)
    access_key = models.CharField(max_length=12, unique=True)
    password = models.CharField(max_length=8)
    is_active = models.BooleanField(default=True)
    access_count = models.PositiveIntegerField(default=0)
    last_access = models.DateTimeField(null=True, blank=True)
    
    @property
    def is_valid(self):
        return self.is_active  # PERMANENT - Plus d'expiration !
```

### **Caractéristiques Clés**
- **🔄 Permanentes** : Pas d'expiration, utilisables à vie
- **🔒 Uniques** : Une seule clé par patient (OneToOneField)
- **🔐 Sécurisées** : Clé 12 chars + Mot de passe 8 chars
- **♻️ Réutilisables** : Mêmes identifiants pour tous les examens futurs

### **Génération Automatique**
```python
def generate_access_key(self):
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(12))

def generate_password(self):
    return ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(8))
```

## 🚪 Processus d'Authentification Patient

### **Endpoint de Connexion**
```
POST /api/patients/portal/login/
{
    "access_key": "ABC123DEF456",
    "password": "abc123de"
}
```

### **Workflow d'Authentification**
```python
def patient_login(self, request):
    access_key = request.data['access_key']
    password = request.data['password']
    
    try:
        patient_access = PatientAccess.objects.get(
            access_key=access_key,
            password=password
        )
        
        if not patient_access.is_valid:
            return Response({'error': 'Accès désactivé'}, status=401)
        
        # Traçage de l'accès
        patient_access.record_access()
        
        return Response({
            'success': True,
            'patient': {...},
            'access_info': {
                'is_permanent': True,
                'access_count': patient_access.access_count
            }
        })
    except PatientAccess.DoesNotExist:
        return Response({'error': 'Clé d\'accès ou mot de passe incorrect'}, status=401)
```

## 📋 Gestion des Comptes Rendus

### **Modèle PatientReport**
```python
class PatientReport(models.Model):
    patient_access = models.ForeignKey(PatientAccess, related_name='reports')
    report_file = models.FileField(upload_to='reports/')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    download_count = models.IntegerField(default=0)
    
    @property
    def is_accessible(self):
        return self.is_active and self.patient_access.is_valid
```

### **Validation Automatique**
```python
def validate_and_activate(self):
    # Vérifier que l'accès patient est valide
    if not self.patient_access.is_valid:
        raise ValidationError("L'accès patient associé n'est pas valide")
    
    # Vérifier correspondance avec facture
    matching_invoice = Invoice.objects.filter(
        patient=self.patient_access.patient,
        patient_access=self.patient_access
    ).first()
    
    # Activer automatiquement
    self.is_active = True
```

## 🔄 Workflow Complet d'Accès

### **1. Génération Automatique (Backend)**
```
Facture Payée → Génération Clés → Association Facture-Clés → PDF avec Clés
```

### **2. Distribution au Patient**
```python
def send_access_credentials(self, patient_access):
    message = f"""
Bonjour {patient.full_name},

Vos résultats d'examen sont disponibles.
Accédez à vos résultats sur : {settings.PATIENT_PORTAL_URL}

Clé d'accès : {patient_access.access_key}
Mot de passe : {patient_access.password}

⚠️ IMPORTANT : Ces identifiants sont permanents et réutilisables.
Conservez-les précieusement pour vos futurs accès.
    """
    
    # Envoi email + SMS (si configuré)
```

### **3. Accès Patient (Frontend)**
```
Patient → Portail → Saisie Clés → Authentification → Liste Résultats → Téléchargement
```

## 🛡️ Sécurité du Portail

### **Contrôles d'Accès**
- **Authentification** : Clé + mot de passe obligatoires
- **Validation** : Vérification is_active
- **Traçabilité** : Comptage accès + dernière connexion
- **Isolation** : Chaque patient voit uniquement ses résultats

### **Protection des Fichiers**
```python
def download_report(self, request, report_id):
    # Vérification accès patient
    patient_access = get_patient_access_from_session(request)
    
    # Vérification propriété du rapport
    report = get_object_or_404(
        PatientReport,
        id=report_id,
        patient_access=patient_access,
        is_active=True
    )
    
    # Incrémenter compteur
    report.increment_download_count()
    
    # Servir fichier sécurisé
    return serve_protected_file(report.report_file)
```

## 📱 Interface Patient

### **Page de Connexion**
- **Champs** : Clé d'accès + Mot de passe
- **Validation** : Temps réel côté client
- **Messages** : Erreurs claires et explicites
- **Design** : Simple et accessible

### **Dashboard Patient**
- **Informations** : Nom, téléphone, statut accès
- **Statistiques** : Nombre d'accès, dernière connexion
- **Résultats** : Liste des comptes rendus disponibles
- **Actions** : Téléchargement PDF sécurisé

### **Liste des Résultats**
```typescript
interface PatientReport {
    id: number;
    report_file: string;
    created_at: string;
    download_count: number;
    is_accessible: boolean;
    file_type: string;
    file_size: string;
}
```

## 🔗 Intégration Facture-Rapport

### **Validation Croisée**
```python
def validate_invoice_key_match(self):
    # Chercher facture avec mêmes clés d'accès
    matching_invoices = Invoice.objects.filter(
        patient=self.patient_access.patient,
        patient_access=self.patient_access
    )
    
    if not matching_invoices.exists():
        return False, "Aucune facture trouvée avec ces clés"
    
    return True, f"Clés validées avec facture {matching_invoices.first().invoice_number}"
```

### **Workflow Automatisé**
1. **Facturation** : Création facture + examens
2. **Paiement** : Enregistrement paiement
3. **Clés** : Génération automatique si facture payée
4. **PDF** : Facture avec clés dans encadré
5. **Upload** : Personnel upload compte rendu
6. **Validation** : Système vérifie clés facture ↔ rapport
7. **Activation** : Rapport automatiquement accessible
8. **Notification** : Patient informé par email/SMS

## 📊 Traçabilité et Audit

### **Métriques d'Accès**
```python
def record_access(self):
    self.access_count += 1
    self.last_accessed = timezone.now()
    self.save(update_fields=['access_count', 'last_accessed'])
```

### **Statistiques Disponibles**
- **Nombre total d'accès** : Par patient
- **Dernière connexion** : Timestamp précis
- **Téléchargements** : Comptage par rapport
- **Activité** : Historique des connexions

## 🎯 API Endpoints Patient

### **Authentification**
- `POST /api/patients/portal/login/` : Connexion patient
- `GET /api/patients/portal/profile/` : Profil patient
- `POST /api/patients/portal/logout/` : Déconnexion

### **Gestion Accès (Personnel)**
- `POST /api/patients/access/generate/` : Génération clés
- `GET /api/patients/access/` : Liste accès patients
- `PUT /api/patients/access/{id}/` : Modification accès

### **Rapports**
- `GET /api/reports/patient/` : Liste rapports patient
- `GET /api/reports/download/{id}/` : Téléchargement sécurisé

## 🔧 Configuration Portail

### **Variables d'Environnement**
```python
# settings.py
PATIENT_PORTAL_URL = 'http://localhost:5173/patient'
DEFAULT_FROM_EMAIL = 'noreply@cimef.sn'
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
```

### **Paramètres de Sécurité**
```python
# Durée de session patient (si nécessaire)
PATIENT_SESSION_TIMEOUT = 30  # minutes

# Nombre max de tentatives de connexion
MAX_LOGIN_ATTEMPTS = 5

# Délai entre tentatives
LOGIN_ATTEMPT_DELAY = 300  # secondes
```

## 📧 Notifications Patient

### **Email Automatique**
```python
def send_access_credentials(self, patient_access):
    message = f"""
Bonjour {patient.full_name},

Vos résultats d'examen sont disponibles.
Accédez à vos résultats sur : {settings.PATIENT_PORTAL_URL}

Clé d'accès : {patient_access.access_key}
Mot de passe : {patient_access.password}

⚠️ IMPORTANT : Ces identifiants sont permanents et réutilisables.
Conservez-les précieusement pour vos futurs accès.
    """
```

### **Canaux de Communication**
- **📧 Email** : Envoi automatique si email disponible
- **📱 SMS** : À implémenter (Twilio, Orange API)
- **📄 PDF** : Clés incluses dans facture
- **🗣️ Verbal** : Communication directe au cabinet

## 🔄 Cycle de Vie d'un Accès

### **Création**
```
Facture Payée → get_or_create(PatientAccess) → Génération Clés → Notification
```

### **Utilisation**
```
Patient Login → Validation Clés → Liste Rapports → Téléchargement → Comptage
```

### **Gestion**
```
Personnel → Activation/Désactivation → Régénération si nécessaire
```

## 🎯 Avantages du Système

### **✅ Pour les Patients**
- **Simplicité** : Mêmes identifiants à vie
- **Accessibilité** : 24h/24, 7j/7
- **Sécurité** : Accès protégé et personnel
- **Traçabilité** : Historique des consultations

### **✅ Pour le Personnel**
- **Automatisation** : Génération automatique
- **Gestion centralisée** : Interface admin
- **Traçabilité** : Audit complet des accès
- **Flexibilité** : Activation/désactivation

### **✅ Pour le Système**
- **Performance** : Optimisé gros volumes
- **Sécurité** : Validation croisée facture-rapport
- **Maintenance** : Pas de gestion d'expiration
- **Évolutivité** : Architecture extensible

## 🚨 Gestion d'Erreurs

### **Erreurs Communes**
- **Clés incorrectes** : "Clé d'accès ou mot de passe incorrect"
- **Accès désactivé** : "Accès désactivé"
- **Rapport indisponible** : "Ce rapport n'est plus accessible"
- **Fichier manquant** : "Fichier temporairement indisponible"

### **Messages Utilisateur**
```python
PATIENT_MESSAGES = {
    'login_success': 'Connexion réussie',
    'invalid_credentials': 'Clé d\'accès ou mot de passe incorrect',
    'access_disabled': 'Votre accès a été désactivé. Contactez le cabinet.',
    'no_reports': 'Aucun résultat disponible pour le moment',
    'download_success': 'Téléchargement démarré',
    'permanent_access': 'Vos identifiants sont permanents et réutilisables'
}
```

## 📱 Interface Frontend

### **Page de Connexion** (`/patient`)
```typescript
interface LoginForm {
    access_key: string;    // 12 caractères
    password: string;      // 8 caractères
}

const handleLogin = async (credentials: LoginForm) => {
    const response = await api.post('/patients/portal/login/', credentials);
    if (response.data.success) {
        setPatientSession(response.data);
        navigate('/patient/dashboard');
    }
};
```

### **Dashboard Patient** (`/patient/dashboard`)
- **Informations personnelles** : Nom, téléphone
- **Statut accès** : Permanent, nombre d'accès
- **Résultats disponibles** : Liste avec dates
- **Actions** : Téléchargement, impression

### **Composants React**
```typescript
// Composant de connexion patient
const PatientLogin: React.FC = () => {
    const [credentials, setCredentials] = useState({
        access_key: '',
        password: ''
    });
    
    return (
        <div className="patient-login">
            <h2>Accès à vos résultats</h2>
            <form onSubmit={handleLogin}>
                <input 
                    placeholder="Clé d'accès (12 caractères)"
                    maxLength={12}
                    value={credentials.access_key}
                />
                <input 
                    placeholder="Mot de passe (8 caractères)"
                    maxLength={8}
                    type="password"
                    value={credentials.password}
                />
                <button type="submit">Se connecter</button>
            </form>
        </div>
    );
};
```

## 🔗 Intégration avec le Workflow

### **Déclenchement Automatique**
```python
# Dans Invoice.save()
if not self.patient_access and self.status in ['sent', 'paid']:
    self.create_patient_access()

def create_patient_access(self):
    # Récupérer ou créer accès existant
    patient_access, created = PatientAccess.objects.get_or_create(
        patient=self.patient,
        defaults={'created_by': self.created_by}
    )
    
    if not created:
        # Réactiver accès existant
        patient_access.is_active = True
        patient_access.save()
    
    self.patient_access = patient_access
    self.save(update_fields=['patient_access'])
```

### **Inclusion dans PDF Facture**
```python
def get_access_keys_info(self):
    if self.patient_access:
        return {
            'access_key': self.patient_access.access_key,
            'password': self.patient_access.password,
            'is_permanent': True,
            'portal_url': settings.PATIENT_PORTAL_URL
        }
    return None
```

## 📊 Administration des Accès

### **Interface Admin Django**
- **Liste patients** : Avec statut accès
- **Actions en lot** : Activation/désactivation
- **Recherche** : Par nom, clé, statut
- **Statistiques** : Accès par patient

### **API de Gestion**
```python
@action(detail=False, methods=['post'], url_path='generate')
def generate_access(self, request):
    patient_id = request.data.get('patient_id')
    patient = Patient.objects.get(id=patient_id)
    
    # get_or_create pour réutiliser clés existantes
    patient_access, created = PatientAccess.objects.get_or_create(
        patient=patient,
        defaults={'created_by': request.user}
    )
    
    # Envoyer identifiants
    self.send_access_credentials(patient_access)
```

## 🎯 Cas d'Usage Typiques

### **Nouveau Patient**
1. **Enregistrement** : Secrétaire crée dossier patient
2. **Examen** : Docteur réalise examen
3. **Facturation** : Création facture + examens
4. **Paiement** : Comptable enregistre paiement
5. **Génération** : Clés créées automatiquement
6. **PDF** : Facture avec clés envoyée
7. **Accès** : Patient se connecte avec clés

### **Patient Existant**
1. **Nouvel examen** : Docteur réalise examen
2. **Facturation** : Nouvelle facture
3. **Réutilisation** : Mêmes clés d'accès (permanent)
4. **Upload** : Nouveau compte rendu
5. **Accès** : Patient utilise mêmes identifiants

### **Gestion Administrative**
- **Désactivation** : En cas de problème
- **Réactivation** : Restauration d'accès
- **Audit** : Consultation historique accès
- **Support** : Aide patient si oubli clés

## 🔧 Configuration Technique

### **URLs Patient Portal**
```python
# urls.py
urlpatterns = [
    path('api/patients/portal/', include('patients.urls_portal')),
    path('api/reports/patient/', include('reports.urls_patient')),
]
```

### **Permissions**
```python
# Portail patient : AllowAny (auth par clés)
# Gestion accès : IsAuthenticated (personnel uniquement)
# Rapports : Custom permission (propriétaire uniquement)
```

## 📈 Métriques et Monitoring

### **Statistiques d'Usage**
- **Connexions quotidiennes** : Nombre de logins
- **Téléchargements** : Par rapport et par patient
- **Accès actifs** : Patients avec accès valide
- **Utilisation** : Fréquence d'accès par patient

### **Alertes Système**
- **Tentatives échouées** : Surveillance sécurité
- **Accès suspects** : Détection anomalies
- **Fichiers manquants** : Vérification intégrité
- **Performance** : Temps de réponse portail

---

*Le portail patient CIMEF offre une solution sécurisée, permanente et simple pour l'accès aux résultats médicaux, intégrée parfaitement au workflow de facturation.*
