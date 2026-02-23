# 🔐 Système d'Authentification CIMEF

## 🏗️ Architecture d'Authentification

### **Double Système d'Authentification**
1. **Personnel Médical** : JWT + Sessions Django
2. **Patients** : Clés d'accès permanentes + Mots de passe

## 👥 Gestion des Rôles Personnel

### **Modèle User Étendu**
```python
# authentication/models.py
class User(AbstractUser):
    ROLE_CHOICES = [
        ('superuser', 'Superutilisateur'),
        ('admin', 'Administrateur'), 
        ('doctor', 'Docteur'),
        ('secretary', 'Secrétaire'),
        ('accountant', 'Comptable'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=17)
    department = models.CharField(max_length=100)
```

### **Permissions par Rôle**

| Rôle | Patients | Examens | Factures | Paiements | Rapports | Admin |
|------|----------|---------|----------|-----------|----------|-------|
| **Superuser** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Docteur** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Secrétaire** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Comptable** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |

### **Méthodes de Vérification**
```python
# Propriétés du modèle User
@property
def is_admin(self):
    return self.role in ['superuser', 'admin']

@property 
def is_doctor(self):
    return self.role == 'doctor'

def get_permissions(self):
    permissions = {
        'superuser': ['all'],
        'admin': ['patients', 'exams', 'invoices', 'payments', 'reports', 'users'],
        'doctor': ['patients', 'exams', 'reports'],
        'secretary': ['patients', 'appointments'], 
        'accountant': ['invoices', 'payments'],
    }
    return permissions.get(self.role, [])
```

## 🔑 Authentification JWT Personnel

### **Configuration Tokens**
```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### **Endpoints d'Authentification**
- `POST /api/auth/login/` : Connexion + récupération tokens
- `POST /api/auth/refresh/` : Renouvellement token
- `POST /api/auth/logout/` : Déconnexion

### **Middleware de Contrôle d'Accès**
```python
# Vérification automatique des permissions par URL
class RoleBasedAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Vérification des permissions selon l'URL et le rôle
        if request.path.startswith('/api/'):
            self.check_api_permissions(request)
        return self.get_response(request)
```

## 🏥 Dashboards Spécialisés par Rôle

### **Admin Dashboard** (`/dashboard/admin`)
- **Statistiques** : Utilisateurs par rôle, revenus globaux
- **Gestion** : Utilisateurs, patients, système
- **Monitoring** : Activité générale

### **Secrétaire Dashboard** (`/dashboard/secretary`)
- **Patients** : Nouveaux patients, rendez-vous
- **Factures** : Factures récentes, statuts
- **Planning** : Rendez-vous du jour

### **Docteur Dashboard** (`/dashboard/doctor`)
- **Examens** : Rapports récents, patients
- **Rendez-vous** : Planning personnel
- **Statistiques** : Examens réalisés

### **Comptable Dashboard** (`/dashboard/accountant`)
- **Finances** : Revenus mensuels, factures en attente
- **Paiements** : Statuts, méthodes de paiement
- **Reporting** : Analyses financières

## 🔒 Système d'Accès Patient

### **Modèle PatientAccess**
```python
# patients/models.py
class PatientAccess(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE)
    access_key = models.CharField(max_length=12, unique=True)
    password = models.CharField(max_length=8)
    is_active = models.BooleanField(default=True)
    access_count = models.PositiveIntegerField(default=0)
    last_access = models.DateTimeField(null=True, blank=True)
    
    @property
    def is_valid(self):
        return self.is_active  # Plus d'expiration !
```

### **Génération Automatique**
- **Clé d'accès** : 12 caractères alphanumériques
- **Mot de passe** : 8 caractères alphanumériques
- **Unicité** : Une seule clé par patient (OneToOneField)
- **Permanence** : Pas d'expiration, réutilisable

### **Workflow d'Accès Patient**
```
1. Facturation → Génération automatique clés
2. PDF facture → Inclusion clés dans encadré
3. Patient → Connexion portail avec clés
4. Téléchargement → Comptes rendus disponibles
5. Traçabilité → Comptage accès + dernière connexion
```

## 🛡️ Sécurité Implémentée

### **Protection API**
- **CORS** : Configuration frontend/backend
- **CSRF** : Protection contre attaques
- **JWT** : Tokens sécurisés avec expiration
- **Permissions** : Vérification par endpoint

### **Protection Patient**
- **Clés uniques** : Impossibilité de collision
- **Mots de passe** : Génération aléatoire sécurisée
- **Activation/Désactivation** : Contrôle d'accès
- **Audit** : Traçage des connexions

## 🔧 Configuration Sécurité

### **Variables d'Environnement**
```python
# .env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
```

### **Middleware Stack**
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'authentication.middleware.RoleBasedAccessMiddleware',  # Custom
]
```

## 📱 Intégration Frontend

### **Authentification React**
- **Login automatique** : Redirection selon rôle
- **Token storage** : localStorage sécurisé
- **Route protection** : ProtectedRoute component
- **Permissions check** : Vérification côté client

### **Navigation Dynamique**
```typescript
// Sidebar adaptée selon permissions utilisateur
const canAccess = (permission: string) => {
  return user?.permissions?.includes(permission) || user?.permissions?.includes('all');
};
```

## 🎯 Comptes de Test

Les comptes de test sont configurés lors de l'installation. Contactez l'administrateur système pour obtenir les identifiants.

## 🔄 Flux d'Authentification

### **Personnel → API**
```
1. POST /api/auth/login/ {username, password}
2. Response: {access_token, refresh_token, user_info}
3. Headers: Authorization: Bearer <access_token>
4. Middleware → Vérification permissions
```

### **Patient → Portail**
```
1. POST /api/patients/portal/login/ {access_key, password}
2. Response: {patient_info, reports_available}
3. Session → Accès aux téléchargements
4. Traçage → Comptage + dernière connexion
```

## 🚨 Gestion d'Erreurs

### **Erreurs Communes**
- **401 Unauthorized** : Token expiré/invalide
- **403 Forbidden** : Permissions insuffisantes
- **404 Not Found** : Clé d'accès inexistante
- **400 Bad Request** : Données invalides

### **Messages Utilisateur**
- **Personnel** : "Accès non autorisé pour votre rôle"
- **Patient** : "Clé d'accès ou mot de passe incorrect"
- **Système** : "Accès désactivé" (au lieu d'"expiré")

---

*Ce système d'authentification garantit la sécurité, la traçabilité et la simplicité d'utilisation pour tous les acteurs du système médical.*
