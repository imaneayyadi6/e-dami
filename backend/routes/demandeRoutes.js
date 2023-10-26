import express from "express";

import { protect } from "../middlewares/authMidlleware.js";
import { createDemande } from "../controllers/demandeController.js";

const router = express.Router();

router
  .route("/")

  .post(protect, createDemande);

export default router;
