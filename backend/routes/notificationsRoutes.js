import express from "express";
import {
    getCountNotSeenNotifications, getNotifications, getToastNotifications, seenNotifications,
    seenToastNotifications,
    seenOneToastNotification
} from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMidlleware.js";

const router = express.Router();
router
    .route("/")
    .get(protect, getNotifications)
    .put(protect, seenNotifications)
router
    .route("/toast")
    .get(protect, getToastNotifications)
    .put(protect, seenToastNotifications)

router.route("/toast/:id").put(protect, seenOneToastNotification)

router
    .route("/:id")
    .get(protect, getCountNotSeenNotifications)




export default router;