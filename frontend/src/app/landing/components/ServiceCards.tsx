"use client";

import { ArrowRight, Globe, Server } from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
  href: string;
  title: string;
  subtitle: string;
  cta: string;
  price?: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  pattern: "dots" | "grid" | "waves";
}

function ServiceCard({
  href,
  title,
  subtitle,
  cta,
  price,
  Icon,
  gradient,
  pattern,
}: ServiceCardProps) {
  return (
    <Link
      className="group relative block h-full overflow-hidden rounded-2xl border border-emerald-300/15 bg-[#0a1124]/92 backdrop-blur-[2px] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/30 hover:shadow-[0_16px_50px_rgba(0,0,0,0.45)]"
      href={href}
    >
      <div
        className={[
          "absolute inset-0 opacity-[0.04]",
          pattern === "dots" ? "bg-dots-pattern" : "",
          pattern === "grid" ? "bg-grid-pattern" : "",
          pattern === "waves" ? "bg-waves-pattern" : "",
        ].join(" ")}
      />

      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-[0.08] transition-opacity duration-300 group-hover:opacity-[0.14] ${gradient}`}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_65%_at_50%_0%,rgba(1,252,141,0.10)_0%,rgba(1,252,141,0.03)_40%,transparent_78%)]" />

      <div className="relative flex h-full flex-col p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/50 transition-all duration-200 group-hover:bg-primary/10">
            <Icon className="h-5 w-5 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>

        <h3 className="font-semibold text-2xl text-white leading-tight transition-colors duration-200 group-hover:text-[#01FC8D]">
          {title}
        </h3>
        <p className="mt-2 text-slate-400 text-sm leading-relaxed">
          {subtitle}
        </p>

        <div className="mt-auto pt-6">
          {price ? (
            <p className="text-slate-400 text-sm">
              A partir de{" "}
              <span className="font-semibold text-white">{price}</span>
            </p>
          ) : null}
          <p className="mt-1 font-semibold text-base text-white">{cta}</p>
          <p className="mt-2 font-semibold text-[#01FC8D] text-xs">
            100% de cashback
          </p>
          <p className="mt-1 font-semibold text-[#38bdf8] text-xs">
            Suporte 24/7
          </p>
        </div>
      </div>
    </Link>
  );
}

export function ServiceCards() {
  return (
    <section
      className="mt-0 bg-[linear-gradient(180deg,rgba(1,252,141,0.06)_0%,rgba(8,9,26,0.92)_34%,#08091a_100%)] px-4 pb-12 md:-mt-12"
      id="servicos"
    >
      <div className="mx-auto grid w-[92vw] max-w-[2400px] grid-cols-1 gap-4 md:grid-cols-2">
        <ServiceCard
          cta="Ver planos VPS"
          gradient="from-emerald-500 to-teal-500"
          href="/hosting/premium"
          Icon={Server}
          pattern="grid"
          price="R$ 39,90/mês"
          subtitle="Servidores VPS com alta performance, escalabilidade e controle total para projetos profissionais."
          title="Compra de VPS"
        />
        <ServiceCard
          cta="Buscar domínio"
          gradient="from-green-500 to-emerald-500"
          href="/domains/register"
          Icon={Globe}
          pattern="dots"
          subtitle="Registre o domínio ideal para sua marca e proteja sua identidade online desde o primeiro dia."
          title="Compra de Domínio"
        />
      </div>
    </section>
  );
}
