"use client";

import {
  ChevronDown,
  Database,
  HardDrive,
  Menu,
  MessageSquare,
  Monitor,
  Server,
  Star,
  UserPlus,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getOptionalUser } from "@/lib/auth";
import {
  type DisplayCurrency,
  readDisplayCurrency,
  saveDisplayCurrency,
} from "@/lib/display-currency";

const roboto = { className: "[font-family:var(--font-roboto)]" };

export function Navbar({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [isVpsOpen, setIsVpsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [displayCurrency, setDisplayCurrency] =
    useState<DisplayCurrency>("BRL");
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setDisplayCurrency(readDisplayCurrency());
  }, []);

  useEffect(() => {
    let cancelled = false;
    getOptionalUser()
      .then(user => {
        if (!cancelled) setIsAuthed(!!user);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
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
    { href: "/#planos", name: "Planos" },
    { href: "/#testimonials", name: "Depoimentos" },
  ];

  const isLight = variant === "light";

  return (
    <header
      className={`fixed top-0 left-0 z-[500] w-full transition-all duration-500 ${isScrolled ? "pt-4" : "pt-4"}`}
      id="site-header"
    >
      <nav
        className={`mx-auto flex h-16 items-center justify-between transition-all duration-500 ${
          isScrolled
            ? `w-[min(1180px,calc(100%-2rem))] rounded-full border px-6 ${isLight ? "border-slate-200 bg-slate-50/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)]" : "border-white/15 bg-[#00050A]/80 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"} backdrop-blur-xl`
            : "w-full max-w-[1280px] rounded-none border border-transparent bg-transparent px-6 md:px-8"
        }`}
      >
        {/* Logo - Centered on mobile, Left on desktop */}
        <div className="flex flex-1 items-center justify-center md:flex-none md:justify-start">
          <Link className="flex min-w-0 shrink-0 items-center" href="/">
            <div
              className={`relative h-[33px] w-[130px] transition-all md:h-[37px] md:w-[145px] lg:h-[45px] lg:w-[180px] ${isLight ? "brightness-0 filter" : "brightness-0 invert filter"}`}
            >
              <Image
                alt="Atlashost Logo"
                className="object-contain"
                fill
                priority
                src="/atlas-logo.png"
                unoptimized
              />
            </div>
          </Link>
        </div>

        {/* Nav Links - Centered (Desktop only) */}
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-4 md:flex lg:gap-8">
          {/* VPS dropdown */}
          <div
            className="group relative py-2"
            onMouseEnter={() => setIsVpsOpen(true)}
            onMouseLeave={() => setIsVpsOpen(false)}
          >
            <Link
              className={`${roboto.className} flex items-center gap-1.5 ${isLight ? "text-slate-700 hover:text-sky-500" : "text-white/90 hover:text-sky-400"} font-bold text-[13px] uppercase tracking-wide transition-colors lg:text-[16px]`}
              href="/vps"
            >
              VPS
              <ChevronDown
                className={`h-4 w-4 ${isLight ? "text-slate-400" : "text-white/40"} transition-transform duration-300 group-hover:rotate-180 group-hover:text-sky-400`}
                strokeWidth={2.5}
              />
            </Link>

            <AnimatePresence>
              {isVpsOpen && (
                <motion.div
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`absolute top-full left-0 mt-1 min-w-[280px] ${isLight ? "border-slate-200 bg-white shadow-xl" : "border-white/5 bg-[#00080D] shadow-[0_10px_30px_rgba(0,0,0,0.5)]"} overflow-hidden rounded-[6px] border`}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Link
                    className={`${roboto.className} block px-5 py-3 font-bold text-[15px] ${isLight ? "text-slate-600 hover:bg-slate-50" : "text-white/80 hover:bg-sky-400 hover:text-[#00050A]"} uppercase transition-all`}
                    href="/vps"
                  >
                    VPS em nuvem
                  </Link>
                  <Link
                    className={`${roboto.className} block px-5 py-3 font-bold text-[15px] ${isLight ? "border-slate-100 text-slate-600 hover:bg-slate-50" : "border-white/5 text-white/80 hover:bg-sky-400 hover:text-[#00050A]"} border-t uppercase transition-all`}
                    href="/vds"
                  >
                    Cloud VDS
                  </Link>
                  <Link
                    className={`${roboto.className} block px-5 py-3 font-bold text-[15px] ${isLight ? "border-slate-100 text-slate-600 hover:bg-slate-50" : "border-white/5 text-white/80 hover:bg-sky-400 hover:text-[#00050A]"} border-t uppercase transition-all`}
                    href="/vps-armazenamento"
                  >
                    VPS de armazenamento
                  </Link>
                  <Link
                    className={`${roboto.className} block px-5 py-3 font-bold text-[15px] ${isLight ? "border-slate-100 text-slate-600 hover:bg-slate-50" : "border-white/5 text-white/80 hover:bg-sky-400 hover:text-[#00050A]"} border-t uppercase transition-all`}
                    href="/vps-windows"
                  >
                    VPS Windows
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinks.map(link => (
            <Link
              className={`${roboto.className} ${isLight ? "text-slate-700 hover:text-sky-500" : "text-white/90 hover:text-sky-400"} font-bold text-[13px] uppercase tracking-wide transition-colors lg:text-[16px]`}
              href={link.href}
              key={link.name}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons (Desktop) + Hamburger (Mobile) */}
        <div className="flex flex-1 items-center justify-end gap-3 md:flex-none">
          <div className="hidden items-center gap-2 md:flex">
            {/* Currency dropdown disabled — BRL default only. <CurrencySelector value={displayCurrency} onChange={changeDisplayCurrency} isLight={isLight} /> */}
            {isAuthed ? (
              <Button
                asChild
                className={`${roboto.className} h-auto rounded-[10px] border border-white bg-transparent px-4 py-1.5 font-bold text-[12px] text-white uppercase tracking-widest transition-all duration-300 hover:bg-white/10 lg:px-8 lg:py-2 lg:text-[15px]`}
              >
                <Link href="/home">Voltar para Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  className={`${roboto.className} h-auto rounded-[10px] border border-white bg-transparent px-3 py-1.5 font-bold text-[12px] text-white uppercase tracking-widest transition-all duration-300 hover:bg-white/10 lg:px-6 lg:py-2 lg:text-[15px]`}
                >
                  <Link href="/signup">Cadastre-se</Link>
                </Button>
                <Button
                  asChild
                  className={`${roboto.className} h-auto rounded-[10px] border border-white bg-transparent px-4 py-1.5 font-bold text-[12px] text-white uppercase tracking-widest transition-all duration-300 hover:bg-white/10 lg:px-8 lg:py-2 lg:text-[15px]`}
                >
                  <Link href="/login">Login</Link>
                </Button>
              </>
            )}
          </div>

          {/* Hamburger Button */}
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-full border md:hidden ${isLight ? "border-slate-200 bg-white text-slate-700 shadow-sm" : "border-white/10 bg-white/5 text-white"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className={`fixed inset-0 z-[600] ${isLight ? "bg-slate-50/95" : "bg-[#00050A]/98"} flex flex-col backdrop-blur-2xl md:hidden`}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Background Decor */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
              <div className="absolute top-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-sky-500/20 blur-[120px]" />
              <div className="absolute bottom-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
            </div>

            <div className="relative z-10 flex h-full flex-col overflow-y-auto px-6 pt-24 pb-12">
              {/* Close button */}
              <button
                className={`absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border ${isLight ? "border-slate-200 bg-white shadow-sm" : "border-white/10 bg-white/5"} text-white transition-transform active:scale-90`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X
                  className={`h-6 w-6 ${isLight ? "text-slate-800" : "text-white"}`}
                />
              </button>

              <div className="mx-auto flex w-full max-w-sm flex-col gap-10">
                {/* Main Services */}
                <div className="space-y-2">
                  <p className="mb-4 px-2 font-black text-[13px] text-sky-400 uppercase tracking-[0.2em]">
                    Nossos Serviços
                  </p>
                  {[
                    { href: "/vps", icon: Server, name: "VPS em Nuvem" },
                    { href: "/vds", icon: Database, name: "Cloud VDS" },
                    {
                      href: "/vps-armazenamento",
                      icon: HardDrive,
                      name: "Armazenamento",
                    },
                    {
                      href: "/vps-windows",
                      icon: Monitor,
                      name: "Windows VPS",
                    },
                  ].map((item, i) => (
                    <motion.div
                      animate={{ opacity: 1, x: 0 }}
                      initial={{ opacity: 0, x: -20 }}
                      key={item.name}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        className={`group flex items-center gap-4 rounded-2xl p-4 transition-all ${isLight ? "border border-transparent shadow-sm hover:border-slate-100 hover:bg-white" : "border border-transparent hover:border-white/5 hover:bg-white/5"}`}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${isLight ? "bg-slate-100 text-slate-700" : "bg-white/5 text-white group-hover:bg-sky-500/20 group-hover:text-sky-400"}`}
                        >
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span
                          className={`${roboto.className} font-bold text-[18px] ${isLight ? "text-slate-800" : "text-white"} transition-colors`}
                        >
                          {item.name}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Currency dropdown disabled — BRL default only.
                <div className="space-y-2">
                  <p className="text-[13px] font-black uppercase tracking-[0.2em] text-sky-400 mb-4 px-2">Moeda</p>
                  <CurrencySelector value={displayCurrency} onChange={changeDisplayCurrency} isLight={isLight} variant="inline" />
                </div>
                */}

                {/* Secondary Links */}
                <div className="space-y-1">
                  <p className="mb-4 px-2 font-black text-[13px] text-sky-400 uppercase tracking-[0.2em]">
                    Atlas Hosting
                  </p>
                  {[
                    { href: "/#planos", icon: Star, name: "Nossos Planos" },
                    {
                      href: "/#testimonials",
                      icon: MessageSquare,
                      name: "Depoimentos",
                    },
                  ].map((item, i) => (
                    <motion.div
                      animate={{ opacity: 1, x: 0 }}
                      initial={{ opacity: 0, x: -20 }}
                      key={item.name}
                      transition={{ delay: 0.2 + i * 0.05 }}
                    >
                      <Link
                        className={`flex items-center gap-4 rounded-xl p-3 transition-all ${isLight ? "hover:bg-white" : "hover:bg-white/5"} text-muted-foreground hover:text-sky-400`}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-4 w-4 opacity-50" />
                        <span
                          className={`${roboto.className} font-bold text-[15px] uppercase tracking-widest`}
                        >
                          {item.name}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Auth Buttons */}
                <div className="mt-4 flex flex-col gap-4">
                  {isAuthed ? (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 20 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        asChild
                        className={`${roboto.className} group h-auto w-full rounded-[16px] bg-[#00A3FF] py-7 font-extrabold text-lg text-white uppercase tracking-wide shadow-[0_12px_30px_rgba(0,163,255,0.25)] transition-all hover:bg-[#0091E6]`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link
                          className="flex items-center justify-center gap-3"
                          href="/home"
                        >
                          <UserPlus className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                          Voltar para Dashboard
                        </Link>
                      </Button>
                    </motion.div>
                  ) : (
                    <>
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button
                          asChild
                          className={`${roboto.className} group h-auto w-full rounded-[16px] bg-[#00A3FF] py-7 font-extrabold text-lg text-white uppercase tracking-wide shadow-[0_12px_30px_rgba(0,163,255,0.25)] transition-all hover:bg-[#0091E6]`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Link
                            className="flex items-center justify-center gap-3"
                            href="/signup"
                          >
                            <UserPlus className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            Começar Agora
                          </Link>
                        </Button>
                      </motion.div>

                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Button
                          asChild
                          className={`${roboto.className} w-full border-2 bg-transparent ${isLight ? "border-slate-200 text-slate-700" : "border-white/10 text-white"} h-auto rounded-[16px] py-7 text-lg uppercase tracking-wide transition-all hover:border-sky-400`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Link
                            className="flex items-center justify-center gap-3"
                            href="/signup"
                          >
                            <UserPlus className="h-5 w-5 opacity-40" />
                            Criar Conta
                          </Link>
                        </Button>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
