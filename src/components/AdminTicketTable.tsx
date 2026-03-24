"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  User, 
  ChevronRight, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  Flag, 
  Building2,
  XCircle,
  ArrowUpDown,
  Trash2
} from "lucide-react";
import { formatDistance } from "date-fns";
import axios from "axios";
import { useLanguage } from "@/components/LanguageContext";

interface AdminTicketTableProps {
  tickets: any[];
  role?: string;
}

export default function AdminTicketTable({ tickets: initialTickets, role }: AdminTicketTableProps) {
  const { t, lang } = useLanguage();
  const [tickets, setTickets] = useState(initialTickets);
  const [deletingTicket, setDeletingTicket] = useState<any>(null); // State for custom modal
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Get unique companies and categories for filter dropdowns
  const companies = useMemo(() => {
    const list = new Set(tickets.map(t => t.createdBy.companyName).filter(Boolean));
    return Array.from(list).sort() as string[];
  }, [tickets]);

  const categories = useMemo(() => {
    const list = new Set(tickets.map(t => t.category).filter(Boolean));
    return Array.from(list).sort() as string[];
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter(t => {
        const matchesSearch = 
          t.subject.toLowerCase().includes(search.toLowerCase()) ||
          t.createdBy.name.toLowerCase().includes(search.toLowerCase()) ||
          t.createdBy.email.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
        const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
        const matchesCategory = categoryFilter === "ALL" || t.category === categoryFilter;
        const matchesCompany = companyFilter === "ALL" || t.createdBy.companyName === companyFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesCompany;
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter, companyFilter, sortOrder]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setCategoryFilter("ALL");
    setCompanyFilter("ALL");
    setSortOrder("newest");
  };

  const handleDelete = async () => {
    if (!deletingTicket) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`/api/admin/tickets/${deletingTicket.id}`);
      setTickets(prev => prev.filter(t => t.id !== deletingTicket.id));
      setDeletingTicket(null);
    } catch (error: any) {
      console.error("Delete Ticket Error:", error);
      const message = error.response?.data?.message || "Internal server error";
      alert(`Error: ${message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`space-y-6 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {/* Filters Bar */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${lang === 'ar' ? 'lg:flex-row-reverse' : ''}`}>
          <div className="relative flex-1">
            <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input 
              type="text" 
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full ${lang === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-bgs-teal transition-all`}
            />
          </div>
          <button 
            onClick={resetFilters}
            className={`flex items-center justify-center space-x-2 text-xs font-bold text-gray-400 hover:text-bgs-teal uppercase tracking-widest transition-colors ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <XCircle size={16} />
            <span>{t("resetFilters")}</span>
          </button>
        </div>

        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className={`flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest ${lang === 'ar' ? 'flex-row-reverse mr-1' : 'ml-1'}`}>
              <Filter size={10} className={lang === 'ar' ? 'ml-1' : 'mr-1'} /> {t("status")}
            </label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-bgs-teal outline-none ${lang === 'ar' ? 'text-right' : ''}`}
            >
              <option value="ALL">{t("allStatus")}</option>
              {["OPEN", "PENDING", "RESOLVED", "CLOSED"].map(s => (
                <option key={s} value={s}>{t(s.toLowerCase())}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-1.5">
            <label className={`flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest ${lang === 'ar' ? 'flex-row-reverse mr-1' : 'ml-1'}`}>
              <Flag size={10} className={lang === 'ar' ? 'ml-1' : 'mr-1'} /> {t("priority")}
            </label>
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-bgs-teal outline-none ${lang === 'ar' ? 'text-right' : ''}`}
            >
              <option value="ALL">{t("allPriority")}</option>
              {["LOW", "MEDIUM", "HIGH", "URGENT"].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className={`flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest ${lang === 'ar' ? 'flex-row-reverse mr-1' : 'ml-1'}`}>
              <Tag size={10} className={lang === 'ar' ? 'ml-1' : 'mr-1'} /> {t("category")}
            </label>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-bgs-teal outline-none ${lang === 'ar' ? 'text-right' : ''}`}
            >
              <option value="ALL">{t("allCategories")}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div className="space-y-1.5">
            <label className={`flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest ${lang === 'ar' ? 'flex-row-reverse mr-1' : 'ml-1'}`}>
              <Building2 size={10} className={lang === 'ar' ? 'ml-1' : 'mr-1'} /> {t("company")}
            </label>
            <select 
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-bgs-teal outline-none ${lang === 'ar' ? 'text-right' : ''}`}
            >
              <option value="ALL">{t("allCompanies")}</option>
              {companies.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          {/* Date Sort */}
          <div className="space-y-1.5">
            <label className={`flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest ${lang === 'ar' ? 'flex-row-reverse mr-1' : 'ml-1'}`}>
              <Calendar size={10} className={lang === 'ar' ? 'ml-1' : 'mr-1'} /> {t("sortDate")}
            </label>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-bgs-teal outline-none ${lang === 'ar' ? 'text-right' : ''}`}
            >
              <option value="newest">{t("newestFirst")}</option>
              <option value="oldest">{t("oldestFirst")}</option>
            </select>
          </div>

          {/* Result Count (Visual only) */}
          <div className={`flex flex-col justify-end pb-1 px-2 ${lang === 'ar' ? 'items-start' : 'items-end'}`}>
            <span className="text-[10px] font-bold text-bgs-teal uppercase tracking-widest">
              {filteredTickets.length} {t("results")}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase text-gray-400 tracking-[0.15em] border-b">
                <th className="px-6 py-4">{t("status")}</th>
                <th className="px-6 py-4">{t("requester")}</th>
                <th className="px-6 py-4">{t("ticketDetails")}</th>
                <th className="px-6 py-4">{t("priority")}</th>
                <th className="px-6 py-4">{t("created")}</th>
                <th className={`px-6 py-4 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                      ticket.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                      ticket.status === 'PENDING' ? 'bg-blue-100 text-blue-700' :
                      ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {t(ticket.status.toLowerCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : 'space-x-3'}`}>
                      <div className="w-9 h-9 bg-bgs-teal/10 rounded-full flex items-center justify-center text-bgs-teal shrink-0">
                        <User size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-gray-800">{ticket.createdBy.name}</div>
                        <div className="text-[10px] text-gray-500 flex flex-col leading-tight">
                          <span className="truncate">{ticket.createdBy.email}</span>
                          <span className="text-bgs-navy font-medium opacity-70">{ticket.createdBy.companyName || t("noCompany")}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-bgs-navy line-clamp-1">{ticket.subject}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest">{ticket.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      ticket.priority === 'URGENT' ? 'border-red-200 text-red-600 bg-red-50' :
                      ticket.priority === 'HIGH' ? 'border-orange-200 text-orange-600 bg-orange-50' :
                      'border-gray-200 text-gray-500'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {lang === 'ar'
                      ? formatDistance(new Date(ticket.createdAt), new Date(), { addSuffix: true }).replace('ago', 'مضت').replace('about', 'حوالي').replace('less than', 'أقل من').replace('minutes', 'دقائق').replace('hours', 'ساعات')
                      : formatDistance(new Date(ticket.createdAt), new Date(), { addSuffix: true })}
                  </td>
                  <td className={`px-6 py-4 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                    <div className={`flex items-center justify-end ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : 'space-x-3'}`}>
                      <Link href={`/dashboard/tickets/${ticket.id}`} className={`inline-flex items-center space-x-1 text-bgs-teal font-bold text-xs uppercase hover:underline ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <span>{t("manage")}</span>
                        <ChevronRight size={14} className={lang === 'ar' ? 'rotate-180' : ''} />
                      </Link>
                      {role === "SUPERADMIN" && (
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingTicket(ticket); }}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          title={t("deleteTicket")}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                    {t("noMatchingTickets")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Deletion Confirmation Modal */}
      {deletingTicket && (
        <div className="fixed inset-0 bg-bgs-navy/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 scale-in-center">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-red-100">
             <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                   <Trash2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-bgs-navy uppercase tracking-tight mb-2">{t("deleteCaseTitle")}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                   {t("deleteCaseDesc")}
                   <span className="font-bold text-bgs-navy block mt-1 underline">#{deletingTicket.id.slice(-6).toUpperCase()}</span>
                   {t("deleteCaseWarning")}
                </p>
                <div className="flex flex-col space-y-3">
                   <button 
                     onClick={handleDelete}
                     disabled={isDeleting}
                     className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
                   >
                     {isDeleting ? <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> : null}
                     <span>{isDeleting ? t("processing") : t("confirmDeleteBtn")}</span>
                   </button>
                   <button 
                     onClick={() => setDeletingTicket(null)}
                     disabled={isDeleting}
                     className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                   >
                     {t("cancel")}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
