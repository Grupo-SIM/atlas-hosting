"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rajdhani } from "next/font/google";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const rajdhani = Rajdhani({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export function Navbar() {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  return (
    <header id="site-header" className="fixed top-0 w-full z-[100] bg-[#0a0e27]/90 backdrop-blur-md border-b border-white/5 py-4 lg:py-1">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <div className="relative w-[180px] h-[45px]">
            <Image 
              src="http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/2025/04/IMG_5796.png"
              alt="Atlashost Logo"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </Link>
        
        {/* Nav Links - Centered */}
        <div className="hidden md:flex items-center gap-6 lg:gap-10 absolute left-1/2 -translate-x-1/2">
          {/* Menu Item with Sub-menu */}
          <div 
            className="relative group py-2"
            onMouseEnter={() => setIsHowItWorksOpen(true)}
            onMouseLeave={() => setIsHowItWorksOpen(false)}
          >
            <a 
              href="#comofunciona" 
              className={`${rajdhani.className} flex items-center gap-1.5 text-white/90 group-hover:text-[#01FC8D] transition-colors text-[14px] lg:text-[15px] font-bold tracking-wide uppercase`}
            >
              Como Funciona
              <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-[#01FC8D] transition-transform duration-300 group-hover:rotate-180" strokeWidth={2.5} />
            </a>
            
            {/* Dropdown Menu */}
            <AnimatePresence>
              {isHowItWorksOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-0 mt-1 min-w-[180px] bg-[#11172f] border border-white/5 rounded-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  <a 
                    href="#servicos" 
                    className={`${rajdhani.className} block px-5 py-3 text-[13px] font-bold text-white/80 hover:text-[#0a0e27] hover:bg-[#01FC8D] transition-all uppercase`}
                  >
                    Serviços
                  </a>
                  <a 
                    href="#beneficios" 
                    className={`${rajdhani.className} block px-5 py-3 text-[13px] font-bold text-white/80 hover:text-[#0a0e27] hover:bg-[#01FC8D] transition-all uppercase border-t border-white/5`}
                  >
                    Benefícios
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a href="#planos" className={`${rajdhani.className} text-white/90 hover:text-[#01FC8D] transition-colors text-[14px] lg:text-[15px] font-bold tracking-wide uppercase`}>
            Planos
          </a>
          <a href="#projetos" className={`${rajdhani.className} text-white/90 hover:text-[#01FC8D] transition-colors text-[14px] lg:text-[15px] font-bold tracking-wide uppercase`}>
            Projetos
          </a>
          <a href="#blog" className={`${rajdhani.className} text-white/90 hover:text-[#01FC8D] transition-colors text-[14px] lg:text-[15px] font-bold tracking-wide uppercase`}>
            Blog
          </a>
          <a href="#faq" className={`${rajdhani.className} text-white/90 hover:text-[#01FC8D] transition-colors text-[14px] lg:text-[15px] font-bold tracking-wide uppercase`}>
            FAQ
          </a>
        </div>
        
        {/* Auth Button */}
        <div className="shrink-0">
          <Button 
            className={`${rajdhani.className} bg-[#01FC8D] hover:bg-[#01fc8d]/90 text-black font-extrabold px-8 py-5 text-[14px] rounded-[6px] transition-all duration-300 shadow-[0_0_20px_rgba(1,252,141,0.15)] hover:shadow-[0_0_30px_rgba(1,252,141,0.3)] tracking-wider`} 
            asChild
          >
            <Link href="/login">LOGIN</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

