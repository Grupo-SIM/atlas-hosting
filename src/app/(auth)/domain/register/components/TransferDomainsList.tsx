"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { OrganizationDomain } from "@/lib/db/schema/tables/organization";
import { CheckCircle, Clock, RefreshCw } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { motion, type Variants } from "motion/react";

interface TransferDomainsListProps {
  domains: OrganizationDomain[];
}

export function TransferDomainsList({ domains }: TransferDomainsListProps) {
  const [refreshing, setRefreshing] = useState<string[]>([]);

  const handleRefresh = async (domainId: string) => {
    setRefreshing((prev) => [...prev, domainId]);
    // Simulate checking nameservers - replace with actual implementation
    setTimeout(() => {
      setRefreshing((prev) => prev.filter((id) => id !== domainId));
    }, 2000);
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
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium flex items-center gap-2">
                  {domain.domain}
                  <Clock className="h-4 w-4 text-yellow-500" />
                </p>
                <p className="text-sm text-muted-foreground">
                  Adicionado em {domain.createdAt.toLocaleDateString("pt-BR")}{" "}
                  às{" "}
                  {domain.createdAt.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Aguardando nameservers
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRefresh(domain.id)}
                  disabled={refreshing.includes(domain.id)}
                  className="flex items-center gap-1 relative"
                >
                  <MotionRefreshCw
                    variants={refreshVariants}
                    animate={
                      refreshing.includes(domain.id)
                        ? ["reloading", "spin"]
                        : "initial"
                    }
                    className={clsx("h-4 w-4 absolute")}
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
    translate: "-50% -50%",
    transition: { duration: 0.3, ease: "easeInOut" },
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
