import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Init dotenv :
dotenv.config();

// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
    host: '172.16.0.35',
    port: 587,
    secure: false, // Set to false to allow STARTTLS
    auth: {
        user: 'e-dami@snrt.com',
        pass: '123456',
    },
    tls: {
        rejectUnauthorized: false, // Set to false to skip certificate validation (not recommended for production)
    },
});


export const sendMail = (mailOptions) => {
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error:', error.message);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}


