import Link from "next/link";
import { Button } from "@/components/ui/button";
import AtlasLogo from "@/assets/atlas.svg";
import { Instagram, Youtube, Twitter, Facebook, MessageSquare, Phone, Mail } from "lucide-react";
import { FaThreads, FaTiktok } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <AtlasLogo className="h-8 w-8 object-contain" />
              <span className="text-lg font-bold text-cyan-400">Atlas Hosting</span>
            </Link>
            <p className="text-sm text-white/70 mb-4">
              Feito pra quem quer mais do que só<br />
              "estar no ar"
            </p>
            <div className="flex gap-4">
              <Link href="https://www.instagram.com/hostingatlas/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-cyan-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://www.youtube.com/@hostingatlas" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-cyan-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="https://x.com/hostingatlasbr" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-cyan-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://www.threads.com/@hostingatlas" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-cyan-400 transition-colors">
                <FaThreads className="h-5 w-5" />
              </Link>
              <Link href="https://www.tiktok.com/@hostingatlas" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-cyan-400 transition-colors">
                <FaTiktok className="h-5 w-5" />
              </Link>
              <Link href="https://www.facebook.com/hostingatlasbr/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-cyan-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-white">Menu</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="#how-it-works" className="hover:text-cyan-400 transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="#servicos" className="hover:text-cyan-400 transition-colors">
                  Serviços
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-cyan-400 transition-colors">
                  Benefícios
                </Link>
              </li>
              <li>
                <Link href="#plans" className="hover:text-cyan-400 transition-colors">
                  Planos
                </Link>
              </li>
              <li>
                <Link href="#projetos" className="hover:text-cyan-400 transition-colors">
                  Projetos
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-cyan-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-cyan-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-white">Serviços</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="#servicos" className="hover:text-cyan-400 transition-colors">
                  Hospedagem otimizada
                </Link>
              </li>
              <li>
                <Link href="#comprar-dominio" className="hover:text-cyan-400 transition-colors">
                  Compra de domínios
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-white">Blogs Recomendados</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="#" className="hover:text-cyan-400 transition-colors">
                  007SpyHacker
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-cyan-400 transition-colors">
                  Central do Marketing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-cyan-400 transition-colors">
                  Seguidores em Alta
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-cyan-400 transition-colors">
                  Marketing Raiz
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-cyan-400 transition-colors">
                  Zyrion Brazil
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-cyan-400 transition-colors">
                  Frendz
                </Link>
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-sm text-white/70 mb-2">Acesse nosso blog e fique por dentro de tudo!</p>
              <Link href="#" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
                Acessar Agora →
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-sm text-white/70">
          <p>Copyright © 2025 JB Mídia, Todos os direitos reservados.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="#" className="hover:text-cyan-400 transition-colors">
              Termos de Uso
            </Link>
            <span className="text-white/30">|</span>
            <Link href="#" className="hover:text-cyan-400 transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


