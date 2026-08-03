export const ADMIN_THEME_CLASS = "admin-theme";

export function isAdminPath(pathname: string | null): boolean {
  return pathname === "/admin" || !!pathname?.startsWith("/admin/");
}

/**
 * Mesma transição do toggle de tema do projeto revalida: troca a paleta dentro
 * de um View Transition e revela a nova cor num círculo que cresce a partir do
 * ponto clicado. Sem suporte a View Transitions, só troca a classe.
 */
export async function playAdminThemeTransition({
  enable,
  origin,
  duration = 450,
}: {
  enable: boolean;
  origin: { x: number; y: number } | null;
  duration?: number;
}): Promise<void> {
  const root = document.documentElement;
  const applyTheme = () => root.classList.toggle(ADMIN_THEME_CLASS, enable);

  const startViewTransition = (
    document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    }
  ).startViewTransition?.bind(document);

  if (!startViewTransition || !origin) {
    applyTheme();
    return;
  }

  await startViewTransition(applyTheme).ready;

  const { x, y } = origin;
  const maxRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  root.animate(
    {
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${maxRadius}px at ${x}px ${y}px)`,
      ],
    },
    {
      duration,
      easing: "ease-in-out",
      pseudoElement: "::view-transition-new(root)",
    }
  );
}
