# Guide de Déploiement CIMEF — DigitalOcean Droplet + Managed Database

## Prérequis
- Un **Droplet Ubuntu 22.04** sur DigitalOcean
- Une **Managed Database MySQL** (ajoutée lors de la création du Droplet)
- Accès SSH au serveur (mot de passe reçu par email ou clé SSH)
- Un nom de domaine (optionnel mais recommandé)

---

## Étape 1 : Récupérer vos informations DigitalOcean

Avant de commencer, notez ces informations depuis votre tableau de bord DigitalOcean :

**Droplet :**
- IP du serveur : `___.___.___.__`

**Managed Database** (DigitalOcean → Databases → Connection Details) :
- Host : `db-mysql-xxx-do-user-xxx.ondigitalocean.com`
- Port : `25060`
- Username : `doadmin`
- Password : `xxxxxxxxxxxxxxxx`
- Database : `defaultdb`
- SSL Mode : `REQUIRED`

---

## Étape 2 : Se connecter au serveur

```bash
ssh root@VOTRE_IP_DROPLET
```

> À la première connexion, changez le mot de passe si demandé.

---

## Étape 3 : Installer les dépendances système

```bash
# Mettre à jour le système
apt update && apt upgrade -y

# Installer les paquets nécessaires
# (PAS de mysql-server, la base est managée par DigitalOcean)
apt install -y python3 python3-pip python3-venv python3-dev \
    libmysqlclient-dev pkg-config \
    nginx certbot python3-certbot-nginx \
    git curl supervisor

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Vérifier les versions
python3 --version
node --version
npm --version
```

---

## Étape 4 : Tester la connexion à la base de données managée

```bash
# Installer le client MySQL (pas le serveur)
apt install -y mysql-client

# Tester la connexion (remplacer par vos infos)
mysql -h db-mysql-xxx-do-user-xxx.ondigitalocean.com \
      -P 25060 -u doadmin -p --ssl-mode=REQUIRED
```

> Si la connexion réussit, tapez `EXIT;`. Sinon, vérifiez dans DigitalOcean → Databases → Settings → Trusted Sources que l'IP de votre Droplet est autorisée.

---

## Étape 5 : Créer la base de données

Dans la connexion MySQL ci-dessus :

```sql
CREATE DATABASE cimef_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

> Ou gardez `defaultdb` si vous préférez ne pas créer de nouvelle base.

---

## Étape 6 : Créer un utilisateur système

```bash
adduser cimef
usermod -aG sudo cimef

# Créer les dossiers nécessaires
mkdir -p /var/log/cimef
chown cimef:cimef /var/log/cimef

# Basculer vers cet utilisateur
su - cimef
```

---

## Étape 7 : Cloner le projet

```bash
cd /home/cimef
git clone https://github.com/annakadiake/cimef.git
cd cimef
```

---

## Étape 8 : Configurer le Backend

```bash
cd /home/cimef/cimef/backend

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
pip install gunicorn
```

### Créer le fichier `.env`

```bash
nano /home/cimef/cimef/backend/.env
```

Coller ce contenu en remplaçant les valeurs :

```env
# Django
SECRET_KEY=GENEREZ_UNE_CLE_SECRETE_ICI
DEBUG=False

# Base de données DigitalOcean Managed MySQL
DB_DATABASE=cimef_db
DB_USERNAME=doadmin
DB_PASSWORD=VOTRE_MOT_DE_PASSE_DB_DIGITALOCEAN
DB_HOST=db-mysql-xxx-do-user-xxx.ondigitalocean.com
DB_PORT=25060

# Domaine
ALLOWED_HOSTS=VOTRE_IP_DROPLET,votre-domaine.com,www.votre-domaine.com
PATIENT_PORTAL_URL=http://VOTRE_IP_DROPLET/patient
```

> **Générer une SECRET_KEY :** `python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

### Appliquer les migrations et créer le superutilisateur

```bash
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

> Entrez le nom d'utilisateur, email et mot de passe pour l'admin.

---

## Étape 9 : Build du Frontend

```bash
cd /home/cimef/cimef/frontend

# Installer les dépendances
npm install

# Créer le fichier .env.production
nano .env.production
```

Contenu :

```env
VITE_API_URL=http://VOTRE_IP_DROPLET/api
```

> Remplacez par `https://votre-domaine.com/api` si vous avez un domaine + SSL.

```bash
# Build
npm run build
```

> Le dossier `dist/` sera créé avec les fichiers statiques du frontend.

---

## Étape 10 : Configurer Nginx

```bash
# Revenir en root
exit

# Copier la config
cp /home/cimef/cimef/deployment/nginx-cimef.conf /etc/nginx/sites-available/cimef
ln -sf /etc/nginx/sites-available/cimef /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Éditer pour mettre votre IP ou domaine
nano /etc/nginx/sites-available/cimef
```

**Remplacer** `votre-domaine.com www.votre-domaine.com` par votre IP :

```
server_name VOTRE_IP_DROPLET;
```

```bash
# Tester et redémarrer
nginx -t
systemctl restart nginx
```

---

## Étape 11 : Configurer Gunicorn avec Supervisor

```bash
# Copier la config
cp /home/cimef/cimef/deployment/supervisor-cimef.conf /etc/supervisor/conf.d/cimef.conf

# Démarrer
supervisorctl reread
supervisorctl update
supervisorctl start cimef

# Vérifier que ça tourne
supervisorctl status cimef
```

> Vous devez voir `cimef RUNNING`. Si c'est `FATAL`, vérifiez les logs : `tail -50 /var/log/cimef/gunicorn.log`

---

## Étape 12 : Ouvrir les ports du pare-feu

```bash
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

---

## Étape 13 : Tester !

Ouvrez votre navigateur et allez sur :

- **Frontend** : `http://VOTRE_IP_DROPLET`
- **API** : `http://VOTRE_IP_DROPLET/api/`
- **Admin Django** : `http://VOTRE_IP_DROPLET/admin/`

Connectez-vous avec le superutilisateur créé à l'étape 8.

---

## Étape 14 : SSL avec Let's Encrypt (si vous avez un domaine)

```bash
# Pointer votre domaine vers l'IP du Droplet (DNS A record)
# Puis :
certbot --nginx -d votre-domaine.com
```

Après SSL, mettez à jour :
1. Le `.env` backend : `ALLOWED_HOSTS` et `PATIENT_PORTAL_URL` avec `https://`
2. Le `.env.production` frontend : `VITE_API_URL=https://votre-domaine.com/api`
3. Rebuild le frontend : `cd /home/cimef/cimef/frontend && npm run build`
4. Redémarrer : `supervisorctl restart cimef`

---

## Commandes utiles

```bash
# Voir les logs du backend
supervisorctl tail -f cimef

# Redémarrer le backend
supervisorctl restart cimef

# Redémarrer Nginx
systemctl restart nginx

# Voir les logs Nginx
tail -f /var/log/nginx/cimef-error.log

# Voir le statut
supervisorctl status cimef
systemctl status nginx
```

## Mettre à jour le code

```bash
cd /home/cimef/cimef
git pull

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Frontend
cd ../frontend
npm install
npm run build

# Redémarrer
sudo supervisorctl restart cimef
sudo systemctl restart nginx
```

## Sauvegardes

> La **Managed Database DigitalOcean** fait des sauvegardes automatiques quotidiennes (7 jours de rétention).
> Vous pouvez aussi faire des sauvegardes manuelles depuis le tableau de bord DigitalOcean → Databases → Backups.

Pour une sauvegarde manuelle supplémentaire :

```bash
mkdir -p /home/cimef/backups

# Sauvegarde manuelle
mysqldump -h db-mysql-xxx.ondigitalocean.com -P 25060 \
  -u doadmin -p --ssl-mode=REQUIRED cimef_db \
  > /home/cimef/backups/cimef_db_$(date +%Y%m%d).sql
```

## Dépannage

| Problème | Solution |
|----------|----------|
| `502 Bad Gateway` | `supervisorctl restart cimef` puis vérifier les logs |
| `FATAL` dans supervisor | `tail -50 /var/log/cimef/gunicorn.log` |
| Connexion DB refusée | Vérifier Trusted Sources dans DigitalOcean Databases |
| Frontend page blanche | Vérifier que `dist/` existe et que Nginx pointe dessus |
| Erreur CORS | Vérifier `ALLOWED_HOSTS` dans `.env` |
| Static files 404 | `python manage.py collectstatic --noinput` |
