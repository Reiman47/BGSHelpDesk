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

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({ message: "If an account exists, an OTP has been sent." }, { status: 200 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`[AUTH] OTP for ${email}: ${otp}`);

    await prisma.user.update({
      where: { email },
      data: {
        resetOtp: otp,
        resetOtpExpiry: expiry,
      },
    });

    // Send Email
    try {
      await transporter.sendMail({
        from: `"Barcode Gulf Support" <${process.env.EMAIL_FROM || "support@barcodegulf.net"}>`,
        to: email,
        subject: "Password Reset OTP",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #1AA1C5; text-align: center;">Password Reset</h2>
            <p>Hello ${user.name || 'User'},</p>
            <p>You requested a password reset. Use the One-Time Password (OTP) below to complete the process. This OTP is valid for 10 minutes.</p>
            <div style="background: #F0F2F5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #222;">
              ${otp}
            </div>
            <p style="margin-top: 20px; color: #777; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
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
