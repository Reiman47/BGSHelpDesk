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

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        setError(lang === 'ar' ? 'يرجى إدخال عنوان بريد إلكتروني صالح.' : "Please enter a valid email address.");
        return;
      }
      
      setSendingOtp(true);
      setError("");
      try {
        await axios.post("/api/auth/send-registration-otp", { email: formData.email });
        setOtpSent(true);
        setStep(2);
        window.scrollTo(0, 0);
      } catch (err: any) {
        setError(err.response?.data?.message || (lang === 'ar' ? 'فشل إرسال الرمز.' : "Failed to send code."));
      } finally {
        setSendingOtp(false);
      }
    } else if (step === 2) {
      if (!otp || otp.length < 6) {
        setError(lang === 'ar' ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام.' : "Please enter 6-digit verification code.");
        return;
      }
      setVerifyingOtp(true);
      setError("");
      try {
        await axios.post("/api/auth/verify-registration-otp", { email: formData.email, otp });
        setOtpVerified(true);
        setStep(3);
        window.scrollTo(0, 0);
      } catch (err: any) {
        setError(err.response?.data?.message || (lang === 'ar' ? 'رمز غير صالح.' : "Invalid code."));
      } finally {
        setVerifyingOtp(false);
      }
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email) return;
    setSendingOtp(true);
    setError("");
    try {
      await axios.post("/api/auth/send-registration-otp", { email: formData.email });
      setOtpSent(true);
      // Optional: show a small success message for resend
    } catch (err: any) {
      setError(err.response?.data?.message || (lang === 'ar' ? 'فشل إرسال الرمز.' : "Failed to send code."));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
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
      <header className={`w-full bg-white p-4 md:p-6 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center shadow-sm border-b border-gray-100 gap-4 ${lang === 'ar' ? 'md:flex-row-reverse' : ''}`}>
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image 
            src="/logo.jpg" 
            alt="Barcode Gulf" 
            width={180} 
            height={60} 
            className="h-8 md:h-10 w-auto object-contain"
            priority
          />
        </Link>
        <div className={`text-[10px] italic text-gray-400 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
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

      <main className="max-w-[1000px] w-full mt-8 p-4 flex-grow flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#111111]">
          {step === 2 ? t("verifyStepTitle") : t("registerPortal")}
        </h1>

        {/* Zebra Stepper */}
        <div className={`flex items-center justify-center mb-16 relative w-full max-w-4xl px-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center w-full justify-between relative capitalize">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? (step > 1 ? 'bg-green-500 border-green-500' : 'bg-black border-black') : 'bg-white border-gray-300'} text-white font-bold text-sm transition-all`}>
                {step > 1 ? "✓" : "1"}
              </div>
              <span className={`absolute -bottom-7 text-[10px] md:text-[11px] font-bold tracking-tight whitespace-nowrap ${step === 1 ? 'text-red-600' : 'text-gray-600'}`}>
                {t("step1Step")} <span className="text-red-600">*</span>
              </span>
            </div>

            {/* Line 1-2 */}
            <div className={`flex-grow h-[2px] mx-2 transition-all ${step > 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? (step > 2 ? 'bg-green-500 border-green-500' : 'bg-black border-black') : 'bg-white border-gray-300'} text-white font-bold text-sm transition-all`}>
                {step > 2 ? "✓" : "2"}
              </div>
              <span className={`absolute -bottom-7 text-[10px] md:text-[11px] font-bold tracking-tight whitespace-nowrap ${step === 2 ? 'text-red-600' : 'text-gray-600'}`}>
                {t("step2Step")} <span className="text-red-600">*</span>
              </span>
            </div>

            {/* Line 2-3 */}
            <div className={`flex-grow h-[2px] mx-2 transition-all ${step > 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'bg-black border-black' : 'bg-white border-gray-300'} text-white font-bold text-sm transition-all`}>
                3
              </div>
              <span className={`absolute -bottom-7 text-[10px] md:text-[11px] font-bold tracking-tight whitespace-nowrap ${step === 3 ? 'text-red-600' : 'text-gray-600'}`}>
                {t("step3Step")} <span className="text-red-600">*</span>
              </span>
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

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-8 max-w-lg mx-auto">
              <div className={`space-y-6 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <h2 className="text-2xl font-bold text-[#111111]">{t("registerEmail")}</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#111111] mb-2 uppercase">
                      {t("emailAddr")}
                    </label>
                    <input 
                      type="email"
                      required
                      className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none transition-all bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t("emailNote")}
                  </p>

                  <p className="text-sm text-gray-800 font-medium">
                    {t("emailIdNote")}
                  </p>
                </div>
              </div>

              <div className={`flex flex-col md:flex-row gap-4 pt-10 border-t border-gray-100 ${lang === 'ar' ? 'md:flex-row-reverse' : ''}`}>
                <button 
                  type="submit"
                  disabled={sendingOtp}
                  className="w-full md:w-auto px-12 py-3 bg-[#1AA1C5] text-white font-bold uppercase text-sm hover:bg-[#1589a8] transition-all flex items-center justify-center rounded-md min-w-[140px] shadow-sm"
                >
                  {sendingOtp && <Loader2 className="animate-spin mr-2" size={18} />}
                  {t("next")}
                </button>
                <button 
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  className="w-full md:w-auto px-12 py-3 border border-gray-300 bg-white text-black font-bold uppercase text-sm hover:bg-gray-50 transition-all rounded-md min-w-[140px] shadow-sm"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-8 max-w-2xl mx-auto text-center">
              <div className={`space-y-6 ${lang === 'ar' ? 'text-right' : 'text-center'}`}>
                <p className="text-sm text-gray-700 max-w-xl mx-auto">
                  {t("otpSentSuccess")}
                </p>
                
                <p className="text-sm text-gray-700">
                  {t("resendNote")} 
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    disabled={sendingOtp}
                    className="text-blue-600 hover:underline font-bold"
                  >
                    {t("resendLink")}
                  </button>
                </p>

                <div className="max-w-md mx-auto space-y-4">
                  <label className="block text-sm font-bold text-[#111111] mb-2 uppercase">
                    {t("enterVerificationCode")} <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    maxLength={6}
                    className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none transition-all bg-white text-sm text-center font-bold tracking-widest`}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 pt-10 border-t border-gray-100">
                <div className={`flex flex-col md:flex-row gap-4 w-full justify-center ${lang === 'ar' ? 'md:flex-row-reverse' : ''}`}>
                  <button 
                    type="submit"
                    disabled={verifyingOtp}
                    className="w-full md:w-auto px-12 py-3 bg-[#1AA1C5] text-white font-bold uppercase text-sm hover:bg-[#1589a8] transition-all flex items-center justify-center rounded-md min-w-[140px] shadow-sm"
                  >
                    {verifyingOtp && <Loader2 className="animate-spin mr-2" size={18} />}
                    {t("next")}
                  </button>
                  <button 
                    type="button"
                    onClick={() => router.push("/auth/login")}
                    className="w-full md:w-auto px-12 py-3 border border-gray-300 bg-white text-black font-bold uppercase text-sm hover:bg-gray-50 transition-all rounded-md min-w-[140px] shadow-sm"
                  >
                    {t("cancel")}
                  </button>
                </div>

                <button 
                  type="button" 
                  onClick={handleBack}
                  className="text-[#1AA1C5] hover:underline font-bold text-sm"
                >
                  {t("returnStep")}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className={`border-b border-gray-200 pb-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <h2 className="text-xl font-bold text-[#111111]">{t("enterUserInfo")}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                {/* ... existing fields ... */}
                <div>
                  <label className={`block text-sm font-bold text-[#111111] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("firstName")}
                  </label>
                <input 
                  type="text"
                  required
                  className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
                </div>
                <div>
                  <label className={`block text-sm font-bold text-[#111111] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("lastName")}
                  </label>
                  <input 
                    type="text"
                    required
                    className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold text-[#111111] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("companyName")}
                  </label>
                  <input 
                    type="text"
                    required
                    className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold text-[#111111] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("phone")}
                  </label>
                  <input 
                    type="text"
                    required
                    className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-bold text-[#111111] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("address")}
                  </label>
                  <textarea 
                    required
                    className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none resize-none bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold text-[#111111] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("password")}
                  </label>
                  <input 
                    type="password"
                    required
                    className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold text-[#111111] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t("confirmPass")}
                  </label>
                  <input 
                    type="password"
                    required
                    className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1AA1C5] outline-none bg-white text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className={`flex flex-col md:flex-row gap-4 pt-10 border-t border-gray-100 ${lang === 'ar' ? 'md:flex-row-reverse' : ''}`}>
                <button 
                  type="button"
                  onClick={handleBack}
                  className="w-full md:w-auto px-12 py-3 border border-gray-300 bg-white text-black font-bold uppercase text-sm hover:bg-gray-50 transition-all rounded-md min-w-[140px] shadow-sm"
                >
                  {t("back")}
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-12 py-3 bg-[#1AA1C5] text-white font-bold uppercase text-sm hover:bg-[#1589a8] transition-all flex items-center justify-center rounded-md min-w-[200px] shadow-sm"
                >
                  {loading && <Loader2 className="animate-spin mr-2" size={18} />}
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
