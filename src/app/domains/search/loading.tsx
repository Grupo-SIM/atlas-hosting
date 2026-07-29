import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/app/landing/components/Navbar";
import LoadingState from "./components/LoadingState";

export default function Loading() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#00050A]">
      <Navbar />

      {/* Background Grid Pattern from VDS */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#00050A]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <main className="relative z-10 w-full pt-20 md:pt-32">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-16 md:px-8 md:pt-10 md:pb-24">
          <Link
            className="mb-8 inline-flex items-center gap-2 text-slate-400 text-sm"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>

          <header className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
            <h1 className="font-black text-3xl text-white uppercase tracking-tight md:text-4xl lg:text-[2.65rem] lg:leading-tight">
              Encontre o nome do seu{" "}
              <span className="text-sky-500">domínio</span>
            </h1>
            <p className="mt-3 text-base text-slate-400 md:text-lg">
              Pesquise, compare extensões e registre em poucos cliques.
            </p>
          </header>

          <div className="mt-12 md:mt-14">
            <LoadingState />
          </div>
        </div>
      </main>
    </div>
  );
}
