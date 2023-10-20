import express from "express";
import {
  createOption,
  deleteOption,
  getOptionByID,
  getOptions,
  getOptionsBySousCategorieID,
  updateOption,
} from "../controllers/optionController.js";
import { protect, createur } from "../middlewares/authMidlleware.js";
const router = express.Router();

router
  .route("/")
  .get(protect, getOptions)
  .post(protect, createur, createOption);
router
  .route("/:id")
  .get(protect, getOptionByID)
  .put(protect, createur, updateOption)
  .delete(protect, createur, deleteOption);

router.route("/souscategorie/:id").get(protect, getOptionsBySousCategorieID);

export default router;
