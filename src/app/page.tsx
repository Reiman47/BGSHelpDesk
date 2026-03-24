"use client";

import Link from "next/link";
import { Ticket, Search, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function Home() {
  const { t, lang } = useLanguage();

  const features = [
    {
      title: t("realTimeTitle"),
      description: t("realTimeDesc"),
      icon: <Clock className="text-bgs-teal" size={32} />,
    },
    {
      title: t("securityTitle"),
      description: t("securityDesc"),
      icon: <ShieldCheck className="text-bgs-teal" size={32} />,
    },
    {
      title: t("knowledgeTitle"),
      description: t("knowledgeDesc"),
      icon: <Search className="text-bgs-teal" size={32} />,
    }
  ];

  return (
    <div className={`flex flex-col ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-bgs-navy overflow-hidden">
        {/* Abstract background elements */}
        <div className={`absolute top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} w-1/3 h-full bg-bgs-teal opacity-10 transform ${lang === 'ar' ? '-skew-x-12 -translate-x-1/2' : 'skew-x-12 translate-x-1/2'}`}></div>
        <div className={`absolute -bottom-24 ${lang === 'ar' ? '-right-24' : '-left-24'} w-96 h-96 bg-bgs-teal opacity-10 rounded-full blur-3xl`}></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 py-24">
          <div className={`max-w-3xl ${lang === 'ar' ? 'mr-0' : ''}`}>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight uppercase tracking-tight">
              {lang === 'ar' ? (
                <>
                  {t("heroTitle2")} <span className="text-bgs-teal">{t("heroTitle")}</span>
                </>
              ) : (
                <>
                  {t("heroTitle")} <span className="text-bgs-teal">Support</span> <br /> {t("heroTitle2")}
                </>
              )}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              {t("heroDesc")}
            </p>
            <div className={`flex flex-col sm:flex-row space-y-4 sm:space-y-0 ${lang === 'ar' ? 'sm:space-x-reverse sm:space-x-4' : 'sm:space-x-4'}`}>
              <Link href="/auth/register" className="btn-primary text-center text-lg py-4 px-10">
                {t("getStarted")}
              </Link>
              <Link href="/auth/login" className="btn-outline border-white text-white hover:bg-white hover:text-bgs-navy text-center text-lg py-4 px-10">
                {t("memberLogin")}
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-bgs-navy text-3xl md:text-4xl font-bold uppercase mb-4">{t("successDedicated")}</h2>
            <div className="w-20 h-1 bg-bgs-teal mx-auto mb-6"></div>
            <p className="text-gray-600">{t("successDesc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="card group hover:-translate-y-2 text-center md:text-left">
                <div className="mb-6 p-4 bg-gray-50 rounded-lg inline-block group-hover:bg-bgs-teal group-hover:bg-opacity-10 transition-colors mx-auto md:mx-0">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-bgs-navy mb-4 uppercase">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-bgs-teal mb-2">24/7</div>
              <p className="text-xs uppercase tracking-widest font-bold text-gray-500">{t("monitoring")}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-bgs-teal mb-2">15k+</div>
              <p className="text-xs uppercase tracking-widest font-bold text-gray-500">{t("ticketsResolved")}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-bgs-teal mb-2">99.9%</div>
              <p className="text-xs uppercase tracking-widest font-bold text-gray-500">{t("uptime")}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-bgs-teal mb-2">1h</div>
              <p className="text-xs uppercase tracking-widest font-bold text-gray-500">{t("avgResponse")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-bgs-teal text-white text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 uppercase">{t("ctaTitle")}</h2>
          <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto">{t("ctaDesc")}</p>
          <div className={`flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 ${lang === 'ar' ? 'sm:space-x-reverse sm:space-x-6' : 'sm:space-x-6'}`}>
            <Link href="/auth/register" className="bg-bgs-navy text-white px-10 py-4 rounded-md font-bold text-lg hover:bg-[#11223a] transition-all">
              {t("createAccount")}
            </Link>
            <Link href="mailto:sales@barcodegulf.net" className="border-2 border-white text-white px-10 py-4 rounded-md font-bold text-lg hover:bg-white hover:text-bgs-teal transition-all">
              {t("contactSales")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
