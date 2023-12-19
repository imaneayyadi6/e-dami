import express from "express";
import {
  protect,
} from "../middlewares/authMidlleware.js";
import {
  chartBarGetDemandes,
  chartGetCountOptionsOfServices,
  chartGetCountOptionsOfSousCategories,
  chartGetOptions,
  chartGetUsers,
  chartLineGetDemandes,
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

export default router;
