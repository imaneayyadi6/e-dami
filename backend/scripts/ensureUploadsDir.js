import fs from 'fs';
import path from 'path';

const ensureUploadsDirectory = () => {
  const uploadsDir = 'uploads';
  const motifRefusDir = path.join(uploadsDir, 'motifRefus');
  
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Dossier uploads créé');
  }
  
  
  if (!fs.existsSync(motifRefusDir)) {
    fs.mkdirSync(motifRefusDir, { recursive: true });
    console.log('✅ Dossier uploads/motifRefus créé');
  }
  
  console.log('📁 Structure des dossiers uploads vérifiée');
  console.log(`📂 Dossier uploads: ${fs.existsSync(uploadsDir) ? '✅' : '❌'}`);
  console.log(`📂 Dossier motifRefus: ${fs.existsSync(motifRefusDir) ? '✅' : '❌'}`);
};

export default ensureUploadsDirectory; 