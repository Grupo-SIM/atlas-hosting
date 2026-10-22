"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
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
      adminEmail,
      adminPassword,
      adminUsername,
      siteTitle,
    });

    if (result.success) {
      toast({
        description: "Seu site WordPress foi criado com sucesso.",
        title: "Sucesso!",
      });
      router.push("/sites");
    } else {
      toast({
        description: result.error,
        title: "Erro!",
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
                onChange={e => setSiteTitle(e.target.value)}
                placeholder="Meu Blog Incrível"
                value={siteTitle}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="admin-username">Usuário do Admin</Label>
              <Input
                id="admin-username"
                onChange={e => setAdminUsername(e.target.value)}
                placeholder="admin"
                value={adminUsername}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="admin-password">Senha do Admin</Label>
              <Input
                id="admin-password"
                onChange={e => setAdminPassword(e.target.value)}
                type="password"
                value={adminPassword}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="admin-email">Email do Admin</Label>
              <Input
                id="admin-email"
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                value={adminEmail}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancelar</Button>
        <Button
          disabled={isSubmitting}
          onClick={() => document.querySelector("form")?.requestSubmit()}
        >
          {isSubmitting ? "Criando..." : "Criar Site WordPress"}
        </Button>
      </CardFooter>
    </Card>
  );
}
