import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edami', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const optionSchema = new mongoose.Schema({
  nom: String,
  libelle: String,
  type: String,
  description: String,
  categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie' },
  sousCategorie: { type: mongoose.Schema.Types.ObjectId, ref: 'SousCategorie' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  departement: { type: mongoose.Schema.Types.ObjectId, ref: 'Departement' },
  direction: { type: mongoose.Schema.Types.ObjectId, ref: 'Direction' }
});

const demandeSchema = new mongoose.Schema({
  demandeur: { type: mongoose.Schema.Types.ObjectId, ref: 'utilisateur' },
  option: { type: mongoose.Schema.Types.ObjectId, ref: 'Option' },
  status: { type: String, default: 'en cours' },
  dateEnvoiTraitement: Date,
  traitement: [{
    signataire: { type: mongoose.Schema.Types.ObjectId, ref: 'utilisateur' },
    status: { type: String, default: 'en attente' },
    dateTraitement: Date,
    commentaire: String
  }],
  pdfGenerated: { type: Boolean, default: false },
  pdfPath: String
}, { timestamps: true });

const Option = mongoose.model('Option', optionSchema);
const Demande = mongoose.model('Demande', demandeSchema);

async function cleanDatabase() {
  try {
    console.log('🧹 Nettoyage de la base de données...\n');

    
    const deletedDemandes = await Demande.deleteMany({});
    console.log(`🗑️ ${deletedDemandes.deletedCount} demandes supprimées`);

    
    const deletedOptions = await Option.deleteMany({});
    console.log(`🗑️ ${deletedOptions.deletedCount} options supprimées`);

    
    const newOptions = [
      {
        nom: "Demande de Congé Annuel",
        libelle: "Demande de Congé Annuel",
        type: "RH",
        description: "Demande de congé annuel pour les employés"
      },
      {
        nom: "Demande de Matériel Informatique",
        libelle: "Demande de Matériel Informatique", 
        type: "IT",
        description: "Demande d'achat de matériel informatique"
      },
      {
        nom: "Demande de Formation",
        libelle: "Demande de Formation",
        type: "RH",
        description: "Demande de formation professionnelle"
      }
    ];

    for (const optionData of newOptions) {
      const newOption = new Option(optionData);
      await newOption.save();
      console.log(`✅ Option créée: ${optionData.nom}`);
    }

    
    console.log('\n🔍 Vérification des options créées...');
    const allOptions = await Option.find();
    console.log(`📊 Total des options: ${allOptions.length}`);
    allOptions.forEach((option, index) => {
      console.log(`   ${index + 1}. ${option.nom} (${option.type}) - ID: ${option._id}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

cleanDatabase();
