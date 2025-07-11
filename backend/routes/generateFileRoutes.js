import express from "express";
import {
  generateImage,
  generateExcel
} from "../controllers/generateFileController.js";
import { protect } from "../middlewares/authMidlleware.js";

const router = express.Router();

router
  .route("/image")
  .post(protect, generateImage)

router
  .route("/excel")
  .post(protect, generateExcel)

export default router;
