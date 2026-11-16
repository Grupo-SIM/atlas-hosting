import type { ReactNode } from "react";
import { FitSite } from "./FitSite";

/**
 * Miniatura estática de um site, para as grades de cartões (templates e "Meus sites"). Preenche o pai (que
 * precisa ser `relative`) com o topo do site reduzido à largura do cartão. Sem rolagem, sem efeitos e sem
 * montagem por visibilidade: tudo vem no HTML da página, como um site sem JavaScript (o `SiteRenderer` deve
 * vir com `skipFxRuntime`, então nenhum script liga os efeitos). A classe `sb-thumb-static` (globals.css)
 * zera as animações e transições do CSS do site.
 */
export function StaticThumb({ children }: { children: ReactNode }) {
  return (
    <div className="sb-thumb-static absolute inset-0 overflow-hidden">
      <FitSite>{children}</FitSite>
    </div>
  );
}
