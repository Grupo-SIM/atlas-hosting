"use client";

import { Loader, Search } from "lucide-react";
import { useState } from "react";
import { searchDomainsForPublish } from "../../publish-checkout-actions";

export interface DomainOffer {
  domain: string;
  priceBrl: number;
}

interface Props {
  /** Classe do input, para casar com o estilo de cada tela. */
  fieldClassName: string;
  onSelect: (offer: DomainOffer | null) => void;
  selected: DomainOffer | null;
}

export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { currency: "BRL", style: "currency" });

/**
 * Busca de domínio para comprar durante a publicação. Os preços vêm do mesmo
 * cálculo que monta a fatura, então o valor mostrado aqui é o cobrado.
 */
export default function DomainSearchPicker({
  fieldClassName,
  onSelect,
  selected,
}: Props) {
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<
    { available: boolean; domain: string; priceBrl: number }[] | null
  >(null);

  const search = async () => {
    setPending(true);
    setError(null);
    const result = await searchDomainsForPublish(query);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      setResults(null);
      return;
    }
    setResults(
      result.results.map(item => ({
        available: item.available,
        domain: item.domain,
        priceBrl: item.priceBrl,
      }))
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          className={fieldClassName}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              void search();
            }
          }}
          placeholder="meusite.com.br"
          value={query}
        />
        <button
          className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#e0ddd5] bg-white px-3.5 text-sm disabled:opacity-50"
          disabled={pending || query.trim().length < 2}
          onClick={() => void search()}
          type="button"
        >
          {pending ? (
            <Loader className="size-[15px] animate-spin" />
          ) : (
            <Search className="size-[15px]" />
          )}
          Buscar
        </button>
      </div>

      {error ? <p className="text-[13px] text-destructive">{error}</p> : null}

      {results ? (
        results.length === 0 ? (
          <p className="text-[#6e6b65] text-xs">Nenhum resultado.</p>
        ) : (
          <ul className="flex max-h-56 flex-col gap-1 overflow-y-auto">
            {results.map(item => {
              const isSelected = selected?.domain === item.domain;
              return (
                <li key={item.domain}>
                  <button
                    className={`flex w-full items-center justify-between gap-3 rounded-[10px] border px-3 py-2 text-left text-sm ${
                      isSelected
                        ? "border-[#1f7a4d] bg-[#f3faf6]"
                        : "border-[#e0ddd5] bg-white"
                    } ${item.available ? "" : "opacity-55"}`}
                    disabled={!item.available}
                    onClick={() =>
                      onSelect(
                        isSelected
                          ? null
                          : { domain: item.domain, priceBrl: item.priceBrl }
                      )
                    }
                    type="button"
                  >
                    <span className="min-w-0 truncate">{item.domain}</span>
                    <span className="whitespace-nowrap text-[#6e6b65] text-xs">
                      {item.available
                        ? `${brl(item.priceBrl)}/ano`
                        : "indisponível"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )
      ) : null}

      <p className="text-[#6e6b65] text-xs">
        O domínio é registrado no seu nome depois do pagamento e o DNS já vem
        configurado pelo Atlas.
      </p>
    </div>
  );
}
