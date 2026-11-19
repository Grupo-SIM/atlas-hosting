import type { ReactNode } from "react";
import { requireClientArea } from "@/lib/permissions/client";

export const dynamic = "force-dynamic";

/** Conta com acesso de equipe só entra aqui se a área do painel do cliente foi liberada para ela. */
export default async function Layout({ children }: { children: ReactNode }) {
  await requireClientArea("client_hosting");
  return children;
}
