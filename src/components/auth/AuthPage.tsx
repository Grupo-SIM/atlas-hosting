import Link from "next/link";
import AtlasLogo from "@/assets/atlas.svg";
import { PropsWithChildren } from "react";
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
      <div className="w-full md:w-1/2 bg-gradient-to-br from-primary/90 to-blue-700 text-white p-8 md:p-16 flex flex-col justify-between">
        <div className="text-shadow-sm shadow-zinc-900/10">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center mb-2">
            <AtlasLogo className="h-8 w-min object-contain mr-2" />
            Atlas Hosting
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            Hospedagem poderosa para desenvolvedores e empresas
          </p>
        </div>

        <div className="hidden md:block space-y-8">
          <div className="flex items-start space-x-3">
            <div className="bg-white/20 p-3 rounded-full">
              <FaBolt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">99.9% Uptime</h3>
              <p className="opacity-80">
                Garantimos servidores confiáveis com máxima disponibilidade
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-white/20 p-3 rounded-full">
              <FaHeadset className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Suporte 24/7</h3>
              <p className="opacity-80">
                Nossa equipe está sempre disponível para ajudar você
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-white/20 p-3 rounded-full">
              <FaLock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Infraestrutura Segura</h3>
              <p className="opacity-80">
                Certificados SSL incluídos em todos os planos de hospedagem
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-0">
          <p className="opacity-70">
            © 2025 Atlas Hosting. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
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

export interface AuthPageProps {
  title: string;
  subtitle: string;
  switchHref: string;
  switchTitle: string;
  switchText: string;
}
