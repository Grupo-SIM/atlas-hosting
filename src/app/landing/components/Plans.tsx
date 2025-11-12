"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Meteors } from "@/components/ui/meteors";

const plans = [
  {
    name: "START",
    description: "Perfeito para sites pessoais e blogs",
    monthlyPrice: "R$49,90",
    yearlyPrice: "R$499,00",
    popular: false,
    features: [
      "1 site",
      "Até 10.000 visitas mensais",
      "Armazenamento: 10gb",
      "WordPress + Elementor PRO",
      "SSL grátis e ilimitado",
      "Backups diários",
      "CDN grátis",
      "Prioridade no suporte",
    ],
  },
  {
    name: "PREMIUM",
    description: "Ideal para pequenas empresas",
    monthlyPrice: "R$79,90",
    yearlyPrice: "R$799,00",
    popular: false,
    features: [
      "5 sites",
      "Até 25.000 visitas mensais",
      "Armazenamento: 20gb",
      "WordPress + Elementor PRO",
      "SSL grátis e ilimitado",
      "Backups diários",
      "CDN grátis",
      "Prioridade no suporte",
    ],
  },
  {
    name: "BUSINESS",
    description: "Para grandes projetos e empresas",
    monthlyPrice: "R$109,90",
    yearlyPrice: "R$1.099,00",
    popular: true,
    features: [
      "10 sites",
      "Até 50.000 visitas mensais",
      "Armazenamento: 40gb",
      "WordPress + Elementor PRO",
      "SSL grátis e ilimitado",
      "Backups diários",
      "CDN grátis",
      "Prioridade no suporte",
    ],
  },
  {
    name: "ELITE",
    description: "Para empresas de grande porte",
    monthlyPrice: "R$159,90",
    yearlyPrice: "R$1.599,00",
    popular: false,
    features: [
      "15 sites",
      "Até 100.000 visitas mensais",
      "Armazenamento: 60gb",
      "WordPress + Elementor PRO",
      "SSL grátis e ilimitado",
      "Backups diários",
      "CDN grátis",
      "Prioridade no suporte",
    ],
  },
];

export function Plans() {
  const [isYearly, setIsYearly] = useState(false);
  return (
    <section id="plans" className="py-20 px-4 relative overflow-hidden">
      {/* Background com Meteors */}
      <div className="absolute inset-0 pointer-events-none">
        <Meteors number={30} />
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Planos que se adaptam ao seu negócio
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Escolha o plano ideal para suas necessidades. Todos incluem SSL
            grátis e suporte 24/7
          </p>
          
          {/* Toggle Mensal/Anual */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-white text-lg font-medium ${!isYearly ? 'font-semibold' : 'opacity-70'}`}>
              Mensal
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-green-500"
            />
            <div className="flex items-center gap-2">
              <span className={`text-white text-lg font-medium ${isYearly ? 'font-semibold' : 'opacity-70'}`}>
                Anual
              </span>
              <Badge className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-sm font-medium">
                -20%
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative overflow-visible border-none bg-black/40 rounded-3xl ${
                plan.popular
                  ? "shadow-lg scale-105"
                  : ""
              }`}
            >
              {/* Borda com gradiente que desaparece de cima para baixo */}
              <div 
                className="absolute inset-0 rounded-3xl pointer-events-none z-[1]"
                style={{
                  padding: '1px',
                  background: plan.popular
                    ? 'linear-gradient(to bottom, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0.5) 15%, rgba(20, 184, 166, 0.4) 30%, rgba(20, 184, 166, 0.3) 45%, rgba(20, 184, 166, 0.2) 60%, rgba(0, 0, 0, 0.1) 75%, rgba(0, 0, 0, 0.3) 85%, rgba(0, 0, 0, 0.5) 95%, rgba(0, 0, 0, 0.7) 100%)'
                    : 'linear-gradient(to bottom, rgba(139, 90, 43, 0.5) 0%, rgba(139, 90, 43, 0.4) 15%, rgba(139, 90, 43, 0.3) 30%, rgba(139, 90, 43, 0.2) 45%, rgba(139, 90, 43, 0.1) 60%, rgba(0, 0, 0, 0.1) 75%, rgba(0, 0, 0, 0.3) 85%, rgba(0, 0, 0, 0.5) 95%, rgba(0, 0, 0, 0.7) 100%)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                }}
              />

              {/* Background do topo - amarronzado para cards laterais, gradiente aurora para o popular */}
              <div 
                className={`absolute top-0 left-0 right-0 h-48 pointer-events-none z-0 rounded-t-3xl ${
                  plan.popular ? '' : ''
                }`}
                style={plan.popular 
                  ? {
                      background: `
                        radial-gradient(ellipse 120% 100% at 20% 0%, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0.4) 30%, transparent 60%),
                        radial-gradient(ellipse 120% 100% at 80% 0%, rgba(20, 184, 166, 0.6) 0%, rgba(20, 184, 166, 0.4) 30%, transparent 60%),
                        linear-gradient(to bottom, transparent 40%, rgba(0, 0, 0, 0.1) 60%, rgba(0, 0, 0, 0.3) 80%, rgba(0, 0, 0, 0.5) 100%)
                      `,
                      backgroundSize: '100% 100%, 100% 100%, 100% 100%',
                      backgroundPosition: 'top, top, center',
                      backgroundRepeat: 'no-repeat',
                    }
                  : {
                      background: 'linear-gradient(to bottom, rgba(139, 90, 43, 0.4) 0%, rgba(139, 90, 43, 0.3) 30%, rgba(139, 90, 43, 0.2) 50%, rgba(139, 90, 43, 0.1) 70%, transparent 100%)',
                    }
                }
              />
              
              {/* Overlay com gradiente que escurece de cima para baixo */}
              <div 
                className="absolute inset-0 pointer-events-none z-10 rounded-3xl"
                style={{
                  background: plan.popular
                    ? 'linear-gradient(to bottom, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.1) 65%, rgba(0, 0, 0, 0.3) 80%, rgba(0, 0, 0, 0.5) 90%, rgba(0, 0, 0, 0.7) 95%, rgba(0, 0, 0, 0.95) 100%)'
                    : 'linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(0, 0, 0, 0.1) 45%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.5) 75%, rgba(0, 0, 0, 0.7) 85%, rgba(0, 0, 0, 0.9) 95%, rgba(0, 0, 0, 0.95) 100%)',
                }}
              />
              
              {/* Tag com nome do plano */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 text-sm font-semibold z-20 rounded-tr-3xl rounded-bl-3xl">
                {plan.name}
              </div>
              
              <CardHeader className="pt-8 relative z-10">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-white">
                        {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground">/{isYearly ? 'ano' : 'mês'}</span>
                    </div>
              </CardHeader>
              <CardContent className="relative z-10 flex flex-col">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/signup"
                  className="w-full custom-animated-button inline-flex items-center justify-center mx-auto"
                >
                  Começar Agora
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

