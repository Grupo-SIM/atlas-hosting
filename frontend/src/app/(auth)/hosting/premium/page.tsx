"use client";

import {
  ArrowRight,
  Check,
  Clock,
  Cpu,
  Crown,
  Database,
  Gauge,
  Headphones,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PremiumHostingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>("enterprise");

  const premiumPlans = [
    {
      description: "Máxima performance para sites de alto tráfego",
      features: [
        "Websites Ilimitados",
        "500 GB SSD NVMe",
        "Largura de Banda Ilimitada",
        "CPU Dedicada (8 vCPU)",
        "16 GB RAM Dedicada",
        "SSL Premium Wildcard",
        "CDN Global Premium",
        "Backup Diário + Versionamento",
        "Staging Environment",
        "Suporte Prioritário 24/7",
        "Gerente de Conta Dedicado",
        "Monitoramento Avançado",
      ],
      id: "enterprise",
      name: "Enterprise",
      originalPrice: 149.99,
      price: 99.99,
      recommended: true,
      resources: {
        bandwidth: "Ilimitada",
        cpu: "8 vCPU Dedicada",
        ram: "16 GB DDR4",
        storage: "500 GB NVMe",
        uptime: "99.99%",
      },
    },
    {
      description: "Servidor físico exclusivo para máximo controle",
      features: [
        "Servidor Físico Exclusivo",
        "1 TB SSD NVMe",
        "Largura de Banda Ilimitada",
        "16 vCPU Intel Xeon",
        "32 GB RAM ECC",
        "SSL Premium Wildcard",
        "CDN Global Premium",
        "Backup Completo Diário",
        "Acesso Root Completo",
        "IP Dedicado",
        "Suporte White Glove 24/7",
        "Setup e Migração Gratuita",
      ],
      id: "dedicated",
      name: "Servidor Dedicado",
      originalPrice: 299.99,
      price: 199.99,
      recommended: false,
      resources: {
        bandwidth: "10 Gbps",
        cpu: "16 vCPU Intel Xeon",
        ram: "32 GB ECC",
        storage: "1 TB NVMe",
        uptime: "99.99%",
      },
    },
    {
      description: "Escalabilidade automática e alta disponibilidade",
      features: [
        "Auto-scaling Dinâmico",
        "200 GB SSD NVMe",
        "Largura de Banda Ilimitada",
        "6 vCPU Otimizada",
        "12 GB RAM",
        "SSL Premium",
        "CDN Global",
        "Backup Automático",
        "Load Balancer",
        "Múltiplas Zonas de Disponibilidade",
        "Suporte Expert 24/7",
        "API de Gerenciamento",
      ],
      id: "cloud",
      name: "Cloud Premium",
      originalPrice: 119.99,
      price: 79.99,
      recommended: false,
      resources: {
        bandwidth: "Ilimitada",
        cpu: "6 vCPU (Auto-scale)",
        ram: "12 GB DDR4",
        storage: "200 GB NVMe",
        uptime: "99.99%",
      },
    },
  ];

  const premiumFeatures = [
    {
      description:
        "Servidores de última geração com SSD NVMe e otimização avançada",
      icon: Crown,
      title: "Performance Extrema",
    },
    {
      description: "Proteção DDoS, firewall avançado e monitoramento 24/7",
      icon: Shield,
      title: "Segurança Enterprise",
    },
    {
      description: "Garantia de disponibilidade com SLA premium",
      icon: Gauge,
      title: "Uptime 99.99%",
    },
    {
      description: "Suporte prioritário com gerente de conta dedicado",
      icon: Headphones,
      title: "Suporte White Glove",
    },
  ];

  const comparisons = [
    { basic: "Padrão", feature: "Performance", premium: "10x mais rápido" },
    { basic: "Básico", feature: "Suporte", premium: "Prioritário 24/7" },
    { basic: "Semanal", feature: "Backup", premium: "Diário + Versionamento" },
    { basic: "Let's Encrypt", feature: "SSL", premium: "Premium Wildcard" },
    { basic: "Básico", feature: "CDN", premium: "Global Premium" },
    { basic: "99.9%", feature: "Uptime", premium: "99.99%" },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      currency: "BRL",
      style: "currency",
    }).format(price);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-4 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="font-bold text-3xl tracking-tight md:text-4xl">
            Hospedagem Premium
          </h1>
        </div>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
          Performance extrema, segurança enterprise e suporte dedicado para
          sites que precisam do máximo em hospedagem.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
            <Star className="mr-1 h-3 w-3" />
            Oferta Limitada - 33% OFF
          </Badge>
        </div>
      </div>

      {/* Premium Plans */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
        {premiumPlans.map(plan => (
          <Card
            className={`relative ${
              plan.recommended
                ? "scale-105 border-yellow-400 bg-gradient-to-b from-yellow-50 to-white shadow-xl"
                : ""
            } ${
              selectedPlan === plan.id ? "ring-2 ring-primary" : ""
            } cursor-pointer transition-all duration-200 hover:shadow-lg`}
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                <Badge className="bg-yellow-500 text-yellow-900">
                  <Crown className="mr-1 h-3 w-3" />
                  Mais Popular
                </Badge>
              </div>
            )}

            <CardHeader className="pb-2 text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                {plan.id === "enterprise" && (
                  <Crown className="h-5 w-5 text-yellow-500" />
                )}
                {plan.id === "dedicated" && (
                  <Database className="h-5 w-5 text-blue-500" />
                )}
                {plan.id === "cloud" && (
                  <Zap className="h-5 w-5 text-purple-500" />
                )}
                {plan.name}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <div className="font-bold text-3xl">
                  {formatPrice(plan.price)}
                </div>
                <div className="text-muted-foreground text-sm line-through">
                  De {formatPrice(plan.originalPrice)}
                </div>
                <div className="font-medium text-green-600 text-sm">
                  Economize {formatPrice(plan.originalPrice - plan.price)}/mês
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Resources */}
              <div className="rounded-lg bg-muted/50 p-3">
                <h4 className="mb-2 flex items-center gap-2 font-medium">
                  <Cpu className="h-4 w-4" />
                  Recursos Dedicados
                </h4>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div>• CPU: {plan.resources.cpu}</div>
                  <div>• RAM: {plan.resources.ram}</div>
                  <div>• Storage: {plan.resources.storage}</div>
                  <div>• Bandwidth: {plan.resources.bandwidth}</div>
                  <div>• Uptime: {plan.resources.uptime}</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                {plan.features.slice(0, 8).map((feature, index) => (
                  <div className="flex items-center space-x-2" key={index}>
                    <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {plan.features.length > 8 && (
                  <div className="text-muted-foreground text-xs">
                    +{plan.features.length - 8} recursos adicionais
                  </div>
                )}
              </div>

              <Button
                className="mt-6 w-full"
                size="lg"
                variant={selectedPlan === plan.id ? "default" : "outline"}
              >
                {selectedPlan === plan.id ? "Selecionado" : "Escolher Plano"}
                {selectedPlan !== plan.id && (
                  <ArrowRight className="ml-2 h-4 w-4" />
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Premium Features */}
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="mb-4 font-bold text-2xl">Vantagens Premium</h2>
          <p className="text-muted-foreground">
            O que faz nossos planos premium serem únicos
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {premiumFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card className="text-center" key={index}>
                <CardContent className="pt-6">
                  <Icon className="mx-auto mb-4 h-10 w-10 text-primary" />
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Premium vs Hospedagem Básica</CardTitle>
            <CardDescription>
              Veja a diferença que faz escolher premium
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparisons.map((comparison, index) => (
                <div
                  className="grid grid-cols-3 items-center gap-4 border-b py-2 last:border-b-0"
                  key={index}
                >
                  <div className="font-medium">{comparison.feature}</div>
                  <div className="text-muted-foreground text-sm">
                    {comparison.basic}
                  </div>
                  <div className="flex items-center gap-1 font-medium text-green-600 text-sm">
                    <Check className="h-4 w-4" />
                    {comparison.premium}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Migration Support */}
      <div className="mx-auto max-w-4xl">
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-blue-100 p-3">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold text-xl">
                Migração Gratuita e Suporte Especializado
              </h3>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Nossa equipe especializada cuida de toda a migração do seu site
                sem custo adicional. Garantimos zero downtime e acompanhamento
                completo durante todo o processo.
              </p>
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-green-500" />
                  Migração em 24h
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-500" />
                  Zero Downtime
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Headphones className="h-4 w-4 text-green-500" />
                  Suporte Dedicado
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      {selectedPlan && (
        <div className="mx-auto max-w-2xl space-y-4 rounded-lg border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 text-center">
          <Crown className="mx-auto h-8 w-8 text-yellow-600" />
          <h3 className="font-semibold text-xl">
            Plano {premiumPlans.find(p => p.id === selectedPlan)?.name}{" "}
            Selecionado
          </h3>
          <p className="text-muted-foreground">
            Aproveite nossa oferta limitada de 33% de desconto
          </p>
          <div className="font-bold text-2xl text-green-600">
            Economize{" "}
            {formatPrice(
              (premiumPlans.find(p => p.id === selectedPlan)?.originalPrice ||
                0) - (premiumPlans.find(p => p.id === selectedPlan)?.price || 0)
            )}{" "}
            por mês!
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline">Falar com Especialista</Button>
            <Button
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              size="lg"
            >
              Contratar Agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="text-muted-foreground text-xs">
            ⏰ Oferta válida por tempo limitado • 🔒 Compra 100% segura • 💰
            Garantia de 30 dias
          </div>
        </div>
      )}

      {/* Guarantee */}
      <div className="py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <Shield className="h-4 w-4" />
          Garantia de reembolso de 30 dias • SLA de 99.99% de uptime
        </div>
      </div>
    </div>
  );
}
