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

    if (registrationOtp.attempts >= 5) {
      await prisma.registrationOtp.delete({ where: { email } });
      return NextResponse.json({ message: "OTP expired due to too many failed attempts" }, { status: 400 });
    }

    if (registrationOtp.otp !== otp) {
      const newAttempts = registrationOtp.attempts + 1;
      if (newAttempts >= 5) {
        await prisma.registrationOtp.delete({ where: { email } });
        return NextResponse.json({ message: "OTP expired due to too many failed attempts" }, { status: 400 });
      }
      
      await prisma.registrationOtp.update({
        where: { email },
        data: { attempts: newAttempts }
      });
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > registrationOtp.expiry) {
      await prisma.registrationOtp.delete({ where: { email } });
      return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
    }

    await prisma.registrationOtp.delete({
      where: { email },
    });

    return NextResponse.json({ message: "OTP verified correctly" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
