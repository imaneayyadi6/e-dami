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

async function checkDemandesData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/e-dami');
    console.log('✅ Connected to MongoDB\n');

    
    const demandes = await Demande.find({});
    console.log(`📋 Found ${demandes.length} demandes\n`);

    if (demandes.length > 0) {
      console.log('📋 Demande details:');
      demandes.forEach((demande, index) => {
        console.log(`${index + 1}. Demande ID: ${demande._id}`);
        console.log(`   Status: ${demande.status}`);
        console.log(`   Traitement count: ${demande.traitement ? demande.traitement.length : 0}`);
        
        if (demande.traitement && demande.traitement.length > 0) {
          demande.traitement.forEach((traitement, tIndex) => {
            console.log(`   Traitement ${tIndex + 1}:`);
            console.log(`   - Signataire ID: ${traitement.signataire}`);
            console.log(`   - Status: ${traitement.status}`);
            console.log(`   - Date: ${traitement.dateTraitement}`);
            console.log(`   - Motif: ${traitement.motifValidation}`);
          });
        }
        console.log('');
      });

      
      if (demandes.length > 0) {
        console.log('🔍 Testing populate on first demande...');
        const firstDemande = await Demande.findById(demandes[0]._id)
          .populate('traitement.signataire', 'nom prenom matricule civilite');
        
        if (firstDemande.traitement && firstDemande.traitement.length > 0) {
          const traitement = firstDemande.traitement[0];
          if (traitement.signataire) {
            console.log('✅ Populate successful:');
            console.log(`   Signataire: ${traitement.signataire.prenom} ${traitement.signataire.nom} (${traitement.signataire.civilite})`);
          } else {
            console.log('❌ Signataire not populated');
          }
        }
      }
    } else {
      console.log('❌ No demandes found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkDemandesData();

