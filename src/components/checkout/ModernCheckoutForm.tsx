"use client";

import { getUserCardsForCheckout } from "@/app/(auth)/wallet/actions";
import {
  completeCheckout,
  completeCheckoutWithSavedCard,
  initiateCheckoutPix,
  syncCheckoutPixPayment,
} from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input, inputClasses } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { isValidCNPJ, isValidCPF } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Plus,
  QrCode,
  Store,
  User,
  UserCheck,
} from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import {
  Controller,
  useForm,
  useFormState,
  type UseFormReturn,
} from "react-hook-form";
import { IMaskInput } from "react-imask";
import { usePaymentInputs } from "react-payment-inputs";
import { toast } from "sonner";
import { z } from "zod";
import { Skeleton } from "../ui/skeleton";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { isString, pick } from "lodash";
import { useRouter } from "next/navigation";

export interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  holderName: string;
  isDefault: boolean;
  cardToken: string;
}

export type CheckoutSidebarActionState = {
  label: string;
  disabled: boolean;
};

interface ModernCheckoutFormProps {
  invoiceId: string;
  hasExistingUser?: boolean;
  /** Atualiza texto/estado do botão principal da coluna lateral (checkout-client). */
  onSidebarActionStateChange?: (state: CheckoutSidebarActionState) => void;
}

export interface ModernCheckoutFormHandle {
  submit: () => void;
}

type CheckoutStep = "billing" | "payment";

const billingAddressSchema = z.object({
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
    state: z.string().length(2, "Digite o código de 2 dígitos do estado"),
    zipCode: z
      .string()
      .min(1, "CEP é obrigatório")
      .regex(/^\d{8}$/, "CEP inválido"),
  }),
});

const newCardSchema = billingAddressSchema.merge(
  z.object({
    cardNumber: z
      .string()
      .min(1, "Número do cartão é obrigatório")
      .refine(
        (v) => /^\d{16}$/.test(v.replace(/\D/g, "")),
        "Número do cartão deve ter 16 dígitos"
      ),
    cardCvv: z
      .string()
      .min(1, "CVV é obrigatório")
      .refine((v) => /^\d{3,4}$/.test(v.replace(/\D/g, "")), "CVV inválido"),
    cardExpiration: z
      .string()
      .min(1, "Data de validade é obrigatória")
      .regex(/^[0-9]{2}\/[0-9]{2}$/, "Data inválida"),
  })
);

type NewCardFormInputs = z.infer<typeof newCardSchema>;

interface OpenCepResponse {
  error?: true;
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

const ModernCheckoutForm = forwardRef<
  ModernCheckoutFormHandle,
  ModernCheckoutFormProps
>(({ invoiceId, hasExistingUser = false, onSidebarActionStateChange }, ref) => {
  const id = useId();
  const sidebarActionCbRef = useRef(onSidebarActionStateChange);
  sidebarActionCbRef.current = onSidebarActionStateChange;
  const [paymentMethod, setPaymentMethod] = useState<"new" | "pix" | string | null>();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isPixLoading, setIsPixLoading] = useState(false);
  const [pixSession, setPixSession] = useState<{
    pix_qrcode: string;
    pix_content: string;
    paymentId: string;
    transactionId: string;
  } | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const pixCopiedResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("billing");

  // Always use the full schema for form management
  const methods = useForm<NewCardFormInputs>({
    resolver: zodResolver(newCardSchema),
    mode: "onChange",
  });

  const {
    getValues,
    handleSubmit,
    trigger,
    formState: { errors, touchedFields },
    control,
    setValue,
  } = methods;

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

  useEffect(() => {
    if (paymentMethod !== "pix") {
      setPixSession(null);
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (!pixSession) return;
    const intervalId = setInterval(() => {
      void syncCheckoutPixPayment(invoiceId);
    }, 2500);
    const stopAt = setTimeout(() => clearInterval(intervalId), 15 * 60 * 1000);
    return () => {
      clearInterval(intervalId);
      clearTimeout(stopAt);
    };
  }, [pixSession, invoiceId]);

  useEffect(() => {
    setPixCopied(false);
    if (pixCopiedResetRef.current) {
      clearTimeout(pixCopiedResetRef.current);
      pixCopiedResetRef.current = null;
    }
  }, [pixSession?.pix_content]);

  useEffect(
    () => () => {
      if (pixCopiedResetRef.current) clearTimeout(pixCopiedResetRef.current);
    },
    []
  );

  const copyPixToClipboard = useCallback(() => {
    if (!pixSession) return;
    void navigator.clipboard
      .writeText(pixSession.pix_content)
      .then(() => {
        if (pixCopiedResetRef.current) clearTimeout(pixCopiedResetRef.current);
        setPixCopied(true);
        pixCopiedResetRef.current = setTimeout(() => {
          setPixCopied(false);
          pixCopiedResetRef.current = null;
        }, 2200);
      })
      .catch(() => toast.error("Não foi possível copiar."));
  }, [pixSession]);

  const handleInitiatePix = useCallback(async () => {
    const ok = await trigger([
      "firstName",
      "lastName",
      "document",
      "phoneNumber",
      "address.street",
      "address.number",
      "address.neighborhood",
      "address.city",
      "address.state",
      "address.zipCode",
    ]);
    if (!ok) {
      toast.error("Preencha os dados de cobrança corretamente.");
      return;
    }
    const v = getValues();
    setIsPixLoading(true);
    try {
      const res = await initiateCheckoutPix({
        invoiceId,
        firstName: v.firstName,
        lastName: v.lastName,
        document: v.document,
        phoneNumber: v.phoneNumber,
        address: v.address,
      });
      if (res.status === "success") {
        setPixSession({
          pix_qrcode: res.pix_qrcode,
          pix_content: res.pix_content,
          paymentId: res.paymentId,
          transactionId: res.transactionId,
        });
        toast.success("PIX gerado. Escaneie ou copie o código.");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Erro ao gerar PIX.");
    } finally {
      setIsPixLoading(false);
    }
  }, [invoiceId, getValues, trigger]);

  const onSubmit = useCallback(
    (values: NewCardFormInputs) => {
      if (paymentMethod === "new") {
        // New card payment
        startTransition(async () => {
          try {
            const result = await completeCheckout(null, {
              ...values,
              invoiceId,
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
            const result = await completeCheckout(null, {
              ...values,
              cardToken: selectedCard.cardToken,
              invoiceId,
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

  const router = useRouter();

  // Simplified submit for existing users (only payment method)
  const onSimpleSubmit = useCallback(() => {
    if (paymentMethod === "new") {
      // For new card with existing user, we need card data and billing data
      const values = getValues();
      const { cardNumber, cardExpiration, cardCvv, firstName, lastName, document } =
        values;

      if (!cardNumber || !cardExpiration || !cardCvv) {
        toast.error("Por favor, preencha todos os dados do cartão");
        return;
      }

      if (!firstName || !lastName || !document) {
        toast.error(
          "Por favor, preencha o nome, sobrenome e documento do titular do cartão"
        );
        return;
      }

      startTransition(async () => {
        try {
          const result = await completeCheckout(null, {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            document: document.replace(/\D/g, ""),
            phoneNumber: "", // Will be populated from existing user data on server
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
          });

          if (result.status === "success") {
            router.push("/payment/success");
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
          firstName: "", // Will be populated from existing user data on server
          lastName: "",
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
          card: selectedCard,
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
  }, [paymentMethod, savedCards, invoiceId, getValues, router]);

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

  const isPaymentComplete = () => {
    if (paymentMethod === "pix") {
      return true;
    }
    if (paymentMethod === "new") {
      const values = getValues();
      return values.cardNumber && values.cardCvv && values.cardExpiration;
    }
    return !!paymentMethod && paymentMethod !== "new" && paymentMethod !== "pix";
  };

  function isFirstStepValid() {
    const billingFields = pick(
      getValues(),
      "firstName",
      "lastName",
      "document",
      "phoneNumber",
      "address"
    );

    console.log({ billingFields });

    const isTouched = Object.values(
      pick(billingFields, "firstName", "lastName", "document", "phoneNumber", "address")
    ).every((e) => {
      if (!isString(e)) {
        return e && Object.values(e).every((v) => !!v);
      }
      return !!e;
    });

    console.log({ isTouched });

    if (!isTouched) {
      return false;
    }

    const isValid = Object.values(
      pick(errors, "firstName", "lastName", "document", "phoneNumber", "address")
    ).every((e) => {
      if (!isString(e)) {
        console.log(e);
        return Object.values(e).some((v) => !v);
      }
      return !e;
    });

    return isValid;
  }

  const canProceedToPayment = isFirstStepValid();

  console.log({
    canProceedToPayment,
    err: pick(errors, "firstName", "lastName", "document", "phoneNumber", "address"),
  });

  const canCompleteCheckout = () => {
    if (paymentMethod === "pix") {
      return canProceedToPayment;
    }
    return canProceedToPayment && isPaymentComplete();
  };

  const allowCardFinalize = canCompleteCheckout();

  const handleContinueToPayment = () => {
    if (canProceedToPayment) {
      setCurrentStep("payment");
    }
  };

  const handleBackToBilling = () => {
    setCurrentStep("billing");
  };

  useImperativeHandle(
    ref,
    () => ({
      submit: () => {
        if (hasExistingUser) {
          if (paymentMethod === "pix") {
            if (!pixSession) {
              void handleInitiatePix();
            } else {
              void syncCheckoutPixPayment(invoiceId);
            }
            return;
          }
          onSimpleSubmit();
          return;
        }
        if (currentStep === "billing") {
          if (canProceedToPayment) {
            setCurrentStep("payment");
          }
          return;
        }
        if (paymentMethod === "pix") {
          if (!pixSession) {
            void handleInitiatePix();
          } else {
            void syncCheckoutPixPayment(invoiceId);
          }
          return;
        }
        handleSubmit(onSubmit)();
      },
    }),
    [
      hasExistingUser,
      currentStep,
      canProceedToPayment,
      paymentMethod,
      pixSession,
      handleSubmit,
      onSubmit,
      onSimpleSubmit,
      handleInitiatePix,
      invoiceId,
    ]
  );

  useEffect(() => {
    const notify = sidebarActionCbRef.current;
    if (!notify) return;

    let label = "Finalizar Transação";
    let disabled = false;

    if (!hasExistingUser && currentStep === "billing") {
      label = "Continuar";
      disabled = !canProceedToPayment;
    } else if (paymentMethod === "pix") {
      if (isPixLoading) {
        label = "Gerando PIX...";
        disabled = true;
      } else if (pixSession) {
        label = "Finalizar Transação";
        disabled = false;
      } else {
        label = "Gerar PIX";
        disabled = !canProceedToPayment;
      }
    } else {
      if (isPending) {
        label = "Processando...";
        disabled = true;
      } else {
        label = "Finalizar Transação";
        disabled = !allowCardFinalize;
      }
    }

    notify({ label, disabled });
  }, [
    hasExistingUser,
    currentStep,
    paymentMethod,
    pixSession,
    isPixLoading,
    isPending,
    canProceedToPayment,
    allowCardFinalize,
  ]);

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
              className="grid gap-3"
            >
              <Label className="relative flex cursor-pointer items-center gap-3 rounded-lg border border-input p-4 shadow-sm shadow-black/5 outline-offset-2 transition-colors has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring/70 h-21">
                <RadioGroupItem
                  value="pix"
                  className="sr-only after:absolute after:inset-0"
                />
                <div className="flex size-8 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-500/10">
                  <QrCode
                    size={16}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div>
                  <span className="font-medium">PIX</span>
                  <div className="text-sm text-muted-foreground">
                    QR Code no app do banco
                  </div>
                </div>
              </Label>

              {(isLoadingCards || savedCards.length > 0) && <Separator />}

              {isLoadingCards ? (
                <Skeleton className="h-21 w-full" />
              ) : (
                savedCards.length > 0 &&
                savedCards.map((card) => (
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
                        {card.holderName} • {card.expiryMonth}/{card.expiryYear}
                      </div>
                    </div>
                  </Label>
                ))
              )}

              {(isLoadingCards || savedCards.length > 0) && <Separator />}

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

        {paymentMethod === "pix" && (
          <BillingInformationSection methods={methods} id={id} />
        )}

        {/* New Card Form - Only show if "new" is selected */}
        <AnimatePresence>
          {paymentMethod === "new" && <NewCardFormSection {...methods} />}
        </AnimatePresence>

        {paymentMethod === "pix" && pixSession && (
          <Card>
            <CardHeader>
              <CardTitle>Pague com PIX</CardTitle>
              <CardDescription>
                Escaneie o QR ou copie o código no app do banco
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pixSession.pix_qrcode ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pixSession.pix_qrcode}
                  alt="QR Code PIX"
                  className="mx-auto max-w-[240px] rounded-lg border border-border"
                />
              ) : null}
              <Button
                type="button"
                variant="outline"
                className={clsx(
                  "w-full overflow-hidden transition-[color,background-color,border-color] duration-300",
                  pixCopied &&
                    "border-emerald-500/45 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"
                )}
                onClick={copyPixToClipboard}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={pixCopied ? "copied" : "copy"}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="inline-flex items-center justify-center gap-2"
                  >
                    {pixCopied ? (
                      <>
                        <Check className="size-4 shrink-0" strokeWidth={2.5} />
                        Copiado!
                      </>
                    ) : (
                      "Copiar código PIX"
                    )}
                  </motion.span>
                </AnimatePresence>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Após o pagamento, a confirmação é automática (pode levar alguns
                instantes).
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Billing Information Step */}
      {currentStep === "billing" && (
        <>
          <BillingInformationSection methods={methods} id={id} />

          {/* Payment Card - Collapsed/Preview */}
          <Card className="opacity-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border">
                  <CreditCard
                    className="opacity-80"
                    size={16}
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <CardTitle>Pagamento</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Continue Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleContinueToPayment}
              disabled={!canProceedToPayment}
              className="min-w-32"
            >
              Continuar
            </Button>
          </div>
        </>
      )}

      {/* Payment Step */}
      {currentStep === "payment" && (
        <>
          {/* Billing Summary Card */}
          <BillingSummaryCard
            values={getValues()}
            onEdit={handleBackToBilling}
          />

          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border">
                  <CreditCard
                    className="opacity-80"
                    size={16}
                    strokeWidth={2}
                  />
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
                className="grid gap-3"
              >
                <Label className="relative flex cursor-pointer items-center gap-3 rounded-lg border border-input p-4 shadow-sm shadow-black/5 outline-offset-2 transition-colors has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring/70">
                  <RadioGroupItem
                    value="pix"
                    className="sr-only after:absolute after:inset-0"
                  />
                  <div className="flex size-8 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-500/10">
                    <QrCode size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <span className="font-medium">PIX</span>
                    <div className="text-sm text-muted-foreground">
                      QR Code no app do banco
                    </div>
                  </div>
                </Label>

                {(isLoadingCards || savedCards.length > 0) && <Separator />}

                {isLoadingCards ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    <Skeleton className="h-21 w-full" />
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
                            {card.holderName} • {card.expiryMonth}/
                            {card.expiryYear}
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

          {/* New Card Form - Only show if "new" is selected */}
          {paymentMethod === "new" && <NewCardFormSection {...methods} />}

          {paymentMethod === "pix" && pixSession && (
            <Card>
              <CardHeader>
                <CardTitle>Pague com PIX</CardTitle>
                <CardDescription>
                  Escaneie o QR ou copie o código no app do banco
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pixSession.pix_qrcode ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pixSession.pix_qrcode}
                    alt="QR Code PIX"
                    className="mx-auto max-w-[240px] rounded-lg border border-border"
                  />
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  className={clsx(
                    "w-full overflow-hidden transition-[color,background-color,border-color] duration-300",
                    pixCopied &&
                      "border-emerald-500/45 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"
                  )}
                  onClick={copyPixToClipboard}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={pixCopied ? "copied" : "copy"}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="inline-flex items-center justify-center gap-2"
                    >
                      {pixCopied ? (
                        <>
                          <Check className="size-4 shrink-0" strokeWidth={2.5} />
                          Copiado!
                        </>
                      ) : (
                        "Copiar código PIX"
                      )}
                    </motion.span>
                  </AnimatePresence>
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Após o pagamento, a confirmação é automática (pode levar alguns
                  instantes).
                </p>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBackToBilling}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar
            </Button>

            <Button
              onClick={() => {
                if (paymentMethod === "pix") {
                  if (pixSession) {
                    void syncCheckoutPixPayment(invoiceId);
                  } else {
                    void handleInitiatePix();
                  }
                } else {
                  handleSubmit(onSubmit)();
                }
              }}
              disabled={
                isPixLoading ||
                isPending ||
                (paymentMethod === "pix" &&
                  !pixSession &&
                  !canProceedToPayment) ||
                (paymentMethod !== "pix" && !canCompleteCheckout())
              }
              className="min-w-40"
            >
              {isPixLoading
                ? "Gerando PIX..."
                : paymentMethod === "pix" && pixSession
                  ? "Finalizar Transação"
                  : paymentMethod === "pix"
                    ? "Gerar PIX"
                    : isPending
                      ? "Processando..."
                      : "Finalizar Transação"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
});

function BillingInformationSection({
  methods,
  id,
}: {
  methods: UseFormReturn<NewCardFormInputs>;
  id: string;
}) {
  const {
    register,
    control,
    formState: { errors },
    setValue,
  } = methods;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border">
            <User className="opacity-80" size={16} strokeWidth={2} />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">
              Informações de Cobrança
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Personal Information */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${id}-firstName`} className="text-muted-foreground">
              Nome
            </Label>
            <Input
              id={`${id}-firstName`}
              placeholder="Seu nome"
              autoComplete="given-name"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-xs text-red-400">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-lastName`} className="text-muted-foreground">
              Sobrenome
            </Label>
            <Input
              id={`${id}-lastName`}
              placeholder="Seu sobrenome"
              autoComplete="family-name"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-xs text-red-400">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${id}-document`} className="text-muted-foreground">
              CPF ou CNPJ
            </Label>
            <Controller
              name="document"
              control={control}
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  mask={[
                    { mask: "000.000.000-00" },
                    { mask: "00.000.000/0000-00" },
                  ]}
                  placeholder="000.000.000-00"
                  autoComplete="off"
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
            <Label
              htmlFor={`${id}-phoneNumber`}
              className="text-muted-foreground"
            >
              Telefone
            </Label>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  mask="(00) 00000-0000"
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                  className={inputClasses}
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

        <div className="space-y-2">
          <Label
            htmlFor={`${id}-address.zipCode`}
            className="text-muted-foreground"
          >
            CEP
          </Label>
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
                onAccept={(value) => {
                  field.onChange(value);

                  (async () => {
                    const digits = value as string;
                    if (digits && digits.length === 8) {
                      const { data } = await axios.get(
                        `https://opencep.com/v1/${digits}.json`
                      );

                      if (data.error) {
                        return;
                      }

                      setValue("address.street", data.logradouro);
                      setValue("address.neighborhood", data.bairro);
                      setValue("address.city", data.localidade);
                      setValue("address.state", data.uf);
                    }
                  })();
                }}
              />
            )}
          />
          {errors.address?.zipCode && (
            <p className="text-xs text-red-400">
              {errors.address.zipCode.message}
            </p>
          )}
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor={`${id}-address.street`}
                className="text-muted-foreground"
              >
                Rua
              </Label>
              <Input
                id={`${id}-address.street`}
                placeholder="Nome da rua"
                autoComplete="address-line1"
                {...register("address.street")}
              />
              {errors.address?.street && (
                <p className="text-xs text-red-400">
                  {errors.address.street.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`${id}-address.number`}
                className="text-muted-foreground"
              >
                Número
              </Label>
              <Input
                id={`${id}-address.number`}
                placeholder="123"
                autoComplete="address-line2"
                {...register("address.number")}
              />
              {errors.address?.number && (
                <p className="text-xs text-red-400">
                  {errors.address.number.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor={`${id}-address.neighborhood`}
                className="text-muted-foreground"
              >
                Bairro
              </Label>
              <Input
                id={`${id}-address.neighborhood`}
                placeholder="Nome do bairro"
                {...register("address.neighborhood")}
              />
              {errors.address?.neighborhood && (
                <p className="text-xs text-red-400">
                  {errors.address.neighborhood.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor={`${id}-address.city`}
                className="text-muted-foreground"
              >
                Cidade
              </Label>
              <Input
                id={`${id}-address.city`}
                placeholder="Nome da cidade"
                autoComplete="address-level2"
                {...register("address.city")}
              />
              {errors.address?.city && (
                <p className="text-xs text-red-400">
                  {errors.address.city.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`${id}-address.state`}
                className="text-muted-foreground"
              >
                Estado
              </Label>
              <Input
                id={`${id}-address.state`}
                placeholder="SP"
                autoComplete="address-level1"
                maxLength={2}
                {...register("address.state")}
              />
              {errors.address?.state && (
                <p className="text-xs text-red-400">
                  {errors.address.state.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BillingSummaryCard({
  values,
  onEdit,
}: {
  values: NewCardFormInputs;
  onEdit: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-green-50">
              <UserCheck
                className="opacity-80 text-green-500 h-5 w-5"
                strokeWidth={3}
              />
            </div>
            <div>
              <CardTitle className="text-muted-foreground">
                Informações de Cobrança
              </CardTitle>
              <CardDescription>Dados confirmados</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Editar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <span className="font-medium">{values.firstName} {values.lastName}</span>
              <div className="text-muted-foreground">{values.document}</div>
            </div>
            <div>
              <span className="font-medium">Telefone</span>
              <div className="text-muted-foreground">{values.phoneNumber}</div>
            </div>
          </div>
          <div>
            <span className="font-medium">Endereço</span>
            <div className="text-muted-foreground">
              {values.address?.street}, {values.address?.number} •{" "}
              {values.address?.neighborhood}
              <br />
              {values.address?.city}, {values.address?.state} •{" "}
              {values.address?.zipCode}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NewCardFormSection({
  register,
  control,
  formState: { errors, touchedFields },
}: UseFormReturn<NewCardFormInputs>) {
  return (
    <MotionCard
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ ease: [0.25, 1, 0.5, 1], duration: 0.6 }}
    >
      <CardHeader>
        <CardTitle>Dados do Cartão</CardTitle>
        <CardDescription>
          Insira os dados do seu cartão de crédito
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="cardNumber" className="text-muted-foreground">
              Número do Cartão
            </Label>
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
            {errors.cardNumber && touchedFields.cardNumber && (
              <p className="text-xs text-red-400">
                {errors.cardNumber.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardCvv" className="text-muted-foreground">
              CVV
            </Label>
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
            {errors.cardCvv && touchedFields.cardCvv && (
              <p className="text-xs text-red-400">{errors.cardCvv.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardExpiration" className="text-muted-foreground">
              Data de Validade
            </Label>
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
            {errors.cardExpiration && touchedFields.cardExpiration && (
              <p className="text-xs text-red-400">
                {errors.cardExpiration.message}
              </p>
            )}
          </div>
        </div>

        {/* Billing Information for Card Holder */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Informações do Titular
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-muted-foreground">
                Nome do Titular
              </Label>
              <Input
                placeholder="Nome"
                autoComplete="given-name"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-xs text-red-400">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-muted-foreground">
                Sobrenome do Titular
              </Label>
              <Input
                placeholder="Sobrenome"
                autoComplete="family-name"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-xs text-red-400">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="document" className="text-muted-foreground">
              CPF ou CNPJ do titular
            </Label>
            <Controller
              name="document"
              control={control}
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  mask={[
                    { mask: "000.000.000-00" },
                    { mask: "00.000.000/0000-00" },
                  ]}
                  placeholder="000.000.000-00"
                  autoComplete="document"
                  className={inputClasses}
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
        </div>
      </CardContent>
    </MotionCard>
  );
}

const MotionCard = motion.create(Card);

ModernCheckoutForm.displayName = "ModernCheckoutForm";

export default ModernCheckoutForm;
