import fs from 'fs';
import path from 'path';

const ensureUploadsDirectory = () => {
  const uploadsDir = 'uploads';
  const motifRefusDir = path.join(uploadsDir, 'motifRefus');
  
  // Créer le dossier uploads s'il n'existe pas
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Dossier uploads créé');
  }
  
  // Créer le dossier motifRefus s'il n'existe pas
  if (!fs.existsSync(motifRefusDir)) {
    fs.mkdirSync(motifRefusDir, { recursive: true });
    console.log('✅ Dossier uploads/motifRefus créé');
  }
  
  console.log('📁 Structure des dossiers uploads vérifiée');
  console.log(`📂 Dossier uploads: ${fs.existsSync(uploadsDir) ? '✅' : '❌'}`);
  console.log(`📂 Dossier motifRefus: ${fs.existsSync(motifRefusDir) ? '✅' : '❌'}`);
};

export default ensureUploadsDirectory; 