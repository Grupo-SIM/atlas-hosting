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
    <section id="testimonials" className="py-24 relative overflow-hidden bg-transparent w-full">
      <div className="container mx-auto max-w-[1440px] px-4 relative z-10">
        <div className="bg-[#00111a] rounded-[3rem] px-8 py-20 md:px-16 md:py-24 shadow-[0_30px_100px_rgba(0,0,0,0.4)] relative overflow-hidden">
          
          {/* Top Header */}
          <div className="text-center mb-16 flex flex-col items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center rounded-full border border-sky-500/25 bg-sky-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-400 mb-6"
            >
              ● DEPOIMENTOS
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-[3rem] font-black mb-6 text-white tracking-tight"
            >
              Feedback & Avaliações
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-1.5 justify-center"
            >
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-[18px] h-[18px] text-[#FFB800] fill-[#FFB800]" />
              ))}
            </motion.div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <div key={index} className="flex flex-col">
                {/* Bubble */}
                <div className="relative bg-white rounded-2xl p-8 mb-8 shadow-xl">
                  <p className="text-[#0f172a] text-[15px] font-medium leading-relaxed">
                    {testimonial.text}
                  </p>
                  {/* Bubble Tail */}
                  <div className="absolute -bottom-3 left-10 w-6 h-6 bg-white rotate-45" />
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 px-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 border-white/10 shadow-lg">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-[15px]">
                      {testimonial.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
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
