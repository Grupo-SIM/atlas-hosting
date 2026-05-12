import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Instagram, Youtube } from "lucide-react";
import { FaThreads, FaTiktok, FaXTwitter, FaFacebook, FaVideo } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="bg-transparent pt-24 pb-12 w-full overflow-hidden">
      <div className="w-full px-4 md:px-8">

        {/* Main Footer Container - Background and border removed as requested */}
        <div className="px-4 py-16 md:py-24 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8">

            {/* Column 1: Logo, Text, Socials */}
            <div className="flex flex-col items-center lg:items-center text-center">
              <Link href="/" className="mb-8 block">
                <div className="relative w-[180px] h-[45px] mx-auto lg:mx-0 filter brightness-0 invert">
                  <Image
                    src="/atlas-logo.png"
                    alt="Atlashost Logo"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </Link>
              <p className="text-slate-400 text-[13px] leading-relaxed mb-8 max-w-[220px]">
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
                      className="w-[34px] h-[34px] rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-sky-400 hover:bg-sky-500 hover:text-white transition-colors duration-300"
                    >
                      <Icon className="w-4 h-4" strokeWidth={2} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Menu */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <h4 className="font-bold text-[#1394BE] text-[15px] uppercase tracking-wider mb-6">Menu</h4>

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
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 fill-sky-500/10" />
                    <Link href={link.href} className="text-[13.5px] text-slate-400 group-hover:text-sky-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Serviços & Blogs */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <h4 className="font-bold text-[#1394BE] text-[15px] uppercase tracking-wider mb-6">Serviços</h4>

              <ul className="space-y-3.5 pl-1 mb-10">
                {[
                  { label: "Hospedagem otimizada", href: "#servicos" },
                  { label: "Compra de domínios", href: "#planos" },
                ].map((link, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 group">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 fill-sky-500/10" />
                    <Link href={link.href} className="text-[13.5px] text-slate-400 group-hover:text-sky-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <h4 className="font-bold text-[#1394BE] text-[15px] uppercase tracking-wider mb-6">Blogs Recomendados</h4>

              <ul className="space-y-3.5 pl-1">
                {[
                  { label: "007SpyHacker", href: "https://007spyhacker.com/" },
                  { label: "Central do Marketing", href: "https://centraldomarketing.com/" },
                  { label: "Seguidores em Alta", href: "https://seguidoresemalta.com/" },
                  { label: "Marketing Raiz", href: "https://marketingraiz.com/" },
                  { label: "Zyrion Brazil", href: "https://zyrionbrazil.com/" },
                ].map((link, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 group">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 fill-sky-500/10" />
                    <Link href={link.href} target="_blank" rel="noopener noreferrer" className="text-[13.5px] text-slate-400 group-hover:text-sky-400 transition-colors">
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
          <p className="text-slate-500 text-[12px] mb-4 md:mb-0">
            Copyright © 2026 JB Mídia, Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-3 text-[12px] font-semibold">
            <Link href="/termos-de-uso" className="text-sky-500 hover:text-sky-400 transition-colors">
              Termos de Uso
            </Link>
            <span className="text-white/10">•</span>
            <Link href="/politica-de-privacidade" className="text-sky-500 hover:text-sky-400 transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}


