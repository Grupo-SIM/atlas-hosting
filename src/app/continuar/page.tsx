import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Continuar compra | Atlas Hosting",
  description: "Faça login ou crie uma conta para concluir o registro do domínio.",
};

/** Evita open redirect: só caminhos relativos internos. */
function sanitizeNext(raw: string | undefined): string {
  const n = (raw ?? "").trim();
  if (!n.startsWith("/") || n.startsWith("//")) {
    return "/domains/search";
  }
  if (
    n.includes("://") ||
    n.includes("\\") ||
    /[\s<>"]/.test(n) ||
    n.length > 2048
  ) {
    return "/domains/search";
  }
  return n;
}

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function ContinuarPage({ searchParams }: PageProps) {
  const { next: nextRaw } = await searchParams;
  const next = sanitizeNext(nextRaw);
  const enc = encodeURIComponent(next);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0e27] px-4 py-16">
      <Card className="w-full max-w-md border-white/10 bg-[#0d1225]/90 text-white shadow-xl backdrop-blur-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-white">Continuar compra</CardTitle>
          <CardDescription className="text-base text-white/65">
            Você já possui conta na Atlas Hosting?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            asChild
            className="h-11 w-full bg-[#01FC8D] font-semibold text-black hover:bg-[#01e67d]"
          >
            <Link href={`/login?redirect=${enc}`}>Sim — entrar com minha conta</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 w-full border-white/25 bg-transparent text-white hover:bg-white/5"
          >
            <Link href={`/signup?redirect=${enc}`}>Não — criar conta nova</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-1 text-white/60 hover:text-white">
            <Link href="/domains/search">Cancelar e voltar à busca</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
