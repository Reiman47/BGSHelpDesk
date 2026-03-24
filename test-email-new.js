require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_PORT === '465',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

async function testEmail() {
  console.log('Sending test email to shafeek@barcodegulf.net...');
  try {
    const info = await transporter.sendMail({
      from: `"BGS Help Desk Support" <${process.env.EMAIL_FROM}>`,
      to: 'shafeek@barcodegulf.net',
      subject: 'OTP Integration Successful',
      html: '<b>Your email integration for OTP is now working! The App Password was successfully applied.</b>',
    });
    console.log('Email sent:', info.messageId);
  } catch (err) {
    console.error('Email Error:', err);
  }
}

testEmail();
