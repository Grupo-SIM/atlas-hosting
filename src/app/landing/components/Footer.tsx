import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Instagram, Youtube } from "lucide-react";
import { FaThreads, FaTiktok, FaXTwitter, FaFacebook, FaVideo } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="bg-slate-100 pt-24 pb-12 w-full overflow-hidden">
      <div className="w-full px-4 md:px-8">

        {/* Main Rounded Footer Card */}
        <div className="bg-white rounded-[24px] px-8 py-16 md:px-12 md:py-20 mb-8 border border-slate-200 shadow-xl shadow-slate-200/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8">

            {/* Column 1: Logo, Text, Socials */}
            <div className="flex flex-col items-center lg:items-center text-center">
              <Link href="/" className="mb-6 block">
                <Image
                  src="/atlas-logo.png"
                  alt="Atlas Hosting"
                  width={250}
                  height={63}
                  className="h-14 w-auto object-contain filter brightness-0"
                  unoptimized
                />
              </Link>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-8 max-w-[220px]">
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
                      className="w-[34px] h-[34px] rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors duration-300"
                    >
                      <Icon className="w-4 h-4" strokeWidth={2} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Menu */}
            <div className="flex flex-col">
              <div className="relative py-2.5 px-4 bg-slate-50 w-fit min-w-[160px] rounded-r border border-slate-200 border-l-0 mb-6 group">
                <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(-45deg,#000_0,#000_1px,transparent_1px,transparent_6px)] pointer-events-none" />
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
                <h4 className="relative z-10 font-bold text-slate-900 text-[15px]">Menu</h4>
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
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 fill-emerald-500/10" />
                    <Link href={link.href} className="text-[13.5px] text-slate-500 group-hover:text-emerald-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Serviços & Blogs */}
            <div className="flex flex-col">
              <div className="relative py-2.5 px-4 bg-slate-50 w-fit min-w-[200px] rounded-r border border-slate-200 border-l-0 mb-6 group">
                <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(-45deg,#000_0,#000_1px,transparent_1px,transparent_6px)] pointer-events-none" />
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
                <h4 className="relative z-10 font-bold text-slate-900 text-[15px]">Serviços</h4>
              </div>

              <ul className="space-y-3.5 pl-1 mb-10">
                {[
                  { label: "Hospedagem otimizada", href: "#servicos" },
                  { label: "Compra de domínios", href: "#planos" },
                ].map((link, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 group">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 fill-emerald-500/10" />
                    <Link href={link.href} className="text-[13.5px] text-slate-500 group-hover:text-emerald-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="relative py-2.5 px-4 bg-slate-50 w-fit min-w-[200px] rounded-r border border-slate-200 border-l-0 mb-6 group">
                <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(-45deg,#000_0,#000_1px,transparent_1px,transparent_6px)] pointer-events-none" />
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
                <h4 className="relative z-10 font-bold text-slate-900 text-[15px]">Blogs Recomendados</h4>
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
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 fill-emerald-500/10" />
                    <Link href={link.href} target="_blank" rel="noopener noreferrer" className="text-[13.5px] text-slate-500 group-hover:text-emerald-600 transition-colors">
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
          <p className="text-slate-400 text-[12px] mb-4 md:mb-0">
            Copyright © 2026 JB Mídia, Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-3 text-[12px] font-semibold">
            <Link href="/termos-de-uso" className="text-emerald-600 hover:text-emerald-700 transition-colors">
              Termos de Uso
            </Link>
            <span className="text-slate-200">•</span>
            <Link href="/politica-de-privacidade" className="text-emerald-600 hover:text-emerald-700 transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}


