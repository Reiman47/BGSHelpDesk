"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function ReplyForm({ ticketId }: { ticketId: string }) {
  const { lang, t } = useLanguage();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await axios.post(`/api/tickets/${ticketId}/reply`, { content });
      setContent("");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(t("failedSendReply"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <form onSubmit={handleSubmit} className={lang === 'ar' ? 'text-right dir-rtl' : 'text-left'}>
        <label className={`block text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          {t("postReply")}
        </label>
        <textarea
          required
          rows={4}
          className={`input-field mb-4 bg-gray-50 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
          placeholder={t("writeResponse")}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className={`flex ${lang === 'ar' ? 'justify-start' : 'justify-end'}`}>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className={`btn-primary flex items-center ${lang === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <Send size={18} />
                <span>{t("sendReply")}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
