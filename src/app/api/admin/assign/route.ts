
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Only SuperAdmin or Admin can assign/reassign
  if (!session || !["ADMIN", "SUPERADMIN"].includes((session.user as any).role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ticketId, adminId } = await req.json();

    if (!ticketId || !adminId) {
      return NextResponse.json({ message: "Missing data" }, { status: 400 });
    }

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { assignedId: adminId },
      include: { assignedTo: { select: { name: true, email: true } } }
    });

    return NextResponse.json({ message: "Ticket assigned", assignedTo: ticket.assignedTo?.name });
  } catch (error) {
    console.error("Assign Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
