import { CheckCircle2, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebook,
  FaThreads,
  FaTiktok,
  FaVideo,
  FaXTwitter,
} from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="relative z-20 w-full overflow-hidden bg-transparent pt-8 pb-6">
      <div className="w-full px-4 md:px-8">
        {/* Main Footer Container */}
        <div className="mb-2 px-4 pt-4 pb-6 md:py-10">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {/* Column 1: Logo, Text, Socials */}
            <div className="flex flex-col items-center text-center lg:items-center">
              <Link className="mb-8 block" href="/">
                <div className="relative mx-auto h-[45px] w-[180px] brightness-0 invert filter lg:mx-0">
                  <Image
                    alt="Atlashost Logo"
                    className="object-contain"
                    fill
                    src="/atlas-logo.png"
                    unoptimized
                  />
                </div>
              </Link>
              <p className="mb-8 max-w-[250px] text-[15px] text-white leading-relaxed">
                Feito pra quem quer mais do que só <br />
                "estar no ar"
              </p>

              <div className="flex flex-wrap justify-center gap-2.5">
                {[
                  {
                    href: "https://www.instagram.com/hostingatlas/",
                    icon: Instagram,
                  },
                  {
                    href: "https://www.youtube.com/@hostingatlas",
                    icon: Youtube,
                  },
                  { href: "https://x.com/hostingatlasbr", icon: FaXTwitter },
                  {
                    href: "https://www.threads.com/@hostingatlas",
                    icon: FaThreads,
                  },
                  {
                    href: "https://www.tiktok.com/@hostingatlas",
                    icon: FaTiktok,
                  },
                  { href: "https://kwai.com/@atlashosting", icon: FaVideo },
                  {
                    href: "https://www.facebook.com/hostingatlasbr/",
                    icon: FaFacebook,
                  },
                ].map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <Link
                      className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/10 bg-white/5 text-sky-400 transition-colors duration-300 hover:bg-sky-500 hover:text-white"
                      href={social.href}
                      key={idx}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Menu */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <h4 className="mb-6 font-bold text-[#00A3FF] text-[18px] uppercase tracking-wider">
                Menu
              </h4>

              <ul className="space-y-3.5 pl-1">
                {[
                  { href: "/vps", label: "VPS em nuvem" },
                  { href: "/vds", label: "Cloud VDS" },
                  { href: "/vps-armazenamento", label: "VPS de armazenamento" },
                  { href: "/vps-windows", label: "VPS Windows" },
                  { href: "/#planos", label: "Nossos Planos" },
                  { href: "/#testimonials", label: "Depoimentos" },
                ].map((link, idx) => (
                  <li className="group flex items-center gap-2.5" key={idx}>
                    <CheckCircle2 className="h-4 w-4 shrink-0 fill-sky-500/10 text-sky-500" />
                    <Link
                      className="text-[16px] text-white transition-colors group-hover:text-sky-400"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Blogs Recomendados */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <h4 className="mb-6 font-bold text-[#00A3FF] text-[18px] uppercase tracking-wider">
                Blogs Recomendados
              </h4>

              <ul className="space-y-3.5 pl-1">
                {[
                  { href: "https://007spyhacker.com/", label: "007SpyHacker" },
                  {
                    href: "https://centraldomarketing.com/",
                    label: "Central do Marketing",
                  },
                  {
                    href: "https://seguidoresemalta.com/",
                    label: "Seguidores em Alta",
                  },
                  {
                    href: "https://marketingraiz.com/",
                    label: "Marketing Raiz",
                  },
                  { href: "https://zyrionbrazil.com/", label: "Zyrion Brazil" },
                ].map((link, idx) => (
                  <li className="group flex items-center gap-2.5" key={idx}>
                    <CheckCircle2 className="h-4 w-4 shrink-0 fill-sky-500/10 text-sky-500" />
                    <Link
                      className="text-[16px] text-white transition-colors group-hover:text-sky-400"
                      href={link.href}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar Container */}
        <div className="flex flex-col items-center justify-between px-4 pt-4 text-center md:flex-row md:text-left">
          <p className="mb-4 text-[15px] text-white/60 md:mb-0">
            Copyright © 2026 JB Mídia, Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
