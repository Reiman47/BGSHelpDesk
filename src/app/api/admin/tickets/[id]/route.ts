import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log(`[API] Deleting ticket: ${id} by user: ${session.user.email} (Role: ${(session.user as any).role})`);

    await prisma.ticket.delete({
      where: { id },
    });

    console.log(`[API] Ticket ${id} deleted successfully.`);
    return NextResponse.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("[API] Ticket Deletion Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
