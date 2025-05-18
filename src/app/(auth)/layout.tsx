import { validateSession } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Atlas Hosting - Serviços de Web Hosting",
  description: "Serviços de hospedagem profissional com gerenciamento fácil e preços acessíveis",
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <>{children}</>
  );
}