
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();

const testSmtp = async () => {
    console.log("Starting SMTP Test...");
    console.log("Host:", process.env.EMAIL_SERVER_HOST);
    console.log("Port:", process.env.EMAIL_SERVER_PORT);
    console.log("User:", process.env.EMAIL_SERVER_USER);
    
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
        secure: process.env.EMAIL_SERVER_PORT === "465",
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
    });

    try {
        console.log("Verifying connection...");
        await transporter.verify();
        console.log("Connection verified successfully!");

        console.log("Sending test email...");
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_SERVER_USER,
            subject: "SMTP TEST - HelpDesk",
            text: "This is a direct test of the SMTP configuration.",
        });
        console.log("Email sent successfully! ID:", info.messageId);
    } catch (error) {
        console.error("SMTP Error Details:", error);
    }
};

testSmtp();
