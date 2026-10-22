"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function scrollToSectionById(id: string) {
  const element = document.getElementById(id);
  if (!element) return false;
  const header = document.getElementById("site-header");
  const headerOffset = header ? header.getBoundingClientRect().height + 8 : 96;
  const offsetPosition =
    element.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({
    behavior: "smooth",
    top: offsetPosition,
  });
  return true;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const raw = window.location.hash;
    if (!raw || raw === "#") return;
    const id = decodeURIComponent(raw.slice(1));
    if (!id) return;

    let cancelled = false;
    const tryScroll = () => {
      if (cancelled) return;
      scrollToSectionById(id);
    };

    tryScroll();
    const t0 = window.setTimeout(tryScroll, 0);
    const t1 = window.setTimeout(tryScroll, 120);
    const t2 = window.setTimeout(tryScroll, 400);
    const t3 = window.setTimeout(tryScroll, 900);

    return () => {
      cancelled = true;
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;

    const onHashChange = () => {
      const raw = window.location.hash;
      if (!raw || raw === "#") return;
      const id = decodeURIComponent(raw.slice(1));
      if (!id) return;
      window.setTimeout(() => scrollToSectionById(id), 0);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      if (href.startsWith("#") && href.length > 1) {
        if (pathname !== "/") return;
        e.preventDefault();
        history.replaceState(null, "", href);
        scrollToSectionById(href.slice(1));
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [pathname]);

  return <>{children}</>;
}
