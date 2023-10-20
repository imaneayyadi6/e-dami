import express from "express";
import { createur, protect } from "../middlewares/authMidlleware.js";
import {
  chartGetCountOptionsOfServices,
  chartGetCountOptionsOfSousCategories,
  chartGetOptions,
  chartGetUsers,
} from "../controllers/chartController.js";
const router = express.Router();

router.route("/users").get(protect, createur, chartGetUsers);
router.route("/options").get(protect, createur, chartGetOptions);
router
  .route("/options/services")
  .get(protect, createur, chartGetCountOptionsOfServices);
router
  .route("/options/souscategories")
  .get(protect, createur, chartGetCountOptionsOfSousCategories);

export default router;
