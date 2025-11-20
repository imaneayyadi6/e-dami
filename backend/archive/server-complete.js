
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();


app.set('trust proxy', 1);


app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ADDRESS || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Trop de requêtes depuis cette IP" }
});
app.use("/api/", limiter);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use(compression());


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
  civilite: String,
  telephone: String,
  isActive: { type: Boolean, default: true },
  firstTimeLogin: { type: Boolean, default: false },
  roles: [{ role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' }, dateAttribution: Date }],
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'service' },
  direction: { type: mongoose.Schema.Types.ObjectId, ref: 'direction' },
  departement: { type: mongoose.Schema.Types.ObjectId, ref: 'departement' }
}, { timestamps: true });

const roleSchema = new mongoose.Schema({
  code: String,
  libelle: String
});

const optionSchema = new mongoose.Schema({
  libelle: String,
  description: String,
  typeProcessus: String,
  isDeleted: { type: Boolean, default: false }
});

const demandeSchema = new mongoose.Schema({
  demandeur: { type: mongoose.Schema.Types.ObjectId, ref: 'utilisateur' },
  option: { type: mongoose.Schema.Types.ObjectId, ref: 'option' },
  contenu: { type: String, required: true },
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

const directionSchema = new mongoose.Schema({
  libelle: String
});

const serviceSchema = new mongoose.Schema({
  libelle: String,
  direction: { type: mongoose.Schema.Types.ObjectId, ref: 'direction' }
});

const departementSchema = new mongoose.Schema({
  libelle: String
});

const User = mongoose.model('utilisateur', userSchema);
const Role = mongoose.model('role', roleSchema);
const Option = mongoose.model('option', optionSchema);
const Demande = mongoose.model('demande', demandeSchema);
const Direction = mongoose.model('direction', directionSchema);
const Service = mongoose.model('service', serviceSchema);
const Departement = mongoose.model('departement', departementSchema);


app.use("/uploads", express.static("uploads"));


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
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


app.post('/api/utilisateurs/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request received:', { email, password: '***' });

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
      civilite: user.civilite,
      telephone: user.telephone,
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
      error: 'Erreur serveur interne'
    });
  }
});




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


app.get('/api/options', authenticateToken, async (req, res) => {
  try {
    const options = await Option.find({ isDeleted: false });
    res.json(options);
  } catch (error) {
    console.error('Get options error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/options/:optionId', authenticateToken, async (req, res) => {
  try {
    const { optionId } = req.params;
    const option = await Option.findById(optionId);
    
    if (!option) {
      return res.status(404).json({ error: 'Option non trouvée' });
    }
    
    res.json(option);
  } catch (error) {
    console.error('Get option by ID error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/directions', authenticateToken, async (req, res) => {
  try {
    const directions = await Direction.find();
    res.json(directions);
  } catch (error) {
    console.error('Get directions error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/services', authenticateToken, async (req, res) => {
  try {
    const services = await Service.find().populate('direction');
    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/departements', authenticateToken, async (req, res) => {
  try {
    const departements = await Departement.find();
    res.json(departements);
  } catch (error) {
    console.error('Get departements error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/demandes/mesdemandes', authenticateToken, async (req, res) => {
  try {
    const userInfo = req.user;
    const demandes = await Demande.find({ demandeur: userInfo.id })
      .populate('option', 'libelle')
      .populate('traitement.signataire', 'nom prenom')
      .sort({ createdAt: -1 });
    
    res.json(demandes);
  } catch (error) {
    console.error('Get mes demandes error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/demandes/handle', authenticateToken, async (req, res) => {
  try {
    const userInfo = req.user;
    const demandes = await Demande.find({
      'traitement.signataire': userInfo.id,
      'traitement.status': 'en attente'
    })
      .populate('demandeur', 'nom prenom email')
      .populate('option', 'libelle')
      .populate('traitement.signataire', 'nom prenom')
      .sort({ createdAt: -1 });
    
    res.json(demandes);
  } catch (error) {
    console.error('Get demandes to handle error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/demandes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userInfo = req.user;
    
    const demande = await Demande.findById(id)
      .populate('demandeur', 'nom prenom email matricule')
      .populate('option', 'libelle')
      .populate('traitement.signataire', 'nom prenom');
    
    if (!demande) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }
    
    
    let hasAccess = false;
    
    
    const user = await User.findById(userInfo.id).populate('roles.role');
    const roleCodes = user.roles.map(role => role.role.code);
    
    if (roleCodes.includes('demandeur') && String(demande.demandeur._id) === String(userInfo.id)) {
      hasAccess = true;
    }
    else if (roleCodes.includes('signataire')) {
      hasAccess = demande.traitement.some(t => String(t.signataire._id) === String(userInfo.id));
    }
    else if (roleCodes.includes('admin')) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Accès non autorisé à cette demande' });
    }
    
    res.json(demande);
  } catch (error) {
    console.error('Get demande by ID error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.post('/api/demandes', authenticateToken, async (req, res) => {
  try {
    const { option, contenu } = req.body;
    const userInfo = req.user;
    
    if (!option || !contenu) {
      return res.status(400).json({ error: 'Option et contenu requis' });
    }
    
    
    const signataires = await User.find({ 'roles.role': { $in: await Role.find({ code: 'signataire' }).distinct('_id') } })
      .select('_id nom prenom email');
    
    
    const traitement = signataires.map(signataire => ({
      signataire: signataire._id,
      status: 'en attente',
      dateTraitement: null,
      commentaire: null
    }));
    
    const demande = new Demande({
      demandeur: userInfo.id,
      option,
      contenu,
      status: 'en cours',
      dateEnvoiTraitement: new Date(),
      traitement: traitement,
      pdfGenerated: false
    });
    
    await demande.save();
    
    
    const populatedDemande = await Demande.findById(demande._id)
      .populate('traitement.signataire', 'nom prenom email')
      .populate('option', 'libelle');
    
    res.status(201).json({
      message: 'Demande créée avec succès',
      demande: populatedDemande,
      pdfGenerated: false
    });
    
  } catch (error) {
    console.error('Create demande error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
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




app.get('/api/demandes/for/preview/team/all', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userInfo = req.user;
    
    
    const demandes = await Demande.find({})
      .populate('demandeur', 'nom prenom email matricule')
      .populate('option', 'libelle')
      .populate('traitement.signataire', 'nom prenom email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Demande.countDocuments();
    
    res.json({
      demandes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get demandes for preview error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const userInfo = req.user;
    
    
    const notifications = [
      {
        _id: '1',
        titre: 'Nouvelle demande',
        contenu: 'Une nouvelle demande a été créée',
        date: new Date(),
        lu: false
      }
    ];
    
    res.json({
      notifications,
      totalPages: 1,
      currentPage: page,
      total: 1
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/notifications/toast', authenticateToken, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Get notifications toast error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/notifications/notseen', authenticateToken, async (req, res) => {
  try {
    res.json({ count: 0 });
  } catch (error) {
    console.error('Get notifications not seen error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/directions', authenticateToken, async (req, res) => {
  try {
    const directions = await Direction.find({});
    res.json(directions);
  } catch (error) {
    console.error('Get directions error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await Categorie.find({});
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.get('/api/charts/users', authenticateToken, async (req, res) => {
  try {
    res.json({ data: [] });
  } catch (error) {
    console.error('Get charts users error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

app.get('/api/charts/options/souscategories', authenticateToken, async (req, res) => {
  try {
    res.json({ data: [] });
  } catch (error) {
    console.error('Get charts options souscategories error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

app.get('/api/charts/options', authenticateToken, async (req, res) => {
  try {
    res.json({ data: [] });
  } catch (error) {
    console.error('Get charts options error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

app.get('/api/charts/options/services', authenticateToken, async (req, res) => {
  try {
    res.json({ data: [] });
  } catch (error) {
    console.error('Get charts options services error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

app.get('/api/charts/bars/demandes', authenticateToken, async (req, res) => {
  try {
    res.json({ data: [] });
  } catch (error) {
    console.error('Get charts bars demandes error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

app.get('/api/charts/lines/demandes', authenticateToken, async (req, res) => {
  try {
    res.json({ data: [] });
  } catch (error) {
    console.error('Get charts lines demandes error:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/utilisateurs/login`);
  console.log(`👥 Users: GET http://localhost:${PORT}/api/utilisateurs`);
  console.log(`📋 Options: GET http://localhost:${PORT}/api/options`);
  console.log(`📄 Demandes: GET http://localhost:${PORT}/api/demandes`);
});


process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
