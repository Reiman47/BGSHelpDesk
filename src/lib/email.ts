import nodemailer from "nodemailer";
import path from "path";

const host = process.env.EMAIL_SERVER_HOST || "smtp.example.com";
const port = parseInt(process.env.EMAIL_SERVER_PORT || "587");

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER || "user",
    pass: process.env.EMAIL_SERVER_PASSWORD || "pass",
  },
});

export const sendTicketEmail = async (to: string, subject: string, body: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Barcode Gulf Support" <${process.env.EMAIL_FROM || "support@barcodegulf.com"}>`,
      to,
      subject: `[BGS Support Ticket] ${subject}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e1e1e1;">
          <div style="background-color: #222222; padding: 15px; text-align: center; border-bottom: 4px solid #008BB1;">
             <img src="cid:bgs-logo" alt="Barcode Gulf Solutions" style="max-height: 40px; width: auto;" />
          </div>
          <div style="padding: 40px 30px; background-color: #ffffff; line-height: 1.6;">
            ${body}
          </div>
          <div style="background-color: #f8f9fa; padding: 25px; text-align: center; font-size: 11px; color: #777; border-top: 1px solid #eee;">
            <p style="margin-bottom: 5px;"><strong>Barcode Gulf Solutions</strong></p>
            <p style="margin-bottom: 15px;">Office No: 8, 1st Floor, Building 6, Al Hawari Street, Al Malaz, Riyadh, KSA | +966 11 213 1355</p>
            <p style="margin-bottom: 0;">This is an automated system notification. Please do not reply directly to this email.</p>
            <p style="margin-top: 5px;">&copy; 2026 Barcode Gulf Solutions. All rights reserved.</p>
          </div>
        </div>
      `,
      attachments: [{
        filename: 'logo.png',
        path: path.join(process.cwd(), 'public', 'logo.png'),
        cid: 'bgs-logo'
      }]
    });
    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Email Error:", error);
  }
};
