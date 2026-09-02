import type { LegalSectionProps } from "./types";

export function LegalSection({ children, title }: LegalSectionProps) {
  return (
    <section className="border-white/10 border-b py-8 last:border-b-0 sm:py-10">
      <h2 className="mb-4 font-bold text-2xl text-white sm:text-3xl">{title}</h2>
      <div className="space-y-4 text-[15px] text-white/70 leading-7 sm:text-base">
        {children}
      </div>
    </section>
  );
}
