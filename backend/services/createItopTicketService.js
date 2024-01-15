import { sendMail } from "./sendMailService";

sendMail({
    from: "e-dami@snrt.com",
    to: "e-dami@snrt.com",
    subject: "Hello World",
    content: "Hello world"
})