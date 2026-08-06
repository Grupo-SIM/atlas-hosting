"use client";

import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/ModeToggle";
import { isAdminPath } from "../admin-mode";

/**
 * No modo admin a paleta é fixa (cinza/preto), então alternar claro/escuro não
 * teria efeito nenhum — o botão some enquanto o admin está nessas telas.
 */
export function ThemeToggleSlot() {
  const pathname = usePathname();
  if (isAdminPath(pathname)) return null;
  return <ModeToggle />;
}
