"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
      <Search className="w-5 h-5 text-white/70 ml-2" />
      <input
        name="q"
        type="text"
        defaultValue={defaultValue}
        placeholder="Digite o nome do domínio..."
        className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-base py-2"
        id="domain-search-input"
      />
      <Button
        type="submit"
        className="bg-green-500 hover:bg-green-600 text-white rounded-4xl px-6"
      >
        Pesquisar
      </Button>
    </form>
  );
}
