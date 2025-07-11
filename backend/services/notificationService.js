import Notification from "../models/notificationModel.js";
import Utilisateur from "../models/utilisateurModel.js";
import io from "../server.js";
import { sendMail } from "./sendMailService.js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

export const sendNotification = async (
  utilisateurID,
  content,
  subject,
  seen = false
) => {
  try {
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
      /*
      let mailOptions = {
        from: '"e-dami" <e-dami@snrt.com>',
        to: utilisateur.email,
        // to: utilisateur.email.replace(new RegExp("ma", "g"), "com"),
        subject: subject || "Message from e-dami",
        html: content,
      };
      // send email :
      sendMail(mailOptions);
      */
     
      // Define the uploads as static folder :
      const __dirname = path.resolve();
      const logFilePath = path.join(
        __dirname,
        "logs",
        "e-dami-notification-log.txt"
      );
      const dataToWrite = `[NOTIFICATION SENT] : ${new Date().toLocaleString()} SERVER :: [${
        process.env.ZIMBRA_ADDRESS
      }] ::  [${JSON.stringify(mailOptions)}] \n`;
      fs.appendFileSync(logFilePath, dataToWrite, (err) => {
        if (err) throw err;
        console.log("Data has been backed up successfully !");
      });
    } else {
      throw new Error("utilisateur introuvable !");
    }
  } catch (error) {
    throw new Error("email-notification error :", error);
  }
};

// sendNotification("65df196cfc882c17ca280dc4", "hello world", "hello world");
