"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function StatusUpdater({ ticketId, currentStatus }: { ticketId: string, currentStatus: string }) {
  const { t, lang } = useLanguage();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const statuses = [
    { value: "OPEN", label: t("open"), color: "bg-yellow-500", icon: <AlertCircle size={14} /> },
    { value: "PENDING", label: t("pending"), color: "bg-blue-500", icon: <Clock size={14} /> },
    { value: "RESOLVED", label: t("resolved"), color: "bg-green-500", icon: <CheckCircle size={14} /> },
    { value: "CLOSED", label: t("closed"), color: "bg-gray-500", icon: <XCircle size={14} /> },
  ];

  const handleUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      await axios.patch(`/api/tickets/${ticketId}/status`, { status: newStatus });
      setStatus(newStatus);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(t("failedUpdateStatus"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${lang === 'ar' ? 'font-arabic flex-row-reverse' : ''}`}>
      {statuses.map((s) => (
        <button
          key={s.value}
          disabled={loading}
          onClick={() => handleUpdate(s.value)}
          className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase flex items-center transition-all ${lang === 'ar' ? 'space-x-reverse space-x-1.5' : 'space-x-1.5'} ${
            status === s.value 
            ? `${s.color} text-white shadow-md scale-105` 
            : 'bg-white border text-gray-500 hover:border-gray-300'
          }`}
        >
          {s.icon}
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  );
}
