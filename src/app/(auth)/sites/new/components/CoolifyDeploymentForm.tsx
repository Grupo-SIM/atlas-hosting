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
import { createCoolifyApplication } from "../../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function CoolifyDeploymentForm() {
  const [gitRepo, setGitRepo] = useState("");
  const [branch, setBranch] = useState("");
  const [buildCommand, setBuildCommand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await createCoolifyApplication({
      gitRepo,
      branch,
      buildCommand,
    });

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Sua aplicação foi criada com sucesso.",
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
        <CardTitle>Detalhes da Aplicação</CardTitle>
        <CardDescription>
          Preencha os detalhes abaixo para fazer o deploy da sua aplicação com o Coolify.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="git-repo">Repositório Git</Label>
              <Input
                id="git-repo"
                placeholder="https://github.com/meu-usuario/meu-repo.git"
                value={gitRepo}
                onChange={(e) => setGitRepo(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                placeholder="main"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="build-command">Comando de Build</Label>
              <Input
                id="build-command"
                placeholder="npm run build"
                value={buildCommand}
                onChange={(e) => setBuildCommand(e.target.value)}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancelar</Button>
        <Button onClick={() => document.querySelector('form')?.requestSubmit()} disabled={isSubmitting}>
          {isSubmitting ? "Fazendo Deploy..." : "Fazer Deploy"}
        </Button>
      </CardFooter>
    </Card>
  );
}
