import colors from "colors";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";


import connectDB from "./config/database.js";
import directionRoutes from "./routes/directionRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import categorieRoutes from "./routes/categorieRoutes.js";
import sousCategorieRoutes from "./routes/sousCategorieRoutes.js";
import optionRoutes from "./routes/optionRoutes.js";
import utilisateurRoutes from "./routes/utilisateurRoutes.js";
import chartRoutes from "./routes/chartRoutes.js";
import demandeRoutes from "./routes/demandeRoutes.js";
import notificationRoutes from "./routes/notificationsRoutes.js";
import departementRoutes from "./routes/departementRoutes.js";
import generateFileRoutes from "./routes/generateFileRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import http from "http";
import { Server } from "socket.io";
import socketRoutes from "./routes/socketRoutes.js";
import path from "path";
import fs from "fs";
import punycode from "punycode";
import dotenv from "dotenv";
import ensureUploadsDirectory from "./scripts/ensureUploadsDir.js";
import checkStaticFiles from "./scripts/checkStaticFiles.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ADDRESS,
    methods: ["GET", "POST"],
  },
});



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


app.set('trust proxy', 1);


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
  message: {
    error: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);


app.use(express.json({ 
  limit: '10mb',
  extended: false 
}));
app.use(express.urlencoded({ 
  limit: '10mb',
  extended: true 
}));


app.use(compression());






connectDB();


ensureUploadsDirectory();


checkStaticFiles();



app.use("/uploads", express.static("uploads"));


app.use("/logs", express.static("logs"));



const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-DAMI API',
      version: '1.0.0',
      description: 'API documentation for E-DAMI application',
    },
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./backend/routes/*.js', './backend/controllers/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


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


app.use("/api/utilisateurs", utilisateurRoutes);
app.use("/api/directions", directionRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/souscategories", sousCategorieRoutes);
app.use("/api/options", optionRoutes);
app.use("/api/charts", chartRoutes);
app.use("/api/demandes", demandeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/generate", generateFileRoutes);
app.use("/api/departements", departementRoutes);
app.use("/api/dashboard", dashboardRoutes);


const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  const buildFolder = path.join(__dirname, "frontend", "build");
  
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
  app.get("/", (req, res) => res.send("API is running..."));
}



socketRoutes(io);



app.use(notFound);
app.use(errorHandler);


process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  
});


const PORT = process.env.PORT || 4000;

server.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold
  )
);

export default io;
