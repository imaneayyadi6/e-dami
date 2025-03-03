import colors from "colors";
import express from "express";

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
import http from "http";
import { Server } from "socket.io";
import socketRoutes from "./routes/socketRoutes.js";
import path from "path";
import fs from "fs";
import punycode from "punycode";
import dotenv from "dotenv";
// Init dotenv :
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ADDRESS,
    methods: ["GET", "POST"],
  },
});

// Connect Database :
connectDB();
// Serve static files from the "uploads" folder
app.use("/uploads", express.static("uploads"));
app.use("/styles", express.static("frontend/src/styles"));

// Serve static files from the "logs" folder
app.use("/logs", express.static("logs"));

// Init Middlewares :
app.use(express.json({ extended: false }));

// Define Routes :
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

// Define the uploads as static folder :
const __dirname = path.resolve();
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV === "production") {
  const buildFolder = path.join(__dirname, "frontend", "build");
  // Place the static middleware before the route handling middleware
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

// Use socketRoutes for Socket.IO logic
socketRoutes(io);

// Init Error Middlewares :
app.use(notFound);
app.use(errorHandler);

// Use socketRoutes for Socket.IO logic
socketRoutes(io);

// run the server :
const PORT = process.env.PORT || 4000;

server.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold
  )
);

export default io;
