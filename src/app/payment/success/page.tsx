"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Countdown from "./components/Countdown";
import { motion } from "framer-motion";

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pt-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2 
              }}
              className="mx-auto bg-emerald-500 rounded-full p-4 w-20 h-20 flex items-center justify-center shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CardTitle className="mt-8 text-3xl font-black tracking-tight text-foreground">
                Muito Obrigado!
              </CardTitle>
              <CardDescription className="mt-4 text-base text-muted-foreground font-medium px-4">
                Seu pagamento foi confirmado com sucesso e seu pedido já está sendo processado.
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="pb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="h-[1px] w-full bg-border/50" />
              <p className="text-sm text-muted-foreground text-center px-6 leading-relaxed">
                Em instantes seu domínio ou serviço estará ativo em sua conta. 
                Enviamos um resumo da transação para o seu e-mail.
              </p>
            </motion.div>
          </CardContent>
          
          <CardFooter className="flex justify-center pb-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Countdown />
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
