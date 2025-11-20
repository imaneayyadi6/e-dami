
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";

const app = express();


app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CLIENT_ADDRESS || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 10000 : 100,
  skipSuccessfulRequests: process.env.NODE_ENV === "development",
  message: { error: "Trop de requêtes depuis cette IP" }
});
app.use("/api/", limiter);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use(compression());


app.use("/uploads", express.static("uploads"));


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    database: 'Not connected (simple mode)'
  });
});


app.get('/test', (req, res) => {
  res.json({ 
    message: 'Serveur fonctionne !', 
    timestamp: new Date().toISOString(),
    mode: 'Simple (sans base de données)'
  });
});



app.post('/api/utilisateurs/login', (req, res) => {
  console.log('Login attempt:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email et mot de passe requis'
    });
  }
  
  
  res.json({
    id: 'test-user-id',
    nom: 'Test',
    prenom: 'User',
    email: email,
    matricule: 12345,
    token: 'test-jwt-token-123',
    roles: [{ role: { code: 'crt', nom: 'Créateur' } }],
    service: { _id: 'service-id', nom: 'Service Test' },
    direction: { _id: 'direction-id', nom: 'Direction Test' },
    departement: { _id: 'dept-id', nom: 'Département Test' },
    isActive: true,
    firstTimeLogin: false
  });
});


app.get('/api/utilisateurs', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token d\'authentification requis'
    });
  }
  
  res.json([
    { 
      _id: 'user-1', 
      nom: 'Test', 
      prenom: 'User', 
      email: 'test@example.com',
      matricule: 12345,
      isActive: true
    }
  ]);
});


app.get('/api/directions', (req, res) => {
  res.json([
    { _id: 'dir-1', nom: 'Direction Test', code: 'DIR001' }
  ]);
});

app.get('/api/services', (req, res) => {
  res.json([
    { _id: 'serv-1', nom: 'Service Test', code: 'SERV001' }
  ]);
});

app.get('/api/categories', (req, res) => {
  res.json([
    { _id: 'cat-1', nom: 'Catégorie Test', code: 'CAT001' }
  ]);
});

app.get('/api/demandes', (req, res) => {
  res.json([
    { 
      _id: 'dem-1', 
      titre: 'Demande Test',
      statut: 'En attente',
      dateCreation: new Date().toISOString()
    }
  ]);
});


if (process.env.NODE_ENV === "production") {
  const buildFolder = path.join(process.cwd(), "frontend", "build");
  app.use(express.static(buildFolder));
  
  app.get("*", (req, res) => {
    const indexFile = path.join(buildFolder, "index.html");
    if (fs.existsSync(indexFile)) {
      res.sendFile(indexFile);
    } else {
      res.status(500).send({
        message: "index.html not found!",
        path: indexFile,
      });
    }
  });
} else {
  app.get("/", (req, res) => res.send(`
    <h1>E-DAMI API - Mode Simple</h1>
    <p>Serveur fonctionne sans base de données</p>
    <ul>
      <li><a href="/health">Health Check</a></li>
      <li><a href="/test">Test</a></li>
      <li><a href="/api/utilisateurs">API Utilisateurs (nécessite auth)</a></li>
    </ul>
  `));
}


app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`.green);
  console.log(`🔗 Test: http://localhost:${PORT}/test`);
  console.log(`❤️ Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/utilisateurs/login`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`\n💡 Mode: Simple (sans base de données)`);
  console.log(`💡 Pour le mode complet, installez MongoDB et utilisez: npm run server`);
});


process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});










