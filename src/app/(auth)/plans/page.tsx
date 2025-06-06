import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sortBy } from "lodash";
import { PlanCard } from "./components/PlanCard";
import { createPlanInvoice } from "@/app/actions";
import { redirect } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function PlansPage({
  searchParams: _searchParams,
}: { searchParams: Promise<{ [key: string]: string }> }) {
  const searchParams = await _searchParams;
  const user = await getUser();

  if (searchParams.action === "buy" && searchParams.planId) {
    const result = await createPlanInvoice(searchParams.planId);

    if (result.status === "success") {
      redirect(result.message);
    }
  }

  // Fetch plans without the planFeatures relation
  const dbPlans = await db.query.pgPlan.findMany();

  // Plans now have feature columns directly.
  // The previous mapping to create a 'features' array is no longer needed.
  const plans = sortBy(dbPlans, [
    (plan) => (plan.id === user.organization.planId ? -1 : 0),
    "price",
  ]);

  // Check if user has a plan and if any plans would be downgrades
  const userPlan = user.organization.plan;
  const hasDowngrades = userPlan && plans.some(plan => 
    plan.id !== userPlan.id && plan.price < userPlan.price
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-muted/20">
      <div className="max-w-7xl mx-auto p-6 pb-16">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Planos de Hospedagem
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o melhor plano para suas necessidades e comece a criar sites incríveis hoje mesmo
            </p>
          </div>

          {/* Downgrade Warning */}
          {hasDowngrades && (
            <Alert className="max-w-2xl mx-auto border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                Para fazer downgrade do seu plano, você precisa primeiro cancelar sua assinatura atual.{" "}
                <Link 
                  href="/settings" 
                  className="font-medium underline hover:no-underline text-amber-900 dark:text-amber-100"
                >
                  Gerencie suas assinaturas aqui
                </Link>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              99.9% Uptime
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              SSL Gratuito
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              Suporte 24/7
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              30 dias de garantia
            </div>
          </div>
        </div>

        {/* Plans Carousel */}
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-2 bg-gradient-to-b from-primary via-primary/80 to-primary/50 rounded-full shadow-lg" />
              <div className="space-y-1">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Nossos Planos
                </h2>
                <p className="text-sm text-muted-foreground">
                  Escolha o plano perfeito para suas necessidades
                </p>
              </div>
            </div>
          </div>

          <Carousel
            opts={{
              align: "start",
              slidesToScroll: 1,
              axis: "x"
            }}
            className="w-full group overflow-visible"
          >
            <div className="flex items-center justify-between mb-6">
              {/* Progress indicator */}
              <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <div className="text-xs text-muted-foreground font-medium">
                    {plans.length} planos disponíveis
                  </div>
                </div>
                <div className="h-1 w-16 bg-muted rounded-full">
                  <div className="h-full w-1/3 bg-gradient-to-r from-primary to-primary/70 rounded-full animate-pulse" />
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-all duration-300">
                <CarouselPrevious className="relative left-0 translate-y-0 h-11 w-11 rounded-xl border-2 border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-lg backdrop-blur-sm" />
                <CarouselNext className="relative right-0 translate-y-0 h-11 w-11 rounded-xl border-2 border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-lg backdrop-blur-sm" />
              </div>
            </div>

            <CarouselContent className="-ml-6">
              {plans.map((plan, index) => (
                <CarouselItem 
                  key={plan.id} 
                  className="pl-6 basis-full sm:basis-1/2 lg:basis-1/3 group/item"
                >
                  <div className="h-full transform transition-all duration-500 group-hover/item:scale-[1.02] group-hover/item:z-10 relative">
                    <PlanCard
                      plan={plan}
                      user={user}
                      searchParams={searchParams}
                      isDowngrade={Boolean(userPlan && plan.id !== userPlan.id && plan.price < userPlan.price)}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Enhanced Mobile Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8 sm:hidden">
              <CarouselPrevious className="relative left-0 translate-y-0 h-9 w-9 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/20 hover:border-primary/40 transition-all duration-300" />
              <div className="flex gap-2">
                {plans.map((plan, index) => (
                  <div 
                    key={`dot-${plan.id}`}
                    className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20 transition-all duration-300 hover:bg-primary/40 hover:scale-125"
                  />
                ))}
              </div>
              <CarouselNext className="relative right-0 translate-y-0 h-9 w-9 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/20 hover:border-primary/40 transition-all duration-300" />
            </div>
          </Carousel>
        </div>

        {/* Additional Features Section */}
        <div className="mt-20 mb-12">
          <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold tracking-tight">
                  Por que escolher nossos planos?
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Oferecemos a melhor infraestrutura e suporte para garantir que seu projeto tenha sucesso
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto">
                    <div className="w-6 h-6 bg-white rounded-full" />
                  </div>
                  <h4 className="font-semibold">99.9% Uptime</h4>
                  <p className="text-sm text-muted-foreground">
                    Infraestrutura confiável com monitoramento 24/7
                  </p>
                </div>
                
                <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200/50 dark:border-blue-800/50">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto">
                    <div className="w-6 h-6 bg-white rounded-full" />
                  </div>
                  <h4 className="font-semibold">Suporte Especializado</h4>
                  <p className="text-sm text-muted-foreground">
                    Equipe técnica pronta para te ajudar quando precisar
                  </p>
                </div>
                
                <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-purple-50/50 to-violet-50/30 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200/50 dark:border-purple-800/50">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto">
                    <div className="w-6 h-6 bg-white rounded-full" />
                  </div>
                  <h4 className="font-semibold">Performance Otimizada</h4>
                  <p className="text-sm text-muted-foreground">
                    CDN global e servidores de alta performance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 space-y-4">
          <div className="bg-card/50 backdrop-blur border rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-2">
              Precisa de algo personalizado?
            </h3>
            <p className="text-muted-foreground mb-4">
              Nossa equipe pode criar um plano sob medida para suas necessidades específicas
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                type="button"
                className="px-6 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                Falar com vendas
              </button>
              <button 
                type="button"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Ver todos os recursos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
