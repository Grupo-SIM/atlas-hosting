"use client";

import LogoLoop from './LogoLoop';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si';

const techLogos = [
  { node: <SiReact className="text-white/80" />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs className="text-white/80" />, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript className="text-white/80" />, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss className="text-white/80" />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
];

export function Partners() {
  return (
    <section className="py-12 w-full" style={{ backgroundColor: '#000319' }}>
      <div className="w-full">
        <LogoLoop
          logos={techLogos}
          speed={120}
          direction="left"
          logoHeight={48}
          gap={40}
          hoverSpeed={0}
          scaleOnHover
          fadeOut
          fadeOutColor="#000319"
          ariaLabel="Technology partners"
          width="100%"
        />
      </div>
    </section>
  );
}

