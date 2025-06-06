// src/app/(authenticated)/(dashboard)/sites/new/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter, // Added CardFooter
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Added Button
import { getUser } from "@/lib/auth";
import { getUserDomains } from "@/lib/server/utils";
import Link from "next/link"; // Added Link
import { Suspense } from "react";
import { NewWordPressSiteForm } from "./components/NewWordPressSiteForm"; // Updated import
import { AlertTriangle } from "lucide-react"; // Corrected duplicate import

export default async function NewSitePageContainer() {
  const user = await getUser();

  if (!user.organization.plan) {
    return (
      <div className="space-y-6 p-6 pb-16 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <span>Assinatura Necessária</span>
            </CardTitle>
            <CardDescription>
              Para criar um novo site, é necessário ter uma assinatura ativa.
              Explore nossos planos e escolha o que melhor se adapta às suas
              necessidades para desbloquear este recurso.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/plans" passHref className="ml-auto">
              <Button>Ver Planos</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (user.organization.plan.maxSites === user.organization.domains.length) {
    const isElitePlan = user.organization.plan.name === "Elite";
    return (
      <div className="space-y-6 p-6 pb-16 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <span>
                {isElitePlan
                  ? "Limite Máximo de Sites Atingido"
                  : "Limite de Sites do Plano Atingido"}
              </span>
            </CardTitle>
            <CardDescription>
              {isElitePlan
                ? "Você atingiu o número máximo de sites permitido, mesmo no plano Elite. Para adicionar mais sites, por favor, entre em contato com o suporte. Você pode gerenciar seus sites existentes ou sua assinatura."
                : `Você utilizou todos os ${user.organization.plan.maxSites} sites disponíveis no seu plano atual (${user.organization.plan.name}). Para criar mais sites, por favor, faça um upgrade do seu plano.`}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            {isElitePlan ? (
              <div className="flex gap-2">
                <Link href="/plans" passHref className="ml-auto">
                  <Button variant="outline">Gerenciar Sites</Button>
                </Link>
              </div>
            ) : (
              <Link href="/plans" passHref>
                <Button>Fazer Upgrade do Plano</Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6 p-6 pb-16">
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Site WordPress</CardTitle>
            <CardDescription>
              Você precisa estar logado para criar um novo site.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const domains = await getUserDomains(user);

  return (
    <div className="p-6">
      <Suspense fallback={<NewSitePageSkeleton />}>
        <NewWordPressSiteForm domains={domains} userEmail={user.email} />
      </Suspense>
    </div>
  );
}

function NewSitePageSkeleton() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <div className="h-6 w-6 bg-muted rounded animate-pulse" />
          Instalação WordPress
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Skeleton for Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              {step < 3 && (
                <div className="w-16 md:w-24 h-0.5 bg-muted animate-pulse" />
              )}
            </div>
          ))}
        </div>
        {/* Skeleton for Form Content */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-2 w-2/3 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="h-4 w-1/4 bg-muted rounded mb-1 animate-pulse" />
              <div className="h-12 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <div className="h-12 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
