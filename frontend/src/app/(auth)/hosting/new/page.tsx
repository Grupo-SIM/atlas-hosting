"use client";

import {
  ArrowRight,
  Check,
  Clock,
  Cpu,
  Database,
  Globe,
  HardDrive,
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

export default function NewHostingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      description: "Perfeito para sites pessoais e blogs",
      features: [
        "1 Website",
        "10 GB SSD Storage",
        "Largura de Banda Ilimitada",
        "Certificado SSL Gratuito",
        "1 Conta de Email",
        "Suporte Básico",
      ],
      id: "starter",
      name: "Starter",
      price: {
        monthly: 9.99,
        yearly: 7.99,
      },
      recommended: false,
      resources: {
        bandwidth: "Ilimitada",
        cpu: "1 vCPU",
        ram: "1 GB RAM",
        storage: "10 GB SSD",
      },
    },
    {
      description: "Ideal para pequenas empresas",
      features: [
        "5 Websites",
        "50 GB SSD Storage",
        "Largura de Banda Ilimitada",
        "Certificado SSL Gratuito",
        "10 Contas de Email",
        "Suporte Prioritário",
        "Backup Automático",
        "CDN Gratuito",
      ],
      id: "professional",
      name: "Professional",
      price: {
        monthly: 19.99,
        yearly: 15.99,
      },
      recommended: true,
      resources: {
        bandwidth: "Ilimitada",
        cpu: "2 vCPU",
        ram: "4 GB RAM",
        storage: "50 GB SSD",
      },
    },
    {
      description: "Para empresas em crescimento",
      features: [
        "Websites Ilimitados",
        "100 GB SSD Storage",
        "Largura de Banda Ilimitada",
        "Certificado SSL Gratuito",
        "Contas de Email Ilimitadas",
        "Suporte 24/7",
        "Backup Automático",
        "CDN Premium",
        "Staging Environment",
      ],
      id: "business",
      name: "Business",
      price: {
        monthly: 39.99,
        yearly: 31.99,
      },
      recommended: false,
      resources: {
        bandwidth: "Ilimitada",
        cpu: "4 vCPU",
        ram: "8 GB RAM",
        storage: "100 GB SSD",
      },
    },
  ];

  const features = [
    {
      description: "Proteção DDoS e firewall incluídos",
      icon: Shield,
      title: "Segurança Avançada",
    },
    {
      description: "Servidores SSD de alta velocidade",
      icon: Zap,
      title: "Performance Otimizada",
    },
    {
      description: "Garantia de disponibilidade",
      icon: Clock,
      title: "Uptime 99.9%",
    },
    {
      description: "Equipe técnica especializada",
      icon: Users,
      title: "Suporte Expert",
    },
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      currency: "BRL",
      style: "currency",
    }).format(price);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-4 text-center">
        <h1 className="font-bold text-3xl tracking-tight md:text-4xl">
          Escolha Seu Plano de Hospedagem
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Hospedagem confiável e rápida para seu site. Todos os planos incluem
          SSL gratuito, backup automático e suporte técnico.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="rounded-lg bg-muted p-1">
          <div className="grid grid-cols-2 gap-1">
            <Button
              onClick={() => setBillingCycle("monthly")}
              size="sm"
              variant={billingCycle === "monthly" ? "default" : "ghost"}
            >
              Mensal
            </Button>
            <Button
              onClick={() => setBillingCycle("yearly")}
              size="sm"
              variant={billingCycle === "yearly" ? "default" : "ghost"}
            >
              Anual
              <Badge className="ml-2" variant="secondary">
                -20%
              </Badge>
            </Button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map(plan => (
          <Card
            className={`relative ${
              plan.recommended ? "scale-105 border-primary shadow-lg" : ""
            } ${
              selectedPlan === plan.id ? "ring-2 ring-primary" : ""
            } cursor-pointer transition-all duration-200 hover:shadow-md`}
            key={plan.id}
            onClick={() => handleSelectPlan(plan.id)}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="mr-1 h-3 w-3" />
                  Mais Popular
                </Badge>
              </div>
            )}

            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <div className="font-bold text-3xl">
                  {formatPrice(plan.price[billingCycle])}
                </div>
                <div className="text-muted-foreground text-sm">
                  por mês
                  {billingCycle === "yearly" && (
                    <span className="block">cobrado anualmente</span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div className="flex items-center space-x-2" key={index}>
                    <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Resources */}
              <div className="border-t pt-4">
                <h4 className="mb-2 font-medium">Recursos Técnicos:</h4>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs">
                  <div className="flex items-center gap-1">
                    <Cpu className="h-3 w-3" />
                    {plan.resources.cpu}
                  </div>
                  <div className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    {plan.resources.ram}
                  </div>
                  <div className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {plan.resources.storage}
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {plan.resources.bandwidth}
                  </div>
                </div>
              </div>

              <Button
                className="mt-6 w-full"
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

      {/* Features Section */}
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="mb-4 font-bold text-2xl">
            Por que escolher a Atlas Hosting?
          </h2>
          <p className="text-muted-foreground">
            Oferecemos a melhor infraestrutura e suporte para seu sucesso online
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6 text-center">
                  <Icon className="mx-auto mb-4 h-8 w-8 text-primary" />
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

      {/* CTA Section */}
      {selectedPlan && (
        <div className="mx-auto max-w-2xl space-y-4 rounded-lg border bg-muted/50 p-6 text-center">
          <h3 className="font-semibold text-xl">
            Plano {plans.find(p => p.id === selectedPlan)?.name} Selecionado
          </h3>
          <p className="text-muted-foreground">
            Continue para configurar seu novo site e domínio
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline">Continuar sem Domínio</Button>
            <Button>
              Adicionar Domínio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Money Back Guarantee */}
      <div className="py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <Shield className="h-4 w-4" />
          Garantia de reembolso de 30 dias
        </div>
      </div>
    </div>
  );
}
