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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(data.message || (lang === "ar" ? "حدث خطأ ما" : "An error occurred"));
      return;
    }

    setStep("otp");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpVerified) {
      setStep("reset");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(data.message || (lang === "ar" ? "رمز التحقق غير صحيح" : "Invalid OTP"));
      setOtpVerified(false);
      return;
    }

    // Only advance if server confirmed OTP is valid
    setOtpVerified(true);
    setStep("reset");
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpVerified) {
      setErrorMsg(lang === "ar" ? "يرجى التحقق من رمز OTP أولاً" : "Please verify your OTP first");
      setStep("otp");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg(lang === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(data.message || (lang === "ar" ? "فشل تحديث كلمة المرور" : "Failed to reset password"));
      return;
    }

    setSuccessMsg(t("resetSuccess"));
  };

  const isRTL = lang === "ar";

  return (
    <div className={`min-h-screen bg-[#F0F2F5] font-montserrat flex flex-col items-center text-[#111111] ${isRTL ? "rtl" : "ltr"}`}>
      <header className={`w-full bg-white p-4 md:p-6 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center shadow-sm border-b border-gray-100 gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image src="/logo.jpg" alt="Barcode Gulf" width={180} height={60} className="h-8 md:h-10 w-auto object-contain" priority />
        </Link>
        <div className={`text-[10px] italic text-gray-400 ${isRTL ? "text-right" : "text-left"}`}>
          <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="hover:text-[#1AA1C5] transition-colors uppercase tracking-tighter decoration-dotted underline underline-offset-4">
            {lang === "en" ? "العربية" : "English"}
          </button>
          <span className="mx-2 text-gray-300">|</span>
          {lang === "en" ? "English - UK" : "العربية - السعودية"}
        </div>
      </header>

      <main className="max-w-[700px] w-full mt-12 p-4 flex-grow">
        <h1 className="text-3xl font-bold text-center mb-10 text-[#222222]">{t("resetPassTitle")}</h1>

        <div className="bg-white p-8 md:p-14 shadow-2xl rounded-sm border border-gray-100 mb-20 min-h-[300px]">

          {/* ===== SUCCESS STATE ===== */}
          {successMsg ? (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6 font-bold text-2xl">✓</div>
              <h2 className="text-xl font-bold">{successMsg}</h2>
              <div className="pt-6">
                <button onClick={() => router.push("/auth/login")} className="px-10 py-3 bg-[#1AA1C5] text-white font-bold uppercase text-xs hover:bg-[#1589a8] transition-all tracking-widest min-w-[200px]">
                  {t("returnLogin")}
                </button>
              </div>
            </div>

          /* ===== STEP 1: EMAIL ===== */
          ) : step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-10">
              <div className={`space-y-4 ${isRTL ? "text-right" : "text-left"}`}>
                <h2 className="text-xl font-bold text-[#333333]">{t("forgotPassQuestion")}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{t("forgotPassInstruction")}</p>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 text-sm border-l-4 border-red-500 rounded">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className={`block text-sm font-bold text-[#555555] mb-2 ${isRTL ? "text-right" : "text-left"}`}>{t("emailAddr")}</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                  className={`w-full p-3.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#1AA1C5] text-sm ${isRTL ? "text-right" : "text-left"}`}
                />
              </div>

              <div className={`flex flex-col sm:flex-row gap-4 pt-6 mt-10 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
                <button type="button" onClick={() => router.push("/auth/login")} className="w-full sm:w-auto px-10 py-4 sm:py-3 border-2 border-[#222222] font-bold uppercase text-xs hover:bg-gray-50 tracking-widest min-w-[140px] rounded-md">{t("cancel")}</button>
                <button type="submit" disabled={loading} className="w-full sm:w-auto px-10 py-4 sm:py-3 bg-[#1AA1C5] text-white font-bold uppercase text-xs hover:bg-[#1589a8] tracking-widest min-w-[160px] flex items-center justify-center shadow-lg disabled:opacity-60 rounded-md">
                  {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : t("submit")}
                </button>
              </div>
            </form>

          /* ===== STEP 2: OTP ===== */
          ) : step === "otp" ? (
            <form onSubmit={handleOtpSubmit} className="space-y-10">
              <div className={`space-y-4 ${isRTL ? "text-right" : "text-left"}`}>
                <h2 className="text-xl font-bold text-[#333333]">{t("enterOtp")}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{t("otpInstructions")}</p>
              </div>

              {/* ERROR BOX - ALWAYS RENDERED HERE FOR OTP STEP */}
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 text-sm border-l-4 border-red-500 rounded font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div>
                <label className={`block text-sm font-bold text-[#555555] mb-2 ${isRTL ? "text-right" : "text-left"}`}>{t("enterOtp")}</label>
                <input
                  type="text" required value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setErrorMsg(""); }}
                  className={`w-full p-3.5 border ${errorMsg ? "border-red-400 bg-red-50" : "border-gray-300"} rounded-md outline-none focus:ring-1 focus:ring-[#1AA1C5] text-sm tracking-[10px] text-center font-bold`}
                  maxLength={6}
                  placeholder="000000"
                  inputMode="numeric"
                />
                <p className={`text-xs text-gray-400 mt-2 ${isRTL ? "text-right" : "text-left"}`}>
                  {lang === "ar" ? "أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك الإلكتروني" : "Enter the 6-digit code sent to your email"}
                </p>
              </div>

              <div className={`flex flex-col sm:flex-row gap-4 pt-6 mt-10 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
                <button type="button" onClick={() => { setStep("email"); setErrorMsg(""); setOtp(""); setOtpVerified(false); }} className="w-full sm:w-auto px-10 py-4 sm:py-3 border-2 border-[#222222] font-bold uppercase text-xs hover:bg-gray-50 tracking-widest min-w-[140px] rounded-md">{t("back")}</button>
                <button type="submit" disabled={loading || otp.length < 6} className="w-full sm:w-auto px-10 py-4 sm:py-3 bg-[#1AA1C5] text-white font-bold uppercase text-xs hover:bg-[#1589a8] tracking-widest min-w-[160px] flex items-center justify-center shadow-lg disabled:opacity-60 rounded-md">
                  {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : t("next")}
                </button>
              </div>
            </form>

          /* ===== STEP 3: NEW PASSWORD ===== */
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-10">
              <div className={`space-y-4 ${isRTL ? "text-right" : "text-left"}`}>
                <h2 className="text-xl font-bold text-[#333333]">{t("enterNewPass")}</h2>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 text-sm border-l-4 border-red-500 rounded">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className={`block text-sm font-bold text-[#555555] mb-2 ${isRTL ? "text-right" : "text-left"}`}>{t("newPassword")}</label>
                <input
                  type="password" required value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full p-3.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#1AA1C5] text-sm ${isRTL ? "text-right" : "text-left"}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-bold text-[#555555] mb-2 ${isRTL ? "text-right" : "text-left"}`}>{t("confirmNewPassword")}</label>
                <input
                  type="password" required value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className={`w-full p-3.5 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#1AA1C5] text-sm ${isRTL ? "text-right" : "text-left"}`}
                />
              </div>

              <div className={`flex flex-col sm:flex-row gap-4 pt-6 mt-10 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
                <button type="button" onClick={() => { setStep("otp"); setErrorMsg(""); }} className="w-full sm:w-auto px-10 py-4 sm:py-3 border-2 border-[#222222] font-bold uppercase text-xs hover:bg-gray-50 tracking-widest min-w-[140px] rounded-md">{t("back")}</button>
                <button type="submit" disabled={loading} className="w-full sm:w-auto px-10 py-4 sm:py-3 bg-[#1AA1C5] text-white font-bold uppercase text-xs hover:bg-[#1589a8] tracking-widest min-w-[200px] flex items-center justify-center shadow-lg disabled:opacity-60 rounded-md">
                  {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : t("resetPassword")}
                </button>
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
