import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { subject, description, category, priority, partNumber, serialNumber } = await req.json();
    const userId = (session.user as any).id;

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        category,
        priority: priority as any,
        creatorId: userId,
        partNumber,
        serialNumber,
      },
    });

    // Notify user
    await sendTicketEmail(
      session.user.email!,
      "Confirmation: Ticket Received",
      `
        <h2 style="color: #1B365D; margin-top: 0;">Ticket Confirmation</h2>
        <p>Dear ${session.user.name},</p>
        <p>We have successfully received your support request and assigned it a tracking ID: <strong>#${ticket.id.slice(-6).toUpperCase()}</strong>.</p>
        <p style="background-color: #f4f7f9; padding: 15px; border-radius: 4px; border-left: 4px solid #008BB1;">
          <strong>Subject:</strong> ${subject}<br/>
          <strong>Category:</strong> ${category}<br/>
          <strong>Priority:</strong> ${priority}
        </p>
        <p>Our technical team is currently reviewing the details provided and will contact you shortly via this support thread.</p>
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard/tickets/${ticket.id}" style="background-color: #008BB1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Ticket Timeline</a>
        </div>
      `
    );

    // Notify admins (Specific Admin: Shafeek)
    await sendTicketEmail(
      "shafeek@barcodegulf.net",
      "Action Required: New Support Ticket",
      `
        <h2 style="color: #1B365D; margin-top: 0;">New Support Case Submitted</h2>
        <p>A new support ticket has been registered by <strong>${session.user.name}</strong>.</p>
        <div style="background-color: #fff9f0; padding: 20px; border-radius: 4px; border: 1px solid #ffedcc; margin: 20px 0;">
          <p style="margin: 0;"><strong>Case ID:</strong> #${ticket.id.slice(-6).toUpperCase()}</p>
          <p style="margin: 5px 0;"><strong>Customer Email:</strong> ${session.user.email}</p>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
          <p style="margin: 5px 0;"><strong>Category:</strong> ${category}</p>
          <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="color: #e53e3e; font-weight: bold;">${priority}</span></p>
        </div>
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXTAUTH_URL}/admin/tickets/${ticket.id}" style="background-color: #1B365D; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Manage Case in Portal</a>
        </div>
      `
    );

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Ticket Creation Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const tickets = await prisma.ticket.findMany({
    where: ["ADMIN", "SUPERADMIN"].includes(role) ? {} : { creatorId: userId },
    include: { createdBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tickets);
}
