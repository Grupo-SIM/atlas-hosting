"use client";

import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Security() {
  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: '#000319' }}>
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Site blindado, dados protegidos
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Firewall, criptografia, proteção contra malwares e estabilidade garantida pra você trabalhar tranquilo.
          </p>
          <Link href="#plans">
            <Button className="bg-emerald-400 hover:bg-emerald-500 text-black font-bold px-8 py-3 text-base uppercase">
              ver planos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

