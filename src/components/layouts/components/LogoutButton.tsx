"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function LogoutButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
        // Redirecionar para a página de login
        router.push("/login");
        router.refresh();
      } else {
        toast({
          title: "Erro ao fazer logout",
          description: data.message || "Ocorreu um erro ao fazer logout.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Não foi possível fazer logout. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full justify-start"
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>{isLoading ? "Saindo..." : "Sair"}</span>
    </Button>
  );
}

