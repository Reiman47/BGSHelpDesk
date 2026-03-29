"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  LogOut,
  Facebook, 
  Linkedin, 
  Instagram, 
  Phone, 
  Mail, 
} from "lucide-react";
import Image from "next/image";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide Navbar on Login/Register pages
  if (pathname?.startsWith("/auth/")) return null;

  const navLinks = [
    { name: t("aboutUs"), href: "https://www.barcodegulf.com/about/" },
    { name: t("supportPortal"), href: "/" },
    { name: t("knowledgeBase"), href: "https://www.barcodegulf.com/blogs/" },
    { name: t("contactUs"), href: "https://www.barcodegulf.com/contact-us/" },
  ];

  return (
    <nav
      dir="ltr"
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#222222]/95 shadow-md py-1.5" : "bg-[#222222] py-2.5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Left Side: Logo & Socials */}
          <div className="flex items-center">
            <Link href="/" className="bg-white p-2 rounded-md transition-transform hover:scale-105 shadow-sm">
              <Image 
                src="/logo.jpg" 
                alt="Barcode Gulf Solutions" 
                width={150} 
                height={50} 
                className="h-8 md:h-10 w-auto object-contain"
                priority
              />
            </Link>
            
            <div className="hidden lg:flex items-center ml-6 space-x-3">
              <Link href="https://www.facebook.com/Barcodegulfmiddleeast/" target="_blank" className="text-gray-400 hover:text-white transition-colors"><Facebook size={18} /></Link>
              <Link href="https://www.linkedin.com/company/barcode-gulf/" target="_blank" className="text-gray-400 hover:text-white transition-colors"><Linkedin size={18} /></Link>
              <Link href="https://www.instagram.com/barcode_gulf/#" target="_blank" className="text-gray-400 hover:text-white transition-colors"><Instagram size={18} /></Link>
              <Link href="https://x.com/GulfBarcode/" target="_blank" className="text-gray-400 hover:text-white transition-colors flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Desktop Menu - Center */}
          <div className="hidden xl:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                target={link.href.startsWith('http') ? '_blank' : undefined}
                className="flex items-center text-sm font-semibold text-white hover:text-bgs-teal transition-all group"
              >
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

        {/* Right Side: Contact & Auth */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Language Switcher */}
            <div className="flex items-center space-x-3 border-r border-[#444444] pr-4">
              <button 
                onClick={() => setLang('en')}
                className={`text-[10px] font-bold transition-colors hover:text-bgs-teal ${lang === 'en' ? 'text-bgs-teal' : 'text-gray-400'}`}
              >
                EN
              </button>
              <span className="text-gray-600 text-[10px]">/</span>
              <button 
                onClick={() => setLang('ar')}
                className={`text-[10px] font-bold transition-colors hover:text-bgs-teal ${lang === 'ar' ? 'text-bgs-teal' : 'text-gray-400'}`}
              >
                AR
              </button>
            </div>

            {session ? (
              <div className="flex items-center space-x-4">
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-white text-[11px] font-bold truncate max-w-[130px]">{session.user?.name ?? '—'}</span>
                  <span className="text-gray-400 text-[10px] truncate max-w-[130px]">{session.user?.email ?? ''}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="text-gray-400 hover:text-white transition-colors p-1 border-l border-[#444444] pl-4"
                  title={t("logout")}
                >
                   <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <a href="tel:+97143462244" className="flex items-center text-xs text-white hover:text-bgs-teal transition-colors font-medium">
                  <Phone size={14} className="mr-1.5 text-bgs-teal" />
                  <span>+971 4 346 2244</span>
                </a>
                <a href="mailto:support@barcodegulf.net" className="flex items-center text-xs text-white hover:text-bgs-teal transition-colors mt-1 font-medium">
                  <Mail size={14} className="mr-1.5 text-bgs-teal" />
                  <span>support@barcodegulf.net</span>
                </a>
              </div>
            )}

            {!session && (
              <div className="flex items-center border-[#444444] border-l pl-6 space-x-3">
                <Link 
                  href="/auth/login" 
                  className="mr-4 text-xs font-bold uppercase text-white hover:text-bgs-teal transition-colors"
                >
                  {t("signIn")}
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-bgs-teal text-white px-5 py-2 rounded shadow-md hover:bg-[#1589a8] transition-all text-xs font-bold uppercase tracking-widest"
                >
                  {t("register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="xl:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`xl:hidden bg-[#222222] border-t border-[#444444] absolute top-full left-0 w-full p-6 flex flex-col space-y-4 shadow-2xl overflow-y-auto max-h-[80vh] ${lang === 'ar' ? 'text-right dir-rtl font-arabic' : 'text-left'}`}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`text-lg font-bold uppercase text-white hover:text-bgs-teal border-b border-[#444444] pb-2 flex items-center ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {session ? (
            <div className={`flex flex-col pt-4 pb-4 border-b border-[#444444] ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <span className="text-white text-sm font-bold truncate">{session.user?.name ?? '—'}</span>
                  <span className="text-gray-400 text-xs truncate">{session.user?.email ?? ''}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="text-gray-400 hover:text-white p-2 border border-[#444444] rounded"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 pt-4">
              <Link 
                href="/auth/login" 
                className="border border-gray-600 text-white text-center py-3 rounded font-bold uppercase tracking-wider"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {lang === 'ar' ? "تسجيل الدخول" : "Login"}
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-bgs-teal text-white text-center py-3 rounded font-bold uppercase tracking-wider shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {lang === 'ar' ? "إنشاء حساب" : "Register"}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
