"use client";

import clsx from "clsx";
import { Clock, RefreshCw } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { checkDomainNameservers } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { OrganizationDomain } from "@/lib/db/schema/tables/organization";

interface TransferDomainsListProps {
  domains: OrganizationDomain[];
}

export function TransferDomainsList({ domains }: TransferDomainsListProps) {
  const [refreshing, setRefreshing] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const handleRefresh = async (domain: OrganizationDomain) => {
    setRefreshing(prev => [...prev, domain.id]);

    const formData = new FormData();
    formData.set("domain", domain.domain);

    try {
      const result = await checkDomainNameservers(null, formData);

      toast({
        description: result.message,
        title: result.isCorrect
          ? "Transferência concluída!"
          : "Nameservers pendentes",
        variant: result.isCorrect ? "default" : "destructive",
      });

      if (result.isCorrect) {
        router.refresh();
      }
    } catch {
      toast({
        description: "Não foi possível verificar os nameservers.",
        title: "Erro",
        variant: "destructive",
      });
    } finally {
      setRefreshing(prev => prev.filter(id => id !== domain.id));
    }
  };

  if (domains.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-500" />
          Domínios em Transferência
        </CardTitle>
        <CardDescription>
          Acompanhe o status dos seus domínios em processo de transferência
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {domains.map(domain => (
            <div
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              key={domain.id}
            >
              <div className="flex-1">
                <p className="flex items-center gap-2 font-medium">
                  {domain.domain}
                  <Clock className="h-4 w-4 text-yellow-500" />
                </p>
                <p className="text-muted-foreground text-sm">
                  Adicionado em {domain.createdAt.toLocaleDateString("pt-BR")}{" "}
                  às{" "}
                  {domain.createdAt.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800">
                  <Clock className="h-3 w-3" />
                  Aguardando nameservers
                </span>

                <Button
                  className="relative flex items-center gap-1"
                  disabled={refreshing.includes(domain.id)}
                  onClick={() => handleRefresh(domain)}
                  size="sm"
                  variant="outline"
                >
                  <MotionRefreshCw
                    animate={
                      refreshing.includes(domain.id)
                        ? ["reloading", "spin"]
                        : "initial"
                    }
                    className={clsx("absolute h-4 w-4")}
                    variants={refreshVariants}
                  />
                  <span
                    className={clsx(
                      "ml-1.5 pl-4",
                      refreshing.includes(domain.id)
                        ? "opacity-0"
                        : "opacity-100"
                    )}
                  >
                    Verificar
                  </span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const refreshVariants: Variants = {
  initial: {
    left: "0.75rem",
    top: "50%",
    translate: "0 -50%",
  },
  reloading: {
    left: "50%",
    top: "50%",
    transition: { duration: 0.3, ease: "easeInOut" },
    translate: "-50% -50%",
  },
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Number.POSITIVE_INFINITY,
    },
  },
};

const MotionRefreshCw = motion(RefreshCw);
