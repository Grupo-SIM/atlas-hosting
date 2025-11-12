"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FaChevronDown } from "react-icons/fa";
import dynamic from "next/dynamic";

// Importar Hyperspeed dinamicamente para evitar problemas de SSR
const Hyperspeed = dynamic(
  () => import("./hyperspeed").then((mod) => mod.Hyperspeed),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-black" />
  }
);

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden min-h-screen flex items-center">
      {/* Hyperspeed Background */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      >
        <Hyperspeed
            effectOptions={{
              distortion: "turbulentDistortion",
              length: 400,
              roadWidth: 10,
              islandWidth: 2,
              lanesPerRoad: 4,
              fov: 90,
              fovSpeedUp: 150,
              speedUp: 2,
              carLightsFade: 0.4,
              totalSideLightSticks: 20,
              lightPairsPerRoadWay: 40,
              shoulderLinesWidthPercentage: 0.05,
              brokenLinesWidthPercentage: 0.1,
              brokenLinesLengthPercentage: 0.5,
              lightStickWidth: [0.12, 0.5],
              lightStickHeight: [1.3, 1.7],
              movingAwaySpeed: [60, 80],
              movingCloserSpeed: [-120, -160],
              carLightsLength: [400 * 0.03, 400 * 0.2],
              carLightsRadius: [0.05, 0.14],
              carWidthPercentage: [0.3, 0.5],
              carShiftX: [-0.8, 0.8],
              carFloorSeparation: [0, 5],
              colors: {
                roadColor: 0x080808,
                islandColor: 0x0a0a0a,
                background: 0x000000,
                shoulderLines: 0xffffff,
                brokenLines: 0xffffff,
                leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
                rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
                sticks: 0x03b3c3,
              },
            }}
          />
      </div>

      {/* Overlay escuro para melhorar legibilidade do texto */}
      <div 
        className="absolute inset-0 bg-black/40 pointer-events-none" 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      />

      {/* Conteúdo */}
      <div className="container mx-auto max-w-6xl relative" style={{ zIndex: 10 }}>
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
             Hospede seu site e receba 
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            100% do valor de volta!
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
          Feito pra quem quer mais do que só
          “está no ar”
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/signup">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
              asChild
            >
              <Link href="#plans">Ver Planos</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Seta indicadora de scroll - posicionada absolutamente */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <FaChevronDown className="h-6 w-6 text-white/70" />
        </div>
      </div>
    </section>
  );
}

