import express from "express";

import { protect, signataire, demandeur } from "../middlewares/authMidlleware.js";
import {
  createDemande,
  getDemandesForHandling,
  getDemandesByID,
  approuverDemande,
  getStatusTraitementDeDemande,
  refuserDemande,
  getMesDemandes,
  getDemandeurDemandeByID,
} from "../controllers/demandeController.js";

const router = express.Router();

router.route("/").post(protect, createDemande);
router.route("/handle").get(protect, signataire, getDemandesForHandling);
router.route("/:id/traitement/:idTraitement").get(protect, signataire, getDemandesByID);
router.route("/:id/status/:idTraitement").get(protect, signataire, getStatusTraitementDeDemande);
router.route("/:id/approuve/:idTraitement").put(protect, signataire, approuverDemande);
router.route("/:id/refuse/:idTraitement").put(protect, signataire, refuserDemande);
router.route("/mesdemandes").get(protect, demandeur, getMesDemandes)
router.route("/:id").get(protect,demandeur, getDemandeurDemandeByID)

export default router;
