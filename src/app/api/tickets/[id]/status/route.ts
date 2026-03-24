
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketEmail } from "@/lib/email";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPERADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();

    const currentTicket = await prisma.ticket.findUnique({
      where: { id },
      select: { status: true }
    });

    const ticket = await prisma.ticket.update({
      where: { id },
      data: { 
        status,
        logs: {
          create: {
            oldStatus: currentTicket?.status,
            newStatus: status,
            adminId: (session.user as any).id
          }
        }
      },
      include: { createdBy: { select: { email: true, name: true } } },
    });

    // Notify user about status change
    await sendTicketEmail(
      ticket.createdBy.email,
      `Case Update: Status Changed to ${status}`,
      `
        <h2 style="color: #1B365D; margin-top: 0;">Case Status Notification</h2>
        <p>Dear ${ticket.createdBy.name},</p>
        <p>The status of your support case <strong>#${id.slice(-6).toUpperCase()}</strong> (${ticket.subject}) has been updated to:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; border: 1px solid #dee2e6; margin: 20px 0; text-align: center;">
          <span style="font-size: 18px; font-weight: bold; color: #1B365D; text-transform: uppercase; letter-spacing: 1px;">${status}</span>
        </div>
        <p>You can view the full history and details of this case in your secure support dashboard.</p>
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard/tickets/${ticket.id}" style="background-color: #008BB1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Case Timeline</a>
        </div>
      `
    );

    // Notify Shafeek about status change
    await sendTicketEmail(
      "shafeek@barcodegulf.net",
      `Audit Log: Ticket #${id.slice(-6).toUpperCase()} Status Change`,
      `
        <h2 style="color: #1B365D; margin-top: 0;">System Status Update</h2>
        <p>This is an automated audit notification for Ticket <strong>#${id.slice(-6).toUpperCase()}</strong>.</p>
        <div style="background-color: #fff9f0; padding: 20px; border-radius: 4px; border: 1px solid #ffedcc; margin: 20px 0;">
          <p style="margin: 0;"><strong>Previous Status:</strong> Unknown</p>
          <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="color: #2b6cb0; font-weight: bold;">${status}</span></p>
          <p style="margin: 5px 0;"><strong>Updated By:</strong> ${session.user!.name}</p>
        </div>
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXTAUTH_URL}/admin/tickets/${ticket.id}" style="background-color: #1B365D; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Review in Admin Panel</a>
        </div>
      `
    );

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Status Update Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
