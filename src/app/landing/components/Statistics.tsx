"use client";

import CountUp from "./CountUp";

const stats = [
  {
    value: 7.2,
    suffix: "K+",
    label: "Sites desenvolvidos",
  },
  {
    value: 5,
    suffix: "K+",
    label: "Clientes satisfeitos",
  },
  {
    value: 20,
    suffix: "+",
    label: "Anos de Experiência no mercado",
  },
  {
    value: 4.7,
    suffix: "",
    label: "Avaliação média",
  },
];

export function Statistics() {
  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: '#000319' }}>
      {/* Vídeo de background - lado direito */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 md:w-1/2 lg:w-2/5 h-full flex items-center justify-end pr-8">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto max-h-[80vh] object-contain opacity-60"
          >
            <source src="/globe.webm" type="video/webm" />
          </video>
        </div>
      </div>

      {/* Background com padrão de pontos (mapa do mundo) */}
      <div className="absolute inset-0 opacity-10 z-[1]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Texto Principal */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Performance Garantida,
            <br />
            preço justo, retorno real
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            Você trabalha muito, seu negócio merece um lugar que valorize isso!
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="statistics-card relative flex flex-col items-center text-center p-6 rounded-2xl border-b-4 border-green-400 transition-all duration-300"
            >
              {/* Número com animação */}
              <div className="mb-6">
                <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-green-400">
                  <CountUp
                    from={0}
                    to={stat.value}
                    separator=""
                    direction="up"
                    duration={2}
                    className="count-up-text"
                  />
                  {stat.suffix}
                </span>
              </div>

              {/* Descrição */}
              <div className="relative w-full">
                <p className="text-white text-sm md:text-base">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

