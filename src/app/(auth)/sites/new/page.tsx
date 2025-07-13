"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { DeploymentOptions } from "./components/DeploymentOptions";
import { CoolifyDeploymentForm } from "./components/CoolifyDeploymentForm";
import { WordPressDeploymentForm } from "./components/WordPressDeploymentForm";

export default function NewSitePage() {
  const [selectedOption, setSelectedOption] = useState<"wordpress" | "coolify" | null>(null);

  return (
    <div className="space-y-6 p-6 pb-16">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
        Criar Novo Site
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Tipo de Aplicação</CardTitle>
          <CardDescription>
            Selecione o tipo de aplicação que você deseja criar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeploymentOptions onSelect={setSelectedOption} />
        </CardContent>
      </Card>

      {selectedOption === "coolify" && <CoolifyDeploymentForm />}
      {selectedOption === "wordpress" && <WordPressDeploymentForm />}
    </div>
  );
}
