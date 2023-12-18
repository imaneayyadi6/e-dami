import Notification from "../models/notificationModel.js";


export const sendNotification = async (utilisateur, content) => {
    const notification = new Notification({ utilisateur, content,dateNotification:new Date() });
    await notification.save();
}
