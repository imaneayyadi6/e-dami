import express from "express";
import {
  createur,
  protect,
  signataire,
} from "../middlewares/authMidlleware.js";
import {
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

export default router;
