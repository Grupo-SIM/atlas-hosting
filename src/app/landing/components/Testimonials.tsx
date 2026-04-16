"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import LetterGlitch from "./LetterGlitch";

const testimonials = [
  {
    name: "Júlia Alba",
    role: "Empreendedora Digital",
    image: "/landing/testimonials/julia.jpg",
    text: "Sempre achei difícil entender termos técnicos, mas o suporte do Atlas é diferente. Gente real, explicação simples. Me senti segura desde o primeiro contato.",
  },
  {
    name: "Fernando Collins",
    role: "Criador de Conteúdo",
    image: "/landing/testimonials/fernando.jpg",
    text: "O cashback mensal foi um diferencial que eu nunca vi em outras hospedagens. Já recuperei parte do valor e continuo com performance altíssima no meu site.",
  },
  {
    name: "Fabricio dos Santos",
    role: "Gestor de Projetos Web",
    image: "/landing/testimonials/fabricio.jpg",
    text: "Estou há 2 anos com o Atlas. Nunca precisei abrir chamado por instabilidade. Me surpreendeu.",
  },
  {
    name: "Luiz Vieira",
    role: "Desenvolvedor WordPress",
    image: "/landing/testimonials/luiz.jpg",
    text: "Além do Elementor Pro incluso, ainda recebo sugestões de otimização com frequência. O Atlas vai além da hospedagem, é parceiro de crescimento.",
  },
  {
    name: "Rafael Carrilho",
    role: "Especialista em Tráfego Pago",
    image: "/landing/testimonials/rafael.jpg",
    text: "Achei que era só mais uma hospedagem, mas o Atlas entrega mesmo. Meu site ficou mais rápido, seguro e ainda economizo com ferramentas que antes eu pagava por fora.",
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  // Automatically adjust items per view based on window size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };
    handleResize(); // Init safely on client
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Guarantee we never stay stuck out of bounds if resizing from mobile to desktop
  useEffect(() => {
    if (currentIndex > testimonials.length - itemsPerView) {
      setCurrentIndex(Math.max(0, testimonials.length - itemsPerView));
    }
  }, [itemsPerView, currentIndex]);

  // Auto-scroll logic for a basic horizontal slider effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        // Limit max index so we don't translate into blank space
        const maxIndex = testimonials.length - itemsPerView;
        if (prev >= maxIndex) return 0;
        return prev + 1;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [itemsPerView]);

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden bg-[#0a0e27] w-full">
      {/* Background Animation Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Letter Glitch Layer */}
        <div className="absolute inset-0 opacity-[0.25]">
          <LetterGlitch 
            glitchSpeed={50}
            centerVignette={true}
            outerVignette={false}
            smooth={true}
          />
        </div>
        
        {/* Overlay Gradients to blend properly with the site theme */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,#0a0e27_95%)]" />
        <div className="absolute inset-0 bg-[#0a0e27]/20" />
      </div>

      <div className="container mx-auto max-w-[1240px] relative z-10">
        
        {/* Top Header */}
        <div className="text-center mb-16 px-4 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex flex-row items-center gap-3 mb-6 bg-[#0e132e] py-1.5 px-3 rounded border border-white/5"
          >
            <div className="w-1 h-4 bg-[#01FC8D]"></div>
            <span className="text-xs font-semibold tracking-wider text-[#01FC8D] uppercase">
              DEPOIMENTOS
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-[2.5rem] font-bold mb-4 text-white tracking-tight"
          >
            Feedback & Avaliações
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-1.5 justify-center mb-4"
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-[18px] h-[18px] text-[#01FC8D] fill-[#01FC8D]" />
            ))}
          </motion.div>
        </div>

        {/* Testimonials Carousel (Custom implemented Elementor 'bubble' skin css) */}
        <div className="px-4 overflow-hidden pt-4 pb-12 w-full">
          <div 
            className="flex transition-transform duration-700 ease-in-out gap-6"
            style={{ 
               // Shift correctly maintaining item percentage and gap adjustments based on screen
               transform: `translateX(calc(-${currentIndex * (100 / itemsPerView)}% - ${currentIndex * (24 / itemsPerView)}px))` 
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[100%] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex flex-col"
              >
                {/* Bubble */}
                <div className="relative bg-[#0e132e] border border-white/5 rounded-[6px] p-8 mb-6 h-full flex items-center shadow-xl">
                  <p className="text-[#9ca3af] text-[15px] font-light leading-relaxed">
                    {testimonial.text}
                  </p>
                  
                  {/* The Elementor 'bubble' arrow pointing down */}
                  <div 
                    className="absolute -bottom-[10px] left-10 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-[#0e132e] border-r-[10px] border-r-transparent drop-shadow-md z-10"
                    style={{ filter: "drop-shadow(0px 1px 0px rgba(255,255,255,0.05))" }}
                  />
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 px-2">
                  <div className="w-12 h-12 rounded-[4px] overflow-hidden shrink-0 border border-white/10 shadow-md">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white text-[14px]">
                      {testimonial.name}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {testimonial.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
