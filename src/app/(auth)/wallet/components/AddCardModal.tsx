"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { type AddCardData, addCard } from "../actions";

const cardSchema = z.object({
  cardCvv: z
    .string()
    .min(3, "CVV deve ter pelo menos 3 dígitos")
    .max(4, "CVV deve ter no máximo 4 dígitos")
    .regex(/^\d+$/, "CVV deve conter apenas números"),
  cardExpiration: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato deve ser MM/AA"),
  cardNumber: z
    .string()
    .min(13, "Número do cartão deve ter pelo menos 13 dígitos")
    .max(19, "Número do cartão deve ter no máximo 19 dígitos")
    .regex(/^[\d\s]+$/, "Número do cartão deve conter apenas números"),
  holderDocument: z
    .string()
    .min(11, "Documento deve ter pelo menos 11 dígitos")
    .max(14, "Documento deve ter no máximo 14 dígitos")
    .regex(/^[\d.-]+$/, "Documento deve conter apenas números, pontos e hífen"),
  holderName: z
    .string()
    .min(2, "Nome do portador deve ter pelo menos 2 caracteres")
    .max(100, "Nome do portador deve ter no máximo 100 caracteres"),
});

export function AddCardModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddCardData>({
    defaultValues: {
      cardCvv: "",
      cardExpiration: "",
      cardNumber: "",
      holderDocument: "",
      holderName: "",
    },
    resolver: zodResolver(cardSchema),
  });

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(" ").slice(0, 19);
  };

  const formatExpiration = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length >= 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
    }
    return numbers;
  };

  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      // CPF format: XXX.XXX.XXX-XX
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    // CNPJ format: XX.XXX.XXX/XXXX-XX
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  const onSubmit = async (data: AddCardData) => {
    setIsSubmitting(true);
    try {
      const result = await addCard(data);

      if (result.status === "success") {
        toast({
          description: result.message,
          title: "Sucesso",
        });
        form.reset();
        setOpen(false);
      } else {
        toast({
          description: result.message,
          title: "Erro",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        description: "Erro inesperado ao adicionar cartão",
        title: "Erro",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar cartão
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Adicionar novo cartão
          </DialogTitle>
          <DialogDescription>
            Adicione um novo cartão à sua carteira para pagamentos futuros. Seus
            dados são protegidos e criptografados.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do cartão</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      {...field}
                      maxLength={19}
                      onChange={e => {
                        const formatted = formatCardNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cardExpiration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validade</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MM/AA"
                        {...field}
                        maxLength={5}
                        onChange={e => {
                          const formatted = formatExpiration(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardCvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123"
                        type="password"
                        {...field}
                        maxLength={4}
                        onChange={e => {
                          const numbers = e.target.value.replace(/\D/g, "");
                          field.onChange(numbers);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="holderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do portador</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="João Silva"
                      {...field}
                      onChange={e => {
                        field.onChange(e.target.value.toUpperCase());
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="holderDocument"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF/CNPJ do portador</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000.000.000-00"
                      {...field}
                      maxLength={18}
                      onChange={e => {
                        const formatted = formatDocument(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                disabled={isSubmitting}
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Adicionar cartão
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
