"use client";

import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addCard } from "@/app/(auth)/wallet/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PaymentField } from "./PaymentField";

export function AddPaymentCard() {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    cardCvv: "",
    cardExpiration: "",
    cardNumber: "",
    holderDocument: "",
    holderName: "",
  });
  const router = useRouter();
  const set = (key: keyof typeof form) => (value: string) =>
    setForm(previous => ({ ...previous, [key]: value }));
  return (
    <form
      className="space-y-4 rounded-lg border p-4"
      onSubmit={event => {
        event.preventDefault();
        // Read native values so submitting within the debounce window never loses edits.
        const data = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await addCard({
            cardCvv: String(data.get("cardCvv") ?? ""),
            cardExpiration: String(data.get("cardExpiration") ?? ""),
            cardNumber: String(data.get("cardNumber") ?? ""),
            holderDocument: String(data.get("holderDocument") ?? ""),
            holderName: String(data.get("holderName") ?? ""),
          });
          toast({
            description: result.message,
            title:
              result.status === "success"
                ? "Cartão salvo"
                : "Falha no cadastro",
            variant: result.status === "success" ? "default" : "destructive",
          });
          if (result.status === "success") {
            setForm({
              cardCvv: "",
              cardExpiration: "",
              cardNumber: "",
              holderDocument: "",
              holderName: "",
            });
            router.refresh();
          }
        });
      }}
    >
      <h3 className="font-semibold">Cadastrar cartão</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <PaymentField
          autoComplete="cc-number"
          disabled={pending}
          label="Número do cartão"
          mask="0000 0000 0000 0000[000]"
          name="cardNumber"
          onChange={set("cardNumber")}
          placeholder="0000 0000 0000 0000"
          value={form.cardNumber}
        />
        <PaymentField
          autoComplete="cc-name"
          disabled={pending}
          label="Nome no cartão"
          name="holderName"
          onChange={set("holderName")}
          placeholder="Ex: Maria Silva"
          value={form.holderName}
        />
        <PaymentField
          autoComplete="cc-exp"
          disabled={pending}
          label="Validade"
          mask="00/00"
          name="cardExpiration"
          onChange={set("cardExpiration")}
          placeholder="06/30"
          value={form.cardExpiration}
        />
        <PaymentField
          autoComplete="cc-csc"
          disabled={pending}
          label="Código de segurança"
          mask="000[0]"
          name="cardCvv"
          onChange={set("cardCvv")}
          placeholder="123"
          secret
          value={form.cardCvv}
        />
        <PaymentField
          disabled={pending}
          label="CPF ou CNPJ do titular"
          mask={
            form.holderDocument.replace(/\D/g, "").length > 11
              ? "00.000.000/0000-00"
              : "00000000000[000]"
          }
          name="holderDocument"
          onChange={set("holderDocument")}
          placeholder="000.000.000-00"
          value={form.holderDocument}
        />
      </div>
      <p className="text-muted-foreground text-sm">
        Salvar não cobra nem ativa renovação automática. Depois, selecione o
        cartão na assinatura abaixo. Se solicitado, complete seu endereço e
        telefone na aba Pessoal.
      </p>
      <Button className="cursor-pointer" disabled={pending} type="submit">
        <CreditCard className="mr-2 h-4 w-4" />
        {pending ? "Salvando..." : "Salvar cartão"}
      </Button>
    </form>
  );
}
