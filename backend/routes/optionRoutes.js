import express from "express";
import {
  createOption,
  deleteOption,
  getOptionByID,
  getOptions,
  getOptionsBySousCategorieID,
  updateOption,

  getOptionsCrtOp,
  createOptionCrOp,
  updateOptionCrtOp,
  deleteOptionCrtOp
} from "../controllers/optionController.js";
import { protect, createur, createurOption } from "../middlewares/authMidlleware.js";
const router = express.Router();

router
  .route("/")
  .get(protect, getOptions)
  .post(protect, createur, createOption);


router
  .route("/crtop")
  .get(protect, getOptionsCrtOp)
  .post(protect, createurOption, createOptionCrOp);


router.route("/souscategorie").get(protect, getOptionsBySousCategorieID);

router
  .route("/:id")
  .get(protect, getOptionByID)
  .put(protect, createur, updateOption)
  .delete(protect, createur, deleteOption);


router
  .route("/crtop/:id")
  .put(protect, createurOption, updateOptionCrtOp)
  .delete(protect, createurOption, deleteOptionCrtOp);




export default router;
