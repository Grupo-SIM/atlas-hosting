"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createWordPressApplication } from "../../actions";

export function WordPressDeploymentForm() {
  const [siteTitle, setSiteTitle] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await createWordPressApplication({
      siteTitle,
      adminUsername,
      adminPassword,
      adminEmail,
    });

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Seu site WordPress foi criado com sucesso.",
      });
      router.push("/sites");
    } else {
      toast({
        title: "Erro!",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes do WordPress</CardTitle>
        <CardDescription>
          Preencha os detalhes abaixo para criar seu site WordPress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="site-title">Título do Site</Label>
              <Input
                id="site-title"
                placeholder="Meu Blog Incrível"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="admin-username">Usuário do Admin</Label>
              <Input
                id="admin-username"
                placeholder="admin"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="admin-password">Senha do Admin</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="admin-email">Email do Admin</Label>
              <Input
                id="admin-email"
                placeholder="admin@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancelar</Button>
        <Button onClick={() => document.querySelector('form')?.requestSubmit()} disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar Site WordPress"}
        </Button>
      </CardFooter>
    </Card>
  );
}
