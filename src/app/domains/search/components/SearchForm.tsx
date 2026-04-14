"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchFormProps {
  defaultValue?: string;
}

export default function SearchForm({ defaultValue = "" }: SearchFormProps) {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    if (q && q.trim()) {
      router.push(`/domains/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <form onSubmit={handleSearch} className="w-full">
        <div className="flex items-stretch gap-0 overflow-hidden rounded-2xl border border-white/15 bg-[#0a1026]/90 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="flex min-w-0 flex-1 items-center gap-3 pl-4 md:pl-5">
            <Search className="h-5 w-5 shrink-0 text-[#01FC8D]/80" strokeWidth={2} />
            <input
              name="q"
              type="text"
              defaultValue={defaultValue}
              placeholder="ex.: minhaempresa ou minhaempresa.com"
              className="min-w-0 flex-1 bg-transparent py-3.5 text-base text-white outline-none placeholder:text-white/40 md:py-4 md:text-lg"
              id="domain-search-input"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="flex w-14 shrink-0 cursor-pointer items-center justify-center bg-[#01FC8D] text-black transition-colors hover:bg-[#01e67d] md:w-16"
            aria-label="Pesquisar domínio"
          >
            <Search className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
