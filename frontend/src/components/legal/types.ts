import type { ReactNode } from "react";

export type LegalPageProps = {
  children: ReactNode;
  currentPage: "privacidade" | "termos";
  description: string;
  title: string;
};

export type LegalSectionProps = {
  children: ReactNode;
  title: string;
};
