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
        <div className="flex items-stretch gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex min-w-0 flex-1 items-center gap-3 pl-4 md:pl-5">
            <Search className="h-5 w-5 shrink-0 text-emerald-500" strokeWidth={2} />
            <input
              name="q"
              type="text"
              defaultValue={defaultValue}
              placeholder="ex.: minhaempresa ou minhaempresa.com"
              className="min-w-0 flex-1 bg-transparent py-3.5 text-base text-slate-900 outline-none placeholder:text-slate-400 md:py-4 md:text-lg"
              id="domain-search-input"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="flex w-14 shrink-0 cursor-pointer items-center justify-center bg-emerald-500 text-white transition-colors hover:bg-emerald-600 md:w-16"
            aria-label="Pesquisar domínio"
          >
            <Search className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
