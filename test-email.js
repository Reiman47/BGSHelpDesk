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
      from: `"Test" <${process.env.EMAIL_FROM}>`,
      to: 'shafeek@barcodegulf.net',
      subject: 'OTP Test',
      html: '<b>Your OTP is 123456</b>',
    });
    console.log('Email sent:', info.messageId);
  } catch (err) {
    console.error('Email Error:', err);
  }
}

testEmail();
