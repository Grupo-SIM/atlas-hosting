import DashboardLayout from "@/components/layouts/DashboardLayout";
import { getUser } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atlas Hosting - Serviços de Web Hosting",
  description: "Serviços de hospedagem profissional com gerenciamento fácil e preços acessíveis",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <DashboardLayout user={user}>{children}</DashboardLayout>
  );
}
