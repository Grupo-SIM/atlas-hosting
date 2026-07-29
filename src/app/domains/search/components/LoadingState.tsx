"use client";

import { motion } from "framer-motion";

export default function LoadingState() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center py-20">
      <div className="relative flex h-8 w-full max-w-md items-center justify-center">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center font-medium text-emerald-600 text-lg"
          initial={{ opacity: 0, y: 10 }}
        >
          Verificando disponibilidade...
        </motion.div>
      </div>

      {/* Decorative dots loading indicator */}
      <div className="mt-6 flex items-center gap-2">
        {[0, 1, 2].map(i => (
          <motion.div
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            className="h-2.5 w-2.5 rounded-full bg-emerald-500"
            key={i}
            transition={{
              delay: i * 0.2,
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
        ))}
      </div>
    </div>
  );
}
