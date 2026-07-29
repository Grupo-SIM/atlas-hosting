import type { Metadata } from "next";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Serviços de hospedagem profissional com gerenciamento fácil e preços acessíveis",
  title: "Atlas Hosting - Serviços de Web Hosting",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
