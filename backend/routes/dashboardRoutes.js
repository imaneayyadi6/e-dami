import express from "express";
import { protect } from "../middlewares/authMidlleware.js";
import {
  getDashboardStats,
  getRecentRequests,
  getChartData
} from "../controllers/dashboardController.js";

const router = express.Router();

router.route("/stats").get(protect, getDashboardStats);
router.route("/recent-requests").get(protect, getRecentRequests);
router.route("/chart-data/:type").get(protect, getChartData);

export default router;


