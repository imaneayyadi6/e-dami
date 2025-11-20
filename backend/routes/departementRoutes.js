import express from "express";
import {
  createDepartement,
  getDepartementByID,
  getDepartements,
  getDepartementsByDirectionID,
} from "../controllers/departementController.js";
import { createur, protect } from "../middlewares/authMidlleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getDepartements)
  .post(protect, createur, createDepartement);

router.route("/:id").get(protect, getDepartementByID);



router.route("/direction/:id").get(protect, getDepartementsByDirectionID);

export default router;
