import { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Registrar domínio - Atlas Hosting",
  description: "Busque e registre seu domínio com facilidade no Atlas Hosting",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
