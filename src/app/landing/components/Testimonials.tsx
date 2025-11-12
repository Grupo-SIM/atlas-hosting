"use client";

import { useMemo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Maria Silva",
    handle: "@mariasilva",
    image: "https://i.pravatar.cc/150?img=47",
    text: "A Atlas Hosting transformou meu negócio online. O suporte é excepcional e a performance é incrível!",
  },
  {
    name: "João Santos",
    handle: "@joaosantos",
    image: "https://i.pravatar.cc/150?img=12",
    text: "Como desenvolvedor, preciso de confiabilidade e velocidade. A Atlas Hosting entrega tudo isso e mais!",
  },
  {
    name: "Ana Costa",
    handle: "@anacosta",
    image: "https://i.pravatar.cc/150?img=45",
    text: "Migrei meu site para a Atlas Hosting e a diferença foi imediata. Site mais rápido e sem problemas!",
  },
  {
    name: "Carlos Oliveira",
    handle: "@carlosoliveira",
    image: "https://i.pravatar.cc/150?img=33",
    text: "A melhor hospedagem que já usei. Interface intuitiva e suporte 24/7 que realmente funciona!",
  },
  {
    name: "Patricia Lima",
    handle: "@patricialima",
    image: "https://i.pravatar.cc/150?img=20",
    text: "Recomendo a Atlas Hosting para todos os meus clientes. Performance excepcional e preço justo!",
  },
  {
    name: "Roberto Alves",
    handle: "@robertoalves",
    image: "https://i.pravatar.cc/150?img=68",
    text: "Uso a Atlas Hosting há mais de 2 anos e nunca tive problemas. Estabilidade e velocidade garantidas!",
  },
];

export function Testimonials() {
  // Dividir em duas linhas
  const topRow = testimonials.slice(0, 3);
  const bottomRow = testimonials.slice(3, 6);
  
  // Duplicar para criar loop infinito
  const topRowDuplicated = [...topRow, ...topRow];
  const bottomRowDuplicated = [...bottomRow, ...bottomRow];

  // Posições fixas para as estrelas
  const stars = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: (i * 7.3) % 100,
      top: (i * 11.7) % 100,
      delay: (i * 0.1) % 3,
      duration: 2 + ((i * 0.3) % 3),
    }));
  }, []);

  return (
    <section id="testimonials" className="py-20 relative overflow-hidden w-full">
        {/* Gradiente granulado saindo do canto inferior direito */}
        <div 
          className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-0"
          style={{
            background: `
              radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.25) 0%, transparent 25%),
              radial-gradient(circle at 90% 90%, rgba(139, 92, 246, 0.2) 0%, transparent 30%),
              radial-gradient(circle at 95% 88%, rgba(139, 92, 246, 0.15) 0%, transparent 35%),
              radial-gradient(circle at 88% 92%, rgba(139, 92, 246, 0.12) 0%, transparent 40%),
              radial-gradient(circle at 92% 95%, rgba(139, 92, 246, 0.1) 0%, transparent 45%),
              linear-gradient(135deg, transparent 0%, transparent 35%, rgba(139, 92, 246, 0.06) 55%, rgba(139, 92, 246, 0.12) 75%, rgba(139, 92, 246, 0.18) 100%)
            `,
            backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%',
            backgroundPosition: 'center, center, center, center, center, center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Sombras laterais pretas - esfumaçadas */}
        <div 
          className="absolute left-0 top-0 bottom-0 z-20 pointer-events-none"
          style={{
            width: '200px',
            background: 'linear-gradient(to right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0.2) 60%, rgba(0, 0, 0, 0.1) 80%, transparent 100%)',
          }}
        />
        <div 
          className="absolute right-0 top-0 bottom-0 z-20 pointer-events-none"
          style={{
            width: '200px',
            background: 'linear-gradient(to left, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0.2) 60%, rgba(0, 0, 0, 0.1) 80%, transparent 100%)',
          }}
        />

        <div className="relative z-10 w-full">
        <div className="text-center mb-16 px-4">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full bg-purple-600/30 backdrop-blur-md border border-purple-500/50 text-white text-sm font-semibold">
              Depoimentos
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Confiança de quem entende de tecnologia
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Veja o que nossos clientes têm a dizer sobre a qualidade dos nossos serviços
          </p>
        </div>

        {/* Linha de cima - carrossel para esquerda */}
        <div className="mb-8 overflow-hidden w-full">
          <div className="flex gap-6 animate-scroll-left" style={{ width: 'fit-content' }}>
            {topRowDuplicated.map((testimonial, index) => (
              <div
                key={`top-${index}`}
                className="flex-shrink-0 w-[90vw] md:w-[500px] lg:w-[600px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold">
                      {testimonial.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-purple-300">{testimonial.handle}</p>
                  </div>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {testimonial.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Linha de baixo - carrossel para direita */}
        <div className="overflow-hidden w-full">
          <div className="flex gap-6 animate-scroll-right" style={{ width: 'fit-content', marginLeft: 'auto' }}>
            {bottomRowDuplicated.map((testimonial, index) => (
              <div
                key={`bottom-${index}`}
                className="flex-shrink-0 w-[90vw] md:w-[500px] lg:w-[600px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold">
                      {testimonial.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-purple-300">{testimonial.handle}</p>
                  </div>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {testimonial.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

