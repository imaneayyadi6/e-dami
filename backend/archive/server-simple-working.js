
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
  isActive: { type: Boolean, default: true },
  firstTimeLogin: { type: Boolean, default: false },
  roles: [{ role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' } }],
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'service' },
  direction: { type: mongoose.Schema.Types.ObjectId, ref: 'direction' },
  departement: { type: mongoose.Schema.Types.ObjectId, ref: 'departement' }
}, { timestamps: true });

const User = mongoose.model('utilisateur', userSchema);


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


app.post('/api/utilisateurs/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password: '***' });

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

    const user = await User.findOne(query)
      .populate("roles.role")
      .populate("direction")
      .populate("service")
      .populate("departement");

    if (!user) {
      return res.status(404).json({
        error: 'Email ou matricule invalide !'
      });
    }

    
    const isPasswordValid = await bcrypt.compare(password, user.password);
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
      error: 'Erreur serveur interne'
    });
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
  console.log(`👥 Users: GET http://localhost:${PORT}/api/utilisateurs`);
});


process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
