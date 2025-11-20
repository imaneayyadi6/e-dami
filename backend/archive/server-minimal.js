import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());


mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/e-dami")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));


const userSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  email: String,
  matricule: Number,
  password: String,
  civilite: String,
  roles: [{
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }
  }]
});

const User = mongoose.model('User', userSchema, 'utilisateurs');


const roleSchema = new mongoose.Schema({
  code: String,
  libelle: String
});

const Role = mongoose.model('Role', roleSchema);


app.post('/api/utilisateurs/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    
    let user;
    if (isNaN(email)) {
      user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
        .populate('roles.role');
    } else {
      user = await User.findOne({ matricule: parseInt(email) })
        .populate('roles.role');
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      matricule: user.matricule,
      civilite: user.civilite,
      roles: user.roles
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/utilisateurs/login`);
});