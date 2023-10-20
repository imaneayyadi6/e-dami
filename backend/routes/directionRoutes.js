import express from "express";
import {
  createDirection,
  deleteDirection,
  getDirectionByID,
  getDirectionByServiceID,
  getDirections,
  updateDirection,
} from "../controllers/directionController.js";
import { createur, protect } from "../middlewares/authMidlleware.js";

const router = express.Router();
router
  .route("/")
  .get(protect, createur, getDirections)
  .post(protect, createur, createDirection);

router
  .route("/:id")
  .get(protect, createur, getDirectionByID)
  .put(protect, createur, updateDirection)
  .delete(protect, createur, deleteDirection);

router.route("/service/:id").get(protect, createur, getDirectionByServiceID);

export default router;
