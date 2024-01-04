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

// Email content
// const mailOptions = {
//     from: '"e-dami" <e-dami@snrt.com>', // Change the from address to "e-dami"
//     to: 'a.elharraj@snrt.com',
//     subject: 'Hello from Node.js',
//     html: `<p>Une <a  style='font-weight:bold' href="${process.env.CLIENT_ADDRESS}/details-demande/657c21d5279b0cfb3a0db265/traitement/657c21d5279b0cfb3a0db266">demande</a> a été faite par Jane Doe, veuillez la traiter en tant que directeur hiérarchique </p>`,
// };

// Send email
export const sendMail = (mailOptions = {
    from: '"e-dami" <e-dami@snrt.com>'
}) => {
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error:', error.message);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}


