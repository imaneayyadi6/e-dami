import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabaseConnection() {
  try {
    console.log('🔍 Test de connexion à la base de données...\n');
    
    
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/e-dami", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connexion MongoDB réussie');
    
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📋 Collections trouvées: ${collections.length}`);
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count} documents`);
    }
    
    
    const userSchema = new mongoose.Schema({
      nom: String,
      prenom: String,
      email: String,
      password: String,
      matricule: Number,
      isActive: { type: Boolean, default: true },
      firstTimeLogin: { type: Boolean, default: false },
      roles: [{ role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' } }],
      service: { type: mongoose.Schema.Types.ObjectId, ref: 'service' },
      direction: { type: mongoose.Schema.Types.ObjectId, ref: 'direction' },
      departement: { type: mongoose.Schema.Types.ObjectId, ref: 'departement' }
    }, { timestamps: true });
    
    const User = mongoose.model('utilisateur', userSchema);
    const userCount = await User.countDocuments();
    console.log(`\n👥 Utilisateurs dans la base: ${userCount}`);
    
    if (userCount > 0) {
      const firstUser = await User.findOne().select('nom prenom email');
      console.log(`📋 Premier utilisateur: ${firstUser?.nom} ${firstUser?.prenom} (${firstUser?.email})`);
    }
    
    console.log('\n🎯 Test terminé!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testDatabaseConnection();
