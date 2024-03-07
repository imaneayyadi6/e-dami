import Notification from "../models/notificationModel.js";
import Utilisateur from "../models/utilisateurModel.js";
import io from "../server.js";
import { sendMail } from "./sendMailService.js";

export const sendNotification = async (
  utilisateurID,
  content,
  subject,
  seen = false
) => {
  const utilisateur = await Utilisateur.findById(utilisateurID);
  if (utilisateur) {
    const notification = new Notification({
      utilisateur: utilisateurID,
      content,
      subject,
      dateNotification: new Date(),
      vue: seen,
      vueToast: seen,
    });
    await notification.save();

    io.emit("notification", notification);

    let mailOptions = {
      from: '"e-dami" <e-dami@snrt.com>',
      to: utilisateur.email,
      // to: utilisateur.email.replace(new RegExp("ma", "g"), "com"),
      subject: subject || "Message from e-dami",
      html: content,
    };

    sendMail(mailOptions);
  } else {
    throw new Error("utilisateur introuvable !");
  }
};
