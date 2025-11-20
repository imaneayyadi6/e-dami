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

async function deleteAllOptions() {
  try {
    console.log('🗑️ Suppression de toutes les DAMI\'s...\n');

    
    const result = await Option.deleteMany({});
    console.log(`✅ ${result.deletedCount} DAMI's supprimées avec succès !`);

    
    const remainingOptions = await Option.countDocuments();
    console.log(`📊 DAMI's restantes: ${remainingOptions}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
}

deleteAllOptions();
