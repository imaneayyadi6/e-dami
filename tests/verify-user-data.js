import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


const userSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  email: String,
  password: String,
  matricule: Number,
  civilite: String,
  isActive: { type: Boolean, default: true },
  firstTimeLogin: { type: Boolean, default: false },
  isDirecteur: { type: Boolean, default: false },
  roles: [{ role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' } }],
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'service' },
  direction: { type: mongoose.Schema.Types.ObjectId, ref: 'direction' },
  departement: { type: mongoose.Schema.Types.ObjectId, ref: 'departement' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);


const demandeSchema = new mongoose.Schema({
  demandeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  option: { type: mongoose.Schema.Types.ObjectId, ref: 'Option' },
  contenu: String,
  status: { type: String, default: 'en cours' },
  traitement: [{
    signataire: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'en cours' },
    dateTraitement: Date,
    motifValidation: String
  }]
}, { timestamps: true });

const Demande = mongoose.model('Demande', demandeSchema);

async function verifyUserData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/e-dami');
    console.log('✅ Connected to MongoDB\n');

    
    console.log('1. Checking user with email multi@snrt.ma...');
    const user = await User.findOne({ email: 'multi@snrt.ma' });
    if (user) {
      console.log('✅ Found user:', {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        matricule: user.matricule,
        civilite: user.civilite
      });
    } else {
      console.log('❌ User not found');
    }

    
    console.log('\n2. Checking demande with traitement...');
    const demande = await Demande.findOne({})
      .populate('traitement.signataire', 'nom prenom matricule civilite');
    
    if (demande && demande.traitement && demande.traitement.length > 0) {
      console.log('✅ Found demande with traitement');
      demande.traitement.forEach((traitement, index) => {
        console.log(`   Traitement ${index + 1}:`);
        console.log(`   - Status: ${traitement.status}`);
        if (traitement.signataire) {
          console.log(`   - Signataire: ${traitement.signataire.prenom} ${traitement.signataire.nom} (${traitement.signataire.civilite})`);
        } else {
          console.log(`   - Signataire: null`);
        }
      });
    } else {
      console.log('❌ No demande with traitement found');
    }

    
    console.log('\n3. Testing exact populate query...');
    const demandes = await Demande.find({})
      .populate('demandeur', 'nom prenom matricule')
      .populate('option', 'libelle')
      .populate('traitement.signataire', 'nom prenom matricule civilite')
      .limit(1);
    
    if (demandes.length > 0) {
      const demande = demandes[0];
      console.log('✅ Populate query result:');
      if (demande.traitement && demande.traitement.length > 0) {
        const traitement = demande.traitement[0];
        if (traitement.signataire) {
          console.log(`   Signataire: ${traitement.signataire.prenom} ${traitement.signataire.nom} (${traitement.signataire.civilite})`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

verifyUserData();

