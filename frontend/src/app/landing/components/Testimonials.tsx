"use client";

import { Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const testimonials = [
  {
    image: "/landing/testimonials/julia.jpg",
    name: "Júlia Alba",
    role: "Empreendedora Digital",
    text: "Sempre achei difícil entender termos técnicos, mas o suporte do Atlas é diferente. Gente real, explicação simples. Me senti segura desde o primeiro contato.",
  },
  {
    image: "/landing/testimonials/fernando.jpg",
    name: "Fernando Collins",
    role: "Criador de Conteúdo",
    text: "O cashback mensal foi um diferencial que eu nunca vi em outras hospedagens. Já recuperei parte do valor e continuo com performance altíssima no meu site.",
  },
  {
    image: "/landing/testimonials/fabricio.jpg",
    name: "Fabricio dos Santos",
    role: "Gestor de Projetos Web",
    text: "Estou há 2 anos com o Atlas. Nunca precisei abrir chamado por instabilidade. Me surpreendeu.",
  },
  {
    image: "/landing/testimonials/luiz.jpg",
    name: "Luiz Vieira",
    role: "Desenvolvedor WordPress",
    text: "Além do Elementor Pro incluso, ainda recebo sugestões de otimização com frequência. O Atlas vai além da hospedagem, é parceiro de crescimento.",
  },
  {
    image: "/landing/testimonials/rafael.jpg",
    name: "Rafael Carrilho",
    role: "Especialista em Tráfego Pago",
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
      setCurrentIndex(prev => {
        // Limit max index so we don't translate into blank space
        const maxIndex = testimonials.length - itemsPerView;
        if (prev >= maxIndex) return 0;
        return prev + 1;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [itemsPerView]);

  return (
    <section
      className="relative w-full overflow-hidden bg-transparent py-24"
      id="testimonials"
    >
      <div className="container relative z-10 mx-auto max-w-[1440px] px-4">
        <div className="relative overflow-hidden rounded-[3rem] bg-[#00111a] px-8 py-20 shadow-[0_30px_100px_rgba(0,0,0,0.4)] md:px-16 md:py-24">
          {/* Top Header */}
          <div className="relative z-10 mb-16 flex flex-col items-center text-center">
            <motion.div
              className="mb-6 inline-flex items-center rounded-full border border-sky-500/25 bg-sky-500/10 px-4 py-1.5 font-bold text-[11px] text-sky-400 uppercase tracking-[0.12em]"
              initial={{ opacity: 0, y: 30 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              ● DEPOIMENTOS
            </motion.div>

            <motion.h2
              className="mb-6 font-black text-3xl text-white tracking-tight md:text-[3rem]"
              initial={{ opacity: 0, y: 30 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              Feedback & Avaliações
            </motion.h2>

            <motion.div
              className="flex items-center justify-center gap-1.5"
              initial={{ opacity: 0, y: 15 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {[...Array(5)].map((_, i) => (
                <Star
                  className="h-[18px] w-[18px] fill-[#FFB800] text-[#FFB800]"
                  key={i}
                />
              ))}
            </motion.div>
          </div>

          {/* Testimonials Grid */}
          <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <div className="flex flex-col" key={index}>
                {/* Bubble */}
                <div className="relative mb-8 rounded-2xl bg-white p-8 shadow-xl">
                  <p className="font-medium text-[#0f172a] text-[15px] leading-relaxed">
                    {testimonial.text}
                  </p>
                  {/* Bubble Tail */}
                  <div className="absolute -bottom-3 left-10 h-6 w-6 rotate-45 bg-white" />
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 px-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 border-white/10 shadow-lg">
                    <img
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      src={testimonial.image}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[15px] text-white">
                      {testimonial.name}
                    </span>
                    <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">
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
