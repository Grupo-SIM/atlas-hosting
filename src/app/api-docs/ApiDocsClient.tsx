"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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
      .then((res) => res.json())
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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div>Carregando documentação da API...</div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div>Erro ao carregar documentação da API</div>
      </div>
    );
  }

  return <SwaggerUI spec={spec} />;
}

