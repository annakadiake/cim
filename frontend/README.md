# 🏥 CIMEF Frontend

Interface React moderne pour le système de gestion médicale CIMEF avec authentification par rôles et portail patient sécurisé.

## 🎨 Charte Graphique

- **Vert turquoise** : `#00A88E` (primary-500)
- **Violet-magenta** : `#9B1B5A` (secondary-500)  
- **Blanc** : `#FFFFFF` (arrière-plans et textes)
- **Design** : Ergonomique, professionnel, moderne

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Backend Django en cours d'exécution sur `http://localhost:8000`

### Installation

```bash
# Cloner le projet (si pas déjà fait)
cd frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🏗️ Architecture

### Structure des Dossiers
```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base
│   ├── layout/         # Layout et navigation
│   └── auth/           # Authentification
├── pages/              # Pages de l'application
│   ├── dashboard/      # Dashboards par rôle
│   └── patient/        # Portail patient
├── contexts/           # Contextes React
├── lib/               # Utilitaires et API
├── types/             # Types TypeScript
└── App.tsx            # Composant racine
```

## 🔐 Système d'Authentification

### Personnel Médical
- **JWT Tokens** avec refresh automatique
- **5 Rôles** : Superuser, Admin, Docteur, Secrétaire, Comptable
- **Permissions** par rôle avec contrôle d'accès
- **Dashboards** spécialisés selon le rôle

### Comptes de Test
Les comptes de test sont configurés lors de l'installation. Contactez l'administrateur système pour obtenir les identifiants.

### Portail Patient
- **Clés d'accès permanentes** (12 caractères)
- **Mots de passe** (8 caractères)
- **Accès sécurisé** aux résultats d'examens
- **Réutilisables** à vie

## 📱 Pages Principales

### Dashboards Personnel
- `/dashboard` - Dashboard adapté selon le rôle
- **Admin** : Statistiques système, gestion utilisateurs
- **Secrétaire** : Patients récents, rendez-vous
- **Docteur** : Rapports médicaux, examens
- **Comptable** : Finances, factures en attente

### Portail Patient
- `/patient` - Connexion patient avec clés d'accès
- `/patient/dashboard` - Résultats et téléchargements

### Modules Fonctionnels
- `/patients` - Gestion des patients
- `/exams` - Types d'examens
- `/invoices` - Facturation
- `/payments` - Paiements
- `/reports` - Comptes rendus
- `/appointments` - Rendez-vous (en développement)

## 🎨 Design System

### Composants UI
- **Button** : Variants primary, secondary, outline, ghost
- **Input** : Avec icônes et validation
- **Card** : Conteneurs avec header/content
- **Badge** : Statuts et étiquettes
- **Layout** : Sidebar responsive + header

### Couleurs Tailwind
```css
primary: {
  500: '#00A88E',  /* Vert turquoise */
  /* Nuances automatiques */
}
secondary: {
  500: '#9B1B5A',  /* Violet-magenta */
  /* Nuances automatiques */
}
```

### Classes Utilitaires
- `.btn-primary`, `.btn-secondary` - Boutons stylisés
- `.card`, `.card-header`, `.card-content` - Cartes
- `.text-gradient` - Texte dégradé
- `.bg-gradient-primary` - Arrière-plan dégradé

## 🔧 Configuration

### Variables d'Environnement
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
VITE_PATIENT_PORTAL_URL=http://localhost:5173/patient
```

### Proxy API
Le serveur Vite proxy automatiquement `/api/*` vers le backend Django.

## 📊 Fonctionnalités

### ✅ Implémentées
- Authentification JWT avec refresh
- Dashboards par rôle avec statistiques
- Portail patient sécurisé
- Navigation dynamique selon permissions
- Design responsive et moderne
- Composants UI réutilisables
- Gestion d'erreurs et loading states

### 🔧 En Développement
- Pages de gestion (patients, factures, etc.)
- Module de rendez-vous
- Notifications temps réel
- Rapports et analytics avancés

## 🛠️ Scripts Disponibles

```bash
# Développement
npm run dev          # Serveur de développement

# Build
npm run build        # Build de production
npm run preview      # Prévisualiser le build

# Qualité
npm run lint         # Linter ESLint
npm run type-check   # Vérification TypeScript
```

## 🔗 Intégration Backend

### API Client
- Client Axios configuré avec intercepteurs
- Gestion automatique des tokens JWT
- Retry automatique en cas d'expiration
- Types TypeScript pour toutes les réponses

### Endpoints Principaux
- `POST /api/auth/login/` - Connexion personnel
- `GET /api/auth/dashboard/{role}/` - Statistiques dashboard
- `POST /api/patients/portal/login/` - Connexion patient
- `GET /api/patients/`, `/api/invoices/`, etc. - CRUD

## 🎯 Permissions par Rôle

| Fonctionnalité | Super | Admin | Docteur | Secrétaire | Comptable |
|----------------|-------|-------|---------|------------|-----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Patients | ✅ | ✅ | ✅ | ✅ | ❌ |
| Examens | ✅ | ✅ | ✅ | ✅ | ❌ |
| Factures | ✅ | ✅ | ❌ | ❌ | ✅ |
| Paiements | ✅ | ✅ | ❌ | ❌ | ✅ |
| Rapports | ✅ | ✅ | ✅ | ✅ | ❌ |
| Utilisateurs | ✅ | ✅ | ❌ | ❌ | ❌ |

## 🚨 Dépannage

### Problèmes Courants

**Erreur CORS**
```bash
# Vérifier que le backend autorise localhost:5173
# Dans settings.py Django :
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
```

**Token expiré**
```bash
# Le refresh automatique est géré par l'intercepteur Axios
# En cas de problème, vider localStorage et se reconnecter
```

**Erreur de build**
```bash
# Vérifier les types TypeScript
npm run type-check

# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 📱 Responsive Design

- **Mobile First** : Design optimisé mobile
- **Breakpoints** : sm (640px), md (768px), lg (1024px), xl (1280px)
- **Sidebar** : Collapsible sur mobile avec overlay
- **Navigation** : Adaptée selon la taille d'écran

## 🔒 Sécurité

- **JWT Tokens** stockés en localStorage
- **Refresh automatique** des tokens expirés
- **Validation côté client** des permissions
- **Portail patient** avec session temporaire
- **Logout automatique** en cas d'erreur auth

## 📈 Performance

- **Code splitting** automatique par route
- **Lazy loading** des composants
- **Optimisation Vite** pour le développement
- **Build optimisé** pour la production
- **Caching** des requêtes API

---

**Développé avec** ❤️ **pour CIMEF**
*Système de gestion médicale moderne et sécurisé*
