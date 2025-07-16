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

import upload from "../middlewares/uploadMiddleware.js";

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
  .get(protect,  getFilterOptionsDemandes);

router
  .route("/:id/traitement/:idTraitement")
  .get(protect, signataire, getDemandesByID);
router
  .route("/:id/status/:idTraitement")
  .get(protect, getStatusTraitementDeDemande);
router
  .route("/:id/approuve/:idTraitement")
  .put(protect, signataire, approuverDemande);
router
  .route("/:id/refuse/:idTraitement")
  .put(protect, upload.single("fichierMotifRefus"), refuserDemande);
router.route("/mesdemandes").get(protect, demandeur, getMesDemandes);
router.route("/:id").get(protect, demandeur, getDemandeurDemandeByID);
router.route("/for/preview/team/all").get(protect,  getDemandesForPreviewAll);



export default router;
