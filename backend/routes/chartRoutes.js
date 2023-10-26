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
} from "../controllers/chartController.js";
const router = express.Router();

router.route("/users").get(protect, chartGetUsers);
router.route("/options").get(protect, chartGetOptions);
router.route("/options/services").get(protect, chartGetCountOptionsOfServices);
router
  .route("/options/souscategories")
  .get(protect, chartGetCountOptionsOfSousCategories);

export default router;
