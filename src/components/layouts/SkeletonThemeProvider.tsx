"use client";

import { useTheme } from "next-themes";
import { PropsWithChildren } from "react";
import { SkeletonTheme } from "react-loading-skeleton";

const darkThemeBaseColor = "#212529";
const darkThemeHighlightColor = "#495057";

const lightThemeBaseColor = "#f8f9fa";
const lightThemeHighlightColor = "#dee2e6";

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
