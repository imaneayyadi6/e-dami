
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";

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


app.use("/uploads", express.static("uploads"));


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});


app.get('/test', (req, res) => {
  res.json({ message: 'Serveur fonctionne !', timestamp: new Date().toISOString() });
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
    token: 'test-jwt-token-123',
    roles: [{ role: { code: 'crt' } }],
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
    { id: 1, nom: 'Test', prenom: 'User', email: 'test@example.com' }
  ]);
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
  console.log(`🚀 Serveur démarré sur le port ${PORT}`.green);
  console.log(`🔗 Test: http://localhost:${PORT}/test`);
  console.log(`❤️ Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/utilisateurs/login`);
});


process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
