"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function NewHostingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: {
        monthly: 9.99,
        yearly: 7.99,
      },
      description: "Perfeito para sites pessoais e blogs",
      features: [
        "1 Website",
        "10 GB SSD Storage",
        "Largura de Banda Ilimitada",
        "Certificado SSL Gratuito",
        "1 Conta de Email",
        "Suporte Básico",
      ],
      resources: {
        cpu: "1 vCPU",
        ram: "1 GB RAM",
        storage: "10 GB SSD",
        bandwidth: "Ilimitada",
      },
      recommended: false,
    },
    {
      id: "professional",
      name: "Professional",
      price: {
        monthly: 19.99,
        yearly: 15.99,
      },
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
      resources: {
        cpu: "2 vCPU",
        ram: "4 GB RAM",
        storage: "50 GB SSD",
        bandwidth: "Ilimitada",
      },
      recommended: true,
    },
    {
      id: "business",
      name: "Business",
      price: {
        monthly: 39.99,
        yearly: 31.99,
      },
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
      resources: {
        cpu: "4 vCPU",
        ram: "8 GB RAM",
        storage: "100 GB SSD",
        bandwidth: "Ilimitada",
      },
      recommended: false,
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Proteção DDoS e firewall incluídos",
    },
    {
      icon: Zap,
      title: "Performance Otimizada",
      description: "Servidores SSD de alta velocidade",
    },
    {
      icon: Clock,
      title: "Uptime 99.9%",
      description: "Garantia de disponibilidade",
    },
    {
      icon: Users,
      title: "Suporte Expert",
      description: "Equipe técnica especializada",
    },
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Escolha Seu Plano de Hospedagem
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Hospedagem confiável e rápida para seu site. Todos os planos incluem
          SSL gratuito, backup automático e suporte técnico.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-muted p-1 rounded-lg">
          <div className="grid grid-cols-2 gap-1">
            <Button
              variant={billingCycle === "monthly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingCycle("monthly")}
            >
              Mensal
            </Button>
            <Button
              variant={billingCycle === "yearly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingCycle("yearly")}
            >
              Anual
              <Badge variant="secondary" className="ml-2">
                -20%
              </Badge>
            </Button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.recommended ? "border-primary shadow-lg scale-105" : ""
            } ${
              selectedPlan === plan.id ? "ring-2 ring-primary" : ""
            } transition-all duration-200 hover:shadow-md cursor-pointer`}
            onClick={() => handleSelectPlan(plan.id)}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <div className="text-3xl font-bold">
                  {formatPrice(plan.price[billingCycle])}
                </div>
                <div className="text-sm text-muted-foreground">
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
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Resources */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Recursos Técnicos:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
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
                className="w-full mt-6"
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Por que escolher a Atlas Hosting?
          </h2>
          <p className="text-muted-foreground">
            Oferecemos a melhor infraestrutura e suporte para seu sucesso online
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6 text-center">
                  <Icon className="h-8 w-8 mx-auto text-primary mb-4" />
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

      {/* CTA Section */}
      {selectedPlan && (
        <div className="max-w-2xl mx-auto text-center space-y-4 p-6 border rounded-lg bg-muted/50">
          <h3 className="text-xl font-semibold">
            Plano {plans.find((p) => p.id === selectedPlan)?.name} Selecionado
          </h3>
          <p className="text-muted-foreground">
            Continue para configurar seu novo site e domínio
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline">Continuar sem Domínio</Button>
            <Button>
              Adicionar Domínio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Money Back Guarantee */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Garantia de reembolso de 30 dias
        </div>
      </div>
    </div>
  );
}
