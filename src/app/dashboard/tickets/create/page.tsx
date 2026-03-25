"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { PlusCircle, ArrowLeft, Loader2, Send, Tag, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

const CATEGORIES = ["Technical Support", "Hardware Repair", "Software License", "General Inquiry"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function CreateTicketPage() {
  const { t, lang } = useLanguage();
  const [formData, setFormData] = useState({
    subject: "",
    category: CATEGORIES[0],
    priority: PRIORITIES[1],
    description: "",
    partNumber: "",
    serialNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/tickets", formData);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(lang === 'ar' ? "فشل إنشاء التذكرة" : "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-gray-50 min-h-screen pt-24 pb-12 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/dashboard" className={`flex items-center text-gray-500 hover:text-bgs-teal mb-6 transition-colors ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <ArrowLeft size={20} className={lang === 'ar' ? 'rotate-180 ml-2' : 'mr-2'} />
          <span className="font-bold uppercase tracking-widest text-xs">{lang === 'ar' ? "العودة إلى لوحة القيادة" : "Back to Dashboard"}</span>
        </Link>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className={`bg-bgs-navy p-6 text-white flex items-center justify-between ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className={`${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <h1 className="text-2xl font-bold uppercase tracking-tight">{lang === 'ar' ? "فتح تذكرة دعم" : "Open Support Ticket"}</h1>
              <p className="text-gray-300 text-sm mt-1">{lang === 'ar' ? "املأ التفاصيل أدناه لتصعيد مشكلتك." : "Fill in the details below to escalate your issue."}</p>
            </div>
            <PlusCircle size={40} className="text-bgs-teal opacity-50" />
          </div>

          <form onSubmit={handleSubmit} className={`p-8 space-y-6 ${lang === 'ar' ? 'text-right dir-rtl' : 'text-left'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2">
                <label className={`block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {lang === 'ar' ? "الموضوع / عنوان المشكلة" : "Subject / Issue Title"}
                </label>
                <input
                  type="text"
                  required
                  className={`input-field ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  placeholder={lang === 'ar' ? "مثال: الطابعة لا تتصل بالشبكة" : "e.g. Printer not connecting to network"}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {lang === 'ar' ? "رقم القطعة (P/N)" : "Part Number (P/N)"}
                </label>
                <input
                  type="text"
                  className={`input-field ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  placeholder={lang === 'ar' ? "مثال: BGS-400-TR" : "e.g. BGS-400-TR"}
                  value={formData.partNumber}
                  onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {lang === 'ar' ? "الرقم التسلسلي (S/N)" : "Serial Number (S/N)"}
                </label>
                <input
                  type="text"
                  className={`input-field ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  placeholder={lang === 'ar' ? "مثال: SN123456789" : "e.g. SN123456789"}
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {lang === 'ar' ? "الفئة" : "Category"}
                </label>
                <div className="relative">
                  <Tag className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                  <select
                    className={`input-field appearance-none ${lang === 'ar' ? 'pr-10 text-right' : 'pl-10 text-left'}`}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t("priority")}
                </label>
                <div className="relative">
                  <AlertTriangle className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                  <select
                    className={`input-field appearance-none ${lang === 'ar' ? 'pr-10 text-right' : 'pl-10 text-left'}`}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {lang === 'ar' ? "وصف مفصل" : "Detailed Description"}
              </label>
              <textarea
                required
                rows={6}
                className={`input-field resize-none ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                placeholder={lang === 'ar' ? "يرجى تقديم أكبر قدر ممكن من التفاصيل، بما في ذلك رموز الخطأ والخطوات المتخذة..." : "Please provide as much detail as possible, including error codes and steps taken..."}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className={`pt-4 flex items-center ${lang === 'ar' ? 'justify-start space-x-reverse space-x-4' : 'justify-end space-x-4'}`}>
              <Link href="/dashboard" className="text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-gray-600">
                {lang === 'ar' ? "إلغاء" : "Cancel"}
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary flex items-center px-10 ${lang === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <Send size={18} />
                    <span>{lang === 'ar' ? "إرسال التذكرة" : "SUBMIT TICKET"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
