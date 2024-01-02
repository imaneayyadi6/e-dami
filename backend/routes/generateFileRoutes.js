import express from "express";
import {
  generateImage
} from "../controllers/generateFileController.js";
import { protect } from "../middlewares/authMidlleware.js";

const router = express.Router();

router
  .route("/image")
  .post(protect, generateImage)



export default router;
