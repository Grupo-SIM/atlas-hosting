import Link from "next/link";
import AtlasLogo from "@/assets/atlas.svg";
import type { PropsWithChildren } from "react";
import { FaBolt, FaLock, FaHeadset } from "react-icons/fa6";

export default function AuthPage({
  title,
  subtitle,
  switchHref,
  switchTitle,
  switchText,
  children,
}: PropsWithChildren<AuthPageProps>) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding & Info */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center mb-12">
            <AtlasLogo className="h-8 w-min object-contain mr-2" />
            Atlas Hosting
          </h1>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Hospedagem de Sites
            <br />
            Profissional
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Infraestrutura otimizada para alta performance e segurança
          </p>

          <div className="grid gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-white/10 backdrop-blur-lg flex items-center justify-center">
                <FaBolt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">99.9% de Uptime</h3>
                <p className="text-blue-100">
                  Servidores com alta disponibilidade
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-white/10 backdrop-blur-lg flex items-center justify-center">
                <FaLock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">SSL Grátis</h3>
                <p className="text-blue-100">
                  Certificado SSL em todos os planos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-white/10 backdrop-blur-lg flex items-center justify-center">
                <FaHeadset className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Suporte 24/7</h3>
                <p className="text-blue-100">Atendimento especializado</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-blue-100">
            © 2024 Atlas Cloud. Todos os direitos reservados.
          </p>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 z-0">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute left-0 bottom-0 w-96 h-96 bg-violet-500 rounded-full filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          </div>
          {children}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              {switchTitle}{" "}
              <Link
                href={switchHref}
                className="text-primary font-medium hover:underline"
              >
                {switchText}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AuthPageProps {
  title: string;
  subtitle: string;
  switchHref: string;
  switchTitle: string;
  switchText: string;
}
