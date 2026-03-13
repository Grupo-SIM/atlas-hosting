"use client";

import { Search, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import TextType from "./TextType";
import { useState } from "react";

export function PromotionalCards() {
  const [domainInput, setDomainInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (!domainInput.trim()) {
      return;
    }

    // Redirect to search results page
    window.location.href = `/domains/search?q=${encodeURIComponent(domainInput.trim())}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomainInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section id="comprar-dominio" className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: '#000319' }}>
      <div className="container mx-auto max-w-[95%] lg:max-w-[98%]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Card Esquerdo - Cashback */}
          <div className="flex flex-col relative rounded-4xl p-6 text-white overflow-hidden bg-slate-200/10 backdrop-blur-[20px] border border-green-500/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.15)] h-full">
            {/* Background com padrão de pontos */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-transparent bg-[radial-gradient(rgba(34,197,94,0.2)_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            
            {/* Ícone circular verde com carteira */}
            <div className="absolute right-6 top-6 w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 flex items-center justify-center">
              <Wallet className="w-8 h-8 md:w-10 md:h-10 text-gray-200" strokeWidth={2} />
            </div>
            
            <div className="relative z-10 pr-20 md:pr-24 flex-1 flex flex-col items-start justify-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                Cashback
              </h3>
              
              <p className="text-white/90 mb-4 text-base">
                Em todas as compras você receberá imediatamente o seu dinheiro de volta pelo Vale Bônus.
              </p>

              <div className="mt-auto">
                <Link
                  href="#plans"
                  className="custom-animated-button inline-flex items-center gap-2"
                >
                  VER PLANOS
                </Link>
              </div>
            </div>
          </div>

          {/* Card Direito - Busca de Domínio */}
          <div className="flex flex-col relative rounded-4xl p-6 text-white overflow-hidden bg-slate-100/10 backdrop-blur-[20px] border border-green-500/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.15)] h-full">
            {/* Background com padrão de pontos */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-transparent bg-[radial-gradient(rgba(34,197,94,0.2)_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                Encontre um domínio
              </h3>
              
              <p className="text-white/90 mb-4 text-base">
                Cause impacto desde o primeiro clique com o domínio perfeito.
              </p>

              {/* Barra de pesquisa */}
              <div className="flex items-center gap-2 backdrop-blur-sm border border-white/20 rounded-4xl p-2 bg-white/5">
                <Search className="w-5 h-5 text-white/70 ml-2" />
                <div className="flex-1 min-h-[24px] flex items-center relative">
                  {!isFocused && domainInput === "" ? (
                    <div className="absolute inset-0 flex items-center pointer-events-none z-0">
                      <TextType
                        text={["Busque por um domínio", "exemplo.com", "seu-dominio.com.br"]}
                        typingSpeed={75}
                        pauseDuration={1500}
                        showCursor={true}
                        cursorCharacter="|"
                        className="text-white/50 text-base"
                        cursorClassName="text-white/50"
                      />
                    </div>
                  ) : null}
                  <input
                    type="text"
                    value={domainInput}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-transparent text-white placeholder-transparent outline-none text-base w-full relative z-10"
                    placeholder=""
                  />
                </div>
                        <Button
                          onClick={handleSearch}
                          disabled={!domainInput.trim()}
                          className="bg-green-500 hover:bg-green-600 text-white rounded-4xl px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                  Pesquisar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

