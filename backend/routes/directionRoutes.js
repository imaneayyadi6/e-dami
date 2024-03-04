import express from "express";
import {
  createDirection,
  deleteDirection,
  getDirectionByID,
  getDirectionByServiceID,
  getDirectionSignataires,
  getDirections,
  updateDirection,
} from "../controllers/directionController.js";
import {
  createur,
  protect,
  signataire,
} from "../middlewares/authMidlleware.js";

const router = express.Router();
router
  .route("/")
  .get(protect, getDirections)
  .post(protect, createur, createDirection);

router.route("/signataires").get(protect, signataire, getDirectionSignataires);

router
  .route("/:id")
  .get(protect, getDirectionByID)
  .put(protect, createur, updateDirection)
  .delete(protect, createur, deleteDirection);

router.route("/service/:id").get(protect, getDirectionByServiceID);

export default router;
