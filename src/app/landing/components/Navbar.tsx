"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const rajdhani = { className: "[font-family:var(--font-rajdhani)]" };

export function Navbar() {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isVpsOpen, setIsVpsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { name: "Projetos", href: "/#projetos" },
    { name: "Depoimentos", href: "/#testimonials" },
    { name: "FAQ", href: "/#faq" },
  ];

  return (
    <header
      id="site-header"
      className={`fixed top-0 left-0 w-full z-[500] transition-all duration-500 ${isScrolled ? "pt-4" : "pt-0"}`}
    >
      <nav
        className={`mx-auto h-16 transition-all duration-500 flex items-center justify-between ${isScrolled
            ? "w-[min(1180px,calc(100%-2rem))] px-6 rounded-full border border-white/15 bg-[#0a1026]/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
            : "w-full max-w-[1280px] px-6 md:px-8 rounded-none border border-transparent bg-transparent"
          }`}
      >
        {/* Logo - Centered on mobile, Left on desktop */}
        <div className="flex-1 flex md:flex-none items-center justify-center md:justify-start">
          <Link href="/" className="flex items-center shrink-0 min-w-0">
            <div className="relative w-[150px] md:w-[180px] h-[38px] md:h-[45px]">
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
        <div className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-10 min-w-0">
          {/* Menu Item with Sub-menu */}
          <div 
            className="relative group py-2"
            onMouseEnter={() => setIsHowItWorksOpen(true)}
            onMouseLeave={() => setIsHowItWorksOpen(false)}
          >
            <Link
              href="/#servicos"
              className={`${rajdhani.className} flex items-center gap-1.5 text-white/90 group-hover:text-[#01FC8D] transition-colors text-[14px] lg:text-[15px] font-bold tracking-wide uppercase`}
            >
              Serviços
              <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-[#01FC8D] transition-transform duration-300 group-hover:rotate-180" strokeWidth={2.5} />
            </Link>
            
            <AnimatePresence>
              {isHowItWorksOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-0 mt-1 min-w-[180px] bg-[#11172f] border border-white/5 rounded-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  <Link
                    href="/#servicos"
                    className={`${rajdhani.className} block px-5 py-3 text-[13px] font-bold text-white/80 hover:text-[#0a0e27] hover:bg-[#01FC8D] transition-all uppercase`}
                  >
                    Serviços
                  </Link>
                  <Link
                    href="/#beneficios"
                    className={`${rajdhani.className} block px-5 py-3 text-[13px] font-bold text-white/80 hover:text-[#0a0e27] hover:bg-[#01FC8D] transition-all uppercase border-t border-white/5`}
                  >
                    Benefícios
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* VPS dropdown */}
          <div
            className="relative group py-2"
            onMouseEnter={() => setIsVpsOpen(true)}
            onMouseLeave={() => setIsVpsOpen(false)}
          >
            <Link
              href="/vps"
              className={`${rajdhani.className} flex items-center gap-1.5 text-white/90 group-hover:text-[#01FC8D] transition-colors text-[14px] lg:text-[15px] font-bold tracking-wide uppercase`}
            >
              VPS
              <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-[#01FC8D] transition-transform duration-300 group-hover:rotate-180" strokeWidth={2.5} />
            </Link>

            <AnimatePresence>
              {isVpsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-0 mt-1 min-w-[280px] bg-[#11172f] border border-white/5 rounded-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  <Link href="/vps" className={`${rajdhani.className} block px-5 py-3 text-[13px] font-bold text-white/80 hover:text-[#0a0e27] hover:bg-[#01FC8D] transition-all uppercase`}>VPS em nuvem</Link>
                  <Link href="/vds" className={`${rajdhani.className} block px-5 py-3 text-[13px] font-bold text-white/80 hover:text-[#0a0e27] hover:bg-[#01FC8D] transition-all uppercase border-t border-white/5`}>Cloud VDS</Link>
                  <Link href="/vps-armazenamento" className={`${rajdhani.className} block px-5 py-3 text-[13px] font-bold text-white/80 hover:text-[#0a0e27] hover:bg-[#01FC8D] transition-all uppercase border-t border-white/5`}>VPS de armazenamento</Link>
                  <Link href="/vps-windows" className={`${rajdhani.className} block px-5 py-3 text-[13px] font-bold text-white/80 hover:text-[#0a0e27] hover:bg-[#01FC8D] transition-all uppercase border-t border-white/5`}>VPS Windows</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className={`${rajdhani.className} text-white/90 hover:text-[#01FC8D] transition-colors text-[14px] lg:text-[15px] font-bold tracking-wide uppercase`}>
              {link.name}
            </Link>
          ))}
        </div>
        
        {/* Auth Buttons (Desktop) + Hamburger (Mobile) */}
        <div className="flex-1 md:flex-none flex items-center justify-end gap-3">
          <div className="hidden md:flex items-center gap-3">
            <Button
              className={`${rajdhani.className} bg-transparent border border-white/30 hover:border-white/50 hover:bg-white/10 text-white font-bold px-5 py-2 h-auto text-[13px] rounded-full transition-all duration-300 tracking-wide uppercase`}
              asChild
            >
              <Link href="/signup">Cadastre-se</Link>
            </Button>
            <Button
              className={`${rajdhani.className} bg-white hover:bg-white/90 text-[#0b112a] font-extrabold px-6 py-2 h-auto text-[13px] rounded-full transition-all duration-300 shadow-[0_8px_26px_rgba(255,255,255,0.2)] tracking-wide uppercase`}
              asChild
            >
              <Link href="/login">Começar</Link>
            </Button>
          </div>

          {/* Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:hidden items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[600] bg-[#0a0e27]/98 backdrop-blur-xl flex flex-col items-center justify-center p-6 md:hidden"
          >
            {/* Close button inside the menu for better usability */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Mobile Nav Links - Centered */}
            <div className="flex flex-col items-center gap-8 w-full max-w-xs">
              <div className="flex flex-col items-center gap-4 w-full">
                <Link
                  href="/vps"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${rajdhani.className} text-3xl font-bold text-white hover:text-[#01FC8D] transition-colors uppercase tracking-wider`}
                >
                  VPS em Nuvem
                </Link>
                <Link
                  href="/vds"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${rajdhani.className} text-3xl font-bold text-white hover:text-[#01FC8D] transition-colors uppercase tracking-wider`}
                >
                  Cloud VDS
                </Link>
                <Link
                  href="/vps-armazenamento"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${rajdhani.className} text-3xl font-bold text-white hover:text-[#01FC8D] transition-colors uppercase tracking-wider`}
                >
                  Armazenamento
                </Link>
                <Link
                  href="/vps-windows"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${rajdhani.className} text-3xl font-bold text-white hover:text-[#01FC8D] transition-colors uppercase tracking-wider`}
                >
                  Windows
                </Link>
              </div>

              <div className="w-12 h-px bg-white/20" />

              <div className="flex flex-col items-center gap-5">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${rajdhani.className} text-xl font-bold text-white/60 hover:text-[#01FC8D] transition-colors uppercase tracking-widest`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Auth Buttons - Centered */}
            <div className="mt-12 flex flex-col gap-4 w-full max-w-xs">
              <Button
                className={`${rajdhani.className} w-full bg-[#01FC8D] hover:bg-[#01FC8D]/90 text-black font-extrabold py-6 h-auto text-lg rounded-xl transition-all shadow-[0_8px_26px_rgba(1,252,141,0.2)] tracking-wide uppercase`}
                asChild
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href="/login">Começar Agora</Link>
              </Button>
              <Button
                className={`${rajdhani.className} w-full bg-transparent border-2 border-white/20 hover:border-white/40 text-white font-bold py-6 h-auto text-lg rounded-xl transition-all tracking-wide uppercase`}
                asChild
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href="/signup">Criar Conta</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

