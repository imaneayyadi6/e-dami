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

const userSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  email: String,
  matricule: Number,
  roles: [{ role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' } }]
}, { timestamps: true });

const Option = mongoose.model('Option', optionSchema);
const User = mongoose.model('User', userSchema);

async function deleteOptionsByUser(matricule) {
  try {
    console.log(`🗑️ Suppression des DAMI's pour l'utilisateur matricule: ${matricule}...\n`);

    
    const user = await User.findOne({ matricule: matricule });
    if (!user) {
      console.log(`❌ Utilisateur avec matricule ${matricule} non trouvé`);
      return;
    }

    console.log(`👤 Utilisateur trouvé: ${user.prenom} ${user.nom}`);

    
    const result = await Option.deleteMany({ createur: user._id });
    console.log(`✅ ${result.deletedCount} DAMI's supprimées pour ${user.prenom} ${user.nom}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
}


const matricule = process.argv[2];
if (!matricule) {
  console.log('❌ Veuillez spécifier un matricule: node delete-options-by-user.js [matricule]');
  process.exit(1);
}

deleteOptionsByUser(parseInt(matricule));
