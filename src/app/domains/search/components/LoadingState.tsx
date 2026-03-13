"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const phrases = [
  "Buscando domínios na velocidade da luz...",
  "Verificando disponibilidade nas galáxias...",
  "Consultando os registros globais...",
  "Quase lá, preparando os melhores resultados...",
];

export default function LoadingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 2500); // Change phrase every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[200px]">
      <div className="relative h-8 w-full max-w-md overflow-hidden flex justify-center items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute text-green-400 font-medium text-lg text-center w-full"
          >
            {phrases[index]}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Decorative dots loading indicator */}
      <div className="flex items-center gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
