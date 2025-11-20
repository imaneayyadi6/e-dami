import asyncHandler from "express-async-handler";
import Notification from "../models/notificationModel.js";




export const getCountNotSeenNotifications = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
        vue: false,
        utilisateur: req.user.id
    });
    res.json({ count });
});




export const getNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 5 } = req.query;

    let notifications = await Notification.find({
        utilisateur: req.user.id

    }).sort({ "dateNotification": -1 }).limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    notifications = JSON.parse(JSON.stringify(notifications));

    let count = await Notification.countDocuments({
        utilisateur: req.user.id
    });


    const totalPages = Math.ceil(count / limit)


    res.json({
        notifications,
        totalPages: totalPages,
        currentPage: page,
    });
});





export const seenNotifications = asyncHandler(async (req, res) => {
    
    
    
    
    const notifications = await Notification.find({ utilisateur: req.user.id });

    for (const notification of notifications) {
        await Notification.updateOne(
            { _id: notification._id },
            { $set: { vue: true } }
        );
    }
    res.json({ message: "notifications modifiee" })
});





export const getToastNotifications = asyncHandler(async (req, res) => {
    let notifications = await Notification.find({
        utilisateur: req.user.id,
        vue: false,
        vueToast: false,
    }).sort({ dateNotification: -1 })
        .limit(5);

    notifications = JSON.parse(JSON.stringify(notifications));
    notifications.sort((a, b) => {
        return new Date(b.dateNotification) - new Date(a.dateNotification)
    });

    res.json(notifications);
});





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




export const seenOneToastNotification = asyncHandler(async (req, res) => {

    await Notification.updateOne(
        { _id: req.params.id },
        { $set: { vueToast: true } }
    );
    res.json({ message: "notification modifiee" })
});