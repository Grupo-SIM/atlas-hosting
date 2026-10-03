import { Roboto } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { FaBolt, FaHeadset, FaLock } from "react-icons/fa6";
import { LuArrowLeft } from "react-icons/lu";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700", "900"],
});

export default function AuthPage({
  title,
  subtitle,
  switchHref,
  switchTitle,
  switchText,
  children,
  backHref,
}: PropsWithChildren<AuthPageProps>) {
  return (
    <div
      className={`${roboto.variable} relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] p-4`}
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          loop
          muted
          playsInline
        >
          <source
            src="/vecteezy_powerful-server-room-in-modern-data-center-cloud-computing_7999282.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-black/60" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex h-auto w-full max-w-[1662px] flex-col overflow-hidden rounded-[59px] border border-[#00A8DA] bg-[rgba(0,29,48,0.79)] shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-md lg:h-[703px] lg:flex-row">
        {/* Left Side: Branding & Features */}
        <div className="flex flex-1 flex-col justify-center p-8 md:p-16 lg:p-20">
          <div className="flex max-w-[571px] flex-col gap-[16px]">
            {/* Branding */}
            <Link
              className="flex h-[40px] items-center gap-[7.5px] transition-opacity hover:opacity-80"
              href="/"
            >
              <div className="relative h-[32px] w-[35.5px]">
                <Image
                  alt="Atlas Logo"
                  className="object-contain"
                  fill
                  src="/logo-branca.svg"
                />
              </div>
              <span
                className={`${roboto.className} font-bold text-[36px] text-white tracking-tight`}
              >
                Atlas Hosting
              </span>
            </Link>

            {/* Headline */}
            <h1
              className={`${roboto.className} mt-4 font-bold text-[48px] text-white leading-[48px]`}
            >
              Hospedagem de Sites
              <br />
              Profissional
            </h1>

            {/* Subheadline */}
            <p className="max-w-[571px] font-normal text-[#DBEAFE] text-[20px] leading-[28px]">
              Infraestrutura otimizada para alta performance e segurança
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-8">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2144] text-white shadow-lg">
                <FaBolt className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  99.9% de Uptime
                </h3>
                <p className="text-[#DBEAFE]/70 text-sm">
                  Servidores com alta disponibilidade
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2144] text-white shadow-lg">
                <FaLock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">SSL Grátis</h3>
                <p className="text-[#DBEAFE]/70 text-sm">
                  Certificado SSL em todos os planos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2144] text-white shadow-lg">
                <FaHeadset className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Suporte 24/7</h3>
                <p className="text-[#DBEAFE]/70 text-sm">
                  Atendimento especializado
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container (Black Panel) */}
        <div className="relative flex max-w-full flex-1 flex-col justify-center rounded-[59px] border border-[#00A8DA] bg-[rgba(0,0,0,0.79)] p-8 md:p-16 lg:h-[703px] lg:max-w-[733px] lg:p-20">
          {backHref && (
            <Link
              aria-label="Voltar à página inicial"
              className="absolute top-6 left-6 flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-[#00A8DA] text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 md:top-8 md:left-8"
              href={backHref}
              title="Voltar à página inicial"
            >
              <LuArrowLeft aria-hidden="true" className="h-5 w-5" />
            </Link>
          )}
          <div className="mx-auto w-full max-w-sm">
            {/* Form Logo (Blue Filter) */}
            <div className="mb-8 flex justify-center">
              <Link
                className="relative block h-12 w-12 transition-opacity hover:opacity-80"
                href="/"
                style={{
                  filter:
                    "invert(52%) sepia(98%) saturate(1476%) hue-rotate(159deg) brightness(98%) contrast(101%)",
                }}
              >
                <Image
                  alt="Atlas Logo"
                  className="object-contain"
                  fill
                  src="/logo-branca.svg"
                />
              </Link>
            </div>

            <div className="mb-10 text-left">
              <h2
                className={`${roboto.className} mb-2 font-bold text-3xl text-white`}
              >
                {title}
              </h2>
              <p className="font-medium text-[#DBEAFE]/60 text-sm">
                {subtitle}
              </p>
            </div>

            <div className="auth-form-container">{children}</div>

            <div className="mt-10 text-center">
              <p className="font-medium text-sm text-white">
                {switchTitle}{" "}
                <Link
                  className="font-bold text-sky-400 transition-colors hover:text-sky-300"
                  href={switchHref}
                >
                  {switchText}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AuthPageProps {
  backHref?: string;
  title: string;
  subtitle: string;
  switchHref: string;
  switchTitle: string;
  switchText: string;
}
