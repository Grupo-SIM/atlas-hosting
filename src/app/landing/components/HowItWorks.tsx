"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CountUp from "./CountUp";

const stats = [
  { value: 4, suffix: "M+", label: "Hosts on average" },
  { value: 150, suffix: "+", label: "Countries served" },
  { value: 20, suffix: "+", label: "Anos no mercado" },
  { value: 10, suffix: "M+", label: "Website customers" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#08091a] px-4 pb-0">
      <div className="mx-auto w-[92vw] max-w-[2400px]">

        {/* Two feature cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Card 1 — More power & control */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1130] p-7 flex flex-col gap-5">
            {/* Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" />
                <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.5" />
                <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.5" />
                <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.3" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white leading-tight">
              More power &amp; control
            </h3>

            {/* Inner subtitle */}
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Automate the busywork
            </p>

            {/* Description */}
            <p className="text-sm text-gray-400 leading-relaxed -mt-2">
              Use Atlas Hosting to handle all the hosting tasks so you can focus on what you
              love, create content. You can focus on doing what matters most.
            </p>

            {/* Divider + CTA */}
            <div className="mt-auto border-t border-white/10 pt-5">
              <Link
                href="/hosting/premium"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors group"
              >
                Performance you can rely on
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2 — More flexible growth */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1130] p-7 flex flex-col gap-5">
            {/* Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.2" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white leading-tight">
              More flexible growth
            </h3>

            {/* Inner subtitle */}
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Hosting that grows with you
            </p>

            {/* Description */}
            <p className="text-sm text-gray-400 leading-relaxed -mt-2">
              Cloud hosting offers premium solutions that ensures your needs which keep
              growing with reliable uptime, powerful performance, enhanced security, and flexible
              pricing.
            </p>

            {/* Divider + CTA */}
            <div className="mt-auto border-t border-white/10 pt-5">
              <Link
                href="/domain/register"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors group"
              >
                Hosting for agencies
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 rounded-2xl overflow-hidden">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={[
                "flex flex-col items-center justify-center gap-1 bg-violet-600 px-6 py-8",
                i < stats.length - 1 ? "border-r border-violet-500/40" : "",
              ].join(" ")}
            >
              <span className="text-3xl font-extrabold text-white flex items-baseline gap-0.5">
                <CountUp from={0} to={stat.value} duration={2} />
                <span>{stat.suffix}</span>
              </span>
              <span className="text-xs text-violet-200 text-center leading-tight">{stat.label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
