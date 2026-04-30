"use client";

import { motion } from "framer-motion";

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[200px]">
      <div className="relative h-8 w-full max-w-md flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-lg font-medium text-emerald-600 w-full"
        >
          Verificando disponibilidade...
        </motion.div>
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
            className="h-2.5 w-2.5 rounded-full bg-emerald-500"
          />
        ))}
      </div>
    </div>
  );
}
