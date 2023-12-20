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
    let notifications = await Notification.find({
        utilisateur: req.user.id
    })

    notifications = JSON.parse(JSON.stringify(notifications));

    notifications.sort((a, b) => {
        return new Date(b.dateNotification) - new Date(a.dateNotification)
    });

    res.json(notifications);
});


// @desc    Rendre tous les notification vue
// @route   PUT /api/notifications
// @access  private
export const seenNotifications = asyncHandler(async (req, res) => {
    // const notifications = await Notification.updateMany(
    //     { utilisateur: req.user.id },
    //     { $setField: { vue: true } });
    // res.json(notifications);
    const notifications = await Notification.find({ utilisateur: req.user.id });

    for (const notification of notifications) {
        await Notification.updateOne(
            { _id: notification._id },
            { $set: { vue: true } }
        );
    }
    res.json({ message: "notifications modifiee" })
});


// @desc    Recuperer tous les notification d un utilisateur
// @route   GET /api/notifications/toast
// @access  private
export const getToastNotifications = asyncHandler(async (req, res) => {
    let notifications = await Notification.find({
        utilisateur: req.user.id,
        vueToast: false,
    })

    notifications = JSON.parse(JSON.stringify(notifications));
    notifications.sort((a, b) => {
        return new Date(b.dateNotification) - new Date(a.dateNotification)
    });

    res.json(notifications);
});

// @desc    Rendre tous les notification vue
// @route   PUT /api/notifications/toast
// @access  private
export const seenToastNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ utilisateur: req.user.id });
    for (const notification of notifications) {
        await Notification.updateOne(
            { _id: notification._id },
            { $set: { vueToast: true } }
        );
    }
    res.json({ message: "notifications modifiee" })
});