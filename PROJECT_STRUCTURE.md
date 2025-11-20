# 📁 Structure du Projet E-DAMI

## 🎯 **Organisation des fichiers**

### **📂 Dossiers principaux :**
- `frontend/` - Application React (code source)
- `backend/` - API Node.js/Express (code source)
- `backup/` - Sauvegardes de la base de données
- `uploads/` - Fichiers uploadés par les utilisateurs

### **📂 Dossiers d'organisation :**

#### **`config/`** - Fichiers de configuration
- `env.example` - Exemple de variables d'environnement
- `jest.config.js` - Configuration des tests Jest
- `jsconfig.json` - Configuration JavaScript

#### **`deployment/`** - Fichiers de déploiement
- `docker-compose.yml` - Configuration Docker Compose
- `Dockerfile` - Image Docker

#### **`docs/`** - Documentation
- `ADMIN_IMPLEMENTATION_SUMMARY.md` - Résumé des fonctionnalités admin
- `ADMIN_SIDEBAR_FIXED.md` - Documentation de la sidebar admin
- `PROBLEMS_TO_FIX_NEXT_SESSION.md` - Problèmes à résoudre
- `UPLOAD_FILES_README.md` - Guide des uploads

#### **`scripts-utils/`** - Scripts utilitaires
- `set-all-passwords.js` - Script pour définir les mots de passe
- `set-createur-service.js` - Script pour configurer les services

#### **`tests/`** - Fichiers de test et debug
- `test-*.js` - Tests d'API et de fonctionnalités
- `check-*.js` - Scripts de vérification
- `debug-*.js` - Scripts de débogage
- `clean-*.js` - Scripts de nettoyage
- `verify-*.js` - Scripts de vérification

#### **`temp-files/`** - Fichiers temporaires
- `FETCH_HEAD` - Fichier Git temporaire
- `test-final-pdf.pdf` - PDF de test

#### **`backend/archive/`** - Fichiers archivés du backend
- `server-*.js` - Anciennes versions du serveur
- `test-*.js` - Tests backend archivés
- `backupData.mjs` - Script de sauvegarde
- `extractData.mjs` - Script d'extraction
- `populateDatabase.js` - Script de population
- `createItopTicketService.js` - Service non utilisé
- `sendMailService.js` - Service email non utilisé

## ✅ **Fichiers essentiels conservés :**

### **Racine :**
- `package.json` - Dépendances du projet
- `package-lock.json` - Verrouillage des versions

### **Backend essentiel :**
- `server.js` - Serveur principal
- `controllers/` - Contrôleurs API
- `models/` - Modèles de données
- `routes/` - Routes API
- `middlewares/` - Middlewares
- `services/convertDamiToMedia.js` - Génération PDF
- `services/notificationService.js` - Notifications
- `services/getTypeApp.js` - Types d'approbation

### **Frontend essentiel :**
- `src/` - Code source React complet
- `public/` - Fichiers publics
- `build/` - Build de production

## 🗑️ **Fichiers supprimés/nettoyés :**
- Anciennes versions de serveur (11 fichiers)
- Services non utilisés (2 fichiers)
- Fichiers de test temporaires
- Documentation obsolète

## 📋 **Avantages de cette organisation :**
1. **Clarté** - Chaque type de fichier a sa place
2. **Maintenance** - Plus facile de trouver les fichiers
3. **Développement** - Séparation claire des responsabilités
4. **Déploiement** - Fichiers de déploiement regroupés
5. **Tests** - Tous les tests dans un seul dossier
6. **Documentation** - Centralisée et organisée

---
*Structure organisée le 14/09/2025*
