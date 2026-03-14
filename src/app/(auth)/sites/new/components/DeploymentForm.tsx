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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createApplication } from "../../actions";

interface DeploymentFormProps {
  user: User & { githubToken?: string | null };
}

export function DeploymentForm({ user }: DeploymentFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [installCommand, setInstallCommand] = useState("");
  const [buildCommand, setBuildCommand] = useState("");
  const [startCommand, setStartCommand] = useState("");
  const [repoType, setRepoType] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleGitHubLogin = () => {
    const githubClientId = process.env.NEXT_PUBLIC_AUTH_GITHUB_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_URL}/auth/callback/github`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=repo`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    let gitRepo = "";
    try {
      const url = new URL(repoUrl);
      if (url.hostname !== "github.com") {
        throw new Error("Apenas repositórios do GitHub são suportados.");
      }
      gitRepo = url.pathname.substring(1).replace(/\.git$/, "");
      if (!gitRepo.match(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}\/[^/]+$/i)) {
        throw new Error("Formato de repositório inválido.");
      }
    } catch (error) {
      toast({
        title: "URL do Repositório Inválida",
        description:
          "Por favor, insira uma URL válida do GitHub (ex: https://github.com/usuario/repo).",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const result = await createApplication({
      repo: gitRepo as `${string}/${string}`,
      branch,
      installCmd: installCommand || undefined,
      buildCmd: buildCommand || undefined,
      startCmd: startCommand || undefined,
    });

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Sua aplicação foi enviada para a fila de criação.",
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
        <CardTitle>Criar Nova Aplicação</CardTitle>
        <CardDescription>
          Preencha os detalhes abaixo para fazer o deploy da sua aplicação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="deployment-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="flex flex-col space-y-2">
            <Label>Tipo de Repositório</Label>
            <RadioGroup
              value={repoType}
              onValueChange={setRepoType}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public">Público</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private">Privado</Label>
              </div>
            </RadioGroup>
          </div>

          {repoType === "private" && !user.githubToken && (
            <div className="flex flex-col space-y-2 rounded-md border border-yellow-400 bg-yellow-50 p-4">
              <Label className="text-yellow-900">
                Conexão com o GitHub Necessária
              </Label>
              <p className="text-sm text-yellow-800">
                Para fazer deploy de repositórios privados, você precisa
                conectar sua conta do GitHub.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleGitHubLogin}
                className="w-fit"
              >
                Conectar com o GitHub
              </Button>
            </div>
          )}

          {repoType === "private" && user.githubToken && (
            <div className="flex flex-col space-y-2 rounded-md border border-green-400 bg-green-50 p-4">
              <Label className="text-green-900">Conectado ao GitHub</Label>
              <p className="text-sm text-green-800">
                Sua conta do GitHub está conectada. Você pode fazer deploy de
                repositórios privados.
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Label htmlFor="git-repo">Repositório Git</Label>
            <Input
              id="git-repo"
              placeholder="https://github.com/usuario/meu-repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Input
              id="branch"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
            />
          </div>

          <p className="text-sm text-gray-500">
            Opcional: Substitua os comandos padrão detectados.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="install-command">Comando de Instalação</Label>
              <Input
                id="install-command"
                placeholder="ex: npm install"
                value={installCommand}
                onChange={(e) => setInstallCommand(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-500">
              Opcional: Substitua os comandos padrão detectados.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="install-command">Comando de Instalação</Label>
                <Input
                  id="install-command"
                  placeholder="ex: npm install"
                  value={installCommand}
                  onChange={(e) => setInstallCommand(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="build-command">Comando de Build</Label>
                <Input
                  id="build-command"
                  placeholder="ex: npm run build"
                  value={buildCommand}
                  onChange={(e) => setBuildCommand(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="start-command">Comando de Início</Label>
                <Input
                  id="start-command"
                  placeholder="ex: npm start"
                  value={startCommand}
                  onChange={(e) => setStartCommand(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="start-command">Comando de Início</Label>
              <Input
                id="start-command"
                placeholder="ex: npm start"
                value={startCommand}
                onChange={(e) => setStartCommand(e.target.value)}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="deployment-form"
          onClick={() => document.querySelector("form")?.requestSubmit()}
          disabled={
            isSubmitting || (repoType === "private" && !user.githubToken)
          }
        >
          {isSubmitting ? "Enviando..." : "Fazer Deploy"}
        </Button>
      </CardFooter>
    </Card>
  );
}
