import Notification from "../models/notificationModel.js";
import io from "../server.js";

export const sendNotification = async (utilisateur, content) => {
    const notification = new Notification({ utilisateur, content, dateNotification: new Date() });
    await notification.save();
    io.emit("notification", notification);
}
