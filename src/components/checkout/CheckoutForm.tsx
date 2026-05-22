"use client";

import { completeCheckout } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input, inputClasses } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidCNPJ, isValidCPF } from "@/lib/utils";
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

const domPk = process.env.NEXT_PUBLIC_DOM_PUBLIC_KEY ?? "";

export default function CheckoutForm({ invoiceId }: { invoiceId: string }) {
  const [_state, doCompleteCheckout, isPending] = useActionState(
    completeCheckout,
    {
      status: "idle" as "error" | "success" | "idle",
      message: "",
    }
  );

  const { register, control, getValues } = useForm<CheckoutFormInputs>({
    resolver: zodResolver(schema),
    mode: "onChange",
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
        name: `${firstName} ${lastName}`,
        document,
        number: cardNumber,
        cvv: cardCvv,
        month,
        year,
      };

      const _installments = 1;

      try {
        startTransition(() => {
          doCompleteCheckout({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            document: document.replace(/\D/g, ""),
            phoneNumber: phoneNumber.replace(/\D/g, ""),
            cardNumber,
            cardCvv,
            cardExpiration,
            address: {
              ...address,
              zipCode: address.zipCode.replace(/\D/g, ""),
            },
            invoiceId,
            cardToken: "",
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
        type="text/javascript"
        src="https://hml-apiv3.dompagamentos.com.br/js/sdk-dompagamentos.min.js"
      />
      <form onSubmit={onSubmit} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Seu nome"
              autoComplete="given-name"
              {...register("firstName")}
              className={inputClasses}
            />
            {errors.firstName && (
              <p className="text-xs text-red-400">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Seu sobrenome"
              autoComplete="family-name"
              {...register("lastName")}
              className={inputClasses}
            />
            {errors.lastName && (
              <p className="text-xs text-red-400">{errors.lastName.message}</p>
            )}
          </div>
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
                  { mask: "00.000.000/0000-00", lazy: false },
                ]}
                unmask={true}
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
            <p className="text-xs text-red-400">
              {errors.address.zipCode.message}
            </p>
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
              <p className="text-xs text-red-400">
                {errors.address.street.message}
              </p>
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
              <p className="text-xs text-red-400">
                {errors.address.number.message}
              </p>
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
            <p className="text-xs text-red-400">
              {errors.address.neighborhood.message}
            </p>
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
              <p className="text-xs text-red-400">
                {errors.address.city.message}
              </p>
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
              <p className="text-xs text-red-400">
                {errors.address.state.message}
              </p>
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
              <p className="text-xs text-red-400">
                {errors.cardNumber.message}
              </p>
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
              <p className="text-xs text-red-400">
                {errors.cardExpiration.message}
              </p>
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

const schema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z
    .string()
    .trim()
    .min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  document: z
    .string()
    .min(1, "Documento é obrigatório")
    .refine(
      (v) => {
        const d = v.replace(/\D/g, "");
        return isValidCPF(d) || isValidCNPJ(d);
      },
      { message: "Documento inválido" }
    ),
  cardNumber: z
    .string()
    .min(1, "Número do cartão é obrigatório")
    .regex(/^\d{16}$/, "Número do cartão deve ter 16 dígitos"),
  cardCvv: z
    .string()
    .min(1, "CVV é obrigatório")
    .regex(/^\d{3}$/, "CVV deve ter 3 dígitos"),
  cardExpiration: z
    .string()
    .min(1, "Data de validade é obrigatória")
    .regex(/^[0-9]{2}\/[0-9]{2}$/, "Data inválida"),
  phoneNumber: z
    .string()
    .min(1, "Telefone é obrigatório")
    .refine(
      (v) => isValidPhoneNumber(`55${v.replace(/\D/g, "")}`, "BR"),
      { message: "Número de telefone inválido" }
    ),
  address: z.object({
    street: z.string().min(1, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z
      .string()
      .length(2, "Digite o código de 2 dígitos do estado"),
    zipCode: z
      .string()
      .min(1, "CEP é obrigatório")
      .refine((v) => v.replace(/\D/g, "").length === 8, "CEP inválido"),
  }),
  installments: z.number().int().min(1).max(12).optional().default(1),
});

export type CheckoutFormInputs = z.infer<typeof schema>;
