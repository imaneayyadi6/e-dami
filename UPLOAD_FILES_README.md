# Fonctionnalité d'Upload de Fichiers pour Motif de Refus

## Description
Cette fonctionnalité permet aux utilisateurs des services autorisés de joindre des fichiers lors du refus d'une demande.

## Services Autorisés
- SERVICE MAINTENANCE ASSISTANCE ET FORMATION
- SERVICE MAGAZIN A LA DIRECTION D'EQUIPEMENT

## Types de Fichiers Autorisés
- PDF (.pdf)
- Documents Word (.doc, .docx)
- Images (.jpg, .jpeg, .png, .gif, .bmp, .webp)
- Taille maximale : 10MB

## Structure des Dossiers
```
uploads/
└── motifRefus/
    └── [fichiers uploadés]
```

## Configuration

### Backend
1. **Middleware d'upload** : `backend/middlewares/uploadMiddleware.js`
2. **Modèle de données** : Ajout du champ `fichierMotifRefus` dans `backend/models/demandeModel.js`
3. **Contrôleur** : Modification de `refuserDemande` dans `backend/controllers/demandeController.js`
4. **Routes** : Ajout du middleware d'upload à la route de refus

### Frontend
1. **Service de fichiers** : `frontend/src/services/fileService.js`
2. **Interface utilisateur** : Modification du modal de refus dans `DemandeDetailsPage.js`
3. **Affichage** : Ajout des liens vers les fichiers dans `DemandeurDetailsDemande.js`

## Test de la Fonctionnalité

### 1. Vérifier la Structure des Dossiers
```bash
# Dans le dossier backend
node test-upload.js
```

### 2. Tester l'Upload
1. Connectez-vous avec un utilisateur d'un service autorisé
2. Allez sur une demande en cours
3. Cliquez sur "Refuser"
4. Remplissez le motif et joignez un fichier
5. Validez le refus

### 3. Tester l'Accès aux Fichiers
- **Développement** : `http://localhost:5000/uploads/motifRefus/[nom-du-fichier]`
- **Production** : `https://e-dami.snrt.ma/uploads/motifRefus/[nom-du-fichier]`

### 4. Route de Test
```bash
GET /api/demandes/test-file/[nom-du-fichier]
```

## Variables d'Environnement

### Backend (.env)
```env
NODE_ENV=development
SERVER_URL=https://e-dami.snrt.ma
CLIENT_ADDRESS=http://localhost:3000
```

### Frontend
```env
REACT_APP_SERVER_URL=https://e-dami.snrt.ma
```

## Dépannage

### Problème : Fichiers non accessibles
1. Vérifiez que le dossier `uploads/motifRefus` existe
2. Vérifiez les permissions du dossier
3. Testez l'URL directe : `http://localhost:5000/uploads/motifRefus/test.txt`

### Problème : Upload échoue
1. Vérifiez la taille du fichier (max 10MB)
2. Vérifiez le type de fichier
3. Vérifiez les logs du serveur

### Problème : Lien cassé dans les notifications
1. Vérifiez la variable `SERVER_URL` dans l'environnement
2. Vérifiez que l'URL est correcte pour l'environnement

## Sécurité
- Validation des types de fichiers côté client et serveur
- Limite de taille des fichiers
- Noms de fichiers uniques pour éviter les conflits
- Stockage dans un dossier dédié et sécurisé

## Maintenance
- Nettoyage périodique des fichiers anciens
- Surveillance de l'espace disque
- Sauvegarde des fichiers importants 