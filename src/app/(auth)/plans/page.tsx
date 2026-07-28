import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createPlanInvoice } from "@/app/actions";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgPlan } from "@/lib/db/schema";
import { PlanCard } from "./components/PlanCard";

export default async function PlansPage({
  searchParams: _searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const searchParams = await _searchParams;
  const user = await getUser();

  if (searchParams.action === "buy" && searchParams.planId) {
    const result = await createPlanInvoice(searchParams.planId);

    if (result.status === "success") {
      redirect(result.message);
    }
  }

  // Fetch plans without the planFeatures relation
  const plans = await db.query.pgPlan.findMany({
    orderBy: asc(pgPlan.price),
  });

  // Check if user has a plan and if any plans would be downgrades
  const userPlan = user.organization.plan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-muted/20">
      <div className="mx-auto max-w-7xl p-6 pb-16">
        {/* Header Section */}
        <div className="mb-12 space-y-6 text-center">
          <div className="space-y-3">
            <h1 className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text font-bold text-4xl text-transparent tracking-tight md:text-5xl">
              Planos de Hospedagem
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Escolha o melhor plano para suas necessidades e comece a criar
              sites incríveis hoje mesmo
            </p>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              99.9% Uptime
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              SSL Gratuito
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              Suporte 24/7
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              30 dias de garantia
            </div>
          </div>
        </div>

        {/* Plans Carousel */}
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-2 rounded-full bg-gradient-to-b from-primary via-primary/80 to-primary/50 shadow-lg" />
              <div className="space-y-1">
                <h2 className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text font-bold text-3xl text-transparent">
                  Nossos Planos
                </h2>
                <p className="text-muted-foreground text-sm">
                  Escolha o plano perfeito para suas necessidades
                </p>
              </div>
            </div>
          </div>

          <Carousel
            className="group w-full overflow-visible"
            opts={{
              align: "start",
              axis: "x",
              slidesToScroll: 1,
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              {/* Progress indicator */}
              <div className="flex items-center gap-3 opacity-60 transition-opacity group-hover:opacity-100">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <div className="font-medium text-muted-foreground text-xs">
                    {plans.length} planos disponíveis
                  </div>
                </div>
                <div className="h-1 w-16 rounded-full bg-muted">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-primary to-primary/70" />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-3 opacity-60 transition-all duration-300 group-hover:opacity-100">
                <CarouselPrevious className="relative left-0 h-11 w-11 translate-y-0 rounded-xl border-2 border-border/30 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg" />
                <CarouselNext className="relative right-0 h-11 w-11 translate-y-0 rounded-xl border-2 border-border/30 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg" />
              </div>
            </div>

            <CarouselContent className="-ml-6">
              {plans.map((plan, index) => (
                <CarouselItem
                  className="group/item mt-2 mb-4 basis-full pl-6 sm:basis-1/2 lg:basis-1/3"
                  key={plan.id}
                >
                  <div className="relative h-full transform transition-all duration-500 group-hover/item:z-10">
                    <PlanCard
                      isDowngrade={Boolean(
                        userPlan &&
                          plan.id !== userPlan.id &&
                          plan.price < userPlan.price
                      )}
                      plan={plan}
                      searchParams={searchParams}
                      user={user}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Enhanced Mobile Navigation */}
            <div className="mt-8 flex items-center justify-center gap-4 sm:hidden">
              <CarouselPrevious className="relative left-0 h-9 w-9 translate-y-0 rounded-full border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 transition-all duration-300 hover:border-primary/40 hover:from-primary/20 hover:to-primary/10" />
              <div className="flex gap-2">
                {plans.map((plan, index) => (
                  <div
                    className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20 transition-all duration-300 hover:scale-125 hover:bg-primary/40"
                    key={`dot-${plan.id}`}
                  />
                ))}
              </div>
              <CarouselNext className="relative right-0 h-9 w-9 translate-y-0 rounded-full border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 transition-all duration-300 hover:border-primary/40 hover:from-primary/20 hover:to-primary/10" />
            </div>
          </Carousel>
        </div>

        {/* Additional Features Section */}
        <div className="mt-14 mb-12">
          <div className="mx-auto max-w-4xl rounded-3xl border border-border/50 bg-card/30 p-8 backdrop-blur-sm">
            <div className="space-y-6 text-center">
              <div className="space-y-3">
                <h3 className="font-bold text-2xl tracking-tight">
                  Por que escolher nossos planos?
                </h3>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                  Oferecemos a melhor infraestrutura e suporte para garantir que
                  seu projeto tenha sucesso
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-3 rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-50/50 to-emerald-50/30 p-4 dark:border-green-800/50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
                    <div className="h-6 w-6 rounded-full bg-white" />
                  </div>
                  <h4 className="font-semibold">99.9% Uptime</h4>
                  <p className="text-muted-foreground text-sm">
                    Infraestrutura confiável com monitoramento 24/7
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 p-4 dark:border-blue-800/50 dark:from-blue-950/20 dark:to-cyan-950/20">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
                    <div className="h-6 w-6 rounded-full bg-white" />
                  </div>
                  <h4 className="font-semibold">Suporte Especializado</h4>
                  <p className="text-muted-foreground text-sm">
                    Equipe técnica pronta para te ajudar quando precisar
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-violet-50/30 p-4 dark:border-purple-800/50 dark:from-purple-950/20 dark:to-violet-950/20">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500">
                    <div className="h-6 w-6 rounded-full bg-white" />
                  </div>
                  <h4 className="font-semibold">Performance Otimizada</h4>
                  <p className="text-muted-foreground text-sm">
                    CDN global e servidores de alta performance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 space-y-4 text-center">
          <div className="mx-auto max-w-2xl rounded-2xl border bg-card/50 p-8 backdrop-blur">
            <h3 className="mb-2 font-semibold text-xl">
              Precisa de algo personalizado?
            </h3>
            <p className="mb-4 text-muted-foreground">
              Nossa equipe pode criar um plano sob medida para suas necessidades
              específicas
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                className="rounded-lg border border-border px-6 py-2 transition-colors hover:bg-muted/50"
                type="button"
              >
                Falar com vendas
              </button>
              <button
                className="rounded-lg bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
                type="button"
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
