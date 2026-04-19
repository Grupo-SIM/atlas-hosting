"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "swagger-ui-react/swagger-ui.css";

// Importar SwaggerUI dinamicamente para evitar problemas de SSR
const SwaggerUI = dynamic(
  () => import("swagger-ui-react").then((mod) => mod.default),
  { ssr: false }
);

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar a especificação do Swagger
    fetch("/api/swagger")
      .then((res) => {
        if (!res.ok) throw new Error("Falha na resposta da API");
        return res.json();
      })
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao carregar especificação Swagger:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Carregando documentação da API...</p>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-red-600 font-bold text-xl mb-2">Erro de Carregamento</h2>
          <p className="text-red-500">Não foi possível carregar a documentação JSON da API.</p>
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
