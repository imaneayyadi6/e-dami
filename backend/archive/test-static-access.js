import fs from 'fs';
import path from 'path';

console.log('🧪 Test d\'accessibilité des fichiers statiques');

const uploadsDir = 'uploads';
const motifRefusDir = path.join(uploadsDir, 'motifRefus');


console.log(`📂 Dossier uploads: ${fs.existsSync(uploadsDir) ? '✅' : '❌'}`);
console.log(`📂 Dossier motifRefus: ${fs.existsSync(motifRefusDir) ? '✅' : '❌'}`);


const timestamp = Date.now();
const testFileName = `test-${timestamp}.txt`;
const testFilePath = path.join(motifRefusDir, testFileName);

fs.writeFileSync(testFilePath, `Test de fichier statique - ${new Date().toISOString()}`);

console.log(`📄 Fichier de test créé: ${testFilePath}`);
console.log(`📄 Fichier existe: ${fs.existsSync(testFilePath) ? '✅' : '❌'}`);


if (fs.existsSync(motifRefusDir)) {
  const files = fs.readdirSync(motifRefusDir);
  console.log(`📋 Fichiers dans motifRefus: ${files.join(', ')}`);
}

console.log('\n🎯 URLs de test:');
console.log(`- Fichier de test: http://localhost:5000/uploads/motifRefus/${testFileName}`);
console.log(`- API test: http://localhost:5000/api/demandes/test-file/${testFileName}`);

console.log('\n📝 Instructions de test:');
console.log('1. Assurez-vous que le serveur est démarré sur le port 5000');
console.log('2. Testez l\'URL directe dans votre navigateur');
console.log('3. Testez l\'API de test pour vérifier les informations');

console.log('\n✅ Test terminé'); 