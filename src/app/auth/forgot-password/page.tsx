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
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("USER_NOT_FOUND");
        }
        throw new Error(data.message || "Failed to send OTP");
      }
      
      setStep("otp");
      setStatus("idle");
    } catch (err: any) {
      if (err.message === "USER_NOT_FOUND") {
        setError(t("userDoesNotExist"));
      } else {
        setError(err.message || (lang === 'ar' ? 'غير قادر على معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً.' : "Failed to send OTP"));
      }
      setStatus("error");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      
      setStep("reset");
      setStatus("idle");
    } catch (err: any) {
      setError(err.message || (lang === 'ar' ? 'رمز غير صالح.' : "Invalid OTP"));
      setStatus("error");
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError(lang === 'ar' ? 'كلمات المرور غير متطابقة' : "Passwords do not match");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      setStatus("success");
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <div className={`min-h-screen bg-[#F0F2F5] font-montserrat flex flex-col items-center text-[#111111] ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
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

        <div className="bg-white p-8 md:p-14 shadow-2xl rounded-sm border border-gray-100 mb-20 min-h-[300px]">
          {status === "success" ? (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6 font-bold text-2xl">
                ✓
              </div>
              <h2 className="text-xl font-bold">{t("resetSuccess")}</h2>
              <div className="pt-6">
                <button 
                  onClick={() => router.push("/auth/login")}
                  className="px-10 py-3 bg-[#1AA1C5] text-white font-bold uppercase text-xs hover:bg-[#1589a8] transition-all tracking-widest min-w-[200px]"
                >
                  {t("returnLogin")}
                </button>
              </div>
            </div>
          ) : step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-10">
              <div className={`space-y-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <h2 className="text-xl font-bold text-[#333333]">{t("forgotPassQuestion")}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{t("forgotPassInstruction")}</p>
              </div>
              {error && <div className="p-4 bg-red-50 text-red-700 text-sm border-l-4 border-red-500">{error}</div>}
              <div>
                <label className={`block text-sm font-bold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t("emailAddr")}</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-3.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#1AA1C5] text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                />
              </div>
              <div className={`flex gap-4 pt-6 mt-10 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <button type="button" onClick={() => router.push("/auth/login")} className="px-10 py-3 border-2 border-[#222222] font-bold uppercase text-xs hover:bg-gray-50 tracking-widest min-w-[140px]">{t("cancel")}</button>
                <button type="submit" disabled={status === "loading"} className="px-10 py-3 bg-[#1AA1C5] text-white font-bold uppercase text-xs hover:bg-[#1589a8] tracking-widest min-w-[160px] flex items-center justify-center shadow-lg">{status === "loading" ? <Loader2 className="animate-spin mr-2" size={16} /> : t("submit")}</button>
              </div>
            </form>
          ) : step === "otp" ? (
            <form onSubmit={handleOtpSubmit} className="space-y-10">
              <div className={`space-y-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <h2 className="text-xl font-bold text-[#333333]">{t("enterOtp")}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{t("otpInstructions")}</p>
              </div>
              {error && <div className="p-4 bg-red-50 text-red-700 text-sm border-l-4 border-red-500">{error}</div>}
              <div>
                <label className={`block text-sm font-bold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t("enterOtp")}</label>
                <input 
                  type="text" required value={otp} onChange={(e) => { setOtp(e.target.value); setError(""); }}
                  className={`w-full p-3.5 border ${error ? 'border-red-400' : 'border-gray-300'} rounded-md outline-none focus:ring-1 focus:ring-[#1AA1C5] text-sm tracking-[10px] text-center font-bold`}
                  maxLength={6}
                  placeholder="______"
                />
              </div>
              <div className={`flex gap-4 pt-6 mt-10 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <button type="button" onClick={() => { setStep("email"); setError(""); setOtp(""); }} className="px-10 py-3 border-2 border-[#222222] font-bold uppercase text-xs hover:bg-gray-50 tracking-widest min-w-[140px]">{t("back")}</button>
                <button type="submit" disabled={status === "loading"} className="px-10 py-3 bg-[#1AA1C5] text-white font-bold uppercase text-xs hover:bg-[#1589a8] tracking-widest min-w-[160px] flex items-center justify-center shadow-lg disabled:opacity-60">{status === "loading" ? <Loader2 className="animate-spin mr-2" size={16} /> : t("next")}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-10">
              <div className={`space-y-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <h2 className="text-xl font-bold text-[#333333]">{t("enterNewPass")}</h2>
              </div>
              {error && <div className="p-4 bg-red-50 text-red-700 text-sm border-l-4 border-red-500">{error}</div>}
              <div>
                <label className={`block text-sm font-bold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t("newPassword")}</label>
                <input 
                  type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full p-3.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#1AA1C5] text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-bold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t("confirmNewPassword")}</label>
                <input 
                  type="password" required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className={`w-full p-3.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#1AA1C5] text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                />
              </div>
              <div className={`flex gap-4 pt-6 mt-10 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <button type="button" onClick={() => setStep("otp")} className="px-10 py-3 border-2 border-[#222222] font-bold uppercase text-xs hover:bg-gray-50 tracking-widest min-w-[140px]">{t("back")}</button>
                <button type="submit" disabled={status === "loading"} className="px-10 py-3 bg-[#1AA1C5] text-white font-bold uppercase text-xs hover:bg-[#1589a8] tracking-widest min-w-[200px] flex items-center justify-center shadow-lg">{status === "loading" ? <Loader2 className="animate-spin mr-2" size={16} /> : t("resetPassword")}</button>
              </div>
            </form>
          )}
        </div>
      </main>
      <footer className="w-full py-12 flex flex-col items-center">
        <div className="text-[10px] font-bold text-[#1AA1C5]">
          <Link href="https://www.barcodegulf.com" className="hover:underline tracking-widest">BarcodeGulf.com</Link>
        </div>
      </footer>
    </div>
  );
}
