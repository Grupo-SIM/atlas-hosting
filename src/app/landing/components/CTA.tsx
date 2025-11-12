import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Pronto para começar?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Junte-se a milhares de clientes que confiam na Atlas Hosting para
          seus projetos online
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link href="/signup">
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 border-white text-white hover:bg-white/10"
            asChild
          >
            <Link href="/login">Já tenho uma conta</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

