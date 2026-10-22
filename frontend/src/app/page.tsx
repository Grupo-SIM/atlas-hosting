"use client";

import dynamic from "next/dynamic";
import { Hero } from "./landing/components/Hero";
import { Navbar } from "./landing/components/Navbar";

const Statistics = dynamic(
  () => import("./landing/components/Statistics").then(mod => mod.Statistics),
  { ssr: false }
);
const MoreFeatures = dynamic(
  () =>
    import("./landing/components/MoreFeatures").then(mod => mod.MoreFeatures),
  { ssr: false }
);
const Plans = dynamic(
  () => import("./landing/components/Plans").then(mod => mod.Plans),
  { ssr: false }
);
const Partners = dynamic(
  () => import("./landing/components/Partners").then(mod => mod.Partners),
  { ssr: false }
);
const Testimonials = dynamic(
  () =>
    import("./landing/components/Testimonials").then(mod => mod.Testimonials),
  { ssr: false }
);
const Projects = dynamic(
  () => import("./landing/components/Projects").then(mod => mod.Projects),
  { ssr: false }
);
const FAQ = dynamic(
  () => import("./landing/components/FAQ").then(mod => mod.FAQ),
  { ssr: false }
);
const ChatContact = dynamic(
  () => import("./landing/components/ChatContact").then(mod => mod.ChatContact),
  { ssr: false }
);
const Threads = dynamic(() => import("./landing/components/Threads"), {
  ssr: false,
});
const Footer = dynamic(
  () => import("./landing/components/Footer").then(mod => mod.Footer),
  { ssr: false }
);

import { LazySection } from "./landing/components/LazySection";
import { SmoothScroll } from "./landing/components/SmoothScroll";

export default function Home() {
  return (
    <SmoothScroll>
      <div className="min-h-screen w-full overflow-x-hidden bg-[#00050A]">
        <Navbar variant="dark" />
        <div className="relative w-full bg-[#00050A]">
          <Hero />
        </div>
        <LazySection offset="100px">
          <Statistics />
        </LazySection>
        {/* <MoreFeatures /> */}
        <LazySection offset="300px">
          <Plans />
        </LazySection>
        {/* <Partners /> */}
        <div className="relative w-full overflow-hidden bg-[#00050A]">
          {/* Background SVG for the whole block */}
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            <img
              alt=""
              className="h-full w-full object-cover opacity-100"
              src="/Camada_landing.svg"
            />
          </div>

          <div className="pointer-events-none absolute inset-0 z-0 opacity-10">
            <Threads
              amplitude={0.5}
              color={[0, 0, 0]}
              distance={1.8}
              enableMouseInteraction={false}
            />
          </div>

          <div className="relative z-20">
            <LazySection offset="400px">
              <Testimonials />
            </LazySection>
            {/* <Projects /> */}
            {/* <FAQ /> */}
            <LazySection offset="400px">
              <ChatContact />
            </LazySection>
          </div>
        </div>
        <LazySection offset="200px">
          <Footer />
        </LazySection>
      </div>
    </SmoothScroll>
  );
}
