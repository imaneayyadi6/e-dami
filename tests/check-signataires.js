import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/e-dami", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const userSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  email: String,
  roles: [{
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    dateAttribution: Date
  }]
});

const roleSchema = new mongoose.Schema({
  code: String,
  libelle: String
});

const User = mongoose.model('utilisateur', userSchema);
const Role = mongoose.model('Role', roleSchema);

async function checkSignataires() {
  try {
    console.log('🔍 Vérification des signataires...\n');

    
    const roles = await Role.find();
    console.log('📋 Rôles disponibles:');
    roles.forEach(role => {
      console.log(`   - ${role.code}: ${role.libelle}`);
    });

    
    const signataireRole = await Role.findOne({ code: 'signataire' });
    if (!signataireRole) {
      console.log('❌ Rôle signataire non trouvé');
      return;
    }
    console.log(`\n✅ Rôle signataire trouvé: ${signataireRole._id}`);

    
    const signataires = await User.find({ 'roles.role': signataireRole._id })
      .populate('roles.role', 'code libelle')
      .select('nom prenom email roles');

    console.log(`\n👥 Signataires trouvés: ${signataires.length}`);
    signataires.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.prenom} ${user.nom} (${user.email})`);
      user.roles.forEach(role => {
        console.log(`      - Rôle: ${role.role?.code || 'N/A'}`);
      });
    });

    if (signataires.length === 0) {
      console.log('\n❌ Aucun signataire trouvé - c\'est probablement la cause de l\'erreur');
      console.log('💡 Vous devez créer des utilisateurs avec le rôle signataire');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

checkSignataires();
