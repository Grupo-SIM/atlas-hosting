import type { Metadata } from "next";
import "./swagger-isolation.css";

export const metadata: Metadata = {
  title: "API Documentation - Atlas Hosting",
  description: "Documentação completa da API RESTful do Atlas Hosting",
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ colorScheme: "light" }} className="swagger-isolated">
      <link
        rel="stylesheet"
        type="text/css"
        href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css"
      />
      {children}
    </div>
  );
}

