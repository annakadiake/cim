# 🔍 Fonctionnalités de Recherche Avancée - CIMEF

## Vue d'ensemble

Le système CIMEF dispose maintenant de fonctionnalités de recherche robustes pour gérer de **gros volumes de données** avec des performances optimisées.

## 📊 Pagination Intelligente

### **Classes de Pagination**
- **`StandardResultsSetPagination`** : 20 éléments/page (défaut)
- **`LargeResultsSetPagination`** : 50 éléments/page (gros volumes)
- **`SmallResultsSetPagination`** : 10 éléments/page (détails)

### **Paramètres Configurables**
```
?page=2&page_size=50&ordering=-created_at
```

## 🔍 Filtres Avancés

### **Patients (`PatientFilter`)**
```
# Recherche par nom
?name=Diallo

# Filtres par âge
?age_min=18&age_max=65

# Filtres par date
?created_after=2024-01-01&created_before=2024-12-31

# Téléphone partiel
?phone=77
```

### **Factures (`InvoiceFilter`)**
```
# Par montant
?amount_min=10000&amount_max=50000

# Par statut
?payment_status=paid

# Par patient
?patient_name=Diallo

# Par période
?date_from=2024-01-01&date_to=2024-12-31
```

### **Paiements (`PaymentFilter`)**
```
# Par méthode
?payment_method=orange_money

# Par référence
?reference=REF123

# Par patient via facture
?patient_name=Diallo
```

## 🚀 Endpoints de Recherche Optimisés

### **Recherche Globale**
```
GET /api/search/?q=Diallo
```
Recherche simultanée dans :
- Patients (nom, téléphone, email)
- Factures (numéro, patient)
- Paiements (référence, transaction)
- Types d'examens (nom, description)

### **Autocomplétion Patients**
```
GET /api/search/patients/?q=Dia&limit=10
```
Retourne format optimisé pour autocomplétion.

### **Statistiques de Recherche**
```
GET /api/search/stats/
```
Compteurs globaux et répartitions.

## 🏗️ Index de Base de Données

### **Patients**
- `(first_name, last_name)` : Recherche nom complet
- `phone_number` : Recherche téléphone
- `email` : Recherche email
- `created_at` : Tri chronologique
- `date_of_birth` : Filtres par âge

### **Factures**
- `invoice_number` : Recherche par numéro
- `status` : Filtres par statut
- `(patient, status)` : Recherche combinée
- `total_amount` : Filtres par montant

### **Paiements**
- `reference_number` : Recherche par référence
- `payment_method` : Filtres par méthode
- `(invoice, status)` : Recherche combinée

## 🎯 Fonctionnalités Admin Avancées

### **Recherche Intelligente**
- **Par ID** : `123` → Recherche directe
- **Par montant** : `>10000` ou `5000-15000`
- **Par date** : `2024-01-01:2024-12-31`

### **Actions en Lot**
- Activation/désactivation massive
- Export CSV
- Statistiques en temps réel

### **Optimisations de Performance**
- `select_related()` : Relations pré-chargées
- `prefetch_related()` : Relations multiples optimisées
- Index composites pour requêtes complexes

## 📈 Avantages pour Gros Volumes

1. **Pagination** : Évite le chargement de milliers d'enregistrements
2. **Index** : Recherches ultra-rapides même avec 100k+ enregistrements
3. **Filtres** : Réduction intelligente des résultats
4. **Cache** : Relations pré-chargées pour éviter les requêtes N+1

## 🔧 Utilisation Pratique

### **Recherche Rapide Patient**
```python
# Frontend peut utiliser
GET /api/search/patients/?q=77&limit=5
# Retourne patients avec "77" dans nom/téléphone
```

### **Recherche Globale**
```python
# Recherche "Diallo" partout
GET /api/search/?q=Diallo
# Retourne patients, factures, paiements correspondants
```

### **Filtres Combinés**
```python
# Factures payées > 20000 FCFA en 2024
GET /api/invoices/?payment_status=paid&amount_min=20000&date_from=2024-01-01
```

Le système est maintenant **prêt pour des milliers d'enregistrements** avec des performances optimales.
