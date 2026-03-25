"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/components/LanguageContext";

export default function RegisterPage() {
  const { t, lang, setLang } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    firstName: "",
    lastName: "",
    email: "", 
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    address: "",
    contactNumber: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fullName = `${formData.firstName} ${formData.lastName}`.trim();

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      setError(lang === 'ar' ? 'يرجى التحقق من بريدك الإلكتروني أولاً.' : "Please verify your email with OTP first.");
      return;
    }
    setError("");
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError(lang === 'ar' ? 'يرجى إدخال عنوان بريد إلكتروني صالح.' : "Please enter a valid email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(lang === 'ar' ? 'يرجى إدخال عنوان بريد إلكتروني صالح.' : "Please enter a valid email address.");
      return;
    }

    setSendingOtp(true);
    setError("");
    try {
      await axios.post("/api/auth/send-registration-otp", { email: formData.email });
      setOtpSent(true);
      // No alert, just UI state change
    } catch (err: any) {
      setError(err.response?.data?.message || (lang === 'ar' ? 'فشل إرسال الرمز.' : "Failed to send code."));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError(lang === 'ar' ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام.' : "Please enter 6-digit verification code.");
      return;
    }
    setVerifyingOtp(true);
    setError("");
    try {
      await axios.post("/api/auth/verify-registration-otp", { email: formData.email, otp });
      setOtpVerified(true);
    } catch (err: any) {
      setError(err.response?.data?.message || (lang === 'ar' ? 'رمز غير صالح.' : "Invalid code."));
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError(lang === 'ar' ? 'كلمات المرور لا تتطابق.' : "Passwords do not match.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      await axios.post("/api/auth/register", {
        name: fullName,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        address: formData.address,
        contactNumber: formData.contactNumber
      });
      router.push("/auth/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.message || (lang === 'ar' ? 'فشل التسجيل. يرجى المحاولة مرة أخرى.' : "Registration failed. Please try again."));
    } finally {
      setLoading(false);
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

      <main className="max-w-[850px] w-full mt-8 p-4 flex-grow">
        <h1 className="text-3xl font-bold text-center mb-10 text-[#222222]">{t("register")}</h1>

        {/* Zebra Stepper */}
        <div className={`flex items-center justify-center mb-16 relative ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center w-full max-w-sm ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className="relative flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-[#1AA1C5] border-[#1AA1C5] text-white' : 'bg-white border-gray-300 text-gray-400'} font-bold text-base z-10 transition-all`}>1</div>
              <span className="absolute -bottom-7 text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">{t("userEmail")}</span>
            </div>
            <div className={`flex-grow h-[2px] ${step > 1 ? 'bg-[#1AA1C5]' : 'bg-gray-300'} transition-all`}></div>
            <div className="relative flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-[#1AA1C5] border-[#1AA1C5] text-white' : 'bg-white border-gray-300 text-gray-400'} font-bold text-base z-10 transition-all`}>2</div>
              <span className="absolute -bottom-7 text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">{t("userInformation")}</span>
            </div>
          </div>
        </div>

        {/* Zebra Style Form Card */}
        <div className="bg-white p-8 md:p-16 shadow-2xl rounded-sm border border-gray-100 mb-20 min-h-[400px]">
          {error && (
            <div className={`bg-red-50 border-l-4 border-red-500 p-4 mb-10 text-red-700 text-sm font-medium animate-in slide-in-from-top-2 duration-300 ${lang === 'ar' ? 'border-l-0 border-r space-x-reverse text-right' : ''}`}>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-10">
              <div className={`border-b border-gray-200 pb-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <h2 className="text-xl font-bold text-[#333333]">{t("enterEmail")}</h2>
              </div>
              
              <div className={`space-y-8 max-w-md ${lang === 'ar' ? 'ml-auto' : ''}`}>
                <div>
                  <label className={`block text-sm font-bold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("emailAddr")}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="email"
                      required
                      disabled={otpSent || otpVerified}
                      className={`flex-grow p-3.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none transition-all bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'} disabled:bg-gray-50 focus:border-[#1AA1C5]`}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    {!otpVerified && (
                      <button 
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || !formData.email}
                        className="px-4 py-2 bg-[#1AA1C5] text-white font-bold uppercase text-[10px] hover:bg-[#1589a8] transition-all tracking-widest disabled:bg-gray-400 whitespace-nowrap flex items-center justify-center min-w-[120px]"
                      >
                        {sendingOtp ? <Loader2 className="animate-spin" size={20} /> : (otpSent ? (lang === 'ar' ? 'إعادة الإرسال' : 'Resend') : t("sendOtp"))}
                      </button>
                    )}
                  </div>
                </div>

                {otpSent && !otpVerified && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className={`block text-sm font-bold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t("enterOtp")}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        required
                        maxLength={6}
                        className={`flex-grow p-3.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none transition-all bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'} focus:border-[#1AA1C5]`}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                      />
                      <button 
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp || otp.length < 6}
                        className="px-6 py-2 bg-[#222] text-white font-bold uppercase text-[10px] hover:bg-black transition-all tracking-widest disabled:bg-gray-400 min-w-[120px] flex items-center justify-center"
                      >
                        {verifyingOtp ? <Loader2 className="animate-spin" size={20} /> : t("verifyOtp")}
                      </button>
                    </div>
                    <p className={`mt-2 text-[10px] text-gray-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t("otpInstructions")}</p>
                  </div>
                )}

                {otpVerified && (
                  <div className={`p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded flex items-center ${lang === 'ar' ? 'flex-row-reverse' : ''} animate-in zoom-in-95`}>
                    <span className="mx-2">✓</span>
                    {t("otpVerified")}
                  </div>
                )}
              </div>

              <div className={`flex flex-wrap gap-4 pt-6 border-t border-gray-100 pt-10 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <button 
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  className="px-10 py-3 border-2 border-[#111111] font-bold uppercase text-xs hover:bg-gray-50 transition-all tracking-widest min-w-[140px]"
                >
                  {t("cancel")}
                </button>
                <button 
                  type="submit"
                  disabled={!otpVerified}
                  className="px-10 py-3 bg-[#1AA1C5] text-white font-bold uppercase text-xs hover:bg-[#1589a8] transition-all tracking-widest min-w-[140px] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("next")}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className={`border-b border-gray-200 pb-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <h2 className="text-xl font-bold text-[#333333]">{t("enterUserInfo")}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <div>
                  <label className={`block text-sm font-bold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("firstName")}
                  </label>
                  <input 
                    type="text"
                    required
                    className={`w-full p-3.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("lastName")}
                  </label>
                  <input 
                    type="text"
                    required
                    className={`w-full p-3.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("companyName")}
                  </label>
                  <input 
                    type="text"
                    required
                    className={`w-full p-3.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("phone")}
                  </label>
                  <input 
                    type="text"
                    required
                    className={`w-full p-3.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-bold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("address")}
                  </label>
                  <textarea 
                    required
                    className={`w-full p-3.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none resize-none bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("password")}
                  </label>
                  <input 
                    type="password"
                    required
                    className={`w-full p-3.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("confirmPass")}
                  </label>
                  <input 
                    type="password"
                    required
                    className={`w-full p-3.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className={`flex flex-wrap gap-4 pt-10 border-t border-gray-100 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <button 
                  type="button"
                  onClick={handleBack}
                  className="px-10 py-3 border-2 border-black font-bold uppercase text-xs hover:bg-gray-50 transition-all tracking-widest min-w-[140px]"
                >
                  {t("back")}
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3 bg-[#1AA1C5] text-white font-bold uppercase text-xs hover:bg-[#1589a8] transition-all tracking-widest min-w-[200px] flex items-center justify-center shadow-lg"
                >
                  {loading && <Loader2 className="animate-spin mr-2" size={16} />}
                  {t("completeReg")}
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
