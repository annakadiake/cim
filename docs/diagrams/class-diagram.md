# 📊 Diagramme de Classes UML - CIMEF

## Modèle de Données Complet du Système

```mermaid
classDiagram
    class Utilisateur {
        +int id
        +string nomUtilisateur
        +string email
        +string prenom
        +string nom
        +string numeroTelephone
        +string service
        +boolean estActif
        +datetime dateInscription
        +obtenirNomComplet()
        +obtenirUrlTableauBord()
        +obtenirPermissions()
    }

    class SuperUtilisateur {
        +gererUtilisateurs()
        +configurerSysteme()
        +accederToutesPermissions()
    }

    class Administrateur {
        +gererPatients()
        +gererExamens()
        +superviserOperations()
        +consulterRapports()
    }

    class Docteur {
        +consulterDossiers()
        +televerserRapports()
        +validerExamens()
        +accederTableauMedical()
    }

    class Secretaire {
        +enregistrerPatients()
        +planifierRendezVous()
        +saisirInformations()
        +gererAccueil()
    }

    class Comptable {
        +creerFactures()
        +enregistrerPaiements()
        +genererPDF()
        +suivreCreances()
        +consulterStatistiquesFinancieres()
    }

    class Patient {
        +int id
        +string prenom
        +string nom
        +string numeroTelephone
        +string email
        +string adresse
        +date dateNaissance
        +char sexe
        +datetime dateCreation
        +datetime dateMiseAJour
        +nomComplet()
    }

    class ExamType {
        +int id
        +string nom
        +text description
        +decimal prix
        +int dureeMinutes
        +boolean estActif
        +datetime dateCreation
        +datetime dateMiseAJour
        +versChaine()
    }

    class Invoice {
        +int id
        +string numeroFacture
        +date dateFacture
        +date dateEcheance
        +char statut
        +decimal sousTotal
        +decimal tauxTaxe
        +decimal montantTaxe
        +decimal montantTotal
        +text notes
        +datetime dateCreation
        +datetime dateMiseAJour
        +sauvegarder()
        +creerAccesPatient()
        +obtenirInfosClesAcces()
        +versChaine()
    }

    class InvoiceItem {
        +int id
        +int quantite
        +decimal prixUnitaire
        +decimal prixTotal
        +sauvegarder()
        +versChaine()
    }

    class Payment {
        +int id
        +decimal montant
        +datetime datePaiement
        +char modePaiement
        +char statut
        +string numeroReference
        +string idTransaction
        +string numeroRecu
        +string numeroTelephone
        +string referenceOperateur
        +text notes
        +datetime dateCreation
        +datetime dateMiseAJour
        +montantRestant()
        +estPaiementPartiel()
        +genererNumeroRecu()
        +mettreAJourStatutFacture()
        +versChaine()
    }

    class PatientAccess {
        +int id
        +string cleAcces
        +string motDePasse
        +boolean estActif
        +int nombreAcces
        +datetime dernierAcces
        +datetime dateCreation
        +boolean envoyeParSMS
        +boolean envoyeParEmail
        +genererCleAcces()
        +genererMotDePasse()
        +estValide()
        +enregistrerAcces()
        +versChaine()
    }

    class PatientReport {
        +int id
        +file fichierRapport
        +datetime dateCreation
        +datetime dateExpiration
        +boolean estActif
        +int nombreTelechargements
        +estExpire()
        +estAccessible()
        +nomPatient()
        +cleAcces()
        +validerEtActiver()
        +incrementerNombreTelechargements()
        +versChaine()
    }

    %% Héritage des utilisateurs
    Utilisateur <|-- SuperUtilisateur
    Utilisateur <|-- Administrateur
    Utilisateur <|-- Docteur
    Utilisateur <|-- Secretaire
    Utilisateur <|-- Comptable

    %% Relations Patient
    Patient ||--|| PatientAccess : "a un accès unique"
    Patient ||--o{ Invoice : "a des factures"
    Secretaire ||--o{ Patient : "enregistre"
    Administrateur ||--o{ Patient : "gère"
    Docteur ||--o{ Patient : "consulte"

    %% Relations ExamType
    Administrateur ||--o{ ExamType : "gère catalogue"
    ExamType ||--o{ InvoiceItem : "utilisé dans"

    %% Relations Invoice
    Invoice ||--o{ InvoiceItem : "contient"
    Comptable ||--o{ Invoice : "crée et gère"
    Administrateur ||--o{ Invoice : "supervise"
    Invoice ||--|| PatientAccess : "génère accès automatique"

    %% Relations Payment
    Invoice ||--o{ Payment : "reçoit paiements"
    Comptable ||--o{ Payment : "enregistre"
    Payment }|--|| Invoice : "met à jour statut"

    %% Relations PatientAccess
    Utilisateur ||--o{ PatientAccess : "créé par"
    PatientAccess ||--o{ PatientReport : "donne accès aux rapports"

    %% Relations PatientReport
    Docteur ||--o{ PatientReport : "téléverse"
    Patient ||--o{ PatientReport : "télécharge via accès"

    %% Relations spécialisées par rôle
    SuperUtilisateur ||--o{ Utilisateur : "gère tous les utilisateurs"
    Administrateur ||--o{ ExamType : "configure examens"
    Docteur ||--o{ Invoice : "peut consulter pour diagnostic"
    Secretaire ||--o{ Invoice : "peut consulter pour info"
    Comptable ||--o{ PatientAccess : "génère via facturation"

    %% Styles par domaine fonctionnel
    classDef userClass fill:#fce4ec,stroke:#ad1457
    classDef patientClass fill:#e3f2fd,stroke:#1976d2
    classDef examClass fill:#f3e5f5,stroke:#7b1fa2
    classDef invoiceClass fill:#e8f5e8,stroke:#388e3c
    classDef paymentClass fill:#fff3e0,stroke:#f57c00
    classDef accessClass fill:#ffebee,stroke:#d32f2f
    classDef reportClass fill:#e0f2f1,stroke:#00796b

    class Utilisateur,SuperUtilisateur,Administrateur,Docteur,Secretaire,Comptable userClass
    class Patient patientClass
    class ExamType examClass
    class Invoice,InvoiceItem invoiceClass
    class Payment paymentClass
    class PatientAccess accessClass
    class PatientReport reportClass
```

## Description des Classes Principales

### **👨‍💼 Hiérarchie des Utilisateurs**

#### **🔧 Utilisateur (Classe de base)**
- **Responsabilité** : Classe abstraite contenant les attributs communs
- **Attributs clés** : Identité, contact, service, statut
- **Méthodes communes** : Authentification, profil, navigation

#### **⚡ SuperUtilisateur**
- **Responsabilité** : Administration système complète
- **Permissions** : Accès total, gestion utilisateurs, configuration
- **Méthodes spécialisées** : Création comptes, paramétrage système

#### **👔 Administrateur**
- **Responsabilité** : Supervision opérationnelle générale
- **Permissions** : Gestion patients, examens, rapports globaux
- **Méthodes spécialisées** : Supervision, coordination inter-services

#### **👨‍⚕️ Docteur**
- **Responsabilité** : Expertise médicale et validation
- **Permissions** : Consultation dossiers, upload rapports, validation examens
- **Méthodes spécialisées** : Diagnostic, téléversement résultats

#### **📋 Secrétaire**
- **Responsabilité** : Gestion administrative et accueil
- **Permissions** : Enregistrement patients, planification, saisie
- **Méthodes spécialisées** : Accueil, organisation rendez-vous

#### **💰 Comptable**
- **Responsabilité** : Gestion financière complète
- **Permissions** : Facturation, paiements, statistiques financières
- **Méthodes spécialisées** : Création factures, suivi créances, génération PDF

### **👤 Patient**
- **Responsabilité** : Gestion des informations patients
- **Attributs clés** : Identité, contact, date de naissance, sexe
- **Relations** : Un accès unique, plusieurs factures
- **Validation** : Numéro de téléphone avec expression régulière

### **🩻 TypeExamen (ExamType)**
- **Responsabilité** : Catalogue des types d'examens radiologiques
- **Attributs clés** : Nom, prix (FCFA), durée, description
- **Fonctionnalités** : Gestion de l'état actif/inactif
- **Relations** : Utilisé dans les articles de facture

### **📄 Facture (Invoice)**
- **Responsabilité** : Gestion de la facturation complète
- **Statuts** : brouillon, envoyée, partiellement_payée, payée, annulée
- **Fonctionnalités** : 
  - Génération automatique numéro (FAC-XXXXXX)
  - Création automatique d'accès patient
  - Calcul automatique des totaux
- **Relations** : Patient, utilisateur créateur, accès patient

### **📋 ArticleFacture (InvoiceItem)**
- **Responsabilité** : Détail des examens facturés
- **Attributs clés** : Quantité, prix unitaire, prix total
- **Fonctionnalités** : Calcul automatique du total, mise à jour facture
- **Relations** : Facture parent, type d'examen

### **💳 Paiement (Payment)**
- **Responsabilité** : Suivi des paiements avec modes sénégalais
- **Modes de paiement** : Espèces, Orange Money, Wave, Free Money, carte, virement
- **Statuts** : en_attente, complété, échoué, annulé, remboursé
- **Fonctionnalités** : 
  - Génération numéro de reçu (REC-AAAAMMJJ-XXXXXX)
  - Mise à jour automatique statut facture
  - Calcul montant restant
- **Sécurité** : Validation montants, références opérateur

### **🔐 AccèsPatient (PatientAccess)**
- **Responsabilité** : Accès sécurisé permanent aux résultats
- **Sécurité** : Clé unique 12 caractères, mot de passe 8 caractères
- **Fonctionnalités** : 
  - Génération automatique identifiants
  - Comptage des accès
  - Validation permanente (pas d'expiration)
- **Relations** : Un patient unique, plusieurs rapports médicaux

### **📊 RapportPatient (PatientReport)**
- **Responsabilité** : Stockage et accès aux comptes rendus médicaux
- **Formats acceptés** : PDF, DOC, DOCX, JPG, JPEG, PNG
- **Sécurité** : 
  - Accès conditionnel via AccèsPatient
  - Validation automatique des clés
  - Comptage des téléchargements
- **Fonctionnalités** : Téléversement par médecins, téléchargement patients

## Patterns de Conception Utilisés

### **1. Model-View-Controller (MVC)**
- **Model** : Classes Django (Patient, Invoice, etc.)
- **View** : API REST (Django REST Framework)
- **Controller** : React Components

### **2. Repository Pattern**
- **API Services** : Abstraction des appels backend
- **Centralisation** : Gestion cohérente des données

### **3. Observer Pattern**
- **Signaux Django** : Actions automatiques
- **Notifications** : Envoi automatique d'emails

### **4. Factory Pattern**
- **Génération d'accès** : Création automatique clé/mot de passe
- **Numérotation** : Génération automatique numéros de facture

## Contraintes et Validations

### **Intégrité Référentielle**
- Cascade sur suppression utilisateur
- Protection des données patient
- Validation des relations

### **Sécurité**
- Accès patient avec expiration
- Validation des permissions
- Chiffrement des mots de passe

### **Business Rules**
- Calcul automatique des totaux
- Validation des dates
- Statuts cohérents
