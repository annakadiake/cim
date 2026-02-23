# Dossier Images / Assets

Ce dossier contient les logos et images personnalisés de l'application.

## Structure

- `logo-dashboard.png` - Logo affiché dans l'en-tête des dashboards
- `logo-invoice.png` - Logo utilisé dans la génération des factures PDF
- `cimef.png` - Logo par défaut (si existant)

## Instructions d'utilisation

1. **Pour le logo des dashboards** :
   - Remplacez le fichier `logo-dashboard.png` par votre logo
   - Format recommandé : PNG, JPG ou SVG
   - Taille recommandée : 64x64px ou plus
   - Le logo sera automatiquement redimensionné

2. **Pour le logo des factures** :
   - Remplacez le fichier `logo-invoice.png` par votre logo
   - Format recommandé : PNG ou JPG
   - Taille recommandée : 200x200px ou plus
   - Le logo apparaîtra en haut à gauche des factures PDF

## Notes techniques

- Les logos sont chargés automatiquement au démarrage de l'application
- Si un logo n'existe pas, l'icône par défaut sera utilisée
- Les logos sont mis en cache par le navigateur pour de meilleures performances
