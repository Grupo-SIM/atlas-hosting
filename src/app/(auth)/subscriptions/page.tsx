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
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  ArrowRight,
  Check,
  Crown,
  Globe,
  Shield,
  Star,
  Users,
  Zap,
  Clock,
  Database,
  Mail,
  Headphones,
  Cpu,
  HardDrive,
  Gauge,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>("professional");

  const plans = [
    {
      id: "starter",
      name: "Starter",
      description: "Perfeito para projetos pessoais",
      price: {
        monthly: 19.99,
        yearly: 15.99,
      },
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
      limits: {
        sites: 1,
        storage: "10 GB",
        bandwidth: "100 GB",
        emails: 1,
      },
      recommended: false,
      color: "blue",
    },
    {
      id: "professional",
      name: "Professional",
      description: "Ideal para pequenas empresas",
      price: {
        monthly: 39.99,
        yearly: 31.99,
      },
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
      limits: {
        sites: 5,
        storage: "50 GB",
        bandwidth: "Ilimitada",
        emails: 10,
      },
      recommended: true,
      color: "purple",
    },
    {
      id: "business",
      name: "Business",
      description: "Para empresas em crescimento",
      price: {
        monthly: 79.99,
        yearly: 63.99,
      },
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
      limits: {
        sites: "Ilimitados",
        storage: "200 GB",
        bandwidth: "Ilimitada",
        emails: "Ilimitadas",
      },
      recommended: false,
      color: "green",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Performance Otimizada",
      description: "Servidores SSD com cache avançado para máxima velocidade",
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Proteção contra malware e backups automáticos",
    },
    {
      icon: Globe,
      title: "CDN Global",
      description: "Rede de distribuição de conteúdo em todo o mundo",
    },
    {
      icon: Headphones,
      title: "Suporte Especializado",
      description: "Equipe WordPress dedicada disponível 24/7",
    },
    {
      icon: Gauge,
      title: "Uptime 99.9%",
      description: "Garantia de disponibilidade com monitoramento constante",
    },
    {
      icon: Database,
      title: "Backup Automático",
      description: "Backups diários com restauração em 1 clique",
    },
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Fundadora, Blog da Maria",
      content: "A Atlas Hosting transformou completamente a performance do meu site. Velocidade incrível!",
      rating: 5,
    },
    {
      name: "João Santos",
      role: "CEO, TechStart",
      content: "Suporte excepcional e infraestrutura robusta. Recomendo para qualquer empresa.",
      rating: 5,
    },
    {
      name: "Ana Costa",
      role: "Designer Freelancer",
      content: "Interface intuitiva e recursos avançados. Tudo que preciso para meus projetos.",
      rating: 5,
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getSavings = (monthly: number, yearly: number) => {
    const yearlySavings = (monthly * 12) - (yearly * 12);
    const percentage = Math.round((yearlySavings / (monthly * 12)) * 100);
    return { amount: yearlySavings, percentage };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="p-6 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto pt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-blue-500" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hospedagem WordPress Premium
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hospedagem otimizada para WordPress com performance excepcional, 
            segurança avançada e suporte especializado. Escolha o plano ideal para seu projeto.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              SSL Grátis Incluído
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Clock className="w-3 h-3 mr-1" />
              Setup Instantâneo
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              <Shield className="w-3 h-3 mr-1" />
              99.9% Uptime
            </Badge>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg border">
            <div className="flex items-center gap-4">
              <span className={`font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Mensal
              </span>
              <Switch
                checked={billingCycle === "yearly"}
                onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
              />
              <span className={`font-medium ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Anual
              </span>
              {billingCycle === "yearly" && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Economize até 20%
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const savings = getSavings(plan.price.monthly, plan.price.yearly);
            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-xl cursor-pointer ${
                  plan.recommended
                    ? "border-purple-300 shadow-xl scale-105 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-slate-900"
                    : selectedPlan === plan.id
                    ? "border-primary shadow-lg scale-102"
                    : "hover:border-purple-200"
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {plan.id === "starter" && <Globe className="h-6 w-6 text-blue-500" />}
                    {plan.id === "professional" && <Zap className="h-6 w-6 text-purple-500" />}
                    {plan.id === "business" && <Crown className="h-6 w-6 text-green-500" />}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  
                  <div className="mt-6">
                    <div className="text-4xl font-bold">
                      {formatPrice(plan.price[billingCycle])}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      por mês
                      {billingCycle === "yearly" && (
                        <div className="text-green-600 font-medium mt-1">
                          Economize {formatPrice(savings.amount)} por ano ({savings.percentage}% off)
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Resource Overview */}
                  <div className="bg-muted/50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
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
                      <div key={feature} className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full mt-6 ${
                      plan.recommended
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        : selectedPlan === plan.id
                        ? "bg-primary"
                        : ""
                    }`}
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                    size="lg"
                  >
                    {selectedPlan === plan.id ? "Plano Selecionado" : "Escolher Plano"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Por que escolher a Atlas Hosting?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Oferecemos a melhor infraestrutura WordPress com recursos avançados 
              para garantir o sucesso do seu projeto online
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6 text-center">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">O que nossos clientes dizem</h2>
            <p className="text-xl text-muted-foreground">
              Mais de 10.000 clientes confiam em nossa hospedagem WordPress
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.content} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={`${testimonial.name}-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-4">
                    "{testimonial.content}"
                  </blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        {selectedPlan && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-8">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Plano {plans.find(p => p.id === selectedPlan)?.name} Selecionado
                    </h3>
                    <p className="text-muted-foreground text-lg">
                      Comece hoje mesmo com hospedagem WordPress otimizada
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {formatPrice(plans.find(p => p.id === selectedPlan)?.price[billingCycle] || 0)}/mês
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline" size="lg">
                      <Users className="mr-2 h-4 w-4" />
                      Falar com Especialista
                    </Button>
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      Começar Agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
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
        <div className="text-center py-12 border-t">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">Incluído em todos os planos</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center">
                <Shield className="h-8 w-8 text-green-500 mb-2" />
                <span className="font-medium">SSL Grátis</span>
              </div>
              <div className="flex flex-col items-center">
                <Database className="h-8 w-8 text-blue-500 mb-2" />
                <span className="font-medium">Backup Diário</span>
              </div>
              <div className="flex flex-col items-center">
                <Zap className="h-8 w-8 text-purple-500 mb-2" />
                <span className="font-medium">Cache Avançado</span>
              </div>
              <div className="flex flex-col items-center">
                <Headphones className="h-8 w-8 text-orange-500 mb-2" />
                <span className="font-medium">Suporte Expert</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}