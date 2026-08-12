"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const HISTORY_KEY = "atlas:back-history";
const HOME = "/home";

function readStack(): string[] {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStack(stack: string[]) {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(stack));
  } catch {
    // sessionStorage indisponível (ex.: modo privado) — sem stack, cai no fallback.
  }
}

/**
 * Pilha de navegação própria, em vez de `router.back()` puro: sobrevive a
 * refresh (sessionStorage) e não corre risco de sair do app quando a página
 * foi aberta direto (link externo, nova aba). Páginas repetidas com querystring
 * diferente (ex.: filtros de fatura) atualizam a última entrada em vez de
 * empilhar, senão "voltar" ficaria preso trocando filtro da mesma página.
 */
export function PageBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.toString();
  const fullPath = query ? `${pathname}?${query}` : pathname;

  useEffect(() => {
    if (!fullPath) return;
    const stack = readStack();
    const last = stack.at(-1);
    const lastPathname = last?.split("?")[0];

    if (lastPathname === pathname) {
      stack[stack.length - 1] = fullPath;
    } else {
      stack.push(fullPath);
      if (stack.length > 30) stack.shift();
    }
    writeStack(stack);
  }, [fullPath, pathname]);

  if (!pathname || pathname === HOME) return null;

  const handleBack = () => {
    const stack = readStack();
    if (stack.at(-1)?.split("?")[0] === pathname) stack.pop();
    const target =
      stack.at(-1) ?? (pathname.startsWith("/admin") ? "/admin" : HOME);
    writeStack(stack);
    router.push(target === pathname ? HOME : target);
  };

  return (
    <div className="px-4 pt-4 md:px-6 md:pt-6">
      <Button
        className="h-9 w-9 rounded-md border-border bg-muted/50 text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
        onClick={handleBack}
        size="icon"
        title="Voltar"
        variant="outline"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
