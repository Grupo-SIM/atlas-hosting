import type { Metadata } from "next";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { FeaturesBadge } from "./components/FeaturesBadge";
import { HowItWorks } from "./components/HowItWorks";
import { PromotionalCards } from "./components/PromotionalCards";
import { Features } from "./components/Features";
import { Services } from "./components/Services";
import { Statistics } from "./components/Statistics";
import { Partners } from "./components/Partners";
import { Plans } from "./components/Plans";
import { ContactPlans } from "./components/ContactPlans";
import { Testimonials } from "./components/Testimonials";
import { MoreFeatures } from "./components/MoreFeatures";
import { Projects } from "./components/Projects";
import { Security } from "./components/Security";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { SmoothScroll } from "./components/SmoothScroll";

export const metadata: Metadata = {
  title: "Atlas Hosting - Hospedagem Profissional de Sites",
  description:
    "Hospedagem de sites profissional com alta performance, segurança e suporte 24/7. SSL grátis, 99.9% de uptime e painel de controle fácil.",
};

export default function LandingPage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#0a0e27]">
        <Navbar />
        <Hero />
        <HowItWorks />
        <Statistics />
        <PromotionalCards />
        <Services />
        <Features />
        <Partners />
        <Plans />
        <ContactPlans />
        <div className="relative w-full bg-[#0a0a0a] overflow-hidden">
          <Testimonials />
          <MoreFeatures />
          <Projects />
          <Security />
          <FAQ />
        </div>
        <Footer />
      </div>
    </SmoothScroll>
  );
}

