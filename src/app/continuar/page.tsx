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

export const dynamic = "force-dynamic";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <Card className="w-full max-w-md border-slate-200 bg-white text-slate-900 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-slate-900">Continuar compra</CardTitle>
          <CardDescription className="text-base text-slate-500">
            Você já possui conta na Atlas Hosting?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            asChild
            className="h-11 w-full bg-emerald-500 font-semibold text-white hover:bg-emerald-600"
          >
            <Link href={`/login?redirect=${enc}`}>Sim — entrar com minha conta</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 w-full border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50"
          >
            <Link href={`/signup?redirect=${enc}`}>Não — criar conta nova</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-1 text-slate-400 hover:text-slate-600">
            <Link href="/domains/search">Cancelar e voltar à busca</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
