"use client";

import { Server, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Services() {
  return (
    <section id="servicos" className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: '#000319' }}>
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-green-500 rounded-full" />
            <span className="text-green-400 text-sm font-semibold uppercase tracking-wide">
              Nossos serviços
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            O Atlas é um lugar criado para você crescer
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            Do iniciante ao profissional, nossos serviços atendem todos os perfis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="relative rounded-4xl p-8 text-white overflow-hidden bg-slate-200/10 backdrop-blur-[20px] border border-green-500/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.15)]">
            <div className="absolute inset-0 -z-10 h-full w-full bg-transparent bg-[radial-gradient(rgba(34,197,94,0.2)_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 flex items-center justify-center mb-6">
                <Server className="w-8 h-8 text-green-400" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Hospedagem otimizada</h3>
              <p className="text-white/80 mb-6">
                Simples, estável e inteligente
              </p>
            </div>
          </div>

          <div className="relative rounded-4xl p-8 text-white overflow-hidden bg-slate-200/10 backdrop-blur-[20px] border border-green-500/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.15)]">
            <div className="absolute inset-0 -z-10 h-full w-full bg-transparent bg-[radial-gradient(rgba(34,197,94,0.2)_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-green-400" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Compra de domínios</h3>
              <p className="text-white/80 mb-6">
                Encontre e registre seu domínio com facilidade
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

