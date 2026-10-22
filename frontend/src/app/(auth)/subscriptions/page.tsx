"use client";

import {
  ArrowRight,
  Check,
  CheckCircle,
  Clock,
  Cpu,
  Crown,
  Database,
  Gauge,
  Globe,
  HardDrive,
  Headphones,
  Mail,
  Shield,
  Sparkles,
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
import { Switch } from "@/components/ui/switch";

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    "professional"
  );

  const plans = [
    {
      color: "blue",
      description: "Perfeito para projetos pessoais",
      features: [
        "1 Site WordPress",
        "10 GB SSD Storage",
        "100 GB Bandwidth",
        "SSL Grátis",
        "1 Conta de Email",
        "Backup Semanal",
        "Suporte por Email",
        "WordPress Otimizado",
      ],
      id: "starter",
      limits: {
        bandwidth: "100 GB",
        emails: 1,
        sites: 1,
        storage: "10 GB",
      },
      name: "Starter",
      price: {
        monthly: 19.99,
        yearly: 15.99,
      },
      recommended: false,
    },
    {
      color: "purple",
      description: "Ideal para pequenas empresas",
      features: [
        "5 Sites WordPress",
        "50 GB SSD Storage",
        "Bandwidth Ilimitada",
        "SSL Premium",
        "10 Contas de Email",
        "Backup Diário",
        "Suporte Prioritário",
        "CDN Global",
        "Staging Environment",
        "WordPress Gerenciado",
      ],
      id: "professional",
      limits: {
        bandwidth: "Ilimitada",
        emails: 10,
        sites: 5,
        storage: "50 GB",
      },
      name: "Professional",
      price: {
        monthly: 39.99,
        yearly: 31.99,
      },
      recommended: true,
    },
    {
      color: "green",
      description: "Para empresas em crescimento",
      features: [
        "Sites Ilimitados",
        "200 GB SSD Storage",
        "Bandwidth Ilimitada",
        "SSL Premium Wildcard",
        "Emails Ilimitados",
        "Backup Diário + Versionamento",
        "Suporte 24/7",
        "CDN Premium",
        "Múltiplos Stagings",
        "WordPress Multisite",
        "Monitoramento Avançado",
        "Malware Protection",
      ],
      id: "business",
      limits: {
        bandwidth: "Ilimitada",
        emails: "Ilimitadas",
        sites: "Ilimitados",
        storage: "200 GB",
      },
      name: "Business",
      price: {
        monthly: 79.99,
        yearly: 63.99,
      },
      recommended: false,
    },
  ];

  const features = [
    {
      description: "Servidores SSD com cache avançado para máxima velocidade",
      icon: Zap,
      title: "Performance Otimizada",
    },
    {
      description: "Proteção contra malware e backups automáticos",
      icon: Shield,
      title: "Segurança Avançada",
    },
    {
      description: "Rede de distribuição de conteúdo em todo o mundo",
      icon: Globe,
      title: "CDN Global",
    },
    {
      description: "Equipe WordPress dedicada disponível 24/7",
      icon: Headphones,
      title: "Suporte Especializado",
    },
    {
      description: "Garantia de disponibilidade com monitoramento constante",
      icon: Gauge,
      title: "Uptime 99.9%",
    },
    {
      description: "Backups diários com restauração em 1 clique",
      icon: Database,
      title: "Backup Automático",
    },
  ];

  const testimonials = [
    {
      content:
        "A Atlas Hosting transformou completamente a performance do meu site. Velocidade incrível!",
      name: "Maria Silva",
      rating: 5,
      role: "Fundadora, Blog da Maria",
    },
    {
      content:
        "Suporte excepcional e infraestrutura robusta. Recomendo para qualquer empresa.",
      name: "João Santos",
      rating: 5,
      role: "CEO, TechStart",
    },
    {
      content:
        "Interface intuitiva e recursos avançados. Tudo que preciso para meus projetos.",
      name: "Ana Costa",
      rating: 5,
      role: "Designer Freelancer",
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      currency: "BRL",
      style: "currency",
    }).format(price);
  };

  const getSavings = (monthly: number, yearly: number) => {
    const yearlySavings = monthly * 12 - yearly * 12;
    const percentage = Math.round((yearlySavings / (monthly * 12)) * 100);
    return { amount: yearlySavings, percentage };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="space-y-12 p-6">
        {/* Hero Section */}
        <div className="mx-auto max-w-4xl space-y-6 pt-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-500" />
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-4xl text-transparent tracking-tight md:text-5xl">
              Hospedagem WordPress Premium
            </h1>
          </div>
          <p className="mx-auto max-w-3xl text-muted-foreground text-xl">
            Hospedagem otimizada para WordPress com performance excepcional,
            segurança avançada e suporte especializado. Escolha o plano ideal
            para seu projeto.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              variant="secondary"
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              SSL Grátis Incluído
            </Badge>
            <Badge
              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              variant="secondary"
            >
              <Clock className="mr-1 h-3 w-3" />
              Setup Instantâneo
            </Badge>
            <Badge
              className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              variant="secondary"
            >
              <Shield className="mr-1 h-3 w-3" />
              99.9% Uptime
            </Badge>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="rounded-lg border bg-white p-2 shadow-lg dark:bg-slate-800">
            <div className="flex items-center gap-4">
              <span
                className={`font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
              >
                Mensal
              </span>
              <Switch
                checked={billingCycle === "yearly"}
                onCheckedChange={checked =>
                  setBillingCycle(checked ? "yearly" : "monthly")
                }
              />
              <span
                className={`font-medium ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}
              >
                Anual
              </span>
              {billingCycle === "yearly" && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <Star className="mr-1 h-3 w-3" />
                  Economize até 20%
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map(plan => {
            const savings = getSavings(plan.price.monthly, plan.price.yearly);
            return (
              <Card
                className={`relative cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  plan.recommended
                    ? "scale-105 border-purple-300 bg-gradient-to-b from-purple-50 to-white shadow-xl dark:from-purple-950/20 dark:to-slate-900"
                    : selectedPlan === plan.id
                      ? "scale-102 border-primary shadow-lg"
                      : "hover:border-purple-200"
                }`}
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 text-white">
                      <Crown className="mr-1 h-3 w-3" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4 text-center">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    {plan.id === "starter" && (
                      <Globe className="h-6 w-6 text-blue-500" />
                    )}
                    {plan.id === "professional" && (
                      <Zap className="h-6 w-6 text-purple-500" />
                    )}
                    {plan.id === "business" && (
                      <Crown className="h-6 w-6 text-green-500" />
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>

                  <div className="mt-6">
                    <div className="font-bold text-4xl">
                      {formatPrice(plan.price[billingCycle])}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      por mês
                      {billingCycle === "yearly" && (
                        <div className="mt-1 font-medium text-green-600">
                          Economize {formatPrice(savings.amount)} por ano (
                          {savings.percentage}% off)
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Resource Overview */}
                  <div className="rounded-lg bg-muted/50 p-4 dark:bg-slate-800/50">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold">
                      <Cpu className="h-4 w-4" />
                      Recursos Incluídos
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-blue-500" />
                        <span>{plan.limits.sites} sites</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-3 w-3 text-green-500" />
                        <span>{plan.limits.storage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gauge className="h-3 w-3 text-orange-500" />
                        <span>{plan.limits.bandwidth}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-purple-500" />
                        <span>{plan.limits.emails} emails</span>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div className="flex items-center gap-3" key={feature}>
                        <div className="flex-shrink-0">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`mt-6 w-full ${
                      plan.recommended
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        : selectedPlan === plan.id
                          ? "bg-primary"
                          : ""
                    }`}
                    size="lg"
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                  >
                    {selectedPlan === plan.id
                      ? "Plano Selecionado"
                      : "Escolher Plano"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl">
              Por que escolher a Atlas Hosting?
            </h2>
            <p className="mx-auto max-w-3xl text-muted-foreground text-xl">
              Oferecemos a melhor infraestrutura WordPress com recursos
              avançados para garantir o sucesso do seu projeto online
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  className="transition-shadow duration-300 hover:shadow-lg"
                  key={feature.title}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl">
              O que nossos clientes dizem
            </h2>
            <p className="text-muted-foreground text-xl">
              Mais de 10.000 clientes confiam em nossa hospedagem WordPress
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                className="transition-shadow duration-300 hover:shadow-lg"
                key={testimonial.content}
              >
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        key={`${testimonial.name}-${i}`}
                      />
                    ))}
                  </div>
                  <blockquote className="mb-4 text-muted-foreground">
                    "{testimonial.content}"
                  </blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-muted-foreground text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        {selectedPlan && (
          <div className="mx-auto max-w-4xl">
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardContent className="pt-8">
                <div className="space-y-6 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-2xl">
                      Plano {plans.find(p => p.id === selectedPlan)?.name}{" "}
                      Selecionado
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      Comece hoje mesmo com hospedagem WordPress otimizada
                    </p>
                  </div>
                  <div className="font-bold text-3xl text-green-600">
                    {formatPrice(
                      plans.find(p => p.id === selectedPlan)?.price[
                        billingCycle
                      ] || 0
                    )}
                    /mês
                  </div>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button size="lg" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Falar com Especialista
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      size="lg"
                    >
                      Começar Agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      SSL Grátis
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Setup em 5 min
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Garantia 30 dias
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Benefits */}
        <div className="border-t py-12 text-center">
          <div className="mx-auto max-w-4xl">
            <h3 className="mb-6 font-bold text-2xl">
              Incluído em todos os planos
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="flex flex-col items-center">
                <Shield className="mb-2 h-8 w-8 text-green-500" />
                <span className="font-medium">SSL Grátis</span>
              </div>
              <div className="flex flex-col items-center">
                <Database className="mb-2 h-8 w-8 text-blue-500" />
                <span className="font-medium">Backup Diário</span>
              </div>
              <div className="flex flex-col items-center">
                <Zap className="mb-2 h-8 w-8 text-purple-500" />
                <span className="font-medium">Cache Avançado</span>
              </div>
              <div className="flex flex-col items-center">
                <Headphones className="mb-2 h-8 w-8 text-orange-500" />
                <span className="font-medium">Suporte Expert</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
