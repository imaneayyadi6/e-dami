import express from "express";
import {
  createService,
  deleteService,
  getServiceByID,
  getServices,
  updateService,
  getServicesByDirectionID,
} from "../controllers/serviceController.js";
import { createur, protect } from "../middlewares/authMidlleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, createur, getServices)
  .post(protect, createur, createService);

router
  .route("/:id")
  .get(protect, createur, getServiceByID)
  .put(protect, createur, updateService)
  .delete(protect, createur, deleteService);
router.route("/direction/:id").get(protect, createur, getServicesByDirectionID);

export default router;
