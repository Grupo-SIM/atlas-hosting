import type { Metadata } from "next";
import { Navbar } from "./landing/components/Navbar";
import { Hero } from "./landing/components/Hero";
import dynamic from "next/dynamic";
const Statistics = dynamic(() => import("./landing/components/Statistics").then(mod => mod.Statistics), { ssr: true });
const MoreFeatures = dynamic(() => import("./landing/components/MoreFeatures").then(mod => mod.MoreFeatures), { ssr: true });
const Plans = dynamic(() => import("./landing/components/Plans").then(mod => mod.Plans), { ssr: true });
const Partners = dynamic(() => import("./landing/components/Partners").then(mod => mod.Partners), { ssr: true });
const Testimonials = dynamic(() => import("./landing/components/Testimonials").then(mod => mod.Testimonials), { ssr: true });
const Projects = dynamic(() => import("./landing/components/Projects").then(mod => mod.Projects), { ssr: true });
const FAQ = dynamic(() => import("./landing/components/FAQ").then(mod => mod.FAQ), { ssr: true });
const ChatContact = dynamic(() => import("./landing/components/ChatContact").then(mod => mod.ChatContact), { ssr: true });
const Threads = dynamic(() => import("./landing/components/Threads"), { ssr: true });
const Footer = dynamic(() => import("./landing/components/Footer").then(mod => mod.Footer), { ssr: true });
import { SmoothScroll } from "./landing/components/SmoothScroll";


export default function Home() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#0a0e27] overflow-x-hidden w-full">
        <Navbar />
        <Hero />
        <Statistics />
        {/* <MoreFeatures /> */}
        <Plans />
        {/* <Partners /> */}
        <div className="relative w-full bg-[#0a0e27] overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <Threads amplitude={0.5} distance={1.1} enableMouseInteraction={false} color={[1, 1, 1]} />
          </div>
          <div className="relative z-10">
            <Testimonials />
            {/* <Projects /> */}
            {/* <FAQ /> */}
            <ChatContact />
          </div>
        </div>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
