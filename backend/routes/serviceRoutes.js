import express from "express";
import {
  createService,
  deleteService,
  getServiceByID,
  getServices,
  updateService,
  getServicesByDirectionID,
  getServicesByDepartementID,
} from "../controllers/serviceController.js";
import { createur, protect } from "../middlewares/authMidlleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getServices)
  .post(protect, createur, createService);

router
  .route("/:id")
  .get(protect, getServiceByID)
  .put(protect, createur, updateService)
  .delete(protect, createur, deleteService);

router.route("/direction/:id").get(protect, getServicesByDirectionID);
router.route("/departement/:id").get(protect, getServicesByDepartementID);

export default router;
