"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X, Server, Database, HardDrive, Monitor, UserPlus, LogIn, Star, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { readDisplayCurrency, saveDisplayCurrency, type DisplayCurrency } from "@/lib/display-currency";
import { CurrencySelector } from "./CurrencySelector";

const roboto = { className: "[font-family:var(--font-roboto)]" };

export function Navbar({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [isVpsOpen, setIsVpsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>("BRL");

  useEffect(() => {
    setDisplayCurrency(readDisplayCurrency());
  }, []);

  const changeDisplayCurrency = (currency: DisplayCurrency) => {
    setDisplayCurrency(currency);
    saveDisplayCurrency(currency);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "Planos", href: "/#planos" },
    { name: "Depoimentos", href: "/#testimonials" },
  ];

  const isLight = variant === "light";

  return (
    <header
      id="site-header"
      className={`fixed top-0 left-0 w-full z-[500] transition-all duration-500 ${isScrolled ? "pt-4" : "pt-4"}`}
    >
      <nav
        className={`mx-auto h-16 transition-all duration-500 flex items-center justify-between ${isScrolled
          ? `w-[min(1180px,calc(100%-2rem))] px-6 rounded-full border ${isLight ? "border-slate-200 bg-slate-50/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)]" : "border-white/15 bg-[#00050A]/80 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"} backdrop-blur-xl`
          : `w-full max-w-[1280px] px-6 md:px-8 rounded-none border border-transparent bg-transparent`
          }`}
      >
        {/* Logo - Centered on mobile, Left on desktop */}
        <div className="flex-1 flex md:flex-none items-center justify-center md:justify-start">
          <Link href="/" className="flex items-center shrink-0 min-w-0">
            <div className={`relative w-[130px] md:w-[145px] lg:w-[180px] h-[33px] md:h-[37px] lg:h-[45px] transition-all ${isLight ? "filter brightness-0" : "filter brightness-0 invert"}`}>
              <Image
                src="/atlas-logo.png"
                alt="Atlashost Logo"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
          </Link>
        </div>

        {/* Nav Links - Centered (Desktop only) */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-4 lg:gap-8 min-w-0">
          {/* VPS dropdown */}
          <div
            className="relative group py-2"
            onMouseEnter={() => setIsVpsOpen(true)}
            onMouseLeave={() => setIsVpsOpen(false)}
          >
            <Link
              href="/vps"
              className={`${roboto.className} flex items-center gap-1.5 ${isLight ? "text-slate-700 hover:text-sky-500" : "text-white/90 hover:text-sky-400"} transition-colors text-[13px] lg:text-[16px] font-bold tracking-wide uppercase`}
            >
              VPS
              <ChevronDown className={`w-4 h-4 ${isLight ? "text-slate-400" : "text-white/40"} group-hover:text-sky-400 transition-transform duration-300 group-hover:rotate-180`} strokeWidth={2.5} />
            </Link>

            <AnimatePresence>
              {isVpsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`absolute top-full left-0 mt-1 min-w-[280px] ${isLight ? "bg-white border-slate-200 shadow-xl" : "bg-[#00080D] border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"} border rounded-[6px] overflow-hidden`}
                >
                  <Link href="/vps" className={`${roboto.className} block px-5 py-3 text-[15px] font-bold ${isLight ? "text-slate-600 hover:bg-slate-50" : "text-white/80 hover:text-[#00050A] hover:bg-sky-400"} transition-all uppercase`}>VPS em nuvem</Link>
                  <Link href="/vds" className={`${roboto.className} block px-5 py-3 text-[15px] font-bold ${isLight ? "text-slate-600 hover:bg-slate-50 border-slate-100" : "text-white/80 hover:text-[#00050A] hover:bg-sky-400 border-white/5"} transition-all uppercase border-t`}>Cloud VDS</Link>
                  <Link href="/vps-armazenamento" className={`${roboto.className} block px-5 py-3 text-[15px] font-bold ${isLight ? "text-slate-600 hover:bg-slate-50 border-slate-100" : "text-white/80 hover:text-[#00050A] hover:bg-sky-400 border-white/5"} transition-all uppercase border-t`}>VPS de armazenamento</Link>
                  <Link href="/vps-windows" className={`${roboto.className} block px-5 py-3 text-[15px] font-bold ${isLight ? "text-slate-600 hover:bg-slate-50 border-slate-100" : "text-white/80 hover:text-[#00050A] hover:bg-sky-400 border-white/5"} transition-all uppercase border-t`}>VPS Windows</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className={`${roboto.className} ${isLight ? "text-slate-700 hover:text-sky-500" : "text-white/90 hover:text-sky-400"} transition-colors text-[13px] lg:text-[16px] font-bold tracking-wide uppercase`}>
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons (Desktop) + Hamburger (Mobile) */}
        <div className="flex-1 md:flex-none flex items-center justify-end gap-3">
          <div className="hidden md:flex items-center gap-2">
            <CurrencySelector value={displayCurrency} onChange={changeDisplayCurrency} isLight={isLight} />
            <Button
              className={`${roboto.className} bg-transparent border border-white text-white font-bold px-3 lg:px-6 py-1.5 lg:py-2 h-auto text-[12px] lg:text-[15px] rounded-[10px] transition-all duration-300 tracking-widest uppercase hover:bg-white/10`}
              asChild
            >
              <Link href="/signup">Cadastre-se</Link>
            </Button>
            <Button
              className={`${roboto.className} bg-transparent border border-white text-white font-bold px-4 lg:px-8 py-1.5 lg:py-2 h-auto text-[12px] lg:text-[15px] rounded-[10px] transition-all duration-300 tracking-widest uppercase hover:bg-white/10`}
              asChild
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>

          {/* Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`flex md:hidden items-center justify-center w-10 h-10 rounded-full border ${isLight ? "border-slate-200 bg-white text-slate-700 shadow-sm" : "border-white/10 bg-white/5 text-white"}`}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-[600] ${isLight ? "bg-slate-50/95" : "bg-[#00050A]/98"} backdrop-blur-2xl flex flex-col md:hidden`}
          >
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
              <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-500/20 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col h-full overflow-y-auto pt-24 pb-12 px-6">
              {/* Close button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className={`absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full border ${isLight ? "border-slate-200 bg-white shadow-sm" : "border-white/10 bg-white/5"} text-white transition-transform active:scale-90`}
              >
                <X className={`w-6 h-6 ${isLight ? "text-slate-800" : "text-white"}`} />
              </button>

              <div className="flex flex-col gap-10 w-full max-w-sm mx-auto">
                {/* Main Services */}
                <div className="space-y-2">
                  <p className="text-[13px] font-black uppercase tracking-[0.2em] text-sky-400 mb-4 px-2">Nossos Serviços</p>
                  {[
                    { name: "VPS em Nuvem", href: "/vps", icon: Server },
                    { name: "Cloud VDS", href: "/vds", icon: Database },
                    { name: "Armazenamento", href: "/vps-armazenamento", icon: HardDrive },
                    { name: "Windows VPS", href: "/vps-windows", icon: Monitor },
                  ].map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center gap-4 p-4 rounded-2xl transition-all ${isLight ? "hover:bg-white shadow-sm border border-transparent hover:border-slate-100" : "hover:bg-white/5 border border-transparent hover:border-white/5"}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isLight ? "bg-slate-100 text-slate-700" : "bg-white/5 text-white group-hover:bg-sky-500/20 group-hover:text-sky-400"}`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className={`${roboto.className} text-[18px] font-bold ${isLight ? "text-slate-800" : "text-white"} transition-colors`}>
                          {item.name}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <p className="text-[13px] font-black uppercase tracking-[0.2em] text-sky-400 mb-4 px-2">Moeda</p>
                  <CurrencySelector value={displayCurrency} onChange={changeDisplayCurrency} isLight={isLight} variant="inline" />
                </div>

                {/* Secondary Links */}
                <div className="space-y-1">
                  <p className="text-[13px] font-black uppercase tracking-[0.2em] text-sky-400 mb-4 px-2">Atlas Hosting</p>
                  {[
                    { name: "Nossos Planos", href: "/#planos", icon: Star },
                    { name: "Depoimentos", href: "/#testimonials", icon: MessageSquare },
                  ].map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isLight ? "hover:bg-white" : "hover:bg-white/5"} text-muted-foreground hover:text-sky-400`}
                      >
                        <item.icon className="w-4 h-4 opacity-50" />
                        <span className={`${roboto.className} text-[15px] font-bold uppercase tracking-widest`}>
                          {item.name}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Auth Buttons */}
                <div className="flex flex-col gap-4 mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      className={`${roboto.className} w-full bg-[#00A3FF] hover:bg-[#0091E6] text-white font-extrabold py-7 h-auto text-lg rounded-[16px] transition-all shadow-[0_12px_30px_rgba(0,163,255,0.25)] tracking-wide uppercase group`}
                      asChild
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/signup" className="flex items-center justify-center gap-3">
                        <UserPlus className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        Começar Agora
                      </Link>
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      className={`${roboto.className} w-full bg-transparent border-2 ${isLight ? "border-slate-200 text-slate-700" : "border-white/10 text-white"} hover:border-sky-400 transition-all py-7 h-auto text-lg rounded-[16px] tracking-wide uppercase`}
                      asChild
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/signup" className="flex items-center justify-center gap-3">
                        <UserPlus className="w-5 h-5 opacity-40" />
                        Criar Conta
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

