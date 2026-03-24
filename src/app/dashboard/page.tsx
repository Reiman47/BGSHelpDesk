import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  ChevronRight,
  Filter
} from "lucide-react";
import { formatDistance } from "date-fns";

import DashboardContent from "./DashboardContent";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const userId = (session.user as any).id;

  const tickets = await prisma.ticket.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = {
    total: await prisma.ticket.count({ where: { creatorId: userId } }),
    open: await prisma.ticket.count({ where: { creatorId: userId, status: "OPEN" } }),
    resolved: await prisma.ticket.count({ where: { creatorId: userId, status: "RESOLVED" } }),
  };

  return <DashboardContent session={session} tickets={tickets} stats={stats} />;
}
