import { Roboto } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import type { Metadata } from "next";
import { N8nChatWrapper } from "@/components/N8nChatWrapper";
import { Toaster } from "@/components/ui/toaster";

const roboto = Roboto({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  description:
    "Hospedagem de sites profissional com alta performance, segurança e suporte 24/7. SSL grátis, 99.9% de uptime e painel de controle fácil.",
  title: "Atlas Hosting - Hospedagem Profissional de Sites",
};

export const viewport = {
  initialScale: 1,
  maximumScale: 1,
  width: "device-width",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${roboto.className} ${roboto.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange={true}
          enableSystem={false}
        >
          {children}
          <Toaster />
          <N8nChatWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}
