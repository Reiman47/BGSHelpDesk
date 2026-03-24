"use client";

import Link from "next/link";
import { ArrowLeft, User, Clock, MessageSquare, Send, AlertCircle } from "lucide-react";
import { formatDistance } from "date-fns";
import ReplyForm from "@/components/ReplyForm";
import TicketAssignment from "@/components/TicketAssignment";
import StatusUpdater from "@/components/StatusUpdater";
import { useLanguage } from "@/components/LanguageContext";

interface TicketDetailContentProps {
  ticket: any;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export default function TicketDetailContent({ ticket, isAdmin, isSuperAdmin }: TicketDetailContentProps) {
  const { lang } = useLanguage();

  return (
    <div className={`bg-gray-50 min-h-screen pt-24 pb-12 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href={isAdmin ? "/admin" : "/dashboard"} className={`flex items-center text-gray-500 hover:text-bgs-teal mb-6 transition-colors ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <ArrowLeft size={20} className={lang === 'ar' ? 'rotate-180 ml-2' : 'mr-2'} />
          <span className="font-bold uppercase tracking-widest text-xs">{lang === 'ar' ? "العودة لتسجيل التذاكر" : "Back to Portal"}</span>
        </Link>

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          {/* Main Thread */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                <div className={`flex items-center justify-between mb-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                    ticket.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700' :
                    ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {ticket.status}
                  </span>
                  <div className={`text-xs text-gray-400 uppercase font-bold tracking-widest flex items-center ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <Clock size={14} className={lang === 'ar' ? 'ml-1' : 'mr-1'} />
                    {lang === 'ar' 
                      ? formatDistance(new Date(ticket.createdAt), new Date(), { addSuffix: true }).replace('ago', 'مضت') 
                      : formatDistance(new Date(ticket.createdAt), new Date(), { addSuffix: true })}
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-bgs-navy mb-4">{ticket.subject}</h1>
                <div className={`flex items-center space-x-4 text-sm text-gray-500 ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`flex items-center ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <User size={16} className={lang === 'ar' ? 'ml-1 text-bgs-teal' : 'mr-1 text-bgs-teal'} /> 
                    {ticket.createdBy.name}
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="uppercase tracking-widest text-[10px] font-bold">{ticket.category}</div>
                </div>
              </div>
              <div className="p-8 leading-relaxed text-gray-700 whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>

            {/* Replies */}
            <div className="space-y-6">
              <h3 className={`font-bold text-bgs-navy uppercase tracking-widest text-sm flex items-center ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <MessageSquare size={18} className={lang === 'ar' ? 'ml-2 text-bgs-teal' : 'mr-2 text-bgs-teal'} />
                {lang === 'ar' ? `مؤشر النقاش (${ticket.replies.length})` : `Discussion Thread (${ticket.replies.length})`}
              </h3>

              {ticket.replies.map((reply: any) => (
                <div key={reply.id} className={`flex ${reply.author.role === 'ADMIN' ? (lang === 'ar' ? 'justify-start' : 'justify-end') : (lang === 'ar' ? 'justify-end' : 'justify-start')}`}>
                  <div className={`max-w-[85%] rounded-xl p-6 shadow-sm border ${
                    reply.author.role === 'ADMIN'
                    ? 'bg-bgs-navy text-white border-bgs-navy'
                    : 'bg-white text-gray-700 border-gray-100'
                  }`}>
                    <div className={`flex items-center justify-between mb-3 opacity-80 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {reply.author.name} {["ADMIN", "SUPERADMIN"].includes(reply.author.role) && (lang === 'ar' ? '(فريق الدعم)' : '(Support Team)')}
                      </span>
                      <span className={`text-[10px] font-medium ${lang === 'ar' ? 'mr-4' : 'ml-4'}`}>
                        {lang === 'ar' 
                          ? formatDistance(new Date(reply.createdAt), new Date(), { addSuffix: true }).replace('ago', 'مضت') 
                          : formatDistance(new Date(reply.createdAt), new Date(), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-sm whitespace-pre-wrap leading-relaxed ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            {ticket.status !== 'CLOSED' && (
              <ReplyForm ticketId={ticket.id} />
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="card">
              <h4 className={`font-bold text-bgs-navy uppercase tracking-widest text-xs mb-6 border-b pb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? "تفاصيل التذكرة" : "Ticket Details"}</h4>
              <ul className="space-y-4 text-sm">
                <li className={`flex justify-between ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{lang === 'ar' ? "المعرف:" : "ID:"}</span>
                  <span className="font-mono text-[10px] text-gray-600 bg-gray-100 px-1 rounded">{ticket.id}</span>
                </li>
                <li className={`flex justify-between items-center ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{lang === 'ar' ? "الأولوية:" : "Priority:"}</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    ticket.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                    ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>{ticket.priority}</span>
                </li>
                {ticket.partNumber && (
                  <li className={`flex justify-between ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{lang === 'ar' ? "رقم القطعة:" : "Part No:"}</span>
                    <span className="font-semibold text-bgs-navy">{ticket.partNumber}</span>
                  </li>
                )}
                {ticket.serialNumber && (
                  <li className={`flex justify-between ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{lang === 'ar' ? "الرقم التسلسلي:" : "Serial No:"}</span>
                    <span className="font-semibold text-bgs-navy">{ticket.serialNumber}</span>
                  </li>
                )}
                <li className={`flex justify-between text-xs ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{lang === 'ar' ? "الفئة:" : "Category:"}</span>
                  <span className="font-semibold text-bgs-navy">{ticket.category}</span>
                </li>
                <li className={`flex justify-between ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{lang === 'ar' ? "أنشئت:" : "Created:"}</span>
                  <span className="text-gray-600">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </li>
                {isAdmin && (
                  <li className="pt-4 border-t border-gray-100">
                    <TicketAssignment ticketId={ticket.id} currentAssigneeId={ticket.assignedId} />
                  </li>
                )}
              </ul>
            </div>

            {isAdmin && (
              <div className={`card bg-white border-bgs-teal ${lang === 'ar' ? 'border-r-4' : 'border-l-4'}`}>
                <h4 className={`font-bold text-bgs-navy uppercase tracking-widest text-xs mb-6 border-b pb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? "معلومات العميل" : "Customer Info"}</h4>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest block mb-1">{lang === 'ar' ? "الشركة" : "Company"}</span>
                    <span className="font-bold text-bgs-navy">{ticket.createdBy.companyName || (lang === 'ar' ? 'غير متوفر' : 'Not Provided')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest block mb-1">{lang === 'ar' ? "بيانات الاتصال" : "Contact Details"}</span>
                    <p className="font-medium text-gray-700">{ticket.createdBy.name}</p>
                    <p className="text-gray-500 text-xs">{ticket.createdBy.email}</p>
                    <p className="text-gray-500 text-xs">{ticket.createdBy.contactNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest block mb-1">{lang === 'ar' ? "العنوان" : "Address"}</span>
                    <p className="text-gray-500 text-xs leading-relaxed">{ticket.createdBy.address || (lang === 'ar' ? 'لا يوجد عنوان' : 'No address provided')}</p>
                  </div>
                </div>
              </div>
            )}

            {isAdmin && (
               <div className="card bg-gray-50 border-dashed border-2 border-gray-200">
                  <h4 className={`font-bold text-bgs-navy uppercase tracking-widest text-xs mb-6 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? "ضوابط الإدارة" : "Admin Controls"}</h4>
                  <div className="space-y-4">
                     <p className={`text-xs text-gray-500 font-medium ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? "قم بتحديث الحالة لإبلاغ العميل." : "Update status to notify the customer."}</p>
                     <StatusUpdater ticketId={ticket.id} currentStatus={ticket.status} />
                  </div>
               </div>
            )}

             {isSuperAdmin && ticket.logs.length > 0 && (
               <div className={`card bg-white border-red-500 ${lang === 'ar' ? 'border-r-4' : 'border-l-4'}`}>
                 <h4 className={`font-bold text-bgs-navy uppercase tracking-widest text-xs mb-6 border-b pb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? "سجل الحالات" : "Status History"}</h4>
                 <div className="space-y-4">
                   {ticket.logs.map((log: any) => (
                     <div key={log.id} className="text-xs border-b border-gray-50 pb-3 last:border-0">
                       <div className={`flex justify-between items-start mb-1 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                         <span className="font-bold text-bgs-navy uppercase tracking-tighter shadow-sm border px-1 rounded bg-gray-50">
                           {log.newStatus}
                         </span>
                         <span className="text-gray-400 text-[9px] uppercase font-bold">
                           {lang === 'ar' 
                             ? formatDistance(new Date(log.createdAt), new Date(), { addSuffix: true }).replace('ago', 'مضت') 
                             : formatDistance(new Date(log.createdAt), new Date(), { addSuffix: true })}
                         </span>
                       </div>
                       <p className={`text-gray-600 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                         {lang === 'ar' ? "تغيرت من " : "Changed from "} <span className="font-medium text-gray-800">{log.oldStatus || 'NONE'}</span>
                       </p>
                       <p className={`text-[10px] text-gray-400 mt-1 italic font-medium ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                         {lang === 'ar' ? `بواسطة ${log.updatedBy.name}` : `by ${log.updatedBy.name}`}
                       </p>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
