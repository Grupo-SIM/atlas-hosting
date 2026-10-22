"use client";

import { Search, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import TextType from "./TextType";

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
    <section
      className="relative overflow-hidden px-4 py-20"
      id="comprar-dominio"
      style={{ backgroundColor: "#000319" }}
    >
      <div className="container mx-auto max-w-[95%] lg:max-w-[98%]">
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          {/* Card Esquerdo - Cashback */}
          <div className="relative flex h-full flex-col overflow-hidden rounded-4xl border border-green-500/30 bg-slate-200/10 p-6 text-white shadow-[0_8px_32px_0_rgba(34,197,94,0.15)] backdrop-blur-[20px]">
            {/* Background com padrão de pontos */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(rgba(34,197,94,0.2)_1px,transparent_1px)] bg-transparent opacity-30 [background-size:16px_16px]" />

            {/* Ícone circular verde com carteira */}
            <div className="absolute top-6 right-6 flex h-16 w-16 items-center justify-center rounded-full border border-green-500/30 bg-green-500/20 backdrop-blur-md md:h-20 md:w-20">
              <Wallet
                className="h-8 w-8 text-gray-200 md:h-10 md:w-10"
                strokeWidth={2}
              />
            </div>

            <div className="relative z-10 flex flex-1 flex-col items-start justify-center pr-20 md:pr-24">
              <h3 className="mb-3 font-bold text-2xl md:text-3xl">Cashback</h3>

              <p className="mb-4 text-base text-white/90">
                Em todas as compras você receberá imediatamente o seu dinheiro
                de volta pelo Vale Bônus.
              </p>

              <div className="mt-auto">
                <Link
                  className="custom-animated-button inline-flex items-center gap-2"
                  href="#plans"
                >
                  VER PLANOS
                </Link>
              </div>
            </div>
          </div>

          {/* Card Direito - Busca de Domínio */}
          <div className="relative flex h-full flex-col overflow-hidden rounded-4xl border border-green-500/30 bg-slate-100/10 p-6 text-white shadow-[0_8px_32px_0_rgba(34,197,94,0.15)] backdrop-blur-[20px]">
            {/* Background com padrão de pontos */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(rgba(34,197,94,0.2)_1px,transparent_1px)] bg-transparent opacity-30 [background-size:16px_16px]" />

            <div className="relative z-10">
              <h3 className="mb-3 font-bold text-2xl md:text-3xl">
                Encontre um domínio
              </h3>

              <p className="mb-4 text-base text-white/90">
                Cause impacto desde o primeiro clique com o domínio perfeito.
              </p>

              {/* Barra de pesquisa */}
              <div className="flex items-center gap-2 rounded-4xl border border-white/20 bg-white/5 p-2 backdrop-blur-sm">
                <Search className="ml-2 h-5 w-5 text-white/70" />
                <div className="relative flex min-h-[24px] flex-1 items-center">
                  {!isFocused && domainInput === "" ? (
                    <div className="pointer-events-none absolute inset-0 z-0 flex items-center">
                      <TextType
                        className="text-base text-white/50"
                        cursorCharacter="|"
                        cursorClassName="text-white/50"
                        pauseDuration={1500}
                        showCursor={true}
                        text={[
                          "Busque por um domínio",
                          "exemplo.com",
                          "seu-dominio.com.br",
                        ]}
                        typingSpeed={75}
                      />
                    </div>
                  ) : null}
                  <input
                    className="relative z-10 w-full flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/50"
                    onBlur={() => setIsFocused(false)}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite o domínio que você quer registrar"
                    type="text"
                    value={domainInput}
                  />
                </div>
                <Button
                  className="rounded-4xl bg-green-500 px-6 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!domainInput.trim()}
                  onClick={handleSearch}
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
