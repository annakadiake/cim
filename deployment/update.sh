#!/bin/bash
# ============================================
# CIMEF - Script de mise à jour
# Exécuter après chaque git push
# Usage: bash update.sh
# ============================================

set -e

echo "=========================================="
echo "  CIMEF - Mise à jour"
echo "=========================================="

PROJECT_DIR="/home/cimef/cimef"

# Pull du code
echo "[1/5] Récupération du code..."
cd $PROJECT_DIR
git pull origin main

# Backend
echo "[2/5] Mise à jour du backend..."
cd $PROJECT_DIR/backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
deactivate

# Frontend
echo "[3/5] Rebuild du frontend..."
cd $PROJECT_DIR/frontend
npm install
npm run build

# Redémarrer les services
echo "[4/5] Redémarrage des services..."
sudo supervisorctl restart cimef
sudo systemctl restart nginx

echo "[5/5] Vérification..."
sudo supervisorctl status cimef
sudo systemctl status nginx --no-pager -l

echo ""
echo "✅ Mise à jour terminée !"
