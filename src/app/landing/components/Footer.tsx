import Link from "next/link";
import AtlasLogo from "@/assets/atlas.svg";
import { Instagram, Youtube, Twitter, Facebook } from "lucide-react";
import { FaThreads, FaTiktok } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="py-12 px-4 border-t bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <AtlasLogo className="h-8 w-auto" />
              <span className="text-xl font-bold">Atlas Hosting</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Hospedagem profissional com alta performance e suporte
              especializado.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Produtos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#plans" className="hover:text-foreground">
                  Planos de Hospedagem
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-foreground">
                  Recursos
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="hover:text-foreground">
                  Depoimentos
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-foreground">
                  Perguntas Frequentes
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#privacy" className="hover:text-foreground">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="#terms" className="hover:text-foreground">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="https://api.whatsapp.com/send/?phone=5547997801802&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                  Suporte
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Redes Sociais</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="https://www.instagram.com/hostingatlas/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="https://www.youtube.com/@hostingatlas" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  YouTube
                </Link>
              </li>
              <li>
                <Link href="https://x.com/hostingatlasbr" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="https://www.threads.com/@hostingatlas" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-2">
                  <FaThreads className="h-4 w-4" />
                  Threads
                </Link>
              </li>
              <li>
                <Link href="https://www.tiktok.com/@hostingatlas" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-2">
                  <FaTiktok className="h-4 w-4" />
                  TikTok
                </Link>
              </li>
              <li>
                <Link href="https://kwai.com/@atlashosting" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-2">
                  <span className="h-4 w-4 flex items-center justify-center font-bold">K</span>
                  Kawai
                </Link>
              </li>
              <li>
                <Link href="https://www.facebook.com/hostingatlasbr/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Atlas Hosting. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

