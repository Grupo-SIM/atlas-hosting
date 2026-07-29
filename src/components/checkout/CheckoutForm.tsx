"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { isValidPhoneNumber } from "libphonenumber-js";
import Script from "next/script";
import { startTransition, useActionState, useCallback, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";
import { z } from "zod";
import { completeCheckout } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input, inputClasses } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidCNPJ, isValidCPF } from "@/lib/utils";

const domPk = process.env.NEXT_PUBLIC_DOM_PUBLIC_KEY ?? "";

export default function CheckoutForm({ invoiceId }: { invoiceId: string }) {
  const [_state, doCompleteCheckout, isPending] = useActionState(
    completeCheckout,
    {
      message: "",
      status: "idle" as "error" | "success" | "idle",
    }
  );

  const { register, control, getValues } = useForm<CheckoutFormInputs>({
    mode: "onChange",
    resolver: zodResolver(schema),
    reValidateMode: "onChange",
  });

  const { errors, isValid, isValidating } = useFormState({ control });

  const [formError, _setFormError] = useState<string | null>(null);
  const [cardToken, _setCardToken] = useState<string>();

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const _publicKey = domPk ?? "";
      const values = getValues();
      const {
        firstName,
        lastName,
        document,
        phoneNumber,
        cardCvv,
        cardExpiration,
        address,
      } = values;

      const [month, year] = cardExpiration.split("/");

      const cardNumber = values.cardNumber.replace(/\D/g, "");

      const _dataCard = {
        cvv: cardCvv,
        document,
        month,
        name: `${firstName} ${lastName}`,
        number: cardNumber,
        year,
      };

      const _installments = 1;

      try {
        startTransition(() => {
          doCompleteCheckout({
            address: {
              ...address,
              zipCode: address.zipCode.replace(/\D/g, ""),
            },
            cardCvv,
            cardExpiration,
            cardNumber,
            cardToken: "",
            document: document.replace(/\D/g, ""),
            firstName: firstName.trim(),
            installments: 1,
            invoiceId,
            lastName: lastName.trim(),
            phoneNumber: phoneNumber.replace(/\D/g, ""),
          });
        });
      } catch {
        toast("Dados de cartão inválido");
      }
    },
    [doCompleteCheckout, getValues, invoiceId]
  );

  return (
    <>
      <Script
        src="https://hml-apiv3.dompagamentos.com.br/js/sdk-dompagamentos.min.js"
        type="text/javascript"
      />
      <form className="space-y-2" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome</Label>
            <Input
              autoComplete="given-name"
              id="firstName"
              placeholder="Seu nome"
              type="text"
              {...register("firstName")}
              className={inputClasses}
            />
            {errors.firstName && (
              <p className="text-red-400 text-xs">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              autoComplete="family-name"
              id="lastName"
              placeholder="Seu sobrenome"
              type="text"
              {...register("lastName")}
              className={inputClasses}
            />
            {errors.lastName && (
              <p className="text-red-400 text-xs">{errors.lastName.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="document">CPF ou CNPJ</Label>
          <Controller
            control={control}
            name="document"
            render={({ field }) => (
              <IMaskInput
                {...field}
                autoComplete="document"
                className={inputClasses}
                mask={[
                  { lazy: true, mask: "000.000.000-00", maxLength: 11 },
                  { lazy: false, mask: "00.000.000/0000-00" },
                ]}
                onAccept={value => field.onChange(value)}
                placeholder="Seu CPF ou CNPJ"
                unmask={true}
              />
            )}
          />
          {errors.document && (
            <p className="text-red-400 text-xs">{errors.document.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Telefone</Label>
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <IMaskInput
                {...field}
                autoComplete="tel"
                className={inputClasses}
                mask={[{ mask: "(00) 0000-0000" }, { mask: "(00) 00000-0000" }]}
                onAccept={value => field.onChange(value)}
                placeholder="(XX) XXXXX-XXXX"
                unmask={true}
              />
            )}
          />
          {errors.phoneNumber && (
            <p className="text-red-400 text-xs">{errors.phoneNumber.message}</p>
          )}
        </div>
        <hr className="my-4" />
        <div className="space-y-2">
          <Label htmlFor="address.zipCode">CEP</Label>
          <Controller
            control={control}
            name="address.zipCode"
            render={({ field }) => (
              <IMaskInput
                {...field}
                autoComplete="postal-code"
                className={inputClasses}
                mask="00000-000"
                onAccept={value => field.onChange(value)}
                placeholder="00000-000"
                unmask={true}
              />
            )}
          />
          {errors.address?.zipCode && (
            <p className="text-red-400 text-xs">
              {errors.address.zipCode.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="address.street">Rua</Label>
            <Input
              autoComplete="street-address"
              id="address.street"
              placeholder="Nome da rua"
              type="text"
              {...register("address.street")}
              className={inputClasses}
            />
            {errors.address?.street && (
              <p className="text-red-400 text-xs">
                {errors.address.street.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address.number">Número</Label>
            <Input
              id="address.number"
              placeholder="Nº"
              type="text"
              {...register("address.number")}
              className={inputClasses}
            />
            {errors.address?.number && (
              <p className="text-red-400 text-xs">
                {errors.address.number.message}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address.neighborhood">Bairro</Label>
          <Input
            id="address.neighborhood"
            placeholder="Seu bairro"
            type="text"
            {...register("address.neighborhood")}
            className={inputClasses}
          />
          {errors.address?.neighborhood && (
            <p className="text-red-400 text-xs">
              {errors.address.neighborhood.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-3 space-y-2">
            <Label htmlFor="address.city">Cidade</Label>
            <Input
              id="address.city"
              placeholder="Sua cidade"
              type="text"
              {...register("address.city")}
              className={inputClasses}
            />
            {errors.address?.city && (
              <p className="text-red-400 text-xs">
                {errors.address.city.message}
              </p>
            )}
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="address.state">Estado</Label>
            <Controller
              control={control}
              name="address.state"
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  autoComplete="address-level1"
                  className={inputClasses}
                  mask="aa"
                  onAccept={value => field.onChange(value.toUpperCase())}
                  placeholder="Código do estado"
                  placeholderChar=" "
                  unmask={true}
                />
              )}
            />
            {errors.address?.state && (
              <p className="text-red-400 text-xs">
                {errors.address.state.message}
              </p>
            )}
          </div>
        </div>
        <hr className="my-4" />
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <Controller
              control={control}
              name="cardNumber"
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  autoComplete="cc-number"
                  className={inputClasses}
                  mask="0000 0000 0000 0000"
                  onAccept={value => field.onChange(value)}
                  placeholder="0000 0000 0000 0000"
                  unmask={true}
                />
              )}
            />
            {errors.cardNumber && (
              <p className="text-red-400 text-xs">
                {errors.cardNumber.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardCvv">CVV</Label>
            <Controller
              control={control}
              name="cardCvv"
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  autoComplete="cc-csc"
                  className={inputClasses}
                  mask="000"
                  onAccept={value => field.onChange(value)}
                  placeholder="123"
                  unmask={true}
                />
              )}
            />
            {errors.cardCvv && (
              <p className="text-red-400 text-xs">{errors.cardCvv.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardExpiration">Data de Validade</Label>
            <Controller
              control={control}
              name="cardExpiration"
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  autoComplete="cc-exp"
                  className={clsx([inputClasses, "text-center"])}
                  lazy={false}
                  mask="00/00"
                  onAccept={value => field.onChange(value)}
                  placeholder="MM/AA"
                  placeholderChar=" "
                />
              )}
            />
            {errors.cardExpiration && (
              <p className="text-red-400 text-xs">
                {errors.cardExpiration.message}
              </p>
            )}
          </div>
        </div>

        <input name="token" type="hidden" value={cardToken} />
        <input name="invoiceId" type="hidden" value={invoiceId} />

        {formError && <p className="text-red-400 text-xs">{formError}</p>}

        <hr className="my-4" />

        <Button
          className="mt-4 flex w-full items-center justify-center"
          disabled={!isValid || isValidating || isPending}
          isLoading={isPending}
          type="submit"
          variant="action"
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

const schema = z.object({
  address: z.object({
    city: z.string().min(1, "Cidade é obrigatória"),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    number: z.string().min(1, "Número é obrigatório"),
    state: z.string().length(2, "Digite o código de 2 dígitos do estado"),
    street: z.string().min(1, "Rua é obrigatória"),
    zipCode: z
      .string()
      .min(1, "CEP é obrigatório")
      .refine(v => v.replace(/\D/g, "").length === 8, "CEP inválido"),
  }),
  cardCvv: z
    .string()
    .min(1, "CVV é obrigatório")
    .regex(/^\d{3}$/, "CVV deve ter 3 dígitos"),
  cardExpiration: z
    .string()
    .min(1, "Data de validade é obrigatória")
    .regex(/^[0-9]{2}\/[0-9]{2}$/, "Data inválida"),
  cardNumber: z
    .string()
    .min(1, "Número do cartão é obrigatório")
    .regex(/^\d{16}$/, "Número do cartão deve ter 16 dígitos"),
  document: z
    .string()
    .min(1, "Documento é obrigatório")
    .refine(
      v => {
        const d = v.replace(/\D/g, "");
        return isValidCPF(d) || isValidCNPJ(d);
      },
      { message: "Documento inválido" }
    ),
  firstName: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  installments: z.number().int().min(1).max(12).optional().default(1),
  lastName: z
    .string()
    .trim()
    .min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  phoneNumber: z
    .string()
    .min(1, "Telefone é obrigatório")
    .refine(v => isValidPhoneNumber(`55${v.replace(/\D/g, "")}`, "BR"), {
      message: "Número de telefone inválido",
    }),
});

export type CheckoutFormInputs = z.infer<typeof schema>;
