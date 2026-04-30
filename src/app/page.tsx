"use client";

import type { Metadata } from "next";
import { Navbar } from "./landing/components/Navbar";
import { Hero } from "./landing/components/Hero";
import dynamic from "next/dynamic";
const Statistics = dynamic(() => import("./landing/components/Statistics").then(mod => mod.Statistics), { ssr: false });
const MoreFeatures = dynamic(() => import("./landing/components/MoreFeatures").then(mod => mod.MoreFeatures), { ssr: false });
const Plans = dynamic(() => import("./landing/components/Plans").then(mod => mod.Plans), { ssr: false });
const Partners = dynamic(() => import("./landing/components/Partners").then(mod => mod.Partners), { ssr: false });
const Testimonials = dynamic(() => import("./landing/components/Testimonials").then(mod => mod.Testimonials), { ssr: false });
const Projects = dynamic(() => import("./landing/components/Projects").then(mod => mod.Projects), { ssr: false });
const FAQ = dynamic(() => import("./landing/components/FAQ").then(mod => mod.FAQ), { ssr: false });
const ChatContact = dynamic(() => import("./landing/components/ChatContact").then(mod => mod.ChatContact), { ssr: false });
const Threads = dynamic(() => import("./landing/components/Threads"), { ssr: false });
const Footer = dynamic(() => import("./landing/components/Footer").then(mod => mod.Footer), { ssr: false });
import { SmoothScroll } from "./landing/components/SmoothScroll";
import { LazySection } from "./landing/components/LazySection";

export default function Home() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-slate-50 overflow-x-hidden w-full">
        <Navbar variant="light" />
        <Hero />
        <LazySection offset="100px">
          <Statistics />
        </LazySection>
        {/* <MoreFeatures /> */}
        <LazySection offset="300px">
          <Plans />
        </LazySection>
        {/* <Partners /> */}
        <div className="relative w-full bg-slate-50 overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
            <Threads amplitude={0.5} distance={1.8} enableMouseInteraction={false} color={[0, 0, 0]} />
          </div>
          <div className="relative z-10">
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
