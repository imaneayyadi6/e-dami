import express from "express";
import {
  createCategorie,
  deleteCategorie,
  getCategorieByID,
  getCategories,
  updateCategorie,
} from "../controllers/categorieController.js";
import { createur, protect } from "../middlewares/authMidlleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getCategories)
  .post(protect, createur, createCategorie);

router
  .route("/:id")
  .get(protect, getCategorieByID)
  .put(protect, createur, updateCategorie)
  .delete(protect, createur, deleteCategorie);

export default router;
