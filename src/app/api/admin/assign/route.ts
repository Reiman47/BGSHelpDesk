
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketEmail } from "@/lib/email";

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
      include: { 
        assignedTo: { select: { name: true, email: true } },
        createdBy: { select: { name: true, companyName: true } }
      }
    });

    // Notify assigned admin
    if (ticket.assignedTo?.email) {
      const ticketIdShort = ticketId.slice(-6).toUpperCase();
      await sendTicketEmail(
        ticket.assignedTo.email,
        `Assignment: ${ticket.subject} [#${ticketIdShort}]`,
        `
          <h2 style="color: #1B365D; margin-top: 0;">New Support Ticket Assigned</h2>
          <p>Hello ${ticket.assignedTo.name},</p>
          <p>You have been assigned to handle support ticket <strong>#${ticketIdShort}</strong>.</p>
          <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
            <p style="margin: 0; color: #666; font-size: 13px;">TICKET DETAILS:</p>
            <p style="margin-top: 10px; font-weight: bold; color: #1B365D; font-size: 16px;">${ticket.subject}</p>
            <p style="margin-top: 5px; color: #444;">Requester: ${ticket.createdBy.name} (${ticket.createdBy.companyName || 'N/A'})</p>
            <p style="margin-top: 5px; color: #444;">Priority: <span style="font-weight: bold; color: #008BB1;">${ticket.priority}</span></p>
          </div>
          <div style="margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/tickets/${ticketId}" style="background-color: #1B365D; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Manage Ticket</a>
          </div>
        `
      );
    }

    return NextResponse.json({ message: "Ticket assigned", assignedTo: ticket.assignedTo?.name });
  } catch (error) {
    console.error("Assign Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
