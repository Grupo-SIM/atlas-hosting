"use client";

import { RefreshCw, Shield } from "lucide-react";
import { useState, useTransition } from "react";
import { generateSslForDomain, revalidateCurrentPath } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface SslFixButtonProps {
  domainName: string;
  serviceStatus: "operational" | "issues" | "error" | "unknown";
}

export function SslFixButton({ domainName, serviceStatus }: SslFixButtonProps) {
  const [isFixing, setIsFixing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleFixSsl = async () => {
    if (serviceStatus === "operational") return;

    setIsFixing(true);
    setProgress(0);

    try {
      // Start SSL generation
      generateSslForDomain(domainName);

      // Simulate progress over 30 seconds
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 100 / 30; // Progress over 30 seconds
        });
      }, 1000);

      // Wait for 30 seconds
      await new Promise(resolve => setTimeout(resolve, 30000));

      clearInterval(interval);
      setProgress(100);

      // Revalidate the page
      startTransition(async () => {
        await revalidateCurrentPath();
        setIsFixing(false);
        setProgress(0);
      });
    } catch (error) {
      console.error("Erro ao corrigir SSL:", error);
      setIsFixing(false);
      setProgress(0);
    }
  };

  // Only show button for error or issues status
  if (serviceStatus === "operational") return null;

  return (
    <div className="mt-3 space-y-2">
      {isFixing ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Instalando certificado SSL...
            </span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
          <Progress className="h-2" value={progress} />
          <p className="text-muted-foreground text-xs">
            Aguarde enquanto configuramos seu certificado SSL. Isso pode levar
            até 30 segundos.
          </p>
        </div>
      ) : (
        <Button
          className={`w-full font-medium text-xs transition-all duration-200 ${
            serviceStatus === "error"
              ? "border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700"
              : "border-amber-600 bg-amber-600 text-white hover:border-amber-700 hover:bg-amber-700"
          }disabled:opacity-50 shadow-sm hover:shadow-md disabled:cursor-not-allowed`}
          disabled={isPending}
          onClick={handleFixSsl}
          size="sm"
        >
          <div className="flex items-center space-x-2">
            {isPending ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Shield className="h-3 w-3" />
            )}
            <span>
              {serviceStatus === "error"
                ? "Instalar Certificado SSL"
                : "Corrigir SSL"}
            </span>
          </div>
        </Button>
      )}
    </div>
  );
}
