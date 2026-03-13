"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

import AtlasLogo from "@/assets/atlas.svg";

export function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/10 backdrop-blur-md bg-black/20">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <AtlasLogo className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold text-cyan-400">Atlas Hosting</span>
        </Link>
        <div className="hidden md:flex items-center gap-12">
          <div 
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="text-white hover:text-cyan-400 transition-colors flex items-center gap-1 text-sm font-medium">
              Como Funciona
              <ChevronDown className="w-4 h-4" />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-lg py-2">
                <Link href="#how-it-works" className="block px-4 py-2 text-white hover:bg-white/10 text-sm">
                  Serviços
                </Link>
                <Link href="#features" className="block px-4 py-2 text-white hover:bg-white/10 text-sm">
                  Benefícios
                </Link>
              </div>
            )}
          </div>
          <a href="#plans" className="text-white hover:text-cyan-400 transition-colors text-sm font-medium">
            Planos
          </a>
          <a href="#projetos" className="text-white hover:text-cyan-400 transition-colors text-sm font-medium">
            Projetos
          </a>
          <a href="#" className="text-white hover:text-cyan-400 transition-colors text-sm font-medium">
            Blog
          </a>
          <a href="#faq" className="text-white hover:text-cyan-400 transition-colors text-sm font-medium">
            FAQ
          </a>
        </div>
        <Button className="bg-emerald-400 hover:bg-emerald-500 text-black font-bold px-6 py-2 text-sm" asChild>
          <Link href="/login">LOGIN</Link>
        </Button>
      </nav>
    </header>
  );
}

