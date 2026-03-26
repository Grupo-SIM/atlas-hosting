import { ThemeProvider } from "@/components/ThemeProvider";
import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], display: 'swap' });
const rajdhani = Rajdhani({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: 'swap'
});

export const metadata: Metadata = {
  title: "Atlas Hosting - Hospedagem Profissional de Sites",
  description:
    "Hospedagem de sites profissional com alta performance, segurança e suporte 24/7. SSL grátis, 99.9% de uptime e painel de controle fácil.",
};

export const experimental_ppr = true;
// export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true} className="dark">
      <body className={`${inter.className} ${rajdhani.variable} antialiased`} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange={true}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
