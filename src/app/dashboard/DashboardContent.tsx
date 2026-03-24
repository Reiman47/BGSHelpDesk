"use client";

import Link from "next/link";
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  ChevronRight
} from "lucide-react";
import { formatDistance } from "date-fns";
import { useLanguage } from "@/components/LanguageContext";

interface DashboardContentProps {
  session: any;
  tickets: any[];
  stats: {
    total: number;
    open: number;
    resolved: number;
  };
}

export default function DashboardContent({ session, tickets, stats }: DashboardContentProps) {
  const { t, lang } = useLanguage();

  return (
    <div className={`bg-gray-50 min-h-screen pt-24 pb-12 ${lang === 'ar' ? 'font-arabic text-right' : 'text-left'}`}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between mb-10 ${lang === 'ar' ? 'md:flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-3xl font-bold text-bgs-navy uppercase tracking-tight">{t("userPortal")}</h1>
            <p className="text-gray-500">{t("welcomeUser")}, {session.user?.name}</p>
          </div>
          <Link href="/dashboard/tickets/create" className={`btn-primary flex items-center space-x-2 mt-4 md:mt-0 ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <PlusCircle size={20} />
            <span className="font-bold tracking-widest">{t("createNewTicket")}</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-10`}>
          <div className={`card flex items-center border-l-4 border-bgs-teal ${lang === 'ar' ? 'flex-row-reverse border-l-0 border-r-4 space-x-reverse space-x-4' : 'space-x-4'}`}>
            <div className="p-3 bg-bgs-teal bg-opacity-10 rounded-full text-bgs-teal">
              <PlusCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{t("totalTickets")}</p>
              <h3 className="text-2xl font-bold text-bgs-navy">{stats.total}</h3>
            </div>
          </div>
          <div className={`card flex items-center border-l-4 border-yellow-500 ${lang === 'ar' ? 'flex-row-reverse border-l-0 border-r-4 space-x-reverse space-x-4' : 'space-x-4'}`}>
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{t("openTickets")}</p>
              <h3 className="text-2xl font-bold text-bgs-navy">{stats.open}</h3>
            </div>
          </div>
          <div className={`card flex items-center border-l-4 border-green-500 ${lang === 'ar' ? 'flex-row-reverse border-l-0 border-r-4 space-x-reverse space-x-4' : 'space-x-4'}`}>
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{t("resolved")}</p>
              <h3 className="text-2xl font-bold text-bgs-navy">{stats.resolved}</h3>
            </div>
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className={`p-6 border-b border-gray-100 flex items-center justify-between ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            <h2 className="font-bold text-bgs-navy uppercase tracking-tight">{t("recentActivity")}</h2>
            <Link href="/dashboard/tickets" className={`text-bgs-teal text-sm font-bold flex items-center hover:underline ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              {t("viewAll")} <ChevronRight size={16} className={lang === 'ar' ? 'rotate-180 ml-1' : ''} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className={`w-full`}>
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold uppercase text-gray-400 tracking-widest border-b">
                  <th className="px-6 py-4">{t("status")}</th>
                  <th className="px-6 py-4">{t("ticketInfo")}</th>
                  <th className="px-6 py-4">{t("priority")}</th>
                  <th className="px-6 py-4">{t("lastUpdated")}</th>
                  <th className={`px-6 py-4 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.length > 0 ? tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                        ticket.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700' :
                        ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                        ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {t(ticket.status.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-bgs-navy group-hover:text-bgs-teal transition-colors">{ticket.subject}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-widest">{ticket.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center text-xs font-semibold ${lang === 'ar' ? 'space-x-reverse' : ''} space-x-1 ${
                        ticket.priority === 'URGENT' ? 'text-red-600' :
                        ticket.priority === 'HIGH' ? 'text-orange-600' :
                        ticket.priority === 'MEDIUM' ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        <AlertCircle size={14} />
                        <span>{ticket.priority}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {lang === 'ar' 
                        ? formatDistance(new Date(ticket.updatedAt), new Date(), { addSuffix: true }).replace('ago', 'مضت').replace('about', 'حوالي').replace('less than', 'أقل من').replace('minutes', 'دقائق').replace('hours', 'ساعات')
                        : formatDistance(new Date(ticket.updatedAt), new Date(), { addSuffix: true })}
                    </td>
                    <td className={`px-6 py-4 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                      <Link href={`/dashboard/tickets/${ticket.id}`} className="text-bgs-teal hover:text-bgs-navy p-2 inline-block">
                        <MessageSquare size={18} />
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p>{t("noTicketsFound")}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
