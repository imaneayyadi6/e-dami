import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();


mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/e-dami", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const userSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  email: String,
  matricule: Number,
  civilite: String,
  telephone: String,
  roles: [{
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    dateAttribution: Date
  }],
  direction: { type: mongoose.Schema.Types.ObjectId, ref: 'direction' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'service' },
  departement: { type: mongoose.Schema.Types.ObjectId, ref: 'departement' }
});

const optionSchema = new mongoose.Schema({
  libelle: String,
  description: String,
  typeProcessus: String
});

const roleSchema = new mongoose.Schema({
  code: String,
  libelle: String
});

const demandeSchema = new mongoose.Schema({
  demandeur: { type: mongoose.Schema.Types.ObjectId, ref: 'utilisateur' },
  option: { type: mongoose.Schema.Types.ObjectId, ref: 'option' },
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

const User = mongoose.model('utilisateur', userSchema);
const Option = mongoose.model('option', optionSchema);
const Role = mongoose.model('Role', roleSchema);
const Demande = mongoose.model('Demande', demandeSchema);

async function testCompletePDFFlow() {
  try {
    console.log('🔍 Test complet du flux PDF...\n');

    
    console.log('📝 Création d\'une demande...');
    const demandeur = await User.findOne({ email: 'demandeur@snrt.ma' });
    const option = await Option.findOne();
    const signataireRole = await Role.findOne({ code: 'signataire' });
    const signataires = await User.find({ 'roles.role': signataireRole._id });
    
    const traitement = signataires.map(signataire => ({
      signataire: signataire._id,
      status: 'en attente',
      dateTraitement: null
    }));

    const demande = new Demande({
      demandeur: demandeur._id,
      option: option._id,
      status: 'en cours',
      dateEnvoiTraitement: new Date(),
      traitement: traitement,
      pdfGenerated: false
    });

    await demande.save();
    console.log(`✅ Demande créée: ${demande._id}`);

    
    console.log('\n📄 Génération du PDF via API...');
    const loginResponse = await axios.post('http://localhost:4000/api/utilisateurs/login', {
      email: 'demandeur@snrt.ma',
      password: '123456'
    });
    const token = loginResponse.data.token;

    
    let demandeResponse;
    try {
      demandeResponse = await axios.post('http://localhost:4000/api/demandes', {
        option: option._id,
        contenu: `Demande de ${option.libelle} pour ${demandeur.nom} ${demandeur.prenom}`
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Demande créée via API avec PDF généré');
      console.log(`   PDF Généré: ${demandeResponse.data.pdfGenerated}`);
      console.log(`   PDF Path: ${demandeResponse.data.pdfPath}`);
      
    } catch (apiError) {
      console.log('❌ Erreur API:', apiError.response?.status);
      console.log('📋 Message:', apiError.response?.data?.error);
      return; 
    }

    
    console.log('\n📥 Test du téléchargement PDF...');
    const apiDemandeId = demandeResponse.data._id;
    
    
    console.log('✅ Approbation de la demande API...');
    await Demande.findByIdAndUpdate(apiDemandeId, { status: 'approuvée' });
    await Demande.findByIdAndUpdate(apiDemandeId, {
      'traitement.0.status': 'approuvé',
      'traitement.0.dateTraitement': new Date()
    });
    console.log('✅ Demande API approuvée');

    try {
      const pdfResponse = await axios.get(`http://localhost:4000/api/demandes/${apiDemandeId}/pdf?token=${token}`, {
        responseType: 'blob',
        timeout: 15000
      });
      
      console.log(`✅ PDF téléchargé avec succès!`);
      console.log(`📊 Taille: ${pdfResponse.data.size} bytes`);
      console.log(`📋 Content-Type: ${pdfResponse.headers['content-type']}`);
      console.log(`📋 Content-Disposition: ${pdfResponse.headers['content-disposition']}`);
      
      
      const fs = await import('fs');
      const path = await import('path');
      const downloadPath = path.join(process.cwd(), 'test-final-pdf.pdf');
      fs.writeFileSync(downloadPath, pdfResponse.data);
      console.log(`💾 PDF sauvegardé dans: ${downloadPath}`);
      
    } catch (pdfError) {
      console.log(`❌ Erreur téléchargement PDF: ${pdfError.response?.status}`);
      console.log(`📋 Message: ${pdfError.response?.data?.error}`);
    }

    console.log('\n🎉 Test complet terminé!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testCompletePDFFlow();
