"use client";

import { ArrowRight, Globe, Server } from "lucide-react";
import Link from "next/link";

type ServiceCardProps = {
  href: string;
  title: string;
  subtitle: string;
  cta: string;
  price?: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  pattern: "dots" | "grid" | "waves";
};

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
      href={href}
      className="group relative block h-full overflow-hidden rounded-2xl border border-emerald-300/15 bg-[#0a1124]/92 backdrop-blur-[2px] transition-all duration-300 hover:border-emerald-300/30 hover:shadow-[0_16px_50px_rgba(0,0,0,0.45)] hover:-translate-y-1"
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
        className={`absolute inset-0 bg-gradient-to-br opacity-[0.08] group-hover:opacity-[0.14] transition-opacity duration-300 ${gradient}`}
      />

      <div className="absolute inset-0 bg-[radial-gradient(90%_65%_at_50%_0%,rgba(1,252,141,0.10)_0%,rgba(1,252,141,0.03)_40%,transparent_78%)] pointer-events-none" />

      <div className="relative flex h-full flex-col p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-all duration-200">
            <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
        </div>

        <h3 className="text-2xl font-semibold leading-tight text-white group-hover:text-[#01FC8D] transition-colors duration-200">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{subtitle}</p>

        <div className="mt-auto pt-6">
          {price ? (
            <p className="text-sm text-slate-400">
              A partir de <span className="font-semibold text-white">{price}</span>
            </p>
          ) : null}
          <p className="mt-1 text-base font-semibold text-white">{cta}</p>
          <p className="mt-2 text-xs font-semibold text-[#01FC8D]">100% de cashback</p>
          <p className="mt-1 text-xs font-semibold text-[#38bdf8]">Suporte 24/7</p>
        </div>
      </div>
    </Link>
  );
}

export function ServiceCards() {
  return (
    <section
      id="servicos"
      className="mt-0 md:-mt-12 bg-[linear-gradient(180deg,rgba(1,252,141,0.06)_0%,rgba(8,9,26,0.92)_34%,#08091a_100%)] px-4 pb-12"
    >
      <div className="mx-auto grid w-[92vw] max-w-[2400px] grid-cols-1 gap-4 md:grid-cols-2">
        <ServiceCard
          href="/hosting/premium"
          title="Compra de VPS"
          subtitle="Servidores VPS com alta performance, escalabilidade e controle total para projetos profissionais."
          cta="Ver planos VPS"
          price="R$ 39,90/mês"
          Icon={Server}
          gradient="from-emerald-500 to-teal-500"
          pattern="grid"
        />
        <ServiceCard
          href="/domain/register"
          title="Compra de Domínio"
          subtitle="Registre o domínio ideal para sua marca e proteja sua identidade online desde o primeiro dia."
          cta="Buscar domínio"
          Icon={Globe}
          gradient="from-green-500 to-emerald-500"
          pattern="dots"
        />
      </div>
    </section>
  );
}
