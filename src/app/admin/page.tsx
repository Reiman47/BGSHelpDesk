import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  ShieldCheck, 
  Users, 
  Ticket, 
  Clock, 
  CheckCircle,
  BarChart3,
  Search,
  ChevronRight,
  User,
  AlertTriangle,
  FileText
} from "lucide-react";
import { formatDistance } from "date-fns";
import AdminTicketTable from "@/components/AdminTicketTable";

import AdminDashboardContent from "./AdminDashboardContent";

export default async function AdminDashboardPage() {
  const session: any = await getServerSession(authOptions);

  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user?.role)) {
    redirect("/dashboard");
  }

  const isSuperAdmin = session.user?.role === "SUPERADMIN";

  const whereClause = isSuperAdmin ? {} : {
    OR: [
      { assignedId: session.user.id },
      { assignedId: null }
    ]
  };

  const allTickets = await prisma.ticket.findMany({
    where: whereClause,
    include: { 
      createdBy: { select: { name: true, email: true, companyName: true } },
      assignedTo: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: await prisma.ticket.count({ where: whereClause }),
    open: await prisma.ticket.count({ where: { ...whereClause, status: "OPEN" } }),
    pending: await prisma.ticket.count({ where: { ...whereClause, status: "PENDING" } }),
    resolved: await prisma.ticket.count({ where: { ...whereClause, status: "RESOLVED" } }),
    users: await prisma.user.count({ where: { role: "USER" } }),
  };

  return (
    <AdminDashboardContent 
      session={session} 
      allTickets={allTickets} 
      stats={stats} 
      isSuperAdmin={isSuperAdmin} 
    />
  );
}
