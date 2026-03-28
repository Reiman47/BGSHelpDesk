"use client";

import Link from "next/link";
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin, Instagram } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";

export default function Footer() {
  const pathname = usePathname();
  const { t, lang } = useLanguage();

  if (pathname?.startsWith("/auth/")) return null;

  return (
    <footer className={`bg-[#222222] text-gray-300 pt-8 pb-4 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          {/* Brand Info */}
          <div className={`${lang === 'ar' ? 'flex flex-col items-end' : ''}`}>
            <Link href="/" className="bg-white p-2 rounded-md inline-block mb-4 shadow-sm hover:scale-105 transition-transform">
              <Image 
                src="/logo.jpg" 
                alt="Barcode Gulf Solutions" 
                width={140} 
                height={45} 
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-xs leading-relaxed mb-4 text-gray-400">
              {t("footerDesc")}
            </p>
            <div className={`flex ${lang === 'ar' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <Link href="https://www.facebook.com/Barcodegulfmiddleeast/" target="_blank" className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#008BB1] transition-all text-white"><Facebook size={14} /></Link>
              <Link href="https://www.linkedin.com/company/barcode-gulf/" target="_blank" className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#008BB1] transition-all text-white"><Linkedin size={14} /></Link>
              <Link href="https://www.instagram.com/barcode_gulf/#" target="_blank" className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#008BB1] transition-all text-white"><Instagram size={14} /></Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className={`${lang === 'ar' ? 'flex flex-col items-end' : ''}`}>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4 border-b border-gray-700 pb-1 inline-block">
              {t("services")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#" className="hover:text-bgs-teal transition-colors">{t("realTimeTitle")}</Link></li>
              <li><Link href="https://www.barcodegulf.com/blogs/" target="_blank" className="hover:text-bgs-teal transition-colors">{t("knowledgeBase")}</Link></li>
            </ul>
          </div>

          {/* Business Verticals */}
          <div className={`${lang === 'ar' ? 'flex flex-col items-end' : ''}`}>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4 border-b border-gray-700 pb-1 inline-block">
              {t("solutions")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="https://www.barcodegulf.com/applications/asset-tracking/" target="_blank" className="hover:text-bgs-teal transition-colors">{t("assetTracking")}</Link></li>
              <li><Link href="https://www.barcodegulf.com/applications/inventory-tracking/" target="_blank" className="hover:text-bgs-teal transition-colors">{t("inventory")}</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className={`${lang === 'ar' ? 'flex flex-col items-end' : ''}`}>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4 border-b border-gray-700 pb-1 inline-block">
              {t("contactUs")}
            </h4>
            <ul className="space-y-3 text-xs">
              <li className={`flex items-center ${lang === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <MapPin className="text-bgs-teal shrink-0" size={14} />
                <span>{t("addressValue")}</span>
              </li>
              <li className={`flex items-center ${lang === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <Phone className="text-bgs-teal shrink-0" size={14} />
                <span dir="ltr">{t("phoneValue")}</span>
              </li>
              <li className={`flex items-center ${lang === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <Mail className="text-bgs-teal shrink-0" size={14} />
                <span>support@barcodegulf.net</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={`mt-8 pt-4 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-[10px] ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
          <p dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {t("allRightsReserved")}
          </p>
          <div className={`flex ${lang === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'} mt-2 md:mt-0 font-medium`}>
            <Link href="#" className="hover:text-white transition-colors">{t("privacyPolicy")}</Link>
            <Link href="#" className="hover:text-white transition-colors">{t("terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
