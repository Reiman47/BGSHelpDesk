import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ message: "Email required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true, resetOtp: true, resetOtpExpiry: true }
  });

  return NextResponse.json(user);
}
