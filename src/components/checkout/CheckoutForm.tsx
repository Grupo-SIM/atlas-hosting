"use client";

import { buyPlan } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidCNPJ, isValidCPF } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import clsx from "clsx";
import { getMonth, getYear } from "date-fns";
import { isValidPhoneNumber } from "libphonenumber-js";
import Script from "next/script";
import { startTransition, useActionState, useCallback, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import { IMaskInput } from "react-imask";
import IMask from "imask";
import * as yup from "yup";
import { toast } from "sonner";

// Standard input class from shadcn/ui for consistency
const inputClasses = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const domPk = process.env.NEXT_PUBLIC_DOM_PUBLIC_KEY ?? "";

export default function CheckoutForm({ invoiceId }: { invoiceId: string }) {
  const [state, doBuyPlan, isPending] = useActionState(buyPlan, {
    status: "idle" as "error" | "success" | "idle",
    message: "",
  });

  const { register, control, getValues } = useForm<CheckoutFormInputs>({
    resolver: yupResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { errors, isValid, isValidating } = useFormState({ control });

  const [formError, setFormError] = useState<string | null>(null);
  const [cardToken, setCardToken] = useState<string>();

  const onSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const public_key = domPk ?? "";
    const values = getValues();
    const { fullName, document, phoneNumber, cardCvv, cardExpiration, address } = values;
    
    const [month, year] = cardExpiration.split("/");

    const cardNumber = values.cardNumber.replace(/\D/g, "");

    const dataCard = {
      name: fullName,
      document: document,
      number: cardNumber,
      cvv: cardCvv,
      month,
      year
    };
    
    const installments = 1;

    try {
      startTransition(() => {
        doBuyPlan({
          fullName,
          document,
          phoneNumber,
          cardNumber,
          cardCvv,
          cardExpiration,
          address: {
            ...address,
            zipCode: address.zipCode.replace(/\D/g, ""),
          },
          invoiceId,
          cardToken: ""
        });
      });
      // getTokenCard(public_key, dataCard, installments, function ({ token }) {
      // });
    } catch {
      toast("Dados de cartão inválido");
    }
  }, [doBuyPlan, getValues, invoiceId]);

  return (
    <>
      <Script type="text/javascript" src="https://hml-apiv3.dompagamentos.com.br/js/sdk-dompagamentos.min.js"></Script>
      <form onSubmit={onSubmit} className="space-y-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome completo</Label>
          <Input // Standard input for non-masked field
            id="fullName"
            type="text"
            placeholder="Seu nome completo"
            autoComplete="name"
            {...register("fullName")}
            className={inputClasses} // Ensure consistency if Input component doesn't apply it by default
          />
          {errors.fullName && (
            <p className="text-xs text-red-400">{errors.fullName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="document">CPF ou CNPJ</Label>
          <Controller
            name="document"
            control={control}
            render={({ field }) => (
              <IMaskInput
                {...field}
                mask={[
                  { mask: "000.000.000-00", lazy: true, maxLength: 11 },
                  { mask: "00.000.000/0000-00", lazy: false }
                ]}
                unmask={true} // Get unmasked value
                placeholder="Seu CPF ou CNPJ"
                autoComplete="document"
                className={inputClasses}
                onAccept={(value) => field.onChange(value)}
              />
            )}
          />
          {errors.document && (
            <p className="text-xs text-red-400">{errors.document.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Telefone</Label>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <IMaskInput
                {...field}
                mask={[{ mask: "(00) 0000-0000" }, { mask: "(00) 00000-0000" }]}
                unmask={true}
                placeholder="(XX) XXXXX-XXXX"
                autoComplete="tel"
                className={inputClasses}
                onAccept={(value) => field.onChange(value)}
              />
            )}
          />
          {errors.phoneNumber && (
            <p className="text-xs text-red-400">{errors.phoneNumber.message}</p>
          )}
        </div>
        <hr className="my-4" />
        <div className="space-y-2">
          <Label htmlFor="address.zipCode">CEP</Label>
          <Controller
            name="address.zipCode"
            control={control}
            render={({ field }) => (
              <IMaskInput
                {...field}
                mask="00000-000"
                unmask={true}
                placeholder="00000-000"
                autoComplete="postal-code"
                className={inputClasses}
                onAccept={(value) => field.onChange(value)}
              />
            )}
          />
          {errors.address?.zipCode && (
            <p className="text-xs text-red-400">{errors.address.zipCode.message}</p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="address.street">Rua</Label>
            <Input 
              id="address.street"
              type="text"
              placeholder="Nome da rua"
              autoComplete="street-address"
              {...register("address.street")}
              className={inputClasses}
            />
            {errors.address?.street && (
              <p className="text-xs text-red-400">{errors.address.street.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address.number">Número</Label>
            <Input
              id="address.number"
              type="text"
              placeholder="Nº"
              {...register("address.number")}
              className={inputClasses}
            />
            {errors.address?.number && (
              <p className="text-xs text-red-400">{errors.address.number.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address.neighborhood">Bairro</Label>
          <Input
            id="address.neighborhood"
            type="text"
            placeholder="Seu bairro"
            {...register("address.neighborhood")}
            className={inputClasses}
          />
          {errors.address?.neighborhood && (
            <p className="text-xs text-red-400">{errors.address.neighborhood.message}</p>
          )}
        </div>
        <div className="grid grid-cols-5 gap-2">
          <div className="space-y-2 col-span-3">
            <Label htmlFor="address.city">Cidade</Label>
            <Input
              id="address.city"
              type="text"
              placeholder="Sua cidade"
              {...register("address.city")}
              className={inputClasses}
            />
            {errors.address?.city && (
              <p className="text-xs text-red-400">{errors.address.city.message}</p>
            )}
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="address.state">Estado</Label>
            <Controller
              name="address.state"
              control={control}
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  unmask={true}
                  mask="aa"
                  placeholderChar=" "
                  placeholder="Código do estado"
                  autoComplete="address-level1"
                  className={inputClasses}
                  onAccept={(value) => field.onChange(value.toUpperCase())}
                />
              )}
            />
            {errors.address?.state && (
              <p className="text-xs text-red-400">{errors.address.state.message}</p>
            )}
          </div>
        </div>
        <hr className="my-4" />
        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <Controller
              name="cardNumber"
              control={control}
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  mask="0000 0000 0000 0000"
                  unmask={true}
                  placeholder="0000 0000 0000 0000"
                  autoComplete="cc-number"
                  className={inputClasses}
                  onAccept={(value) => field.onChange(value)}
                />
              )}
            />
            {errors.cardNumber && (
              <p className="text-xs text-red-400">{errors.cardNumber.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardCvv">CVV</Label>
            <Controller
              name="cardCvv"
              control={control}
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  mask="000"
                  unmask={true}
                  placeholder="123"
                  autoComplete="cc-csc"
                  className={inputClasses}
                  onAccept={(value) => field.onChange(value)}
                />
              )}
            />
            {errors.cardCvv && (
              <p className="text-xs text-red-400">{errors.cardCvv.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardExpiration">Data de Validade</Label>
            <Controller
              name="cardExpiration"
              control={control}
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  mask="00/00"
                  placeholderChar=" "
                  lazy={false}
                  placeholder="MM/AA"
                  autoComplete="cc-exp"
                  className={clsx([inputClasses, "text-center"])}
                  onAccept={(value) => field.onChange(value)}
                />
              )}
            />
            {errors.cardExpiration && (
              <p className="text-xs text-red-400">{errors.cardExpiration.message}</p>
            )}
          </div>
        </div>

        <input type="hidden" value={cardToken} name="token" />
        <input type="hidden" value={invoiceId} name="invoiceId" />

        {formError && <p className="text-xs text-red-400">{formError}</p>}

        <hr className="my-4" />

        <Button
          type="submit"
          variant="action"
          className="w-full mt-4 flex items-center justify-center"
          isLoading={isPending}
          disabled={!isValid || isValidating || isPending}
        >
          {isPending ? (
            <CgSpinner className="h-6 w-6 animate-spin" />
          ) : (
            "Pagar agora"
          )}
        </Button>
      </form>
    </>
  );
}

const schema = yup
  .object({
    fullName: yup
      .string()
      .trim()
      .required("Nome completo é obrigatório")
      .matches(/(\s)/, "Digite seu nome completo"),
    document: yup.string()
      .transform((value) => value.replace(/\D/g, ""))
      .test({
        test: (value) => isValidCPF(value) || isValidCNPJ(value),
        message: "Documento inválido",
      }).required("Documento é obrigatório"),
    cardNumber: yup
      .string()
      .transform((value) => value.replace(/\D/g, ""))
      .required("Número do cartão é obrigatório")
      .matches(/^\d{16}$/, "Número do cartão deve ter 16 dígitos"),
    cardCvv: yup
      .string()
      .required("CVV é obrigatório")
      .matches(/^\d{3}$/, "CVV deve ter 3 dígitos"),
    cardExpiration: yup
      .string()
      .required("Data de validade é obrigatória")
      .matches(/^\d{2}\/\d{2}$/, "Data inválida")
      .test("is-future-date", "Data inválida", (value) => {
        if (!value) return false;

        const [month, year] = value.split("/").map(Number);
        const today = new Date();

        return month > getMonth(today) || (month === getMonth(today) && year > +getYear(today).toString().slice(-2));
      }),
    phoneNumber: yup
      .string()
      .required("Número de telefone é obrigatório")
      .transform((value) => "55"+value.replace(/\D/g, ""))
      .test({
        test: (value) => isValidPhoneNumber(value, "BR"),
        message: "Número de telefone inválido",
      }),
    address: yup.object({
      street: yup.string().required("Rua é obrigatória"),
      number: yup.string().required("Número é obrigatório"),
      neighborhood: yup.string().required("Bairro é obrigatório"),
      city: yup.string().required("Cidade é obrigatória"),
      state: yup.string().length(2, "Digite o código de 2 dígitos do estado").required("Estado é obrigatório"),
      zipCode: yup
        .string()
        .required("CEP é obrigatório")
        .matches(/^\d{5}-\d{3}$/, "CEP inválido"),
    }),
  })
  .required();

export type CheckoutFormInputs = yup.InferType<typeof schema>;
