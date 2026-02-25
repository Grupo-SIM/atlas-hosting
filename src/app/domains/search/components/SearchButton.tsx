"use client";

import { Button } from "@/components/ui/button";

export default function SearchButton() {
  const handleSearch = () => {
    const input = document.getElementById(
      "domain-search-input"
    ) as HTMLInputElement;
    if (input?.value.trim()) {
      window.location.href = `/domains/search?q=${encodeURIComponent(
        input.value.trim()
      )}`;
    }
  };

  return (
    <Button
      onClick={handleSearch}
      className="bg-green-500 hover:bg-green-600 text-white rounded-4xl px-6"
    >
      Pesquisar
    </Button>
  );
}

