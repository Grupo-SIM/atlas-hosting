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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/db/schema";
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
        description:
          "Por favor, insira uma URL válida do GitHub (ex: https://github.com/usuario/repo).",
        title: "URL do Repositório Inválida",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const result = await createApplication({
      branch,
      buildCmd: buildCommand || undefined,
      installCmd: installCommand || undefined,
      repo: gitRepo as `${string}/${string}`,
      startCmd: startCommand || undefined,
    });

    if (result.success) {
      toast({
        description: "Sua aplicação foi enviada para a fila de criação.",
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
        <CardTitle>Criar Nova Aplicação</CardTitle>
        <CardDescription>
          Preencha os detalhes abaixo para fazer o deploy da sua aplicação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          id="deployment-form"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col space-y-2">
            <Label>Tipo de Repositório</Label>
            <RadioGroup
              className="flex items-center space-x-4"
              onValueChange={setRepoType}
              value={repoType}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="public" value="public" />
                <Label htmlFor="public">Público</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="private" value="private" />
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
                className="w-fit"
                onClick={handleGitHubLogin}
                type="button"
                variant="outline"
              >
                Conectar com o GitHub
              </Button>
            </div>
          )}

          {repoType === "private" && user.githubToken && (
            <div className="flex flex-col space-y-2 rounded-md border border-green-400 bg-green-50 p-4">
              <Label className="text-green-900">Conectado ao GitHub</Label>
              <p className="text-green-800 text-sm">
                Sua conta do GitHub está conectada. Você pode fazer deploy de
                repositórios privados.
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Label htmlFor="git-repo">Repositório Git</Label>
            <Input
              id="git-repo"
              onChange={e => setRepoUrl(e.target.value)}
              placeholder="https://github.com/usuario/meu-repo"
              required
              value={repoUrl}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Input
              id="branch"
              onChange={e => setBranch(e.target.value)}
              placeholder="main"
              required
              value={branch}
            />
          </div>

          <p className="text-gray-500 text-sm">
            Opcional: Substitua os comandos padrão detectados.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="install-command">Comando de Instalação</Label>
              <Input
                id="install-command"
                onChange={e => setInstallCommand(e.target.value)}
                placeholder="ex: npm install"
                value={installCommand}
              />
            </div>
            <p className="text-gray-500 text-sm">
              Opcional: Substitua os comandos padrão detectados.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="install-command">Comando de Instalação</Label>
                <Input
                  id="install-command"
                  onChange={e => setInstallCommand(e.target.value)}
                  placeholder="ex: npm install"
                  value={installCommand}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="build-command">Comando de Build</Label>
                <Input
                  id="build-command"
                  onChange={e => setBuildCommand(e.target.value)}
                  placeholder="ex: npm run build"
                  value={buildCommand}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="start-command">Comando de Início</Label>
                <Input
                  id="start-command"
                  onChange={e => setStartCommand(e.target.value)}
                  placeholder="ex: npm start"
                  value={startCommand}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="start-command">Comando de Início</Label>
              <Input
                id="start-command"
                onChange={e => setStartCommand(e.target.value)}
                placeholder="ex: npm start"
                value={startCommand}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={() => router.back()} type="button" variant="outline">
          Cancelar
        </Button>
        <Button
          disabled={
            isSubmitting || (repoType === "private" && !user.githubToken)
          }
          form="deployment-form"
          onClick={() => document.querySelector("form")?.requestSubmit()}
          type="submit"
        >
          {isSubmitting ? "Enviando..." : "Fazer Deploy"}
        </Button>
      </CardFooter>
    </Card>
  );
}
