import nodemailer from "nodemailer";
import dotenv from "dotenv";


dotenv.config();



const transporter = nodemailer.createTransport({
  host: process.env.ZIMBRA_ADDRESS,
  port: 587,
  secure: false, 
  auth: {
    user: process.env.ZIMBRA_USERNAME,
    pass: process.env.ZIMBRA_MOTDEPASSE,
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

export const sendMail = (mailOptions) => {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error:", error.message);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};
