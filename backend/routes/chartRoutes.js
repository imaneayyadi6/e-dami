import express from "express";
import { protect, signataire } from "../middlewares/authMidlleware.js";
import {
  chartBarGetDemandes,
  chartGetCountOptionsOfServices,
  chartGetCountOptionsOfSousCategories,
  chartGetOptions,
  chartGetUsers,
  chartLineGetDemandes,
  chartLinesByDirectionDemandes,
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
  .route("/lines/demandes/bydirections")
  .get(protect, signataire, chartLinesByDirectionDemandes);

export default router;
