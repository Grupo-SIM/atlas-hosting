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
        <div className="flex items-stretch gap-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
          <div className="flex min-w-0 flex-1 items-center gap-3 pl-4 md:pl-5">
            <Search className="h-5 w-5 shrink-0 text-sky-500" strokeWidth={2.5} />
            <input
              name="q"
              type="text"
              defaultValue={defaultValue}
              placeholder="ex.: minhaempresa ou minhaempresa.com"
              className="min-w-0 flex-1 bg-transparent py-3.5 text-base text-white outline-none placeholder:text-slate-500 md:py-4 md:text-lg font-medium"
              id="domain-search-input"
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            className="flex w-14 shrink-0 cursor-pointer items-center justify-center bg-sky-500 text-white transition-all hover:bg-sky-400 active:scale-95 md:w-16"
            aria-label="Pesquisar domínio"
            onClick={(e) => {
              const form = e.currentTarget.closest('form');
              if (form) form.requestSubmit();
            }}
          >
            <Search className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
