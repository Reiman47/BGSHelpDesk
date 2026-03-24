import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify OTP
    if (user.resetOtp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 401 });
    }

    // Verify Expiry
    if (user.resetOtpExpiry && user.resetOtpExpiry < new Date()) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 401 });
    }

    return NextResponse.json({ message: "OTP verified successfully" }, { status: 200 });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
