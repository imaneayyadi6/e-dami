import asyncHandler from "express-async-handler";
import Notification from "../models/notificationModel.js";

// @desc    Recuperer le nombre de notification non vue
// @route   GET /api/notifications/notseen
// @access  private
export const getCountNotSeenNotifications = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
        vue: false,
        utilisateur: req.user.id
    });
    res.json({ count });
});

// @desc    Recuperer tous les notification d un utilisateur
// @route   GET /api/notifications/
// @access  private
export const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
        utilisateur: req.user.id
    });
    res.json(notifications);
});


// @desc    Rendre tous les notification vue
// @route   PUT /api/notifications
// @access  private
export const seenNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.updateMany({
        $set: { vue: true }
    }, {
        utilisateur: req.user.id
    });
    res.json(notifications);
});