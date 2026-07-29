"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Countdown from "./Countdown";

export default function PaymentSuccessCard() {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md"
      initial={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="border-none bg-card/50 shadow-2xl backdrop-blur-sm">
        <CardHeader className="pt-10 text-center">
          <motion.div
            animate={{ scale: 1 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 p-4 shadow-emerald-500/20 shadow-lg"
            initial={{ scale: 0 }}
            transition={{
              damping: 20,
              delay: 0.2,
              stiffness: 260,
              type: "spring",
            }}
          >
            <Check className="h-10 w-10 text-white" strokeWidth={3} />
          </motion.div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.4 }}
          >
            <CardTitle className="mt-8 font-black text-3xl text-foreground tracking-tight">
              Muito Obrigado!
            </CardTitle>
            <CardDescription className="mt-4 px-4 font-medium text-base text-muted-foreground">
              Seu pagamento foi confirmado com sucesso e seu pedido já está
              sendo processado.
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="pb-8">
          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="h-[1px] w-full bg-border/50" />
            <p className="px-6 text-center text-muted-foreground text-sm leading-relaxed">
              Em instantes seu domínio ou serviço estará ativo em sua conta.
              Enviamos um resumo da transação para o seu e-mail.
            </p>
          </motion.div>
        </CardContent>

        <CardFooter className="flex justify-center pb-10">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.8 }}
          >
            <Countdown />
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
