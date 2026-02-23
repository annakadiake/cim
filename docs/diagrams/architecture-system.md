# 🏗️ Diagramme d'Architecture Système - CIMEF

## Vue d'ensemble de l'Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React + TypeScript + Tailwind]
        Router[React Router]
        Auth[Context d'Authentification]
        API_Client[Axios API Client]
    end

    subgraph "Backend Layer"
        Django[Django 5.2.4]
        DRF[Django REST Framework]
        JWT[JWT Authentication]
        
        subgraph "Applications Django"
            Patients[App Patients]
            Exams[App Examens]
            Invoices[App Factures]
            Payments[App Paiements]
            Authentication[App Auth]
        end
    end

    subgraph "Base de Données"
        PostgreSQL[(PostgreSQL)]
    end

    subgraph "Services Externes"
        Email[Service Email]
        SMS[Service SMS]
        Storage[Stockage Fichiers]
    end

    subgraph "Portail Patient"
        PatientUI[Interface Patient]
        SecureAccess[Accès Sécurisé]
        FileDownload[Téléchargement]
    end

    %% Connexions
    UI --> API_Client
    API_Client --> Django
    Django --> DRF
    DRF --> JWT
    
    Patients --> PostgreSQL
    Exams --> PostgreSQL
    Invoices --> PostgreSQL
    Payments --> PostgreSQL
    Authentication --> PostgreSQL
    
    Django --> Email
    Django --> SMS
    Django --> Storage
    
    PatientUI --> SecureAccess
    SecureAccess --> Django
    FileDownload --> Storage

    %% Styles
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef database fill:#e8f5e8
    classDef external fill:#fff3e0
    classDef patient fill:#fce4ec

    class UI,Router,Auth,API_Client frontend
    class Django,DRF,JWT,Patients,Exams,Invoices,Payments,Authentication backend
    class PostgreSQL database
    class Email,SMS,Storage external
    class PatientUI,SecureAccess,FileDownload patient
```

## Technologies Utilisées

### **Frontend**
- **React 18** - Framework JavaScript moderne
- **TypeScript** - Typage statique pour JavaScript
- **Tailwind CSS** - Framework CSS utilitaire
- **Axios** - Client HTTP pour les requêtes API
- **React Router** - Routage côté client

### **Backend**
- **Django 5.2.4** - Framework web Python
- **Django REST Framework** - API REST
- **JWT** - Authentification par tokens
- **PostgreSQL** - Base de données relationnelle

### **Sécurité**
- **JWT Authentication** - Tokens sécurisés
- **CORS** - Politique de partage des ressources
- **Accès patient sécurisé** - Clé + mot de passe unique

### **Services**
- **Email** - Notifications automatiques
- **SMS** - Rappels et alertes
- **Stockage** - Fichiers d'examens sécurisés

## Flux de Données

1. **Authentification** : Login → JWT Token → Accès API
2. **Gestion Patients** : CRUD via API REST
3. **Examens** : Types + Fichiers + Résultats
4. **Facturation** : Génération PDF + Paiements
5. **Portail Patient** : Accès sécurisé + Téléchargement

## Avantages de cette Architecture

- **Séparation des responsabilités** (Frontend/Backend)
- **Scalabilité** (API REST stateless)
- **Sécurité** (JWT + accès contrôlé)
- **Maintenabilité** (Structure modulaire)
- **Performance** (React SPA + API optimisée)
