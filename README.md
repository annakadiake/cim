# CIMEF - Application de Gestion de Facturation Médicale

## Description
Application web complète pour la gestion de facturation d'un cabinet d'imagerie médicale, développée avec Django (backend) et React (frontend).

## Technologies Utilisées

### Backend
- **Django 5.0** - Framework web Python
- **Django REST Framework** - API REST
- **PostgreSQL** - Base de données
- **JWT Authentication** - Authentification sécurisée
- **ReportLab** - Génération de PDF
- **django-filter** - Filtrage avancé
- **python-decouple** - Gestion des variables d'environnement

### Frontend
- **React 18** - Framework JavaScript
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Vite** - Bundler et serveur de développement
- **Axios** - Client HTTP
- **React Router** - Routage côté client
- **Lucide React** - Icônes modernes

## Installation et Configuration

### Prérequis
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Configuration du Backend

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd cimef-tiv
   ```

2. **Créer et activer l'environnement virtuel**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Installer les dépendances**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Configuration de la base de données**
   - Créer une base MySQL nommée `cimef_tiv_db`
   - Copier `.env.example` vers `.env`
   - Configurer les variables d'environnement dans `.env`

5. **Migrations et données initiales**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Démarrer le serveur backend**
   ```bash
   python manage.py runserver
   ```

### Configuration du Frontend

1. **Naviguer vers le dossier frontend**
   ```bash
   cd frontend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

## Structure du Projet

```
cimef-tiv/
├── backend/                 # Application Django
│   ├── medical_billing/     # Configuration principale
│   ├── authentication/     # Gestion des utilisateurs
│   ├── patients/           # Gestion des patients
│   ├── exams/              # Types d'examens
│   ├── invoices/           # Facturation
│   ├── payments/           # Paiements
│   └── requirements.txt    # Dépendances Python
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API
│   │   ├── types/          # Types TypeScript
│   │   └── context/        # Contextes React
│   ├── package.json        # Dépendances Node.js
│   ├── vite.config.ts      # Configuration Vite
│   └── tailwind.config.js  # Configuration Tailwind
├── venv/                   # Environnement virtuel Python
└── README.md               # Documentation
```

## Utilisation

1. **Accès Admin**: Créer un superuser Django et se connecter
2. **Gestion des rôles**: Assigner les rôles via l'interface admin
3. **Patients**: Ajouter et gérer les informations des patients
4. **Examens**: Configurer les types d'examens et leurs prix
5. **Factures**: Créer des factures et générer les PDF
6. **Paiements**: Enregistrer et suivre les paiements

```
medical-billing/
├── backend/
│   ├── medical_billing/
│   ├── patients/
│   ├── exams/
│   ├── invoices/
│   └── payments/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── types/
└── README.md
```

## Fonctionnalités

- ✅ Authentification avec JWT
- ✅ Gestion des patients
- ✅ Catalogue des examens
- ✅ Création de factures
- ✅ Génération PDF avec logo
- ✅ Suivi des paiements
- ✅ Dashboard avec statistiques
- ✅ Interface responsive

## Support
Pour toute question ou support, contactez l'équipe de développement.