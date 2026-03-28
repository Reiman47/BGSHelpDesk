"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/components/LanguageContext";

export default function LoginPage() {
  const { t, lang, setLang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Reset fields on mount/reload with a small delay to override browser autofill
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmail("");
      setPassword("");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        const session: any = await getSession();
        const role = session?.user?.role;
        if (role === "ADMIN" || role === "SUPERADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center font-montserrat p-4 pt-10 pb-20 ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Login Card */}
      <div className="max-w-[550px] w-full bg-white shadow-xl overflow-hidden rounded-sm border border-gray-100">
        {/* Header with Logo */}
        <div className={`p-4 md:p-8 pb-6 flex flex-col md:flex-row md:items-end justify-between bg-white gap-4 ${lang === 'ar' ? 'md:flex-row-reverse' : ''}`}>
          <div className="flex justify-center md:justify-start w-full md:w-auto">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image 
                src="/logo.jpg" 
                alt="Barcode Gulf Solutions" 
                width={180} 
                height={60} 
                className="h-10 md:h-12 w-auto object-contain"
                priority
              />
            </Link>
          </div>
          <div className={`text-[#888888] text-[10px] mb-1 font-medium italic ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <button 
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="hover:text-[#1AA1C5] transition-colors uppercase tracking-tighter decoration-dotted underline underline-offset-4"
            >
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
            <span className="mx-2 text-gray-300">|</span>
            {lang === 'en' ? 'English - UK' : 'العربية - السعودية'}
          </div>
        </div>
        
        <hr className="border-gray-100" />

        <div className="p-8 md:p-12 pb-16">
          <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
            {error && (
              <div className={`bg-red-50 border-l-4 border-red-500 p-4 flex items-center space-x-3 mb-6 ${lang === 'ar' ? 'border-l-0 border-r space-x-reverse' : ''}`}>
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className={`block text-sm font-semibold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t("username")}
                </label>
                <input
                  type="email"
                  required
                  className={`w-full bg-white border border-gray-300 p-3 px-4 focus:outline-none focus:ring-1 focus:ring-bgs-teal transition-all text-sm text-[#444444] rounded-md ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold text-[#555555] mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t("password")}
                </label>
                <input
                  type="password"
                  required
                  className={`w-full bg-white border border-gray-300 p-3 px-4 focus:outline-none focus:ring-1 focus:ring-bgs-teal transition-all text-sm text-[#444444] rounded-md ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <p className={`text-[10px] text-[#999999] italic ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t("mandatory")}</p>

            <div className={`pt-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1AA1C5] hover:bg-[#1589a8] text-white px-12 py-2.5 font-bold transition-all shadow-md flex items-center justify-center min-w-[160px] text-sm rounded-sm"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : t("signIn")}
              </button>
            </div>
          </form>

          {/* Links Section */}
          <div className={`mt-12 space-y-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <p className="text-sm text-[#555555]">
              {t("noAccount")}{" "}
              <Link href="/auth/register" className="font-bold text-[#1AA1C5] hover:underline ml-1 uppercase tracking-tight text-xs">{t("registerNow")}</Link>
            </p>
            <p className="text-sm text-[#555555]">
              {t("forgotPassword")}{" "}
              <Link href="/auth/forgot-password" className="font-bold text-[#1AA1C5] hover:underline ml-1 uppercase tracking-tight text-xs">{t("resetPassword")}</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="max-w-[550px] w-full mt-10 text-center mb-10 px-4">
        <div className="flex justify-center text-[10px] font-bold text-[#1AA1C5]">
          <Link href="https://www.barcodegulf.com" className="hover:underline">BarcodeGulf.com</Link>
        </div>
      </div>
    </div>
  );
}
