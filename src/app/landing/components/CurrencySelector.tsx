"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { DisplayCurrency } from "@/lib/display-currency";

const roboto = { className: "[font-family:var(--font-roboto)]" };

const CURRENCIES: { code: DisplayCurrency; symbol: string; label: string }[] = [
  { code: "BRL", symbol: "R$", label: "Real brasileiro" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "USD", symbol: "US$", label: "Dólar americano" },
];

type CurrencySelectorProps = {
  value: DisplayCurrency;
  onChange: (currency: DisplayCurrency) => void;
  isLight?: boolean;
  variant?: "dropdown" | "inline";
};

export function CurrencySelector({ value, onChange, isLight = false, variant = "dropdown" }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = CURRENCIES.find((c) => c.code === value) ?? CURRENCIES[0];

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-1 rounded-2xl border p-1 ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/5"}`}>
        {CURRENCIES.map((currency) => {
          const isActive = currency.code === value;
          return (
            <button
              key={currency.code}
              type="button"
              onClick={() => onChange(currency.code)}
              aria-pressed={isActive}
              className={`${roboto.className} flex-1 rounded-xl py-2.5 text-[13px] font-bold uppercase tracking-wide transition-colors ${isActive
                ? "bg-sky-500 text-[#00050A]"
                : isLight
                  ? "text-slate-500 hover:text-slate-800"
                  : "text-white/60 hover:text-white"
                }`}
            >
              {currency.symbol} {currency.code}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Moeda dos preços"
        className={`${roboto.className} flex h-10 cursor-pointer items-center gap-1.5 rounded-[10px] border px-3 text-xs font-bold tracking-wide transition-colors ${isLight
          ? "border-slate-200 text-slate-700 hover:bg-slate-50"
          : "border-white/70 text-white hover:bg-white/10"
          }`}
      >
        {current.symbol} {current.code}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="listbox"
            className={`absolute top-full right-0 mt-1 min-w-[170px] overflow-hidden rounded-[6px] border ${isLight
              ? "border-slate-200 bg-white shadow-xl"
              : "border-white/5 bg-[#00080D] shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              }`}
          >
            {CURRENCIES.map((currency, index) => {
              const isActive = currency.code === value;
              return (
                <button
                  key={currency.code}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onChange(currency.code);
                    setIsOpen(false);
                  }}
                  className={`${roboto.className} flex w-full items-center justify-between gap-3 px-4 py-3 text-[14px] font-bold transition-all ${index > 0 ? `border-t ${isLight ? "border-slate-100" : "border-white/5"}` : ""} ${isLight
                    ? "text-slate-600 hover:bg-slate-50"
                    : "text-white/80 hover:bg-sky-400 hover:text-[#00050A]"
                    }`}
                >
                  <span>{currency.symbol} {currency.code}</span>
                  {isActive && <Check className="h-4 w-4" strokeWidth={2.5} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
