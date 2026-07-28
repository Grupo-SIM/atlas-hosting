import type { Metadata } from "next";
import "./swagger-isolation.css";

export const metadata: Metadata = {
  description: "Documentação completa da API RESTful do Atlas Hosting",
  title: "API Documentation - Atlas Hosting",
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="swagger-isolated" style={{ colorScheme: "light" }}>
      <link
        href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css"
        rel="stylesheet"
        type="text/css"
      />
      {children}
    </div>
  );
}
