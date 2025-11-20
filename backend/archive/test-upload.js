import fs from 'fs';
import path from 'path';


console.log('🧪 Test de la structure des dossiers uploads');

const uploadsDir = 'uploads';
const motifRefusDir = path.join(uploadsDir, 'motifRefus');

console.log(`📂 Dossier uploads: ${fs.existsSync(uploadsDir) ? '✅' : '❌'}`);
console.log(`📂 Dossier motifRefus: ${fs.existsSync(motifRefusDir) ? '✅' : '❌'}`);


const testFile = path.join(motifRefusDir, 'test.txt');
fs.writeFileSync(testFile, 'Fichier de test pour vérifier l\'accessibilité');

console.log(`📄 Fichier de test créé: ${testFile}`);
console.log(`📄 Fichier existe: ${fs.existsSync(testFile) ? '✅' : '❌'}`);


if (fs.existsSync(motifRefusDir)) {
  const files = fs.readdirSync(motifRefusDir);
  console.log(`📋 Fichiers dans motifRefus: ${files.join(', ')}`);
}

console.log('\n🎯 URLs de test:');
console.log(`- Local: http://localhost:5000/uploads/motifRefus/test.txt`);
console.log(`- Production: https://e-dami.snrt.ma/uploads/motifRefus/test.txt`);

console.log('\n✅ Test terminé'); 