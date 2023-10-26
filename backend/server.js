import colors from "colors";
import express from "express";
import dotenv from "dotenv";
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

const app = express();

// Init dotenv :
dotenv.config();

// Connect Database :
connectDB();

// Init Middlewares :
app.use(express.json({ extended: false }));

// Define Routes :
app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/utilisateurs", utilisateurRoutes);
app.use("/api/directions", directionRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/souscategories", sousCategorieRoutes);
app.use("/api/options", optionRoutes);
app.use("/api/charts", chartRoutes);
app.use("/api/demandes", demandeRoutes);

// Init Error Middlewares :
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold
  )
);
