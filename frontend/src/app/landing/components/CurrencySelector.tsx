"use client";

import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { DisplayCurrency } from "@/lib/display-currency";

const roboto = { className: "[font-family:var(--font-roboto)]" };

const CURRENCIES: { code: DisplayCurrency; symbol: string; label: string }[] = [
  { code: "BRL", label: "Real brasileiro", symbol: "R$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "Dólar americano", symbol: "US$" },
];

interface CurrencySelectorProps {
  value: DisplayCurrency;
  onChange: (currency: DisplayCurrency) => void;
  isLight?: boolean;
  variant?: "dropdown" | "inline";
}

export function CurrencySelector({
  value,
  onChange,
  isLight = false,
  variant = "dropdown",
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = CURRENCIES.find(c => c.code === value) ?? CURRENCIES[0];

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (variant === "inline") {
    return (
      <div
        className={`flex items-center gap-1 rounded-2xl border p-1 ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/5"}`}
      >
        {CURRENCIES.map(currency => {
          const isActive = currency.code === value;
          return (
            <button
              aria-pressed={isActive}
              className={`${roboto.className} flex-1 rounded-xl py-2.5 font-bold text-[13px] uppercase tracking-wide transition-colors ${
                isActive
                  ? "bg-sky-500 text-[#00050A]"
                  : isLight
                    ? "text-slate-500 hover:text-slate-800"
                    : "text-white/60 hover:text-white"
              }`}
              key={currency.code}
              onClick={() => onChange(currency.code)}
              type="button"
            >
              {currency.symbol} {currency.code}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Moeda dos preços"
        className={`${roboto.className} flex h-10 cursor-pointer items-center gap-1.5 rounded-[10px] border px-3 font-bold text-xs tracking-wide transition-colors ${
          isLight
            ? "border-slate-200 text-slate-700 hover:bg-slate-50"
            : "border-white/70 text-white hover:bg-white/10"
        }`}
        onClick={() => setIsOpen(prev => !prev)}
        type="button"
      >
        {current.symbol} {current.code}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`absolute top-full right-0 mt-1 min-w-[170px] overflow-hidden rounded-[6px] border ${
              isLight
                ? "border-slate-200 bg-white shadow-xl"
                : "border-white/5 bg-[#00080D] shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            }`}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            role="listbox"
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {CURRENCIES.map((currency, index) => {
              const isActive = currency.code === value;
              return (
                <button
                  aria-selected={isActive}
                  className={`${roboto.className} flex w-full items-center justify-between gap-3 px-4 py-3 font-bold text-[14px] transition-all ${index > 0 ? `border-t ${isLight ? "border-slate-100" : "border-white/5"}` : ""} ${
                    isLight
                      ? "text-slate-600 hover:bg-slate-50"
                      : "text-white/80 hover:bg-sky-400 hover:text-[#00050A]"
                  }`}
                  key={currency.code}
                  onClick={() => {
                    onChange(currency.code);
                    setIsOpen(false);
                  }}
                  role="option"
                  type="button"
                >
                  <span>
                    {currency.symbol} {currency.code}
                  </span>
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
