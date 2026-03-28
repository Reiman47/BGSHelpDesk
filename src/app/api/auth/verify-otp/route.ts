import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Use raw SQL to bypass stale Prisma client types
    const rows = await prisma.$queryRawUnsafe<{ reset_otp: string | null; reset_otp_expiry: Date | null; reset_otp_attempts: number }[]>(
      `SELECT "resetOtp" as reset_otp, "resetOtpExpiry" as reset_otp_expiry, "resetOtpAttempts" as reset_otp_attempts FROM "User" WHERE email = $1 LIMIT 1`,
      email
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { reset_otp, reset_otp_expiry, reset_otp_attempts } = rows[0];

    // Verify OTP exists
    if (!reset_otp) {
      return NextResponse.json({ message: "No OTP requested. Please request a new one." }, { status: 401 });
    }

    // Check attempts
    if (reset_otp_attempts >= 5) {
      // Expire it
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET "resetOtp" = NULL, "resetOtpExpiry" = NULL, "resetOtpAttempts" = 0 WHERE email = $1`,
        email
      );
      return NextResponse.json({ message: "OTP expired due to too many failed attempts. Please request a new one." }, { status: 401 });
    }

    // Verify OTP match
    if (reset_otp !== otp) {
      const newAttempts = reset_otp_attempts + 1;
      if (newAttempts >= 5) {
        await prisma.$executeRawUnsafe(
          `UPDATE "User" SET "resetOtp" = NULL, "resetOtpExpiry" = NULL, "resetOtpAttempts" = 0 WHERE email = $1`,
          email
        );
        return NextResponse.json({ message: "OTP expired due to too many failed attempts. Please request a new one." }, { status: 401 });
      }

      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET "resetOtpAttempts" = $1 WHERE email = $2`,
        newAttempts,
        email
      );
      return NextResponse.json({ message: "Invalid OTP" }, { status: 401 });
    }

    // Verify Expiry
    if (reset_otp_expiry && new Date(reset_otp_expiry) < new Date()) {
      return NextResponse.json({ message: "OTP has expired. Please request a new one." }, { status: 401 });
    }

    // Clear attempts on success
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "resetOtpAttempts" = 0 WHERE email = $1`,
      email
    );

    return NextResponse.json({ message: "OTP verified successfully" }, { status: 200 });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
