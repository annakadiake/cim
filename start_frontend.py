#!/usr/bin/env python
"""
Script de démarrage pour le frontend CIMEF
Vérifie les dépendances et démarre le serveur React
"""
import os
import sys
import subprocess
from pathlib import Path

def check_node_modules():
    """Vérifie si node_modules existe"""
    if not Path("node_modules").exists():
        print("📦 Installation des dépendances npm...")
        try:
            subprocess.run(["npm", "install"], check=True)
            print("✅ Dépendances installées")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Erreur lors de l'installation: {e}")
            return False
    return True

def start_dev_server():
    """Démarre le serveur de développement"""
    try:
        print("🚀 Démarrage du serveur React...")
        print("📍 Frontend disponible sur: http://localhost:5173")
        subprocess.run(["npm", "run", "dev"], check=True)
    except KeyboardInterrupt:
        print("\n👋 Arrêt du serveur frontend")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors du démarrage: {e}")

def main():
    print("\U0001f3a8 === CIMEF Frontend Startup ===")
    
    # Vérification et installation des dépendances
    if not check_node_modules():
        return
    
    # Démarrage du serveur
    start_dev_server()

if __name__ == "__main__":
    main()
