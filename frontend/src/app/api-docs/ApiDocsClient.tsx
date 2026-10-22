"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "swagger-ui-react/swagger-ui.css";

// Importar SwaggerUI dinamicamente para evitar problemas de SSR
const SwaggerUI = dynamic(
  () => import("swagger-ui-react").then(mod => mod.default),
  { ssr: false }
);

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar a especificação do Swagger
    fetch("/api/swagger")
      .then(res => {
        if (!res.ok) throw new Error("Falha na resposta da API");
        return res.json();
      })
      .then(data => {
        setSpec(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao carregar especificação Swagger:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="font-medium text-muted-foreground">
            Carregando documentação da API...
          </p>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="mb-2 font-bold text-red-600 text-xl">
            Erro de Carregamento
          </h2>
          <p className="text-red-500">
            Não foi possível carregar a documentação JSON da API.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI spec={spec} />
    </div>
  );
}
