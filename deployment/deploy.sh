#!/bin/bash
# ============================================
# CIMEF - Script de déploiement rapide
# Exécuter sur le serveur VPS après le clone initial
# Usage: bash deploy.sh
# ============================================

set -e

echo "=========================================="
echo "  CIMEF - Déploiement automatique"
echo "=========================================="

PROJECT_DIR="/home/cimef/cimef"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Créer les dossiers nécessaires
echo "[1/8] Création des dossiers..."
sudo mkdir -p /var/log/cimef
sudo chown cimef:cimef /var/log/cimef
mkdir -p /home/cimef/backups

# Backend
echo "[2/8] Configuration du backend..."
cd $BACKEND_DIR
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# Copier le .env si pas déjà fait
if [ ! -f .env ]; then
    cp $PROJECT_DIR/deployment/.env.production .env
    echo "⚠️  IMPORTANT : Éditez le fichier $BACKEND_DIR/.env avec vos vrais mots de passe !"
    echo "   nano $BACKEND_DIR/.env"
    echo "   Puis relancez ce script."
    exit 1
fi

echo "[3/8] Migrations de la base de données..."
python manage.py migrate

echo "[4/8] Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

deactivate

# Frontend
echo "[5/8] Build du frontend..."
cd $FRONTEND_DIR

# Copier le .env frontend si pas déjà fait
if [ ! -f .env.production ]; then
    cp $PROJECT_DIR/deployment/.env.frontend.production .env.production
    echo "⚠️  Éditez le fichier $FRONTEND_DIR/.env.production avec votre domaine !"
fi

npm install
npm run build

# Nginx
echo "[6/8] Configuration de Nginx..."
sudo cp $PROJECT_DIR/deployment/nginx-cimef.conf /etc/nginx/sites-available/cimef
sudo ln -sf /etc/nginx/sites-available/cimef /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Supervisor
echo "[7/8] Configuration de Supervisor (Gunicorn)..."
sudo cp $PROJECT_DIR/deployment/supervisor-cimef.conf /etc/supervisor/conf.d/cimef.conf
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart cimef

# Pare-feu
echo "[8/8] Configuration du pare-feu..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo ""
echo "=========================================="
echo "  ✅ Déploiement terminé !"
echo "=========================================="
echo ""
echo "Votre site est accessible sur : http://VOTRE_IP_SERVEUR"
echo ""
echo "Prochaines étapes :"
echo "  1. Éditez /etc/nginx/sites-available/cimef avec votre domaine"
echo "  2. sudo certbot --nginx -d votre-domaine.com (pour HTTPS)"
echo "  3. python manage.py createsuperuser (créer un admin)"
echo ""
