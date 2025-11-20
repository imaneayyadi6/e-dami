
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/e-dami", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
};


connectDB();



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


const roleSchema = new mongoose.Schema({
  code: String,
  libelle: String
}, { timestamps: true });

const Role = mongoose.model('role', roleSchema);


const directionSchema = new mongoose.Schema({
  libelle: String,
  directeursAdjoints: [String],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Direction = mongoose.model('direction', directionSchema);


const serviceSchema = new mongoose.Schema({
  libelle: String,
  direction: { type: mongoose.Schema.Types.ObjectId, ref: 'direction' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Service = mongoose.model('service', serviceSchema);


const departementSchema = new mongoose.Schema({
  libelle: String,
  direction: { type: mongoose.Schema.Types.ObjectId, ref: 'direction' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Departement = mongoose.model('departement', departementSchema);


const categorieSchema = new mongoose.Schema({
  libelle: String,
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Categorie = mongoose.model('categorie', categorieSchema);


const sousCategorieSchema = new mongoose.Schema({
  libelle: String,
  categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'categorie' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const SousCategorie = mongoose.model('sousCategorie', sousCategorieSchema);


const optionSchema = new mongoose.Schema({
  libelle: String,
  description: String,
  categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'categorie' },
  sousCategorie: { type: mongoose.Schema.Types.ObjectId, ref: 'sousCategorie' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'service' },
  departement: { type: mongoose.Schema.Types.ObjectId, ref: 'departement' },
  direction: { type: mongoose.Schema.Types.ObjectId, ref: 'direction' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Option = mongoose.model('option', optionSchema);


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});



app.get('/api/directions', async (req, res) => {
  try {
    const directions = await Direction.find({ isDeleted: false }).sort({ libelle: 1 });
    res.json(directions);
  } catch (error) {
    console.error('Get directions error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/directions/signataires', async (req, res) => {
  try {
    const directions = await Direction.find({ isDeleted: false }).sort({ libelle: 1 });
    res.json(directions);
  } catch (error) {
    console.error('Get directions signataires error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/directions/service/:serviceId', async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId).populate('direction');
    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }
    res.json(service.direction);
  } catch (error) {
    console.error('Get direction by service error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find({ isDeleted: false })
      .populate('direction', 'libelle')
      .sort({ libelle: 1 });
    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/services/direction/:directionId', async (req, res) => {
  try {
    const services = await Service.find({ 
      direction: req.params.directionId,
      isDeleted: false 
    }).populate('direction', 'libelle').sort({ libelle: 1 });
    res.json(services);
  } catch (error) {
    console.error('Get services by direction error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/services/departement/:departementId', async (req, res) => {
  try {
    const departement = await Departement.findById(req.params.departementId).populate('direction');
    if (!departement) {
      return res.status(404).json({ error: 'Département non trouvé' });
    }
    const services = await Service.find({ 
      direction: departement.direction._id,
      isDeleted: false 
    }).populate('direction', 'libelle').sort({ libelle: 1 });
    res.json(services);
  } catch (error) {
    console.error('Get services by departement error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/services/:serviceId', async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId)
      .populate('direction', 'libelle');
    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }
    res.json(service);
  } catch (error) {
    console.error('Get service by ID error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/departements', async (req, res) => {
  try {
    const departements = await Departement.find({ isDeleted: false })
      .populate('direction', 'libelle')
      .sort({ libelle: 1 });
    res.json(departements);
  } catch (error) {
    console.error('Get departements error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/departements/direction/:directionId', async (req, res) => {
  try {
    const departements = await Departement.find({ 
      direction: req.params.directionId,
      isDeleted: false 
    }).populate('direction', 'libelle').sort({ libelle: 1 });
    res.json(departements);
  } catch (error) {
    console.error('Get departements by direction error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/departements/:departementId', async (req, res) => {
  try {
    const departement = await Departement.findById(req.params.departementId)
      .populate('direction', 'libelle');
    if (!departement) {
      return res.status(404).json({ error: 'Département non trouvé' });
    }
    res.json(departement);
  } catch (error) {
    console.error('Get departement by ID error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Categorie.find({ isDeleted: false }).sort({ libelle: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/sous-categories', async (req, res) => {
  try {
    const sousCategories = await SousCategorie.find({ isDeleted: false })
      .populate('categorie', 'libelle')
      .sort({ libelle: 1 });
    res.json(sousCategories);
  } catch (error) {
    console.error('Get sous-categories error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/souscategories', async (req, res) => {
  try {
    const sousCategories = await SousCategorie.find({ isDeleted: false })
      .populate('categorie', 'libelle')
      .sort({ libelle: 1 });
    res.json(sousCategories);
  } catch (error) {
    console.error('Get souscategories error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/sous-categories/categorie/:categorieId', async (req, res) => {
  try {
    const sousCategories = await SousCategorie.find({ 
      categorie: req.params.categorieId,
      isDeleted: false 
    }).sort({ libelle: 1 });
    res.json(sousCategories);
  } catch (error) {
    console.error('Get sous-categories by category error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/souscategories/categorie/:categorieId', async (req, res) => {
  try {
    const sousCategories = await SousCategorie.find({ 
      categorie: req.params.categorieId,
      isDeleted: false 
    }).sort({ libelle: 1 });
    res.json(sousCategories);
  } catch (error) {
    console.error('Get souscategories by category error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/options', async (req, res) => {
  try {
    const options = await Option.find({ isDeleted: false })
      .populate('categorie', 'libelle')
      .populate('sousCategorie', 'libelle')
      .populate('service', 'libelle')
      .populate('departement', 'libelle')
      .populate('direction', 'libelle')
      .sort({ libelle: 1 });
    res.json(options);
  } catch (error) {
    console.error('Get options error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.post('/api/options', async (req, res) => {
  try {
    const { libelle, description, categorie, sousCategorie, service, departement, direction } = req.body;
    
    if (!libelle || !categorie || !sousCategorie || !service || !departement || !direction) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const option = new Option({
      libelle,
      description,
      categorie,
      sousCategorie,
      service,
      departement,
      direction
    });

    await option.save();
    
    const populatedOption = await Option.findById(option._id)
      .populate('categorie', 'libelle')
      .populate('sousCategorie', 'libelle')
      .populate('service', 'libelle')
      .populate('departement', 'libelle')
      .populate('direction', 'libelle');

    res.status(201).json(populatedOption);
  } catch (error) {
    console.error('Create option error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});



app.get('/api/notifications', async (req, res) => {
  try {
    res.json({ notifications: [], total: 0, page: 1, pages: 1 });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/notifications/toast', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Get notification toast error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/notifications/notseen', async (req, res) => {
  try {
    res.json({ count: 0 });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.put('/api/notifications', async (req, res) => {
  try {
    res.json({ message: 'Notifications marquées comme vues' });
  } catch (error) {
    console.error('Mark notifications as seen error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.put('/api/notifications/toast', async (req, res) => {
  try {
    res.json({ message: 'Notifications toast marquées comme vues' });
  } catch (error) {
    console.error('Mark notification toast as seen error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};



app.get('/api/utilisateurs', authenticateToken, async (req, res) => {
  try {
    const users = await User.find()
      .populate("roles.role")
      .populate("direction")
      .populate("service")
      .populate("departement")
      .select("-password");
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/utilisateurs/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("roles.role")
      .populate("direction")
      .populate("service")
      .populate("departement")
      .select("-password");
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/utilisateurs/directeurs/', authenticateToken, async (req, res) => {
  try {
    const directeurs = await User.find({ isDirecteur: true })
      .populate("roles.role")
      .populate("direction")
      .populate("service")
      .populate("departement")
      .select("-password");
    
    res.json(directeurs);
  } catch (error) {
    console.error('Get directeurs error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/utilisateurs/interim', authenticateToken, async (req, res) => {
  try {
    const interimUsers = await User.find({ interim: { $exists: true, $ne: null } })
      .populate("roles.role")
      .populate("direction")
      .populate("service")
      .populate("departement")
      .select("-password");
    
    res.json(interimUsers);
  } catch (error) {
    console.error('Get interim users error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});



app.get('/api/options/:optionId', authenticateToken, async (req, res) => {
  try {
    const option = await Option.findById(req.params.optionId)
      .populate('categorie', 'libelle')
      .populate('sousCategorie', 'libelle')
      .populate('service', 'libelle')
      .populate('departement', 'libelle')
      .populate('direction', 'libelle');
    
    if (!option) {
      return res.status(404).json({ error: 'Option non trouvée' });
    }
    
    res.json(option);
  } catch (error) {
    console.error('Get option by ID error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/options/crtop', authenticateToken, async (req, res) => {
  try {
    const options = await Option.find({ isDeleted: false })
      .populate('categorie', 'libelle')
      .populate('sousCategorie', 'libelle')
      .populate('service', 'libelle')
      .populate('departement', 'libelle')
      .populate('direction', 'libelle')
      .sort({ createdAt: -1 });
    
    res.json(options);
  } catch (error) {
    console.error('Get options for creator error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});



app.get('/api/demandes/handle/filter', authenticateToken, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Get demandes filter error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/demandes/mesdemandes', authenticateToken, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Get mes demandes error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/demandes/:id', authenticateToken, async (req, res) => {
  try {
    res.status(404).json({ error: 'Demande non trouvée' });
  } catch (error) {
    console.error('Get demande by ID error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});



app.get('/api/charts/users', authenticateToken, async (req, res) => {
  try {
    res.json({ users: [], total: 0 });
  } catch (error) {
    console.error('Get charts users error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/charts/options', authenticateToken, async (req, res) => {
  try {
    res.json({ options: [], total: 0 });
  } catch (error) {
    console.error('Get charts options error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/charts/options/services', authenticateToken, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Get charts options services error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/charts/lines/demandes', authenticateToken, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Get charts demandes lines error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/charts/bars/demandes', authenticateToken, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Get charts demandes bars error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});



app.post('/api/generate/image', authenticateToken, async (req, res) => {
  try {
    res.json({ message: 'Image generation not implemented yet' });
  } catch (error) {
    console.error('Generate image error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.post('/api/generate/excel', authenticateToken, async (req, res) => {
  try {
    res.json({ message: 'Excel generation not implemented yet' });
  } catch (error) {
    console.error('Generate excel error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.post('/api/utilisateurs/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email et mot de passe requis'
      });
    }

    
    const isNumeric = !isNaN(parseFloat(email)) && isFinite(email);
    
    let query;
    if (isNumeric) {
      query = { matricule: parseInt(email) };
    } else {
      query = { email: { $regex: new RegExp(`^${email}$`, "i") } };
    }

    console.log('Searching for user with query:', query);

    const user = await User.findOne(query)
      .populate("roles.role")
      .populate("direction")
      .populate("service")
      .populate("departement");

    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(404).json({
        error: 'Email ou matricule invalide !'
      });
    }

    console.log('Checking password...');
    
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(404).json({
        error: 'Mot de passe invalide !'
      });
    }

    
    if (!user.isActive) {
      return res.status(400).json({
        error: 'Votre compte est inactif'
      });
    }

    
    if (user.firstTimeLogin) {
      return res.status(400).json({
        error: 'Veuillez récupérer votre compte !'
      });
    }

    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '29d'
    });

    console.log('Login successful for user:', user.email);

    
    res.json({
      id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      matricule: user.matricule,
      service: user.service,
      direction: user.direction,
      departement: user.departement,
      roles: user.roles,
      token: token,
      isActive: user.isActive,
      firstTimeLogin: user.firstTimeLogin
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Erreur serveur interne',
      details: error.message
    });
  }
});


app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/utilisateurs/login`);
});


process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
