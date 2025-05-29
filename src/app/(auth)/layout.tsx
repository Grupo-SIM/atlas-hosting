import { validateSession } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export const metadata: Metadata = {
  title: "Atlas Hosting - Serviços de Web Hosting",
  description:
    "Serviços de hospedagem profissional com gerenciamento fácil e preços acessíveis",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateSession();

  if (!user) {
    redirect("/login");
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
