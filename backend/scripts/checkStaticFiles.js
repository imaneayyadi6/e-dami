import fs from 'fs';
import path from 'path';
import express from 'express';

const checkStaticFiles = () => {
  console.log('🔍 Vérification de la configuration des fichiers statiques');
  
  const uploadsDir = 'uploads';
  const motifRefusDir = path.join(uploadsDir, 'motifRefus');
  
  // Vérifier l'existence des dossiers
  console.log(`📂 Dossier uploads: ${fs.existsSync(uploadsDir) ? '✅' : '❌'}`);
  console.log(`📂 Dossier motifRefus: ${fs.existsSync(motifRefusDir) ? '✅' : '❌'}`);
  
  // Créer les dossiers s'ils n'existent pas
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Dossier uploads créé');
  }
  
  if (!fs.existsSync(motifRefusDir)) {
    fs.mkdirSync(motifRefusDir, { recursive: true });
    console.log('✅ Dossier motifRefus créé');
  }
  
  // Créer un fichier de test
  const testFile = path.join(motifRefusDir, 'test-static.txt');
  fs.writeFileSync(testFile, 'Test de fichier statique - ' + new Date().toISOString());
  console.log(`📄 Fichier de test créé: ${testFile}`);
  
  // Vérifier les permissions
  try {
    const stats = fs.statSync(uploadsDir);
    console.log(`📊 Permissions uploads: ${stats.mode.toString(8)}`);
  } catch (error) {
    console.log('❌ Erreur lors de la vérification des permissions uploads');
  }
  
  try {
    const stats = fs.statSync(motifRefusDir);
    console.log(`📊 Permissions motifRefus: ${stats.mode.toString(8)}`);
  } catch (error) {
    console.log('❌ Erreur lors de la vérification des permissions motifRefus');
  }
  
  // Lister les fichiers dans motifRefus
  if (fs.existsSync(motifRefusDir)) {
    const files = fs.readdirSync(motifRefusDir);
    console.log(`📋 Fichiers dans motifRefus: ${files.join(', ')}`);
  }
  
  console.log('\n🎯 Configuration Express:');
  console.log('app.use("/uploads", express.static("uploads"));');
  console.log('✅ Cette configuration devrait servir les fichiers depuis /uploads/');
  
  console.log('\n🎯 URLs de test:');
  console.log(`- Test direct: http://localhost:5000/uploads/motifRefus/test-static.txt`);
  console.log(`- API test: http://localhost:5000/api/demandes/test-file/test-static.txt`);
  
  return {
    uploadsExists: fs.existsSync(uploadsDir),
    motifRefusExists: fs.existsSync(motifRefusDir),
    testFileExists: fs.existsSync(testFile),
    testFile: testFile
  };
};

export default checkStaticFiles; 