import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { content } = await req.json();
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    const reply = await prisma.reply.create({
      data: {
        content,
        ticketId: id,
        authorId: userId,
      },
      include: {
        ticket: {
          include: {
            createdBy: { select: { email: true, name: true } },
          }
        }
      }
    });

    // Notify logic
    if (userRole === "ADMIN") {
      // Notify user that admin replied
      await sendTicketEmail(
        reply.ticket.createdBy.email,
        "Update: Professional Support Response",
        `
          <h2 style="color: #1B365D; margin-top: 0;">Support Team Update</h2>
          <p>Hello ${reply.ticket.createdBy.name},</p>
          <p>Our support engineer has posted a new update to your case <strong>#${id.slice(-6).toUpperCase()}</strong> (${reply.ticket.subject}):</p>
          <div style="background-color: #f0f7ff; padding: 25px; border-radius: 8px; border: 1px solid #cce3ff; margin: 20px 0; font-style: italic;">
            "${content}"
          </div>
          <div style="margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/tickets/${id}" style="background-color: #008BB1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Continue Discussion</a>
          </div>
        `
      );
    } else {
      // Notify admins (Specific Admin: Shafeek)
      await sendTicketEmail(
        "shafeek@barcodegulf.net",
        "Activity Notice: Customer Reply",
        `
          <h2 style="color: #1B365D; margin-top: 0;">New Response from Customer</h2>
          <p>The customer <strong>${session.user.name}</strong> has posted a response to Ticket <strong>#${id.slice(-6).toUpperCase()}</strong>.</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; border: 1px solid #eee; margin: 20px 0;">
            <p style="margin: 0; color: #666; font-size: 13px;">MESSAGE CONTENT:</p>
            <p style="margin-top: 10px; font-weight: 500;">${content}</p>
          </div>
          <div style="margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/admin/tickets/${id}" style="background-color: #1B365D; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View in Admin Panel</a>
          </div>
        `
      );
    }

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error("Reply Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
