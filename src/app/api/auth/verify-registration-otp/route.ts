import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
    }

    const registrationOtp = await prisma.registrationOtp.findUnique({
      where: { email },
    });

    if (!registrationOtp) {
      return NextResponse.json({ message: "No OTP found for this email" }, { status: 404 });
    }

    if (registrationOtp.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > registrationOtp.expiry) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
    }

    // Optionally: delete the OTP record here, or leave it until the user is actually created?
    // Let's delete it so it can't be reused.
    await prisma.registrationOtp.delete({
      where: { email },
    });

    return NextResponse.json({ message: "OTP verified correctly" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
