"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { createTestPaymentInvoice } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TestPaymentClient() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="container max-w-lg py-10">
      <Card>
        <CardHeader>
          <CardTitle>Fatura de teste (R$ 1,00)</CardTitle>
          <CardDescription>
            Cria uma fatura igual à de domínio (tipo e fluxo de checkout), com
            valor fixo de <strong>R$ 1,00</strong>. O pagamento é{" "}
            <strong>real</strong> (Simpay + DOM no cartão). Nenhum domínio é
            registrado na Namecheap.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Disponível em <code className="text-xs">NODE_ENV=development</code>{" "}
            ou com{" "}
            <code className="text-xs">ALLOW_TEST_PAYMENT_INVOICE=true</code> no
            .env.
          </p>
          <Button
            className="w-full"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const r = await createTestPaymentInvoice();
                if (!r.ok) {
                  toast.error(r.message);
                  return;
                }
                router.push(`/checkout/${r.invoiceId}`);
              });
            }}
          >
            {pending ? "Criando…" : "Criar fatura e abrir checkout"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
