"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart3, 
  ArrowLeft, 
  Loader2, 
  Users, 
  Building2, 
  Package, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Download
} from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { useLanguage } from "@/components/LanguageContext";

export default function PerformanceReportsPage() {
  const { t, lang } = useLanguage();
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedAdmin, setExpandedAdmin] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get("/api/admin/reports");
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      setError(lang === 'ar' ? "فشل إنشاء تقارير الأداء" : "Failed to generate performance reports");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-bgs-teal" size={40} />
    </div>
  );

  const totalClosedAcrossAdmins = reportData.reduce((acc, curr) => acc + curr.totalClosed, 0);

  const exportToExcel = () => {
    const exportData = reportData.map(stat => ({
      [lang === 'ar' ? "اسم المسؤول" : "Admin Name"]: stat.adminName,
      [lang === 'ar' ? "إجمالي التذاكر المغلقة" : "Total Closed Tickets"]: stat.totalClosed,
      [lang === 'ar' ? "إجمالي ساعات الدعم" : "Total Support Hours"]: stat.totalTimeHours,
      [lang === 'ar' ? "متوسط ساعات الحل" : "Average Resolution Hours"]: stat.avgResolutionTimeHours,
      [lang === 'ar' ? "توزيع العملاء" : "Customer Breakdown"]: Object.entries(stat.customerBreakdown || {}).map(([k, v]) => `${k} (${v})`).join(', '),
      [lang === 'ar' ? "توزيع الموديل" : "Model Breakdown"]: Object.entries(stat.modelBreakdown || {}).map(([k, v]) => `${k} (${v})`).join(', '),
      [lang === 'ar' ? "تفاصيل التذاكر (التذكرة: الساعات)" : "Ticket Details (Ticket: Hours)"]: (stat.tickets || []).map((t: any) => `${t.id.slice(-6)}: ${t.resolutionTimeHours}h`).join(', ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, lang === 'ar' ? "تقرير الأداء" : "Performance Report");
    
    // Auto adjust column widths slightly for better presentation
    const colWidths = [
      { wch: 25 }, // Admin Name
      { wch: 20 }, // Total Closed
      { wch: 20 }, // Total Hours
      { wch: 25 }, // Avg Resolution
      { wch: 40 }, // Customer Breakdown
      { wch: 40 }, // Model Breakdown
      { wch: 60 }, // Ticket Details
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, lang === 'ar' ? "تقرير_أداء_الدعم.xlsx" : "Support_Performance_Report.xlsx");
  };

  return (
    <div className={`bg-gray-50 min-h-screen pt-24 pb-12 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <div className="container mx-auto px-4 md:px-6">
        <Link href="/admin" className={`flex items-center text-gray-500 hover:text-bgs-teal mb-6 transition-colors ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <ArrowLeft size={20} className={lang === 'ar' ? 'rotate-180 ml-2' : 'mr-2'} />
          <span className="font-bold uppercase tracking-widest text-[10px]">{t("admin")} {t("dashboard")}</span>
        </Link>

        <div className={`mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          <div className={`${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <h1 className={`text-3xl font-bold text-bgs-navy uppercase flex items-center ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              <BarChart3 className={lang === 'ar' ? 'ml-3 text-bgs-teal' : 'mr-3 text-bgs-teal'} size={32} />
              {lang === 'ar' ? "تقارير أداء الدعم" : "Support Performance Reports"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{lang === 'ar' ? "تحليلات وتاريخ تدخلات الدعم حسب المسؤول" : "Analytics and history of support interventions by administrator"}</p>
          </div>
          
          <button 
            onClick={exportToExcel}
            className={`flex items-center justify-center space-x-2 bg-bgs-teal hover:bg-teal-700 transition-colors text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <Download size={18} className={lang === 'ar' ? 'ml-2' : ''} />
            <span>{lang === 'ar' ? "تصدير إلى إكسل" : "Export to Excel"}</span>
          </button>
        </div>

        {error && (
          <div className={`bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-center space-x-3 ${lang === 'ar' ? 'flex-row-reverse space-x-reverse border-l-0 border-r-4' : ''}`}>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center ${lang === 'ar' ? 'flex-row-reverse space-x-reverse space-x-4' : 'space-x-4'}`}>
             <div className="p-4 bg-teal-50 text-bgs-teal rounded-xl">
               <CheckCircle2 size={24} />
             </div>
             <div className={`${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{lang === 'ar' ? "إجمالي المحلول عالمياً" : "Global Resolved"}</p>
                <h3 className="text-2xl font-bold text-bgs-navy">{totalClosedAcrossAdmins}</h3>
             </div>
          </div>
          <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center ${lang === 'ar' ? 'flex-row-reverse space-x-reverse space-x-4' : 'space-x-4'}`}>
             <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
               <TrendingUp size={24} />
             </div>
             <div className={`${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{lang === 'ar' ? "المسؤولون النشطون" : "Active Admins"}</p>
                <h3 className="text-2xl font-bold text-bgs-navy">{reportData.length}</h3>
             </div>
          </div>
          <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center ${lang === 'ar' ? 'flex-row-reverse space-x-reverse space-x-4' : 'space-x-4'}`}>
             <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
               <Clock size={24} />
             </div>
             <div className={`${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{lang === 'ar' ? "متوسط الكفاءة" : "Avg Efficiency"}</p>
                <h3 className="text-2xl font-bold text-bgs-navy">
                  {(reportData.reduce((acc, curr) => acc + parseFloat(curr.avgResolutionTimeHours), 0) / (reportData.length || 1)).toFixed(1)}h
                </h3>
             </div>
          </div>
        </div>

        {/* Admin Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold uppercase text-gray-400 tracking-widest border-b">
                  <th className="px-8 py-5">{lang === 'ar' ? "مسؤول الدعم" : "Support Admin"}</th>
                  <th className="px-6 py-5">{lang === 'ar' ? "التذاكر المغلقة" : "Closed Tickets"}</th>
                  <th className="px-6 py-5">{lang === 'ar' ? "إجمالي وقت الدعم" : "Total Support Time"}</th>
                  <th className="px-6 py-5">{lang === 'ar' ? "متوسط الحل" : "Avg Resolution"}</th>
                  <th className={`px-8 py-5 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>{lang === 'ar' ? "التفاصيل" : "Details"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reportData.map((stat) => (
                  <React.Fragment key={stat.adminId}>
                    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => setExpandedAdmin(expandedAdmin === stat.adminId ? null : stat.adminId)}>
                      <td className="px-8 py-6">
                        <div className={`flex items-center ${lang === 'ar' ? 'flex-row-reverse space-x-reverse space-x-4' : 'space-x-4'}`}>
                          <div className="w-10 h-10 bg-bgs-navy text-white rounded-full flex items-center justify-center font-bold text-sm shadow-inner group-hover:scale-110 transition-transform">
                            {stat.adminName[0].toUpperCase()}
                          </div>
                          <div className={`${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                            <div className="text-sm font-bold text-bgs-navy">{stat.adminName}</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{lang === 'ar' ? "العميل المعين" : "Assigned Agent"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-bold text-bgs-navy">
                        {stat.totalClosed}
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-600">
                        {stat.totalTimeHours} {lang === 'ar' ? "ساعات" : "Hours"}
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-xs font-bold text-bgs-teal bg-teal-50 px-3 py-1 rounded-full">
                          {stat.avgResolutionTimeHours}h / {lang === 'ar' ? "تذكرة" : "ticket"}
                        </span>
                      </td>
                      <td className={`px-8 py-6 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                        <button className="text-gray-400 group-hover:text-bgs-teal transition-colors focus:outline-none">
                          {expandedAdmin === stat.adminId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Breakdown Section */}
                    {expandedAdmin === stat.adminId && (
                      <tr className="bg-gray-50/30 border-t-0 shadow-inner">
                        <td colSpan={5} className="px-8 py-8 animate-in slide-in-from-top-4 duration-300">
                           <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                             {/* Customer Wise */}
                             <div>
                               <h4 className={`flex items-center text-xs font-bold text-bgs-navy uppercase tracking-widest mb-4 border-b pb-2 border-gray-200/50 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                 <Building2 className={lang === 'ar' ? 'ml-2 text-bgs-teal' : 'mr-2 text-bgs-teal'} size={14} /> 
                                 {lang === 'ar' ? "توزيع العملاء" : "Customer-wise Breakdown"}
                               </h4>
                               <div className="space-y-2">
                                  {Object.entries(stat.customerBreakdown).map(([name, count]: any) => (
                                    <div key={name} className={`flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-gray-100/50 shadow-sm ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                      <span className="text-gray-700 font-medium">{name}</span>
                                      <span className="bg-teal-50 text-bgs-teal text-[10px] font-bold px-2 py-0.5 rounded border border-teal-100">{count} {lang === 'ar' ? "تذاكر" : "Tickets"}</span>
                                    </div>
                                  ))}
                               </div>
                             </div>

                             {/* Model Wise */}
                             <div>
                               <h4 className={`flex items-center text-xs font-bold text-bgs-navy uppercase tracking-widest mb-4 border-b pb-2 border-gray-200/50 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                 <Package className={lang === 'ar' ? 'ml-2 text-bgs-teal' : 'mr-2 text-bgs-teal'} size={14} /> 
                                 {lang === 'ar' ? "توزيع الموديل / الفئة" : "Model / Category Breakdown"}
                               </h4>
                               <div className="space-y-2">
                                  {Object.entries(stat.modelBreakdown).map(([model, count]: any) => (
                                    <div key={model} className={`flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-gray-100/50 shadow-sm ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                      <span className="text-gray-700 font-medium">{model}</span>
                                      <span className="bg-navy-50 text-bgs-navy text-[10px] font-bold px-2 py-0.5 rounded border border-navy-100">{count} {lang === 'ar' ? "تذاكر" : "Tickets"}</span>
                                    </div>
                                  ))}
                               </div>
                             </div>

                             {/* Ticket Wise Support Time */}
                             <div className="md:col-span-2 lg:col-span-1">
                               <h4 className={`flex items-center text-xs font-bold text-bgs-navy uppercase tracking-widest mb-4 border-b pb-2 border-gray-200/50 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                 <Clock className={lang === 'ar' ? 'ml-2 text-bgs-teal' : 'mr-2 text-bgs-teal'} size={14} /> 
                                 {lang === 'ar' ? "وقت الدعم لكل تذكرة" : "Ticket-wise Support Time"}
                               </h4>
                               <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                  {stat.tickets?.map((ticket: any) => (
                                    <div key={ticket.id} className={`flex flex-col space-y-1 text-xs bg-white p-2.5 rounded-lg border border-gray-100/50 shadow-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                      <div className={`flex items-center justify-between ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-bgs-navy font-bold truncate max-w-[150px]" title={ticket.subject}>#{ticket.id.slice(-6)} - {ticket.subject}</span>
                                        <span className="text-bgs-teal font-bold">{ticket.resolutionTimeHours}h</span>
                                      </div>
                                      <div className={`flex items-center text-[10px] text-gray-400 uppercase tracking-wider ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                        <Building2 size={10} className={lang === 'ar' ? 'ml-1' : 'mr-1'} />
                                        <span>{ticket.customer}</span>
                                      </div>
                                    </div>
                                  ))}
                               </div>
                             </div>
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {reportData.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm mt-6">
            <Users className="mx-auto text-gray-200 mb-4" size={48} />
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm">{lang === 'ar' ? "لم يتم العثور على بيانات دعم" : "No support data found"}</h3>
            <p className="text-gray-400 text-xs mt-1">{lang === 'ar' ? "التذاكر المغلقة أو المحلولة مع المسؤولين المعينين ستظهر هنا." : "Closed or Resolved tickets with assigned admins will appear here."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
