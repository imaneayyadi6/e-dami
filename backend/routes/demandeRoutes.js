import express from "express";

import { protect, signataire } from "../middlewares/authMidlleware.js";
import {
  createDemande,
  getDemandesForHandling,
  getDemandesByID,
  approuverDemande,
  getStatusTraitementDeDemande,
} from "../controllers/demandeController.js";

const router = express.Router();

router.route("/").post(protect, createDemande);
router.route("/handle").get(protect, signataire, getDemandesForHandling);
router.route("/:id/traitement/:idTraitement").get(protect, signataire, getDemandesByID);
router.route("/:id/status/:idTraitement").get(protect, signataire, getStatusTraitementDeDemande);
router.route("/:id/approuve/:idTraitement").put(protect, signataire, approuverDemande);

export default router;
