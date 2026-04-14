import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Instagram, Youtube } from "lucide-react";
import { FaThreads, FaTiktok, FaXTwitter, FaFacebook, FaVideo } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="bg-[#030616] pt-24 pb-12 w-full overflow-hidden">
      <div className="w-full px-4 md:px-8">
        
        {/* Main Rounded Footer Card */}
        <div className="bg-[#090d23] rounded-[24px] px-8 py-16 md:px-12 md:py-20 mb-8 border border-white/5 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8">
            
            {/* Column 1: Logo, Text, Socials */}
            <div className="flex flex-col items-center lg:items-center text-center">
              <Link href="/" className="mb-6 block">
                <Image
                  src="http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/2025/04/IMG_5796.png"
                  alt="Atlas Hosting"
                  width={250}
                  height={63}
                  className="h-14 w-auto object-contain"
                  unoptimized
                />
              </Link>
              <p className="text-[#a0a4b8] text-[13px] leading-relaxed mb-8 max-w-[220px]">
                Feito pra quem quer mais do que só <br />
                "estar no ar"
              </p>
              
              <div className="flex flex-wrap justify-center gap-2.5">
                {[
                  { icon: Instagram, href: "https://www.instagram.com/hostingatlas/" },
                  { icon: Youtube, href: "https://www.youtube.com/@hostingatlas" },
                  { icon: FaXTwitter, href: "https://x.com/hostingatlasbr" },
                  { icon: FaThreads, href: "https://www.threads.com/@hostingatlas" },
                  { icon: FaTiktok, href: "https://www.tiktok.com/@hostingatlas" },
                  { icon: FaVideo, href: "https://kwai.com/@atlashosting" },
                  { icon: FaFacebook, href: "https://www.facebook.com/hostingatlasbr/" },
                ].map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <Link
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[34px] h-[34px] rounded-full border border-white/5 bg-[#121832] flex items-center justify-center text-[#01FC8D] hover:bg-[#01FC8D] hover:text-[#090d23] transition-colors duration-300"
                    >
                      <Icon className="w-4 h-4" strokeWidth={2} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Menu */}
            <div className="flex flex-col">
              <div className="relative py-2.5 px-4 bg-[#121832] w-fit min-w-[160px] rounded-r border border-white/5 border-l-0 mb-6 group">
                 <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(-45deg,#fff_0,#fff_1px,transparent_1px,transparent_6px)] pointer-events-none" />
                 <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#01FC8D]" />
                 <h4 className="relative z-10 font-bold text-white text-[15px]">Menu</h4>
              </div>
              
              <ul className="space-y-3.5 pl-1">
                {[
                  { label: "Como Funciona", href: "#comofunciona" },
                  { label: "Serviços", href: "#servicos" },
                  { label: "Benefícios", href: "#beneficios" },
                  { label: "Planos", href: "#planos" },
                  { label: "Projetos", href: "#projetos" },
                  { label: "Blog", href: "/blog" },
                  { label: "FAQ", href: "#faq" },
                ].map((link, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 group">
                    <CheckCircle2 className="w-4 h-4 text-[#01FC8D] shrink-0 fill-[#01FC8D]/20" />
                    <Link href={link.href} className="text-[13.5px] text-[#a0a4b8] group-hover:text-[#01FC8D] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Serviços & Blogs */}
            <div className="flex flex-col">
              <div className="relative py-2.5 px-4 bg-[#121832] w-fit min-w-[200px] rounded-r border border-white/5 border-l-0 mb-6 group">
                 <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(-45deg,#fff_0,#fff_1px,transparent_1px,transparent_6px)] pointer-events-none" />
                 <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#01FC8D]" />
                 <h4 className="relative z-10 font-bold text-white text-[15px]">Serviços</h4>
              </div>
              
              <ul className="space-y-3.5 pl-1 mb-10">
                {[
                  { label: "Hospedagem otimizada", href: "#servicos" },
                  { label: "Compra de domínios", href: "#planos" },
                ].map((link, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 group">
                    <CheckCircle2 className="w-4 h-4 text-[#01FC8D] shrink-0 fill-[#01FC8D]/20" />
                    <Link href={link.href} className="text-[13.5px] text-[#a0a4b8] group-hover:text-[#01FC8D] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="relative py-2.5 px-4 bg-[#121832] w-fit min-w-[200px] rounded-r border border-white/5 border-l-0 mb-6 group">
                 <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(-45deg,#fff_0,#fff_1px,transparent_1px,transparent_6px)] pointer-events-none" />
                 <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#01FC8D]" />
                 <h4 className="relative z-10 font-bold text-white text-[15px]">Blogs Recomendados</h4>
              </div>

              <ul className="space-y-3.5 pl-1">
                {[
                  { label: "007SpyHacker", href: "https://007spyhacker.com/" },
                  { label: "Central do Marketing", href: "https://centraldomarketing.com/" },
                  { label: "Seguidores em Alta", href: "https://seguidoresemalta.com/" },
                  { label: "Marketing Raiz", href: "https://marketingraiz.com/" },
                  { label: "Zyrion Brazil", href: "https://zyrionbrazil.com/" },
                ].map((link, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 group">
                    <CheckCircle2 className="w-4 h-4 text-[#01FC8D] shrink-0 fill-[#01FC8D]/20" />
                    <Link href={link.href} target="_blank" rel="noopener noreferrer" className="text-[13.5px] text-[#a0a4b8] group-hover:text-[#01FC8D] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar Container */}
        <div className="flex flex-col md:flex-row justify-between items-center px-4 pt-4 text-center md:text-left">
          <p className="text-[#a0a4b8] text-[12px] mb-4 md:mb-0">
            Copyright © 2026 JB Mídia, Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-3 text-[12px] font-semibold">
            <Link href="/termos-de-uso" className="text-[#01FC8D] hover:text-white transition-colors">
              Termos de Uso
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/politica-de-privacidade" className="text-[#01FC8D] hover:text-white transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}


