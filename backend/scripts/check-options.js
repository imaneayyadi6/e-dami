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

async function checkOptions() {
  try {
    console.log('🔍 Vérification des DAMI\'s dans la base de données...\n');

    
    const allOptions = await Option.find({}, 'nom libelle type isDeleted');
    
    console.log(`📊 Total des DAMI's: ${allOptions.length}\n`);

    if (allOptions.length > 0) {
      console.log('📋 Liste des DAMI\'s:');
      allOptions.forEach((option, index) => {
        const status = option.isDeleted ? '❌ Supprimée' : '✅ Active';
        console.log(`   ${index + 1}. ${option.nom} - ${option.libelle || 'Sans libellé'} (${option.type || 'Sans type'}) - ${status}`);
      });
    } else {
      console.log('✅ Aucune DAMI trouvée dans la base de données');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
}

checkOptions();
