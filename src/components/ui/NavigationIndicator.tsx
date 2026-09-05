"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const SHOW_DELAY_MS = 180;
const HIDE_AFTER_MS = 15_000;

function isInternalNavigation(event: MouseEvent): boolean {
  if (
    event.button !== 0 ||
    event.defaultPrevented ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }

  const anchor = (event.target as Element | null)?.closest("a[href]");
  if (
    !anchor ||
    anchor.hasAttribute("download") ||
    anchor.target === "_blank" ||
    anchor.getAttribute("rel")?.includes("external")
  ) {
    return false;
  }

  const destination = new URL(anchor.href, window.location.href);
  const current = new URL(window.location.href);

  return (
    destination.origin === current.origin &&
    (destination.pathname !== current.pathname ||
      destination.search !== current.search)
  );
}

/**
 * Provides visible feedback for document navigations initiated by links.
 *
 * Local controls intentionally do not use this indicator. Their immediate
 * `:active` feedback is provided by globals.css and remains available before
 * React hydrates.
 */
export function NavigationIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const clearIndicator = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    clearIndicator();
  }, [clearIndicator, pathname, search]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!isInternalNavigation(event)) return;

      timerRef.current = window.setTimeout(() => {
        if (event.defaultPrevented) return;
        setIsVisible(true);
        hideTimerRef.current = window.setTimeout(clearIndicator, HIDE_AFTER_MS);
      }, SHOW_DELAY_MS);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("pageshow", clearIndicator);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("pageshow", clearIndicator);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (hideTimerRef.current !== null)
        window.clearTimeout(hideTimerRef.current);
    };
  }, [clearIndicator]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-0 right-0 left-0 z-[1000] h-1 overflow-hidden"
    >
      {isVisible && (
        <>
          <span className="sr-only">Carregando página</span>
          <div className="navigation-indicator-bar h-full w-full" />
        </>
      )}
    </div>
  );
}
