import express from "express";

import {
  protect,
  signataire,
  demandeur,
  createur,
} from "../middlewares/authMidlleware.js";

import {
  createDemande,
  getDemandesForHandling,
  getDemandesByID,
  approuverDemande,
  getStatusTraitementDeDemande,
  refuserDemande,
  getMesDemandes,
  getDemandeurDemandeByID,
  getFilterOptionsDemandes,
  getDemandesForPreview,
  getDemandeForPreviewByID,
  getDemandesForPreviewAll,
} from "../controllers/demandeController.js";

const router = express.Router();
router.route("/handle").get(protect, signataire, getDemandesForHandling);
router.route("/").post(protect, createDemande);

router
  .route("/for/preview/team")
  .get(protect, signataire, getDemandesForPreview);

router
  .route("/for/preview/team/details/:id")
  .get(protect, getDemandeForPreviewByID);

router
  .route("/handle/filter")
  .get(protect, signataire, getFilterOptionsDemandes);

router
  .route("/:id/traitement/:idTraitement")
  .get(protect, signataire, getDemandesByID);
router
  .route("/:id/status/:idTraitement")
  .get(protect, signataire, getStatusTraitementDeDemande);
router
  .route("/:id/approuve/:idTraitement")
  .put(protect, signataire, approuverDemande);
router
  .route("/:id/refuse/:idTraitement")
  .put(protect, signataire, refuserDemande);
router.route("/mesdemandes").get(protect, demandeur, getMesDemandes);
router.route("/:id").get(protect, demandeur, getDemandeurDemandeByID);
router.route("/for/preview/team/all").get(protect, createur, getDemandesForPreviewAll);


export default router;
