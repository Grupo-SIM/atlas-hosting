"use client";

import { getUserCardsForCheckout } from "@/app/(auth)/wallet/actions";
import { completeCheckout, completeCheckoutWithSavedCard } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { isValidCNPJ, isValidCPF } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { isValidPhoneNumber } from "libphonenumber-js";
import { CreditCard, Plus, Store } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { usePaymentInputs } from "react-payment-inputs";
import { toast } from "sonner";
import * as yup from "yup";
import { Skeleton } from "../ui/skeleton";

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  holderName: string;
  isDefault: boolean;
  cardToken: string;
}

interface ModernCheckoutFormProps {
  invoiceId: string;
  hasExistingUser?: boolean;
}

export interface ModernCheckoutFormHandle {
  submit: () => void;
}

const schema = yup
  .object({
    fullName: yup
      .string()
      .trim()
      .required("Nome completo é obrigatório")
      .matches(/(\s)/, "Digite seu nome completo"),
    document: yup
      .string()
      .transform((value) => value.replace(/\D/g, ""))
      .test({
        test: (value) => isValidCPF(value) || isValidCNPJ(value),
        message: "Documento inválido",
      })
      .required("Documento é obrigatório"),
    phoneNumber: yup
      .string()
      .required("Número de telefone é obrigatório")
      .transform((value) => `55${value.replace(/\D/g, "")}`)
      .test({
        test: (value) => isValidPhoneNumber(value, "BR"),
        message: "Número de telefone inválido",
      }),
    address: yup.object({
      street: yup.string().required("Rua é obrigatória"),
      number: yup.string().required("Número é obrigatório"),
      neighborhood: yup.string().required("Bairro é obrigatório"),
      city: yup.string().required("Cidade é obrigatória"),
      state: yup
        .string()
        .length(2, "Digite o código de 2 dígitos do estado")
        .required("Estado é obrigatório"),
      zipCode: yup
        .string()
        .required("CEP é obrigatório")
        .matches(/^\d{5}-\d{3}$/, "CEP inválido"),
    }),
  })
  .required();

const newCardSchema = schema.concat(
  yup.object({
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
      .matches(/^[0-9]{2}\/[0-9]{2}$/, "Data inválida"),
  })
);

type BaseFormInputs = yup.InferType<typeof schema>;
type NewCardFormInputs = yup.InferType<typeof newCardSchema>;

const ModernCheckoutForm = forwardRef<
  ModernCheckoutFormHandle,
  ModernCheckoutFormProps
>(({ invoiceId, hasExistingUser = false }, ref) => {
  const id = useId();
  const [paymentMethod, setPaymentMethod] = useState<"new" | string | null>();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Payment inputs hook for new card
  const {
    meta,
    getCardNumberProps,
    getExpiryDateProps,
    getCVCProps,
    getCardImageProps,
  } = usePaymentInputs();

  // Always use the full schema for form management
  const {
    register,
    control,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<NewCardFormInputs>({
    resolver: yupResolver(newCardSchema),
    mode: "onChange",
  });

  const watchPaymentMethod = watch();

  // Load saved cards only
  useEffect(() => {
    const loadCards = async () => {
      setIsLoadingCards(true);

      try {
        const cards = await getUserCardsForCheckout();
        setSavedCards(cards);

        // Set default card as selected if available
        const defaultCard = cards.find((card) => card.isDefault);
        if (defaultCard && cards.length > 0) {
          setPaymentMethod(defaultCard.id);
        }
      } catch (error) {
        console.error("Error loading cards:", error);
      } finally {
        setIsLoadingCards(false);
      }
    };

    loadCards();
  }, []);

  const onSubmit = useCallback(
    (values: NewCardFormInputs) => {
      if (paymentMethod === "new") {
        // New card payment
        startTransition(async () => {
          try {
            const result = await completeCheckout(null, {
              ...values,
              invoiceId,
              cardToken: "",
            });

            if (result.status === "success") {
              toast.success(result.message);
            } else {
              toast.error(result.message);
            }
          } catch (error) {
            toast.error("Erro ao processar pagamento");
          }
        });
      } else {
        // Saved card payment
        const selectedCard = savedCards.find(
          (card) => card.id === paymentMethod
        );
        if (!selectedCard) {
          toast.error("Cartão selecionado não encontrado");
          return;
        }

        startTransition(async () => {
          try {
            const result = await completeCheckoutWithSavedCard(null, {
              fullName: values.fullName,
              document: values.document,
              phoneNumber: values.phoneNumber,
              address: values.address,
              invoiceId,
              cardToken: selectedCard.cardToken,
            });

            if (result.status === "success") {
              toast.success(result.message);
            } else {
              toast.error(result.message);
            }
          } catch (error) {
            toast.error("Erro ao processar pagamento");
          }
        });
      }
    },
    [paymentMethod, savedCards, invoiceId]
  );

  // Simplified submit for existing users (only payment method)
  const onSimpleSubmit = useCallback(() => {
    if (paymentMethod === "new") {
      // For new card with existing user, we need card data
      const cardNumber = getValues("cardNumber");
      const cardExpiration = getValues("cardExpiration");
      const cardCvv = getValues("cardCvv");

      if (!cardNumber || !cardExpiration || !cardCvv) {
        toast.error("Por favor, preencha todos os dados do cartão");
        return;
      }

      startTransition(async () => {
        try {
          const result = await completeCheckout(null, {
            fullName: "", // Will be populated from existing user data on server
            document: "",
            phoneNumber: "",
            address: {
              street: "",
              number: "",
              neighborhood: "",
              city: "",
              state: "",
              zipCode: "",
            },
            cardNumber,
            cardExpiration,
            cardCvv,
            invoiceId,
            cardToken: "",
          });

          if (result.status === "success") {
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        } catch (error) {
          toast.error("Erro ao processar pagamento");
        }
      });
      return;
    }

    const selectedCard = savedCards.find((card) => card.id === paymentMethod);
    if (!selectedCard) {
      toast.error("Cartão selecionado não encontrado");
      return;
    }

    startTransition(async () => {
      try {
        const result = await completeCheckoutWithSavedCard(null, {
          fullName: "", // Will be populated from existing user data on server
          document: "",
          phoneNumber: "",
          address: {
            street: "",
            number: "",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: "",
          },
          invoiceId,
          cardToken: selectedCard.cardToken,
        });

        if (result.status === "success") {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Erro ao processar pagamento");
      }
    });
  }, [paymentMethod, savedCards, invoiceId, getValues]);

  // Expose submit function via ref
  useImperativeHandle(
    ref,
    () => ({
      submit: () => {
        if (hasExistingUser) {
          onSimpleSubmit();
        } else {
          handleSubmit(onSubmit)();
        }
      },
    }),
    [hasExistingUser, handleSubmit, onSubmit, onSimpleSubmit]
  );

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return "💳";
      case "mastercard":
        return "💳";
      case "american express":
      case "amex":
        return "💳";
      default:
        return "💳";
    }
  };

  const selectedCard = savedCards.find((card) => card.id === paymentMethod);

  // Render simplified version for existing users with domId
  if (hasExistingUser) {
    return (
      <div className="space-y-6">
        {/* Payment Method Selection Only */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border">
                <Store className="opacity-80" size={16} strokeWidth={2} />
              </div>
              <div>
                <CardTitle>Método de Pagamento</CardTitle>
                <CardDescription>Escolha como deseja pagar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-3"
            >
              {/* Saved Cards */}
              {isLoadingCards ? (
                <Skeleton className="h-21 w-full" />
              ) : savedCards.length > 0 ? (
                <>
                  {savedCards.map((card) => (
                    <Label
                      key={card.id}
                      className="relative flex cursor-pointer items-center gap-3 rounded-lg border border-input p-4 shadow-sm shadow-black/5 outline-offset-2 transition-colors has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring/70 h-21"
                    >
                      <RadioGroupItem
                        value={card.id}
                        className="sr-only after:absolute after:inset-0"
                      />
                      <div className="text-2xl">
                        {getCardBrandIcon(card.brand)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            **** **** **** {card.last4}
                          </span>
                          {card.isDefault && (
                            <Badge variant="secondary">Padrão</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {card.holderName} • {card.expiryMonth}/
                          {card.expiryYear}
                        </div>
                      </div>
                    </Label>
                  ))}
                </>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Nenhum cartão salvo encontrado
                </div>
              )}

              {/* Separator if there are saved cards */}
              {(isLoadingCards || savedCards.length > 0) && <Separator />}

              {/* Add New Card Option */}
              <Label className="relative flex cursor-pointer items-center gap-3 rounded-lg border border-input p-4 shadow-sm shadow-black/5 outline-offset-2 transition-colors has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring/70">
                <RadioGroupItem
                  value="new"
                  className="sr-only after:absolute after:inset-0"
                />
                <div className="flex size-8 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/50">
                  <Plus size={16} />
                </div>
                <div>
                  <span className="font-medium">Novo cartão</span>
                  <div className="text-sm text-muted-foreground">
                    Digite os dados de um novo cartão
                  </div>
                </div>
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* New Card Form - Only show if "new" is selected */}
        {paymentMethod === "new" && (
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cartão</CardTitle>
              <CardDescription>
                Insira os dados do seu cartão de crédito ou débito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Card Number */}
                <div className="space-y-2">
                  <Label htmlFor={`card-number-${id}`}>Número do cartão</Label>
                  <div className="relative">
                    <Input
                      id={`card-number-${id}`}
                      placeholder="1234 5678 9012 3456"
                      {...getCardNumberProps()}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        getCardNumberProps().onChange?.(e);
                        setValue("cardNumber", e.target.value);
                      }}
                      className={errors.cardNumber ? "border-red-500" : ""}
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      {meta.cardType ? (
                        <svg
                          className="overflow-hidden rounded-sm"
                          {...getCardImageProps()}
                          width={20}
                        />
                      ) : (
                        <CreditCard
                          size={16}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>
                  {errors.cardNumber && (
                    <p className="text-sm text-red-500">
                      {errors.cardNumber.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <Label htmlFor={`expiry-${id}`}>Data de validade</Label>
                    <Input
                      id={`expiry-${id}`}
                      placeholder="MM/AA"
                      {...getExpiryDateProps()}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        getExpiryDateProps().onChange?.(e);
                        setValue("cardExpiration", e.target.value);
                      }}
                      className={errors.cardExpiration ? "border-red-500" : ""}
                    />
                    {errors.cardExpiration && (
                      <p className="text-sm text-red-500">
                        {errors.cardExpiration.message}
                      </p>
                    )}
                  </div>

                  {/* CVV */}
                  <div className="space-y-2">
                    <Label htmlFor={`cvv-${id}`}>CVV</Label>
                    <Input
                      id={`cvv-${id}`}
                      placeholder="123"
                      {...getCVCProps()}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        getCVCProps().onChange?.(e);
                        setValue("cardCvv", e.target.value);
                      }}
                      className={errors.cardCvv ? "border-red-500" : ""}
                    />
                    {errors.cardCvv && (
                      <p className="text-sm text-red-500">
                        {errors.cardCvv.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border">
              <Store className="opacity-80" size={16} strokeWidth={2} />
            </div>
            <div>
              <CardTitle>Método de Pagamento</CardTitle>
              <CardDescription>Escolha como deseja pagar</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            className="space-y-3"
          >
            {/* Saved Cards */}
            {isLoadingCards ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Carregando cartões salvos...
              </div>
            ) : savedCards.length > 0 ? (
              <>
                {savedCards.map((card) => (
                  <Label
                    key={card.id}
                    className="relative flex cursor-pointer items-center gap-3 rounded-lg border border-input p-4 shadow-sm shadow-black/5 outline-offset-2 transition-colors has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring/70"
                  >
                    <RadioGroupItem
                      value={card.id}
                      className="sr-only after:absolute after:inset-0"
                    />
                    <div className="text-2xl">
                      {getCardBrandIcon(card.brand)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          **** **** **** {card.last4}
                        </span>
                        {card.isDefault && (
                          <Badge variant="secondary">Padrão</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {card.holderName} • {card.expiryMonth}/{card.expiryYear}
                      </div>
                    </div>
                  </Label>
                ))}
                <Separator />
              </>
            ) : null}

            <Label className="relative flex cursor-pointer items-center gap-3 rounded-lg border border-input p-4 shadow-sm shadow-black/5 outline-offset-2 transition-colors has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring/70">
              <RadioGroupItem
                value="new"
                className="sr-only after:absolute after:inset-0"
              />
              <div className="flex size-8 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/50">
                <Plus size={16} />
              </div>
              <div>
                <span className="font-medium">Novo cartão</span>
                <div className="text-sm text-muted-foreground">
                  Digite os dados de um novo cartão
                </div>
              </div>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Cobrança</CardTitle>
          <CardDescription>
            {paymentMethod === "new"
              ? "Complete os dados para processar o pagamento"
              : `Pagamento com cartão ${selectedCard?.last4}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`fullName-${id}`}>Nome completo</Label>
                <Input
                  id={`fullName-${id}`}
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-400">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`document-${id}`}>CPF ou CNPJ</Label>
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
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                      onAccept={(value) => field.onChange(value)}
                    />
                  )}
                />
                {errors.document && (
                  <p className="text-xs text-red-400">
                    {errors.document.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`phoneNumber-${id}`}>Telefone</Label>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <IMaskInput
                      {...field}
                      mask={[
                        { mask: "(00) 0000-0000" },
                        { mask: "(00) 00000-0000" },
                      ]}
                      unmask={true}
                      placeholder="(XX) XXXXX-XXXX"
                      autoComplete="tel"
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                      onAccept={(value) => field.onChange(value)}
                    />
                  )}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-red-400">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Endereço</h3>

              <div className="space-y-2">
                <Label htmlFor={`zipCode-${id}`}>CEP</Label>
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
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
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

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor={`street-${id}`}>Rua</Label>
                  <Input
                    id={`street-${id}`}
                    placeholder="Nome da rua"
                    autoComplete="street-address"
                    {...register("address.street")}
                  />
                  {errors.address?.street && (
                    <p className="text-xs text-red-400">
                      {errors.address.street.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`number-${id}`}>Número</Label>
                  <Input
                    id={`number-${id}`}
                    placeholder="Nº"
                    {...register("address.number")}
                  />
                  {errors.address?.number && (
                    <p className="text-xs text-red-400">
                      {errors.address.number.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`neighborhood-${id}`}>Bairro</Label>
                <Input
                  id={`neighborhood-${id}`}
                  placeholder="Seu bairro"
                  {...register("address.neighborhood")}
                />
                {errors.address?.neighborhood && (
                  <p className="text-xs text-red-400">
                    {errors.address.neighborhood.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-5 gap-3">
                <div className="space-y-2 col-span-3">
                  <Label htmlFor={`city-${id}`}>Cidade</Label>
                  <Input
                    id={`city-${id}`}
                    placeholder="Sua cidade"
                    {...register("address.city")}
                  />
                  {errors.address?.city && (
                    <p className="text-xs text-red-400">
                      {errors.address.city.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor={`state-${id}`}>Estado</Label>
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
                        className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                        onAccept={(value) =>
                          field.onChange(value.toUpperCase())
                        }
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
            </div>

            {/* Card Information - Only for new cards */}
            {paymentMethod === "new" && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-medium">Informações do Cartão</h3>

                  <div className="space-y-2">
                    <Label htmlFor={`cardNumber-${id}`}>Dados do Cartão</Label>
                    <div className="rounded-lg shadow-sm shadow-black/5">
                      <div className="relative focus-within:z-10">
                        <Input
                          className="peer rounded-b-none pe-9 shadow-none [direction:inherit]"
                          {...getCardNumberProps()}
                          id={`cardNumber-${id}`}
                          onChange={(e) => {
                            getCardNumberProps().onChange(e);
                            register("cardNumber").onChange(e);
                          }}
                        />
                        <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground/80 peer-disabled:opacity-50">
                          {meta.cardType ? (
                            <svg
                              className="overflow-hidden rounded-sm"
                              {...getCardImageProps()}
                              width={20}
                            />
                          ) : (
                            <CreditCard
                              size={16}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      </div>
                      <div className="-mt-px flex">
                        <div className="min-w-0 flex-1 focus-within:z-10">
                          <Input
                            className="rounded-e-none rounded-t-none shadow-none [direction:inherit]"
                            {...getExpiryDateProps()}
                            id={`expiry-${id}`}
                            onChange={(e) => {
                              getExpiryDateProps().onChange(e);
                              register("cardExpiration").onChange(e);
                            }}
                          />
                        </div>
                        <div className="-ms-px min-w-0 flex-1 focus-within:z-10">
                          <Input
                            className="rounded-s-none rounded-t-none shadow-none [direction:inherit]"
                            {...getCVCProps()}
                            id={`cvc-${id}`}
                            onChange={(e) => {
                              getCVCProps().onChange(e);
                              register("cardCvv").onChange(e);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {(errors.cardNumber ||
                      errors.cardExpiration ||
                      errors.cardCvv) && (
                      <div className="space-y-1">
                        {errors.cardNumber && (
                          <p className="text-xs text-red-400">
                            {errors.cardNumber.message}
                          </p>
                        )}
                        {errors.cardExpiration && (
                          <p className="text-xs text-red-400">
                            {errors.cardExpiration.message}
                          </p>
                        )}
                        {errors.cardCvv && (
                          <p className="text-xs text-red-400">
                            {errors.cardCvv.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

ModernCheckoutForm.displayName = "ModernCheckoutForm";

export default ModernCheckoutForm;
