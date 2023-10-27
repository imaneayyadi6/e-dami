import express from "express";

import { protect, signataire } from "../middlewares/authMidlleware.js";
import {
  createDemande,
  getDemandesForHandling,
} from "../controllers/demandeController.js";

const router = express.Router();

router.route("/").post(protect, createDemande);
router.route("/handle").get(protect, signataire, getDemandesForHandling);

export default router;
