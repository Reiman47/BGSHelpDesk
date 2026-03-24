import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Use raw SQL to bypass stale Prisma client types
    const rows = await prisma.$queryRawUnsafe<{ reset_otp: string | null; reset_otp_expiry: Date | null }[]>(
      `SELECT "resetOtp" as reset_otp, "resetOtpExpiry" as reset_otp_expiry FROM "User" WHERE email = $1 LIMIT 1`,
      email
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { reset_otp, reset_otp_expiry } = rows[0];

    // Verify OTP exists
    if (!reset_otp) {
      return NextResponse.json({ message: "No OTP requested. Please request a new one." }, { status: 401 });
    }

    // Verify OTP match
    if (reset_otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP. Please check and try again." }, { status: 401 });
    }

    // Verify Expiry
    if (reset_otp_expiry && new Date(reset_otp_expiry) < new Date()) {
      return NextResponse.json({ message: "OTP has expired. Please request a new one." }, { status: 401 });
    }

    // Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP fields via raw SQL
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET password = $1, "resetOtp" = NULL, "resetOtpExpiry" = NULL WHERE email = $2`,
      hashedPassword,
      email
    );

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
