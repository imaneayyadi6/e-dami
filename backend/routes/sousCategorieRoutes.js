import express from "express";
import {
  createSousCategorie,
  deleteSousCategorie,
  getSousCategorieByID,
  getSousCategories,
  getSousCategoriesByCategorieID,
  updateSousCategorie,
} from "../controllers/sousCategorieController.js";

const router = express.Router();

router.route("/").get(getSousCategories).post(createSousCategorie);
router
  .route("/:id")
  .get(getSousCategorieByID)
  .put(updateSousCategorie)
  .delete(deleteSousCategorie);

router.route("/categorie/:id").get(getSousCategoriesByCategorieID);

export default router;
