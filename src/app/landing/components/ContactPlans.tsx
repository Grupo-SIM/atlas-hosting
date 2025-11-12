"use client";

import Link from "next/link";

export function ContactPlans() {
  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
          <p className="text-white text-xl md:text-2xl text-center md:text-left">
            Caso deseje um plano maior entre em contato agora mesmo:
          </p>
          <Link
            href="https://api.whatsapp.com/send/?phone=5547997801802&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="custom-animated-button inline-flex items-center justify-center px-8 py-6 text-lg md:text-xl font-semibold uppercase"
          >
            CLIQUE AQUI
          </Link>
        </div>
      </div>
    </section>
  );
}

