// src/app/(authenticated)/(dashboard)/sites/new/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { getUserDomains } from "@/lib/server/utils";
import { Suspense } from "react";
import { NewWordPressSiteForm } from "./components/NewWordPressSiteForm"; // Updated import
import { cookies } from "next/headers";

export default async function NewSitePageContainer() {
  const user = await getUser();

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

  const domains = await getUserDomains(user.id);

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
