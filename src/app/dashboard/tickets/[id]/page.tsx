import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Clock, MessageSquare, Send, AlertCircle } from "lucide-react";
import { formatDistance } from "date-fns";
import ReplyForm from "@/components/ReplyForm";
import TicketAssignment from "@/components/TicketAssignment";
import StatusUpdater from "@/components/StatusUpdater";

import TicketDetailContent from "./TicketDetailContent";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session: any = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
          companyName: true,
          address: true,
          contactNumber: true
        }
      },
      replies: {
        include: { author: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      logs: {
        include: { updatedBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ticket) notFound();

  // Security: only creator or admins can view
  const canView = session.user.role === "ADMIN" || session.user.role === "SUPERADMIN" || ticket.creatorId === session.user.id;
  if (!canView) {
    redirect("/dashboard");
  }

  const isAdmin = ["ADMIN", "SUPERADMIN"].includes(session.user.role);
  const isSuperAdmin = session.user.role === "SUPERADMIN";

  return (
    <TicketDetailContent 
      ticket={ticket} 
      isAdmin={isAdmin} 
      isSuperAdmin={isSuperAdmin} 
    />
  );
}
