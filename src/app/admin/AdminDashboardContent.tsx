"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  Users, 
  Ticket, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  FileText
} from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import AdminTicketTable from "@/components/AdminTicketTable";

interface AdminDashboardContentProps {
  session: any;
  allTickets: any[];
  stats: any;
  isSuperAdmin: boolean;
}

export default function AdminDashboardContent({ session, allTickets, stats, isSuperAdmin }: AdminDashboardContentProps) {
  const { t, lang } = useLanguage();

  const statConfig = [
    { label: t("totalTickets"), val: stats.total, icon: <Ticket size={20} />, color: "text-bgs-navy", bg: "bg-gray-100" },
    { label: t("needsAction"), val: stats.open, icon: <AlertTriangle size={20} />, color: "text-red-600", bg: "bg-red-50" },
    { label: t("pending"), val: stats.pending, icon: <Clock size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: t("resolved"), val: stats.resolved, icon: <CheckCircle size={20} />, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className={`bg-gray-50 min-h-screen pt-24 pb-12 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between mb-10 ${lang === 'ar' ? 'md:flex-row-reverse' : ''}`}>
          <div className={`${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center space-x-2 text-bgs-teal mb-1 ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <ShieldCheck size={18} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t("mgmtConsole")}</span>
            </div>
            <h1 className="text-3xl font-bold text-bgs-navy uppercase tracking-tight">{t("admin")} {t("dashboard")}</h1>
          </div>
          <div className={`flex space-x-3 mt-4 md:mt-0 ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
             {isSuperAdmin && (
               <>
                 <Link 
                   href="/admin/users" 
                   className="bg-bgs-teal text-white px-4 py-2 rounded-lg shadow-md hover:bg-bgs-teal/90 transition-all flex items-center space-x-2 font-bold uppercase text-[10px] tracking-widest"
                 >
                   <Users size={16} />
                   <span>{t("userManagement")}</span>
                 </Link>
                 <Link 
                   href="/admin/reports" 
                   className="bg-bgs-navy text-white px-4 py-2 rounded-lg shadow-md hover:bg-bgs-navy/90 transition-all flex items-center space-x-2 font-bold uppercase text-[10px] tracking-widest"
                 >
                   <FileText size={16} />
                   <span>{t("reports")}</span>
                 </Link>
               </>
             )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statConfig.map((s, i) => (
            <div key={i} className={`card flex items-center justify-between group ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              <div className={`${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">{s.label}</p>
                <h3 className={`text-2xl font-bold ${s.color}`}>{s.val}</h3>
              </div>
              <div className={`p-3 ${s.bg} rounded-lg ${s.color} group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Master Ticket Table */}
        <AdminTicketTable tickets={allTickets} role={session.user?.role} />
      </div>
    </div>
  );
}
