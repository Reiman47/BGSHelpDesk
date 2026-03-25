
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { UserCheck, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function TicketAssignment({ 
  ticketId, 
  currentAssigneeId, 
  isSuperAdmin 
}: { 
  ticketId: string, 
  currentAssigneeId: string | null,
  isSuperAdmin: boolean
}) {
  const { lang, t } = useLanguage();
  const [admins, setAdmins] = useState<any[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState(currentAssigneeId || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get("/api/admin/users");
        setAdmins(res.data.filter((u: any) => u.role === "ADMIN" || u.role === "SUPERADMIN"));
      } catch (err) {
        console.error("Failed to fetch admins", err);
      }
    };
    fetchAdmins();
  }, []);

  const handleAssign = async (adminId: string) => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      await axios.post("/api/admin/assign", { ticketId, adminId });
      setSelectedAdmin(adminId);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(t("failedAssign"));
    } finally {
      setLoading(false);
    }
  };

  const currentAssignee = admins.find(a => a.id === currentAssigneeId);

  return (
    <div className={`space-y-3 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <label className={`block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
        {t("assignedTo")}
      </label>
      
      {isSuperAdmin ? (
        <div className="relative">
          <select
            value={selectedAdmin}
            onChange={(e) => handleAssign(e.target.value)}
            disabled={loading}
            className={`w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-bgs-navy focus:outline-none focus:ring-2 focus:ring-bgs-teal appearance-none transition-all disabled:opacity-50 ${lang === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'}`}
          >
            <option value="">{t("unassigned")}</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name} ({admin.role})
              </option>
            ))}
          </select>
          <div className={`absolute top-1/2 -translate-y-1/2 text-bgs-teal ${lang === 'ar' ? 'right-3' : 'left-3'}`}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
          </div>
        </div>
      ) : (
        <div className={`flex items-center space-x-2 py-2 px-3 bg-gray-50 border border-gray-100 rounded-lg ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <UserCheck size={16} className="text-bgs-teal" />
          <span className="text-xs font-bold text-bgs-navy">
            {currentAssignee ? currentAssignee.name : (currentAssigneeId ? "..." : t("unassigned"))}
          </span>
        </div>
      )}
    </div>
  );
}
