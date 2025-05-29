import { ThemeProvider } from "@/components/ThemeProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SkeletonThemeProvider from "@/components/layouts/SkeletonThemeProvider";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

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
  return (
    <html lang="en" suppressHydrationWarning={true} className="dark">
      <body className={inter.className}>
        <Suspense>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
            disableTransitionOnChange={true}
          >
            <SkeletonThemeProvider>{children}</SkeletonThemeProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
