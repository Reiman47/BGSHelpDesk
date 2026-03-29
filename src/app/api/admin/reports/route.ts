
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPERADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all closed or resolved tickets with assignment and creator info
    const tickets = await prisma.ticket.findMany({
      where: {
        status: { in: ["RESOLVED", "CLOSED"] },
        assignedId: { not: null }
      },
      include: {
        assignedTo: {
          select: { name: true, email: true }
        },
        createdBy: {
          select: { name: true, email: true, companyName: true }
        }
      }
    });

    // Process data for reports
    // Grouping by Support Admin (assignedTo)
    const adminStats: Record<string, any> = {};

    tickets.forEach(ticket => {
      const adminId = ticket.assignedId as string;
      const adminName = ticket.assignedTo?.name || "Unknown Admin";
      const customer = ticket.createdBy?.companyName || "Unknown Customer";
      const model = ticket.category === "RMA" ? "RMA" : (ticket.partNumber || ticket.category || "General");
      
      const resolutionTimeMs = ticket.updatedAt.getTime() - ticket.createdAt.getTime();
      const resolutionTimeHours = resolutionTimeMs / (1000 * 60 * 60);

      if (!adminStats[adminId]) {
        adminStats[adminId] = {
          name: adminName,
          totalClosed: 0,
          totalTimeMs: 0,
          customers: {},
          models: {},
          tickets: [] // Add this
        };
      }

      adminStats[adminId].totalClosed += 1;
      adminStats[adminId].totalTimeMs += resolutionTimeMs;
      
      // Customer breakdown for this admin
      if (!adminStats[adminId].customers[customer]) {
        adminStats[adminId].customers[customer] = 0;
      }
      adminStats[adminId].customers[customer] += 1;

      // Model breakdown for this admin
      if (!adminStats[adminId].models[model]) {
        adminStats[adminId].models[model] = 0;
      }
      adminStats[adminId].models[model] += 1;

      // Add ticket detail
      adminStats[adminId].tickets.push({
        id: ticket.id,
        subject: ticket.subject,
        customer: customer,
        resolutionTimeHours: resolutionTimeHours.toFixed(2)
      });
    });

    // Format for easier consumption
    const reportData = Object.keys(adminStats).map(id => {
      const stats = adminStats[id];
      return {
        adminId: id,
        adminName: stats.name,
        totalClosed: stats.totalClosed,
        avgResolutionTimeHours: stats.totalClosed > 0 
          ? (stats.totalTimeMs / stats.totalClosed / (1000 * 60 * 60)).toFixed(2) 
          : "0.00",
        totalTimeHours: (stats.totalTimeMs / (1000 * 60 * 60)).toFixed(2),
        customerBreakdown: stats.customers,
        modelBreakdown: stats.models,
        tickets: stats.tickets // Return this
      };
    });

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Report Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
