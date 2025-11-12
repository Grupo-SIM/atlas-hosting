import Link from "next/link";
import AtlasLogo from "@/assets/atlas.svg";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <AtlasLogo className="h-8 w-auto" />
          <span className="text-xl font-bold">Atlas Hosting</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Como funciona
          </Link>
          <Link
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Recursos
          </Link>
          <Link
            href="#plans"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Planos
          </Link>
          <Link
            href="#testimonials"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Depoimentos
          </Link>
          <Link
            href="#faq"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            FAQ
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="#comprar-dominio">Comprar Domínio</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

