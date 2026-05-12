import Link from "next/link";
import Image from "next/image";
import type { PropsWithChildren } from "react";
import { FaBolt, FaLock, FaHeadset } from "react-icons/fa6";
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto"
});

export default function AuthPage({
  title,
  subtitle,
  switchHref,
  switchTitle,
  switchText,
  children,
}: PropsWithChildren<AuthPageProps>) {
  return (
    <div className={`${roboto.variable} relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#020617]`}>
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/vecteezy_powerful-server-room-in-modern-data-center-cloud-computing_7999282.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-black/60" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1662px] h-auto lg:h-[703px] flex flex-col lg:flex-row rounded-[59px] overflow-hidden border border-[#00A8DA] shadow-[0_40px_100px_rgba(0,0,0,0.8)] bg-[rgba(0,29,48,0.79)] backdrop-blur-md">
        
        {/* Left Side: Branding & Features */}
        <div className="flex-1 p-8 md:p-16 lg:p-20 flex flex-col justify-center">
          <div className="flex flex-col gap-[16px] max-w-[571px]">
            {/* Branding */}
            <div className="flex items-center gap-[7.5px] h-[40px]">
              <div className="relative w-[35.5px] h-[32px]">
                <Image src="/logo-branca.svg" alt="Atlas Logo" fill className="object-contain" />
              </div>
              <span className={`${roboto.className} text-[36px] font-bold text-white tracking-tight`}>
                Atlas Hosting
              </span>
            </div>

            {/* Headline */}
            <h1 className={`${roboto.className} text-[48px] leading-[48px] font-bold text-white mt-4`}>
              Hospedagem de Sites<br />
              Profissional
            </h1>

            {/* Subheadline */}
            <p className="text-[#DBEAFE] text-[20px] leading-[28px] font-normal max-w-[571px]">
              Infraestrutura otimizada para alta performance e segurança
            </p>
          </div>

          <div className="flex flex-col gap-8 mt-12">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-[#0B2144] flex items-center justify-center text-white shadow-lg">
                <FaBolt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">99.9% de Uptime</h3>
                <p className="text-[#DBEAFE]/70 text-sm">Servidores com alta disponibilidade</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-[#0B2144] flex items-center justify-center text-white shadow-lg">
                <FaLock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">SSL Grátis</h3>
                <p className="text-[#DBEAFE]/70 text-sm">Certificado SSL em todos os planos</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-[#0B2144] flex items-center justify-center text-white shadow-lg">
                <FaHeadset className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Suporte 24/7</h3>
                <p className="text-[#DBEAFE]/70 text-sm">Atendimento especializado</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container (Black Panel) */}
        <div className="flex-1 max-w-full lg:max-w-[733px] lg:h-[703px] p-8 md:p-16 lg:p-20 bg-[rgba(0,0,0,0.79)] border border-[#00A8DA] rounded-[59px] flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto">
            {/* Form Logo (Blue Filter) */}
            <div className="flex justify-center mb-8">
              <div className="relative w-12 h-12" style={{ filter: 'invert(52%) sepia(98%) saturate(1476%) hue-rotate(159deg) brightness(98%) contrast(101%)' }}>
                <Image src="/logo-branca.svg" alt="Atlas Logo" fill className="object-contain" />
              </div>
            </div>

            <div className="text-left mb-10">
              <h2 className={`${roboto.className} text-3xl font-bold text-white mb-2`}>{title}</h2>
              <p className="text-[#DBEAFE]/60 text-sm font-medium">{subtitle}</p>
            </div>

            <div className="auth-form-container">
              {children}
            </div>

            <div className="mt-10 text-center">
              <p className="text-white text-sm font-medium">
                {switchTitle}{" "}
                <Link
                  href={switchHref}
                  className="text-sky-400 font-bold hover:text-sky-300 transition-colors"
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
  title: string;
  subtitle: string;
  switchHref: string;
  switchTitle: string;
  switchText: string;
}
