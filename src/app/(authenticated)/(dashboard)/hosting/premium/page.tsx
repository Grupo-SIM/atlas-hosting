"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crown,
  Zap,
  Shield,
  Database,
  Globe,
  HardDrive,
  Cpu,
  Users,
  Clock,
  Check,
  Star,
  ArrowRight,
  Gauge,
  Lock,
  Headphones,
} from "lucide-react";

export default function PremiumHostingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>("enterprise");

  const premiumPlans = [
    {
      id: "enterprise",
      name: "Enterprise",
      price: 99.99,
      originalPrice: 149.99,
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
      resources: {
        cpu: "8 vCPU Dedicada",
        ram: "16 GB DDR4",
        storage: "500 GB NVMe",
        bandwidth: "Ilimitada",
        uptime: "99.99%",
      },
      recommended: true,
    },
    {
      id: "dedicated",
      name: "Servidor Dedicado",
      price: 199.99,
      originalPrice: 299.99,
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
      resources: {
        cpu: "16 vCPU Intel Xeon",
        ram: "32 GB ECC",
        storage: "1 TB NVMe",
        bandwidth: "10 Gbps",
        uptime: "99.99%",
      },
      recommended: false,
    },
    {
      id: "cloud",
      name: "Cloud Premium",
      price: 79.99,
      originalPrice: 119.99,
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
      resources: {
        cpu: "6 vCPU (Auto-scale)",
        ram: "12 GB DDR4",
        storage: "200 GB NVMe",
        bandwidth: "Ilimitada",
        uptime: "99.99%",
      },
      recommended: false,
    },
  ];

  const premiumFeatures = [
    {
      icon: Crown,
      title: "Performance Extrema",
      description:
        "Servidores de última geração com SSD NVMe e otimização avançada",
    },
    {
      icon: Shield,
      title: "Segurança Enterprise",
      description: "Proteção DDoS, firewall avançado e monitoramento 24/7",
    },
    {
      icon: Gauge,
      title: "Uptime 99.99%",
      description: "Garantia de disponibilidade com SLA premium",
    },
    {
      icon: Headphones,
      title: "Suporte White Glove",
      description: "Suporte prioritário com gerente de conta dedicado",
    },
  ];

  const comparisons = [
    { feature: "Performance", basic: "Padrão", premium: "10x mais rápido" },
    { feature: "Suporte", basic: "Básico", premium: "Prioritário 24/7" },
    { feature: "Backup", basic: "Semanal", premium: "Diário + Versionamento" },
    { feature: "SSL", basic: "Let's Encrypt", premium: "Premium Wildcard" },
    { feature: "CDN", basic: "Básico", premium: "Global Premium" },
    { feature: "Uptime", basic: "99.9%", premium: "99.99%" },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Hospedagem Premium
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Performance extrema, segurança enterprise e suporte dedicado para
          sites que precisam do máximo em hospedagem.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Star className="w-3 h-3 mr-1" />
            Oferta Limitada - 33% OFF
          </Badge>
        </div>
      </div>

      {/* Premium Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {premiumPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.recommended
                ? "border-yellow-400 shadow-xl scale-105 bg-gradient-to-b from-yellow-50 to-white"
                : ""
            } ${
              selectedPlan === plan.id ? "ring-2 ring-primary" : ""
            } transition-all duration-200 hover:shadow-lg cursor-pointer`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-500 text-yellow-900">
                  <Crown className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
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
                <div className="text-3xl font-bold">
                  {formatPrice(plan.price)}
                </div>
                <div className="text-sm text-muted-foreground line-through">
                  De {formatPrice(plan.originalPrice)}
                </div>
                <div className="text-sm text-green-600 font-medium">
                  Economize {formatPrice(plan.originalPrice - plan.price)}/mês
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Resources */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
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
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {plan.features.length > 8 && (
                  <div className="text-xs text-muted-foreground">
                    +{plan.features.length - 8} recursos adicionais
                  </div>
                )}
              </div>

              <Button
                className="w-full mt-6"
                variant={selectedPlan === plan.id ? "default" : "outline"}
                size="lg"
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
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Vantagens Premium</h2>
          <p className="text-muted-foreground">
            O que faz nossos planos premium serem únicos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {premiumFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <Icon className="h-10 w-10 mx-auto text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-4xl mx-auto">
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
                  key={index}
                  className="grid grid-cols-3 gap-4 items-center py-2 border-b last:border-b-0"
                >
                  <div className="font-medium">{comparison.feature}</div>
                  <div className="text-sm text-muted-foreground">
                    {comparison.basic}
                  </div>
                  <div className="text-sm font-medium text-green-600 flex items-center gap-1">
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
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">
                Migração Gratuita e Suporte Especializado
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nossa equipe especializada cuida de toda a migração do seu site
                sem custo adicional. Garantimos zero downtime e acompanhamento
                completo durante todo o processo.
              </p>
              <div className="flex gap-4 justify-center">
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
        <div className="max-w-2xl mx-auto text-center space-y-4 p-6 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <Crown className="h-8 w-8 mx-auto text-yellow-600" />
          <h3 className="text-xl font-semibold">
            Plano {premiumPlans.find((p) => p.id === selectedPlan)?.name}{" "}
            Selecionado
          </h3>
          <p className="text-muted-foreground">
            Aproveite nossa oferta limitada de 33% de desconto
          </p>
          <div className="text-2xl font-bold text-green-600">
            Economize{" "}
            {formatPrice(
              (premiumPlans.find((p) => p.id === selectedPlan)?.originalPrice ||
                0) -
                (premiumPlans.find((p) => p.id === selectedPlan)?.price || 0)
            )}{" "}
            por mês!
          </div>
          <div className="flex gap-4 justify-center">
            <Button variant="outline">Falar com Especialista</Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              Contratar Agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            ⏰ Oferta válida por tempo limitado • 🔒 Compra 100% segura • 💰
            Garantia de 30 dias
          </div>
        </div>
      )}

      {/* Guarantee */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Garantia de reembolso de 30 dias • SLA de 99.99% de uptime
        </div>
      </div>
    </div>
  );
}
