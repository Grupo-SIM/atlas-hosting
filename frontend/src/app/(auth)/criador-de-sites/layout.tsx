import type { ReactNode } from "react";
import { requireBuilderUser } from "@/lib/site-builder/access";

export default async function SiteBuilderLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireBuilderUser();
  return children;
}
