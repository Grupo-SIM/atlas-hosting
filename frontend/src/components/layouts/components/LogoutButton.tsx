"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function LogoutButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        credentials: "include",
        method: "POST",
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast({
          description: "Você foi desconectado com sucesso.",
          title: "Logout realizado",
        });
        // Redirecionar para a página de login
        router.push("/login");
        router.refresh();
      } else {
        toast({
          description: data.message || "Ocorreu um erro ao fazer logout.",
          title: "Erro ao fazer logout",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        description: "Não foi possível fazer logout. Tente novamente.",
        title: "Erro ao fazer logout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full justify-start"
      disabled={isLoading}
      onClick={handleLogout}
      type="button"
      variant="ghost"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>{isLoading ? "Saindo..." : "Sair"}</span>
    </Button>
  );
}
