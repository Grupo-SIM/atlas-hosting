"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ADMIN_THEME_CLASS, isAdminPath } from "../admin-mode";

/**
 * Mantém a paleta de admin colada na rota: entrar por link direto, voltar pelo
 * navegador ou dar refresh não pode deixar o tema fora de sincronia com a tela.
 * O clique na sidebar já aplica a classe antes — aqui é só confirmação.
 */
export function AdminThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.toggle(
      ADMIN_THEME_CLASS,
      isAdminPath(pathname)
    );
  }, [pathname]);

  return null;
}
