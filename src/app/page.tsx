import type { Metadata } from "next";
import { Navbar } from "./landing/components/Navbar";
import { Hero } from "./landing/components/Hero";
import dynamic from "next/dynamic";
const HowItWorks = dynamic(() => import("./landing/components/HowItWorks").then(mod => mod.HowItWorks), { ssr: true });
const Statistics = dynamic(() => import("./landing/components/Statistics").then(mod => mod.Statistics), { ssr: true });
const Services = dynamic(() => import("./landing/components/Services").then(mod => mod.Services), { ssr: true });
const PromotionalCards = dynamic(() => import("./landing/components/PromotionalCards").then(mod => mod.PromotionalCards), { ssr: true });
const Features = dynamic(() => import("./landing/components/Features").then(mod => mod.Features), { ssr: true });
const MoreFeatures = dynamic(() => import("./landing/components/MoreFeatures").then(mod => mod.MoreFeatures), { ssr: true });
const Plans = dynamic(() => import("./landing/components/Plans").then(mod => mod.Plans), { ssr: true });
const Partners = dynamic(() => import("./landing/components/Partners").then(mod => mod.Partners), { ssr: true });
const Testimonials = dynamic(() => import("./landing/components/Testimonials").then(mod => mod.Testimonials), { ssr: true });
const Security = dynamic(() => import("./landing/components/Security").then(mod => mod.Security), { ssr: true });
const Projects = dynamic(() => import("./landing/components/Projects").then(mod => mod.Projects), { ssr: true });
const FAQ = dynamic(() => import("./landing/components/FAQ").then(mod => mod.FAQ), { ssr: true });
const Footer = dynamic(() => import("./landing/components/Footer").then(mod => mod.Footer), { ssr: true });
import { SmoothScroll } from "./landing/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Atlas Hosting - Hospedagem Profissional de Sites",
  description:
    "Hospedagem de sites profissional com alta performance, segurança e suporte 24/7. SSL grátis, 99.9% de uptime e painel de controle fácil.",
};

export default function Home() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#0a0e27] overflow-x-hidden w-full">
        <Navbar />
        <Hero />
        <HowItWorks />
        <Statistics />
        <PromotionalCards />
        <Services />
        <Features />
        <MoreFeatures />
        <Plans />
        <Partners />
        <div className="relative w-full bg-[#0a0a0a] overflow-hidden">
          <Testimonials />
          <Security />
          <Projects />
          <FAQ />
        </div>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
