import { ThemeProvider } from "@/components/ThemeProvider";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import type { Metadata } from "next";

const roboto = Roboto({ 
  subsets: ["latin"], 
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: 'swap'
});

export const metadata: Metadata = {
  title: "Atlas Hosting - Hospedagem Profissional de Sites",
  description:
    "Hospedagem de sites profissional com alta performance, segurança e suporte 24/7. SSL grátis, 99.9% de uptime e painel de controle fácil.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${roboto.className} ${roboto.variable} antialiased`} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={true}
        >
          {children}
          <Toaster />
          <Script 
            src="https://app.dante-ai.com/bubble-embed.js?kb_id=e6479ec5-8d25-437d-8bdb-9a3606e3b54e&token=b75d931e-c9f0-4460-b81d-5c0a5ba26045"
            strategy="lazyOnload"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
