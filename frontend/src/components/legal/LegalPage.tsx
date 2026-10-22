import Link from "next/link";
import { Footer } from "@/app/landing/components/Footer";
import { Navbar } from "@/app/landing/components/Navbar";
import type { LegalPageProps } from "./types";

const links = [
  { href: "/privacidade", label: "Política de Privacidade", page: "privacidade" },
  { href: "/termos", label: "Termos de Serviço", page: "termos" },
] as const;

export function LegalPage({
  children,
  currentPage,
  description,
  title,
}: LegalPageProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#00050A] text-white">
      <Navbar variant="dark" />
      <main className="relative px-4 pt-32 pb-12 sm:px-6 sm:pt-40 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px] bg-[radial-gradient(circle_at_top,rgba(0,163,255,0.2),transparent_65%)]" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="mb-4 font-bold text-[#00A3FF] text-sm uppercase tracking-[0.2em]">
            Atlas Hosting
          </p>
          <h1 className="max-w-3xl font-black text-4xl tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base text-white/70 leading-7 sm:text-lg">
            {description}
          </p>
          <p className="mt-6 text-sm text-white/50">Última atualização: 2 de setembro de 2026</p>

          <nav aria-label="Documentos legais" className="mt-10 flex flex-wrap gap-3">
            {links.map(link => {
              const isCurrentPage = link.page === currentPage;

              return (
                <Link
                  aria-current={isCurrentPage ? "page" : undefined}
                  className={`rounded-full border px-4 py-2 font-medium text-sm transition-colors ${
                    isCurrentPage
                      ? "border-sky-400 bg-sky-400 text-[#00050A]"
                      : "border-white/20 text-white hover:border-sky-400 hover:text-sky-300"
                  }`}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <article className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-2 shadow-2xl shadow-black/30 sm:px-10">
            {children}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
