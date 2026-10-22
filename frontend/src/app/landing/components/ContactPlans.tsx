"use client";

import Link from "next/link";

export function ContactPlans() {
  return (
    <section className="bg-background px-4 py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
          <p className="text-center text-white text-xl md:text-left md:text-2xl">
            Caso deseje um plano maior entre em contato agora mesmo:
          </p>
          <Link
            className="custom-animated-button inline-flex items-center justify-center px-8 py-6 font-semibold text-lg uppercase md:text-xl"
            href="https://api.whatsapp.com/send/?phone=5547997801802&text&type=phone_number&app_absent=0"
            rel="noopener noreferrer"
            target="_blank"
          >
            CLIQUE AQUI
          </Link>
        </div>
      </div>
    </section>
  );
}
