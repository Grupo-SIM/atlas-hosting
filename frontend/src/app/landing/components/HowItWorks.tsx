"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import CountUp from "./CountUp";

const stats = [
  { label: "Hosts on average", suffix: "M+", value: 4 },
  { label: "Countries served", suffix: "+", value: 150 },
  { label: "Anos no mercado", suffix: "+", value: 20 },
  { label: "Website customers", suffix: "M+", value: 10 },
];

export function HowItWorks() {
  return (
    <section className="bg-[#08091a] px-4 pb-0" id="how-it-works">
      <div className="mx-auto w-[92vw] max-w-[2400px]">
        {/* Two feature cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Card 1 — More power & control */}
          <div className="relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1130] p-7">
            {/* Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
              <svg
                className="text-white"
                fill="none"
                height="18"
                viewBox="0 0 24 24"
                width="18"
              >
                <rect
                  fill="currentColor"
                  height="7"
                  rx="1"
                  width="7"
                  x="3"
                  y="3"
                />
                <rect
                  fill="currentColor"
                  height="7"
                  opacity="0.5"
                  rx="1"
                  width="7"
                  x="14"
                  y="3"
                />
                <rect
                  fill="currentColor"
                  height="7"
                  opacity="0.5"
                  rx="1"
                  width="7"
                  x="3"
                  y="14"
                />
                <rect
                  fill="currentColor"
                  height="7"
                  opacity="0.3"
                  rx="1"
                  width="7"
                  x="14"
                  y="14"
                />
              </svg>
            </div>

            {/* Title */}
            <h3 className="font-bold text-2xl text-white leading-tight">
              More power &amp; control
            </h3>

            {/* Inner subtitle */}
            <p className="font-semibold text-gray-400 text-xs uppercase tracking-widest">
              Automate the busywork
            </p>

            {/* Description */}
            <p className="-mt-2 text-gray-400 text-sm leading-relaxed">
              Use Atlas Hosting to handle all the hosting tasks so you can focus
              on what you love, create content. You can focus on doing what
              matters most.
            </p>

            {/* Divider + CTA */}
            <div className="mt-auto border-white/10 border-t pt-5">
              <Link
                className="group inline-flex items-center gap-2 font-medium text-sm text-white/80 transition-colors hover:text-white"
                href="/hosting/premium"
              >
                Performance you can rely on
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Card 2 — More flexible growth */}
          <div className="relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1130] p-7">
            {/* Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
              <svg
                className="text-white"
                fill="none"
                height="18"
                viewBox="0 0 24 24"
                width="18"
              >
                <rect
                  fill="currentColor"
                  height="7"
                  opacity="0.4"
                  rx="1.5"
                  width="7"
                  x="3"
                  y="3"
                />
                <rect
                  fill="currentColor"
                  height="7"
                  rx="1.5"
                  width="7"
                  x="14"
                  y="3"
                />
                <rect
                  fill="currentColor"
                  height="7"
                  opacity="0.6"
                  rx="1.5"
                  width="7"
                  x="3"
                  y="14"
                />
                <rect
                  fill="currentColor"
                  height="7"
                  opacity="0.2"
                  rx="1.5"
                  width="7"
                  x="14"
                  y="14"
                />
              </svg>
            </div>

            {/* Title */}
            <h3 className="font-bold text-2xl text-white leading-tight">
              More flexible growth
            </h3>

            {/* Inner subtitle */}
            <p className="font-semibold text-gray-400 text-xs uppercase tracking-widest">
              Hosting that grows with you
            </p>

            {/* Description */}
            <p className="-mt-2 text-gray-400 text-sm leading-relaxed">
              Cloud hosting offers premium solutions that ensures your needs
              which keep growing with reliable uptime, powerful performance,
              enhanced security, and flexible pricing.
            </p>

            {/* Divider + CTA */}
            <div className="mt-auto border-white/10 border-t pt-5">
              <Link
                className="group inline-flex items-center gap-2 font-medium text-sm text-white/80 transition-colors hover:text-white"
                href="/domains/register"
              >
                Hosting for agencies
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-2xl md:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              className={[
                "flex flex-col items-center justify-center gap-1 bg-violet-600 px-6 py-8",
                i < stats.length - 1 ? "border-violet-500/40 border-r" : "",
              ].join(" ")}
              key={stat.label}
            >
              <span className="flex items-baseline gap-0.5 font-extrabold text-3xl text-white">
                <CountUp duration={2} from={0} to={stat.value} />
                <span>{stat.suffix}</span>
              </span>
              <span className="text-center text-violet-200 text-xs leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
