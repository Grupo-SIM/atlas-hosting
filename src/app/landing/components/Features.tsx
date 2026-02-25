import SpotlightCard from "./SpotlightCard";
import { Globe, Server, Zap, Mail, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    icon: Globe,
    title: "Qualidade",
    description:
      "Alta velocidade, segurança avançada, backups automáticos e um bom relacionamento com o cliente.",
  },
  {
    icon: Server,
    title: "Cashback",
    description:
      "Em todas as compras você receberá imediatamente o seu dinheiro de volta pelo Vale Bônus.",
  },
  {
    icon: Zap,
    title: "Velocidade",
    description:
      "Interface fácil e intuitiva. Em poucos cliques você compra seu dominio e configura o seu site.",
  },
  {
    icon: Mail,
    title: "Programa de afiliados",
    description:
      "Indique amigos e clientes e receba 10% de comissão recorrente, direto na sua conta.",
  },
  {
    icon: CreditCard,
    title: "Exclusividade",
    description:
      "Todos os nossos clientes tem acesso a uma interface premium e um construtor de sites.",
  },
  {
    icon: Lock,
    title: "Relacionamento",
    description:
      "Fácil contato e linguagem simples, nada de respostas muito técnicas e confusas.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: '#000319' }}>
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-green-500 rounded-full" />
            <span className="text-green-400 text-sm font-semibold uppercase tracking-wide">
              Benefícios
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Por que escolher o Atlas?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <SpotlightCard
                key={index}
                className="custom-spotlight-card"
                spotlightColor="rgba(34, 197, 94, 0.2)"
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8 text-green-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-base text-white/80 mb-6 flex-1">
                    {feature.description}
                  </p>
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-2 w-full"
                    asChild
                  >
                    <Link href="#plans">
                      VER PLANOS
                    </Link>
                  </Button>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

