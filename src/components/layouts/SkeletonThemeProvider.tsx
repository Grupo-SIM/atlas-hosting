"use client";

import { useTheme } from "next-themes";
import type { PropsWithChildren } from "react";
import { SkeletonTheme } from "react-loading-skeleton";

const darkThemeBaseColor = "#1e293b";
const darkThemeHighlightColor = "#334155";

const lightThemeBaseColor = "#f1f5f9";
const lightThemeHighlightColor = "#e2e8f0";

export default function SkeletonThemeProvider({ children }: PropsWithChildren) {
  const { resolvedTheme = "dark" } = useTheme();

  const baseColor =
    resolvedTheme === "dark" ? darkThemeBaseColor : lightThemeBaseColor;
  const highlightColor =
    resolvedTheme === "dark"
      ? darkThemeHighlightColor
      : lightThemeHighlightColor;

  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      {children}
    </SkeletonTheme>
  );
}
