# Guide de Déploiement CIMEF - VPS Ubuntu

## Prérequis
- Un VPS Ubuntu 22.04 (Contabo, Hetzner, DigitalOcean, OVH...)
- Un nom de domaine (optionnel mais recommandé)
- Accès SSH au serveur

---

## Étape 1 : Se connecter au serveur

```bash
ssh root@VOTRE_IP_SERVEUR
```

## Étape 2 : Installer les dépendances système

```bash
# Mettre à jour le système
apt update && apt upgrade -y

# Installer les paquets nécessaires
apt install -y python3 python3-pip python3-venv python3-dev \
    mysql-server libmysqlclient-dev \
    nginx certbot python3-certbot-nginx \
    git curl supervisor

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

## Étape 3 : Configurer MySQL

```bash
# Sécuriser MySQL
mysql_secure_installation

# Créer la base de données et l'utilisateur
mysql -u root -p
```

```sql
CREATE DATABASE cimef_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cimef_user'@'localhost' IDENTIFIED BY 'VOTRE_MOT_DE_PASSE_FORT';
GRANT ALL PRIVILEGES ON cimef_db.* TO 'cimef_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Étape 4 : Créer un utilisateur système

```bash
# Créer un utilisateur dédié (ne pas faire tourner en root)
adduser cimef
usermod -aG sudo cimef
su - cimef
```

## Étape 5 : Cloner le projet

```bash
cd /home/cimef
git clone https://github.com/annakadiake/cimef.git
cd cimef
```

## Étape 6 : Configurer le Backend

```bash
cd /home/cimef/cimef/backend

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
cp ../deployment/.env.production .env
# IMPORTANT : Éditer le fichier .env avec vos vrais mots de passe
nano .env

# Appliquer les migrations
python manage.py migrate

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# Créer le superutilisateur
python manage.py createsuperuser
```

## Étape 7 : Build du Frontend

```bash
cd /home/cimef/cimef/frontend

# Installer les dépendances
npm install

# Éditer la variable d'API pour pointer vers le serveur
# Dans le fichier .env.production du frontend
nano .env.production
# Mettre : VITE_API_URL=https://votre-domaine.com/api

# Build
npm run build
```

## Étape 8 : Configurer Nginx

```bash
# Copier la config Nginx
sudo cp /home/cimef/cimef/deployment/nginx-cimef.conf /etc/nginx/sites-available/cimef
sudo ln -s /etc/nginx/sites-available/cimef /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# IMPORTANT : Éditer le fichier pour mettre votre domaine ou IP
sudo nano /etc/nginx/sites-available/cimef

# Tester et redémarrer Nginx
sudo nginx -t
sudo systemctl restart nginx
```

## Étape 9 : Configurer Gunicorn avec Supervisor

```bash
# Copier la config supervisor
sudo cp /home/cimef/cimef/deployment/supervisor-cimef.conf /etc/supervisor/conf.d/cimef.conf

# Démarrer
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start cimef
```

## Étape 10 : SSL avec Let's Encrypt (si vous avez un domaine)

```bash
sudo certbot --nginx -d votre-domaine.com
# Suivre les instructions
# Le renouvellement est automatique
```

## Étape 11 : Ouvrir les ports du pare-feu

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

---

## Commandes utiles

```bash
# Voir les logs du backend
sudo supervisorctl tail -f cimef

# Redémarrer le backend
sudo supervisorctl restart cimef

# Redémarrer Nginx
sudo systemctl restart nginx

# Voir les logs Nginx
sudo tail -f /var/log/nginx/cimef-error.log

# Mettre à jour le code
cd /home/cimef/cimef
git pull
cd backend && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo supervisorctl restart cimef
cd ../frontend && npm install && npm run build
sudo systemctl restart nginx
```

## Sauvegardes automatiques

```bash
# Ajouter au crontab (crontab -e)
# Sauvegarde quotidienne de la base de données à 2h du matin
0 2 * * * mysqldump -u cimef_user -pVOTRE_MOT_DE_PASSE cimef_db > /home/cimef/backups/cimef_db_$(date +\%Y\%m\%d).sql

# Supprimer les sauvegardes de plus de 30 jours
0 3 * * * find /home/cimef/backups/ -name "*.sql" -mtime +30 -delete
```
