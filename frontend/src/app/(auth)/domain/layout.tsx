import type { ReactNode } from "react";
import { requireClientArea } from "@/lib/permissions/client";

export const dynamic = "force-dynamic"; // Force dynamic rendering for this layout

export default async function Layout({ children }: { children: ReactNode }) {
  // Conta com acesso de equipe só entra aqui se a área de domínios foi liberada para ela.
  await requireClientArea("client_domains");
  return <div className="container mx-auto px-4 py-8">{children}</div>;
}
