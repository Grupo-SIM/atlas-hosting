"use client";

import { Input } from "@/components/ui/input";

/**
 * Campo de dinheiro "estilo caixa": os dígitos entram pelos centavos, da
 * direita para a esquerda (digitar 8990 → 89,90). Com `name`, também envia um
 * input hidden com ponto decimal para formulários do servidor.
 */
export function MoneyInput({
  className,
  disabled,
  id,
  name,
  onChange,
  placeholder = "0,00",
  value,
}: {
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  onChange: (value: number) => void;
  placeholder?: string;
  value: number;
}) {
  const cents = Math.round(value * 100);
  const display =
    cents > 0
      ? (cents / 100).toLocaleString("pt-BR", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })
      : "";

  return (
    <div className="relative">
      <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 text-muted-foreground text-sm">
        R$
      </span>
      <Input
        className={`pl-9 ${className ?? ""}`}
        disabled={disabled}
        id={id}
        inputMode="numeric"
        onChange={event => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
          onChange(digits ? Number(digits) / 100 : 0);
        }}
        placeholder={placeholder}
        value={display}
      />
      {name && <input name={name} type="hidden" value={(cents / 100).toFixed(2)} />}
    </div>
  );
}
