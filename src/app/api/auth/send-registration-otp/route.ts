import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.example.com",
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_PORT === "465",
  auth: {
    user: process.env.EMAIL_SERVER_USER || "user",
    pass: process.env.EMAIL_SERVER_PASSWORD || "pass",
  },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Check if user already exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return NextResponse.json({ message: "User already exists. Please login." }, { status: 409 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.registrationOtp.upsert({
      where: { email },
      update: {
        otp,
        expiry,
        attempts: 0,
      },
      create: {
        email,
        otp,
        expiry,
        attempts: 0,
      },
    });

    // Send Email
    try {
      await transporter.sendMail({
        from: `"Barcode Gulf Support" <${process.env.EMAIL_FROM || "support@barcodegulf.net"}>`,
        to: email,
        subject: "Registration OTP Code",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #1AA1C5; text-align: center;">Registration Verification</h2>
            <p>Hello,</p>
            <p>Thank you for registering at Barcode Gulf Support. Use the One-Time Password (OTP) below to verify your email address. This OTP is valid for 10 minutes.</p>
            <div style="background: #F0F2F5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #222;">
              ${otp}
            </div>
            <p style="margin-top: 20px; color: #777; font-size: 12px; text-align: center;">If you did not request this registration, please ignore this email.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Email Sending Failed, but OTP is generated:", emailErr);
    }

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
