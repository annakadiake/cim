#!/usr/bin/env python
"""
Script de démarrage pour le backend CIMEF
Vérifie la configuration et démarre le serveur Django
"""
import os
import sys
import subprocess
from pathlib import Path

def check_env_file():
    """Vérifie si le fichier .env existe"""
    env_path = Path("backend/.env")
    if not env_path.exists():
        print("❌ Fichier .env manquant!")
        print("📝 Copiez .env.example vers .env et configurez vos paramètres de base de données")
        print(f"   cp {Path('backend/.env.example')} {env_path}")
        return False
    return True

def check_database_connection():
    """Teste la connexion à la base de données"""
    try:
        os.chdir("backend")
        result = subprocess.run([sys.executable, "manage.py", "check", "--database", "default"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Connexion à la base de données OK")
            return True
        else:
            print("❌ Erreur de connexion à la base de données:")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Erreur lors du test de connexion: {e}")
        return False

def run_migrations():
    """Exécute les migrations Django"""
    try:
        print("🔄 Exécution des migrations...")
        subprocess.run([sys.executable, "manage.py", "makemigrations"], check=True)
        subprocess.run([sys.executable, "manage.py", "migrate"], check=True)
        print("✅ Migrations terminées")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors des migrations: {e}")
        return False

def start_server():
    """Démarre le serveur Django"""
    try:
        print("🚀 Démarrage du serveur Django...")
        print("📍 Serveur disponible sur: http://localhost:8000")
        print("🔧 Admin disponible sur: http://localhost:8000/admin")
        print("📡 API disponible sur: http://localhost:8000/api")
        subprocess.run([sys.executable, "manage.py", "runserver"], check=True)
    except KeyboardInterrupt:
        print("\n👋 Arrêt du serveur")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors du démarrage: {e}")

def main():
    print("\U0001f3e5 === CIMEF Backend Startup ===")
    
    # Vérification du fichier .env
    if not check_env_file():
        return
    
    # Test de connexion à la base de données
    if not check_database_connection():
        print("\n💡 Assurez-vous que PostgreSQL est démarré et que les paramètres .env sont corrects")
        return
    
    # Exécution des migrations
    if not run_migrations():
        return
    
    # Démarrage du serveur
    start_server()

if __name__ == "__main__":
    main()
