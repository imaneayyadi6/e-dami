import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edami', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const optionSchema = new mongoose.Schema({
  nom: String,
  libelle: String,
  type: String,
  description: String,
  isDeleted: { type: Boolean, default: false },
  createur: { type: mongoose.Schema.Types.ObjectId, ref: 'utilisateur' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Option = mongoose.model('Option', optionSchema);

async function deleteSpecificOptions() {
  try {
    console.log('🗑️ Suppression des DAMI\'s spécifiques...\n');

    
    const optionsToDelete = [
      'EEX',
      'ACESS', 
      'ARRIVAGE',
      'testp',
      'Acess SI'
    ];

    console.log('📋 DAMI\'s à supprimer:');
    optionsToDelete.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });
    console.log('');

    let totalDeleted = 0;

    
    for (const optionName of optionsToDelete) {
      try {
        
        const option = await Option.findOne({ nom: optionName });
        
        if (option) {
          await Option.deleteOne({ _id: option._id });
          console.log(`✅ Supprimé: ${optionName} (${option.libelle || 'Sans libellé'})`);
          totalDeleted++;
        } else {
          console.log(`⚠️  Non trouvé: ${optionName}`);
        }
      } catch (error) {
        console.log(`❌ Erreur pour ${optionName}:`, error.message);
      }
    }

    console.log(`\n📊 Résumé:`);
    console.log(`   ✅ ${totalDeleted} DAMI's supprimées`);
    console.log(`   ⚠️  ${optionsToDelete.length - totalDeleted} non trouvées`);

    
    const remainingOptions = await Option.find({}, 'nom libelle');
    console.log(`\n📋 DAMI's restantes (${remainingOptions.length}):`);
    remainingOptions.forEach((option, index) => {
      console.log(`   ${index + 1}. ${option.nom} - ${option.libelle || 'Sans libellé'}`);
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
}

deleteSpecificOptions();
