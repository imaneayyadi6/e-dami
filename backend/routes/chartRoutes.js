import express from "express";
import { protect, signataire } from "../middlewares/authMidlleware.js";
import {
  chartBarGetDemandes,
  chartGetCountOptionsOfServices,
  chartGetCountOptionsOfSousCategories,
  chartGetOptions,
  chartGetUsers,
  chartLineGetDemandes,
  chartLinesSignataireDemandes,
} from "../controllers/chartController.js";
const router = express.Router();

router.route("/users").get(protect, chartGetUsers);
router.route("/options").get(protect, chartGetOptions);
router.route("/options/services").get(protect, chartGetCountOptionsOfServices);
router
  .route("/options/souscategories")
  .get(protect, chartGetCountOptionsOfSousCategories);

router.route("/lines/demandes").get(protect, chartLineGetDemandes);
router.route("/bars/demandes").get(protect, chartBarGetDemandes);
router
  .route("/lines/demandes/signataire")
  .get(protect, signataire, chartLinesSignataireDemandes);

export default router;
