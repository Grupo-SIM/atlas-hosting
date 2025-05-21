"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SubmitButtonProps {
  domain: string;
  adminUsername: string;
  adminPassword: string;
}

export function SubmitButton({
  domain,
  adminUsername,
  adminPassword,
}: SubmitButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    setIsLoading(true);
    setProgress(0);
    setMessage("");

    const eventSource = new EventSource(
      `/api/wp-install?domain=${domain}&admin_username=${adminUsername}&admin_password=${adminPassword}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.error) {
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive",
        });
        eventSource.close();
        setIsLoading(false);
        return;
      }

      if (data.step) {
        setProgress((data.step / data.total) * 100);
        setMessage(data.message);
      }

      if (data.success) {
        eventSource.close();
        setIsLoading(false);
        router.push("/sites");
      }
    };

    eventSource.onerror = () => {
      toast({
        title: "Erro",
        description: "Erro na conexão com o servidor",
        variant: "destructive",
      });
      eventSource.close();
      setIsLoading(false);
    };

    return () => {
      eventSource.close();
    };
  };

  return (
    <div className="w-full space-y-4">
      <Button
        onClick={handleSubmit}
        disabled={isLoading || !domain || !adminUsername || !adminPassword}
        className="w-full"
        isLoading={isLoading}
      >
        {isLoading ? "Instalando..." : "Criar Site WordPress"}
      </Button>

      {isLoading && (
        <div className="w-full space-y-2">
          <div className="relative w-full h-2 bg-green-100 dark:bg-green-900/20 rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute inset-y-0 left-0 bg-green-500 dark:bg-green-400 transition-all duration-500",
                "after:absolute after:inset-0 after:translate-x-[-100%] after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">{message}</p>
        </div>
      )}
    </div>
  );
}
