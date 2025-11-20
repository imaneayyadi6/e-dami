import express from "express";
import {
  createOption,
  deleteOption,
  getOptionByID,
  getOptions,
  getOptionsBySousCategorieID,
  updateOption,
  getOptionsCrtOp,
  createOptionCrtOp,
  updateOptionCrtOp,
  deleteOptionCrtOp,
} from "../controllers/optionController.js";
import {
  protect,
  createur,
  createurOption,
} from "../middlewares/authMidlleware.js";
const router = express.Router();

router.route("/").get(protect, getOptions).post(protect, createOption);

router
  .route("/crtop")
  .get(protect, getOptionsCrtOp)
  .post(protect, createurOption, createOptionCrtOp);

router.route("/souscategorie").get(protect, getOptionsBySousCategorieID);

router
  .route("/:id")
  .get(protect, getOptionByID)
  .put(protect, updateOption)
  .delete(protect, deleteOption);

router
  .route("/crtop/:id")
  .put(protect, createurOption, updateOptionCrtOp)
  .delete(protect, createurOption, deleteOptionCrtOp);

export default router;
