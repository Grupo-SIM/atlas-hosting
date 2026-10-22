import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-20 text-white">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="mb-4 font-bold text-4xl md:text-5xl">
          Pronto para começar?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-blue-100 text-xl">
          Junte-se a milhares de clientes que confiam na Atlas Hosting para seus
          projetos online
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            asChild
            className="px-8 text-lg"
            size="lg"
            variant="secondary"
          >
            <Link href="/signup">
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            className="border-white px-8 text-lg text-white hover:bg-white/10"
            size="lg"
            variant="outline"
          >
            <Link href="/login">Já tenho uma conta</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
