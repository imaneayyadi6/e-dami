import Notification from "../models/notificationModel.js";


export const sendNotificationService = async (utilisateur, content) => {
    const notification = new Notification({ utilisateur, content });
    await notification.save();
}
