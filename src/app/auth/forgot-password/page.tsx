"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/components/LanguageContext";

export default function ForgotPasswordPage() {
  const { t, lang, setLang } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulated API
      setStatus("success");
    } catch (err) {
      setError(lang === 'ar' ? 'غير قادر على معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً.' : "Unable to process your request. Please try again later.");
      setStatus("error");
    }
  };

  return (
    <div className={`min-h-screen bg-[#F0F2F5] font-montserrat flex flex-col items-center text-[#111111] ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Simplify Header inspired by Zebra */}
      <header className={`w-full bg-white p-6 px-10 flex justify-between items-center shadow-sm border-b border-gray-100 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image 
            src="/logo.jpg" 
            alt="Barcode Gulf" 
            width={180} 
            height={60} 
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
        <div className={`text-[10px] italic text-gray-400 hidden md:block ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          <button 
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="hover:text-[#1AA1C5] transition-colors uppercase tracking-tighter decoration-dotted underline underline-offset-4"
          >
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
          <span className="mx-2 text-gray-300">|</span>
          {lang === 'en' ? 'English - UK' : 'العربية - السعودية'}
        </div>
      </header>

      <main className="max-w-[700px] w-full mt-12 p-4 flex-grow">
        <h1 className="text-3xl font-bold text-center mb-10 text-[#222222]">{t("resetPassTitle")}</h1>

        {/* Zebra Style Form Card */}
        <div className="bg-white p-8 md:p-14 shadow-2xl rounded-sm border border-gray-100 mb-20 min-h-[300px]">
          {status === "success" ? (
            <div className="text-center space-y-6 animate-in fade-in duration-500">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6 font-bold text-2xl">
                ✓
              </div>
              <h2 className="text-xl font-bold">{t("emailSent")}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {lang === 'ar' ? `إذا كان هناك حساب لـ ` : "If an account exists for "}
                <span className="font-bold text-[#222222]">{email}</span>
                {lang === 'ar' ? `، فستتلقى رسالة بريد إلكتروني تحتوي على تعليمات لإعادة تعيين كلمة المرور قريباً.` : ", you will receive an email with instructions on how to reset your password shortly."}
              </p>
              <div className="pt-6">
                <button 
                  onClick={() => router.push("/auth/login")}
                  className="px-10 py-3 bg-[#1AA1C5] text-white font-bold uppercase text-xs hover:bg-[#1589a8] transition-all tracking-widest min-w-[200px] shadow-lg"
                >
                  {t("returnLogin")}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className={`space-y-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <h2 className="text-xl font-bold text-[#333333]">{t("forgotPassQuestion")}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t("forgotPassInstruction")}
                </p>
              </div>
              
              {error && (
                <div className={`bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm font-medium ${lang === 'ar' ? 'border-l-0 border-r text-right' : ''}`}>
                  {error}
                </div>
              )}

              <div className={`max-w-md ${lang === 'ar' ? 'ml-auto' : ''}`}>
                <label className={`block text-sm font-bold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t("emailAddr")}
                </label>
                <input 
                  type="email"
                  required
                  className={`w-full p-3.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none transition-all bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className={`text-[10px] text-gray-400 italic mt-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t("mandatory")}
                </p>
              </div>

              <div className={`flex flex-wrap gap-4 pt-6 border-t border-gray-100 mt-10 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <button 
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  className="px-10 py-3 border-2 border-[#222222] font-bold uppercase text-xs hover:bg-gray-50 transition-all tracking-widest min-w-[140px]"
                >
                  {t("cancel")}
                </button>
                <button 
                  type="submit"
                  disabled={status === "loading"}
                  className="px-10 py-3 bg-[#1AA1C5] text-white font-bold uppercase text-xs hover:bg-[#1589a8] transition-all tracking-widest min-w-[160px] flex items-center justify-center shadow-lg"
                >
                  {status === "loading" ? <Loader2 className="animate-spin mr-2" size={16} /> : t("submit")}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <footer className="w-full py-12 flex flex-col items-center">
        <div className="text-[10px] font-bold text-[#1AA1C5] transform hover:scale-105 transition-transform">
          <Link href="https://www.barcodegulf.com" className="hover:underline tracking-widest">BarcodeGulf.com</Link>
        </div>
      </footer>
    </div>
  );
}
