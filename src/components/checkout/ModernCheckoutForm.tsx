"use client";

import { getUserCardsForCheckout } from "@/app/(auth)/wallet/actions";
import {
  completeCheckout,
  completeCheckoutWithSavedCard,
  initiateCheckoutPix,
  markPixPaymentComplete,
  syncCheckoutPixPayment,
} from "@/app/actions";
import {
  getUserBillingInfo,
  saveUserBillingInfo,
} from "@/app/(auth)/billing/actions";
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
  Loader2,
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

const atlasInputClasses = "flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all outline-none disabled:opacity-50";

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
  hidden?: boolean;
};

interface ModernCheckoutFormProps {
  invoiceId: string;
  invoiceType?: string;
  hasExistingUser?: boolean;
  initialStep?: CheckoutStep;
  /** Atualiza texto/estado do botão principal da coluna lateral (checkout-client). */
  onSidebarActionStateChange?: (state: CheckoutSidebarActionState) => void;
  /** Notifica o sidebar quando o método de pagamento muda ("pix", "new", ou ID do cartão salvo). */
  onPaymentMethodChange?: (method: string | null) => void;
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
      .refine((v) => v.replace(/\D/g, "").length === 8, "CEP inválido"),
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
>(({ invoiceId, invoiceType, hasExistingUser = false, initialStep, onSidebarActionStateChange, onPaymentMethodChange }, ref) => {
  const allowPix = invoiceType === "domain";
  const id = useId();
  const sidebarActionCbRef = useRef(onSidebarActionStateChange);
  sidebarActionCbRef.current = onSidebarActionStateChange;
  const paymentMethodCbRef = useRef(onPaymentMethodChange);
  paymentMethodCbRef.current = onPaymentMethodChange;
  const [paymentMethod, setPaymentMethod] = useState<"new" | "pix" | string | null>();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isPixLoading, setIsPixLoading] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [pixSession, setPixSession] = useState<{
    pix_qrcode: string;
    pix_content: string;
    paymentId: string;
    transactionId: string;
  } | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const pixCopiedResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(initialStep || "billing");
  const [savedBillingInfo, setSavedBillingInfo] = useState<any>(null);

  // Fetch saved billing info on mount
  useEffect(() => {
    const fetchBilling = async () => {
      const info = await getUserBillingInfo();
      if (info) {
        setSavedBillingInfo(info);
      } else if (currentStep === "payment") {
        setCurrentStep("billing");
      }
    };
    fetchBilling();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Always use the full schema for form management
  const methods = useForm<NewCardFormInputs>({
    resolver: zodResolver(newCardSchema),
    mode: "onChange",
    shouldUnregister: false,
  });

  const {
    getValues,
    handleSubmit,
    trigger,
    formState: { errors, touchedFields },
    control,
    setValue,
    watch,
    register,
  } = methods;

  const allValues = watch();

  // Watch billing fields to trigger re-renders for the sidebar button
  const watchedBillingFields = watch([
    "firstName",
    "lastName",
    "document",
    "phoneNumber",
    "address.zipCode",
    "address.street",
    "address.number",
    "address.neighborhood",
    "address.city",
    "address.state",
  ]);

  const handleAutoFill = useCallback(() => {
    if (!savedBillingInfo) return;

    const options = { shouldValidate: true, shouldDirty: true };

    setValue("firstName", savedBillingInfo.firstName, options);
    setValue("lastName", savedBillingInfo.lastName, options);
    setValue("document", savedBillingInfo.document, options);
    setValue("phoneNumber", savedBillingInfo.phoneNumber, options);
    setValue("address.zipCode", savedBillingInfo.address.zipCode, options);
    setValue("address.street", savedBillingInfo.address.street, options);
    setValue("address.number", savedBillingInfo.address.number, options);
    setValue("address.neighborhood", savedBillingInfo.address.neighborhood, options);
    setValue("address.city", savedBillingInfo.address.city, options);
    setValue("address.state", savedBillingInfo.address.state, options);

    toast.success("Dados preenchidos com as informações do seu perfil!");
  }, [savedBillingInfo, setValue]);

  // Auto-fill when starting directly at payment step (guest just submitted personal-data form)
  useEffect(() => {
    if (currentStep === "payment" && savedBillingInfo) {
      const options = { shouldValidate: true, shouldDirty: true };
      setValue("firstName", savedBillingInfo.firstName, options);
      setValue("lastName", savedBillingInfo.lastName, options);
      setValue("document", savedBillingInfo.document, options);
      setValue("phoneNumber", savedBillingInfo.phoneNumber, options);
      setValue("address.zipCode", savedBillingInfo.address.zipCode, options);
      setValue("address.street", savedBillingInfo.address.street, options);
      setValue("address.number", savedBillingInfo.address.number, options);
      setValue("address.neighborhood", savedBillingInfo.address.neighborhood, options);
      setValue("address.city", savedBillingInfo.address.city, options);
      setValue("address.state", savedBillingInfo.address.state, options);
    }
  // Only run when savedBillingInfo first loads while on payment step
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedBillingInfo]);

  // Load saved cards only
  useEffect(() => {
    const loadCards = async () => {
      if (!hasExistingUser) {
        setIsLoadingCards(false);
        setSavedCards([]);
        return;
      }

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
        // Save billing info for future use
        void saveUserBillingInfo({
          document: v.document,
          phoneNumber: v.phoneNumber,
          address: v.address,
        });
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Erro ao gerar PIX.");
    } finally {
      setIsPixLoading(false);
    }
  }, [invoiceId, getValues, trigger]);

  const router = useRouter();

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
              void saveUserBillingInfo(values);
              router.push(`/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`);
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
              router.push(`/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`);
            } else {
              toast.error(result.message);
            }
          } catch (error) {
            toast.error("Erro ao processar pagamento");
          }
        });
      }
    },
    [paymentMethod, savedCards, invoiceId, router]
  );

  const handleCheckPayment = useCallback(async () => {
    setIsVerifyingPayment(true);
    const result = await syncCheckoutPixPayment(invoiceId);
    if (result.status === "COMPLETED") {
      setIsPaymentConfirmed(true);
      router.push(`/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`);
    }
    // isVerifyingPayment stays true after click — polling will redirect when confirmed
  }, [invoiceId, router]);

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
            router.push(`/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`);
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

    const isTouched = Object.values(
      pick(billingFields, "firstName", "lastName", "document", "phoneNumber", "address")
    ).every((e) => {
      if (!isString(e)) {
        return e && Object.values(e).every((v) => !!v);
      }
      return !!e;
    });

    if (!isTouched) {
      return false;
    }

    const isValid = Object.values(
      pick(errors, "firstName", "lastName", "document", "phoneNumber", "address")
    ).every((e) => {
      if (!isString(e)) {
        return Object.values(e).some((v) => !v);
      }
      return !e;
    });

    return isValid;
  }

  const canProceedToPayment = isFirstStepValid();

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
              void handleCheckPayment();
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
            void handleCheckPayment();
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
      handleCheckPayment,
      invoiceId,
    ]
  );

  useEffect(() => {
    const notify = sidebarActionCbRef.current;
    if (!notify) return;

    let label = "Finalizar Transação";
    let disabled = false;
    let hidden = false;

    if (!hasExistingUser && currentStep === "billing") {
      label = "Continuar";
      disabled = !canProceedToPayment;
    } else if (paymentMethod === "pix") {
      if (isPixLoading) {
        label = "Gerando PIX...";
        disabled = true;
      } else if (pixSession) {
        // QR code visível: oculta o botão lateral, o usuário usa "Já paguei"
        hidden = true;
        disabled = true;
        label = "";
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

    notify({ label, disabled, hidden });
  }, [
    hasExistingUser,
    currentStep,
    paymentMethod,
    pixSession,
    isPixLoading,
    isVerifyingPayment,
    isPaymentConfirmed,
    isPending,
    canProceedToPayment,
    allowCardFinalize,
    watchedBillingFields,
  ]);

  useEffect(() => {
    paymentMethodCbRef.current?.(paymentMethod ?? null);
  }, [paymentMethod]);

  // Detecção do pagamento PIX: SSE primário (push em tempo real) + polling fallback
  useEffect(() => {
    if (!pixSession || isPixLoading) return;

    const paymentId = pixSession.paymentId;
    const simApi = (process.env.NEXT_PUBLIC_SIMPAY_API_URL ?? "https://simpay-back.simintermediacoes.com").replace(/\/+$/, "");
    let done = false;

    // Chamado quando SSE confirma o pagamento (sem nova chamada à API Simpay)
    const handleSseConfirmed = async () => {
      if (done) return;
      done = true;
      await markPixPaymentComplete(invoiceId);
      setIsPaymentConfirmed(true);
      router.push(`/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`);
    };

    // SSE primário: Simpay faz push instantâneo ao confirmar o pagamento
    let es: EventSource | null = new EventSource(`${simApi}/checkout/pix/${paymentId}/sse`);
    es.addEventListener("payment-status", (e) => {
      try {
        const d = JSON.parse((e as MessageEvent).data) as { status?: string };
        if (d.status === "COMPLETED") { es?.close(); void handleSseConfirmed(); }
      } catch { /* ignore */ }
    });
    es.addEventListener("heartbeat", () => { /* keepalive */ });
    es.onerror = () => { es?.close(); es = null; };

    // Fallback: polling via servidor a cada 1.5s (caso SSE não esteja disponível)
    const intervalId = setInterval(async () => {
      if (done) { clearInterval(intervalId); return; }
      const result = await syncCheckoutPixPayment(invoiceId);
      if (!done && result.status === "COMPLETED") {
        done = true;
        clearInterval(intervalId);
        es?.close();
        setIsPaymentConfirmed(true);
        router.push(`/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`);
      }
    }, 1500);

    const stopAt = setTimeout(() => {
      done = true;
      clearInterval(intervalId);
      es?.close();
    }, 15 * 60 * 1000);

    return () => {
      done = true;
      clearInterval(intervalId);
      clearTimeout(stopAt);
      es?.close();
    };
  }, [pixSession, isPixLoading, invoiceId, router]);

  // Render simplified version for existing users with domId
  if (hasExistingUser) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-xl">
                <Store className="text-sky-400" size={18} strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-white uppercase tracking-tight">Método de Pagamento</CardTitle>
                <CardDescription className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 opacity-80">
                  Escolha como deseja pagar
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="grid gap-3"
            >
              {allowPix && (
                <Label className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-5 shadow-xl transition-all hover:bg-white/10 has-[[data-state=checked]]:border-sky-500/50 has-[[data-state=checked]]:bg-sky-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/50">
                  <RadioGroupItem
                    value="pix"
                    className="sr-only"
                  />
                  <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-lg shadow-emerald-500/20">
                    <QrCode
                      size={20}
                      className="text-emerald-400"
                    />
                  </div>
                  <div>
                    <span className="font-black text-white uppercase tracking-tight text-sm">PIX</span>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      QR Code no app do banco
                    </div>
                  </div>
                </Label>
              )}

              {(isLoadingCards || savedCards.length > 0) && <Separator className="bg-white/10" />}

              {isLoadingCards ? (
                <Skeleton className="h-21 w-full" />
              ) : (
                savedCards.length > 0 &&
                savedCards.map((card) => (
                  <Label
                    key={card.id}
                    className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-5 shadow-xl transition-all hover:bg-white/10 has-[[data-state=checked]]:border-sky-500/50 has-[[data-state=checked]]:bg-sky-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/50"
                  >
                    <RadioGroupItem
                      value={card.id}
                      className="sr-only"
                    />
                    <div className="text-2xl opacity-80">
                      {getCardBrandIcon(card.brand)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white uppercase tracking-tight text-sm">
                          **** **** **** {card.last4}
                        </span>
                        {card.isDefault && (
                          <Badge variant="secondary" className="bg-sky-500/10 text-sky-400 border-sky-500/20 uppercase text-[9px] font-black">Padrão</Badge>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        {card.holderName} • {card.expiryMonth}/
                        {card.expiryYear}
                      </div>
                    </div>
                  </Label>
                ))
              )}

              {(isLoadingCards || savedCards.length > 0) && <Separator className="bg-white/10" />}

              <Label className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-5 shadow-xl transition-all hover:bg-white/10 has-[[data-state=checked]]:border-sky-500/50 has-[[data-state=checked]]:bg-sky-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/50">
                <RadioGroupItem
                  value="new"
                  className="sr-only"
                />
                <div className="flex size-10 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5">
                  <Plus size={20} className="text-sky-400" strokeWidth={3} />
                </div>
                <div>
                  <span className="font-black text-white uppercase tracking-tight text-sm">Novo cartão</span>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Digite os dados de um novo cartão
                  </div>
                </div>
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>

        {paymentMethod === "pix" && (
          pixSession ? (
            <PixQrCodeCard 
              pixSession={pixSession} 
              pixCopied={pixCopied} 
              copyPixToClipboard={copyPixToClipboard} 
              onBack={() => setPixSession(null)}
              onCheckPayment={() => void handleCheckPayment()}
              isPixLoading={isPixLoading}
              isVerifyingPayment={isVerifyingPayment}
              isPaymentConfirmed={isPaymentConfirmed}
            />
          ) : (
            <BillingInformationSection 
              methods={methods} 
              id={id} 
              savedInfo={savedBillingInfo} 
              onAutoFill={handleAutoFill} 
              hasExistingUser={hasExistingUser}
            />
          )
        )}

        <AnimatePresence>
          {paymentMethod === "new" && <NewCardFormSection {...methods} />}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Billing Information Step */}
      {currentStep === "billing" && (
        <>
          {paymentMethod === "pix" && pixSession ? (
            <PixQrCodeCard 
              pixSession={pixSession} 
              pixCopied={pixCopied} 
              copyPixToClipboard={copyPixToClipboard} 
              onBack={() => setPixSession(null)}
              onCheckPayment={() => void handleCheckPayment()}
              isPixLoading={isPixLoading}
              isVerifyingPayment={isVerifyingPayment}
              isPaymentConfirmed={isPaymentConfirmed}
            />
          ) : (
            <BillingInformationSection 
              methods={methods} 
              id={id} 
              savedInfo={savedBillingInfo} 
              onAutoFill={handleAutoFill} 
              hasExistingUser={hasExistingUser}
            />
          )}

          {/* Payment Card - Collapsed/Preview */}
          <Card className="opacity-50">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-xl">
                  <CreditCard
                    className="text-sky-400"
                    size={18}
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-white uppercase tracking-tight">Pagamento</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Continue Button */}
          <div className="flex justify-between items-center pt-8">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="text-slate-500 hover:text-white font-black uppercase text-xs tracking-widest transition-all"
            >
              <ArrowLeft size={16} className="mr-2" strokeWidth={3} />
              Voltar
            </Button>
            <Button
              onClick={handleContinueToPayment}
              disabled={!canProceedToPayment}
              className="min-w-44 h-12 bg-white text-slate-950 text-base font-bold hover:bg-white/90 border-0 shadow-lg transition-all hover:scale-[1.02] active:scale-95"
            >
              Continuar
              <Check className="ml-2 h-4 w-4" strokeWidth={3} />
            </Button>
          </div>
        </>
      )}

      {/* Payment Step */}
      {currentStep === "payment" && (
        <>
          {/* Billing Summary Card or PIX QR Code */}
          {paymentMethod === "pix" && pixSession ? (
            <PixQrCodeCard 
              pixSession={pixSession} 
              pixCopied={pixCopied} 
              copyPixToClipboard={copyPixToClipboard} 
              onBack={() => setPixSession(null)}
              onCheckPayment={() => void handleCheckPayment()}
              isPixLoading={isPixLoading}
              isVerifyingPayment={isVerifyingPayment}
              isPaymentConfirmed={isPaymentConfirmed}
            />
          ) : (
            <BillingSummaryCard
              values={allValues}
              onEdit={handleBackToBilling}
            />
          )}

          <Card className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-xl">
                <CreditCard
                  className="text-sky-400"
                  size={18}
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-white uppercase tracking-tight">Método de Pagamento</CardTitle>
                <CardDescription className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 opacity-80">
                  Escolha como deseja pagar
                </CardDescription>
              </div>
            </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid gap-3"
              >
                {allowPix && (
                  <Label className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-5 shadow-xl transition-all hover:bg-white/10 has-[[data-state=checked]]:border-sky-500/50 has-[[data-state=checked]]:bg-sky-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/50">
                    <RadioGroupItem
                      value="pix"
                      className="sr-only"
                    />
                    <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-lg shadow-emerald-500/20">
                      <QrCode
                        size={20}
                        className="text-emerald-400"
                      />
                    </div>
                    <div>
                      <span className="font-black text-white uppercase tracking-tight text-sm">PIX</span>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        QR Code no app do banco
                      </div>
                    </div>
                  </Label>
                )}

                {(isLoadingCards || savedCards.length > 0) && <Separator className="bg-white/10" />}

                {isLoadingCards ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    <Skeleton className="h-21 w-full" />
                  </div>
                ) : hasExistingUser && savedCards.length > 0 ? (
                  <>
                    {savedCards.map((card) => (
                      <Label
                        key={card.id}
                        className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-5 shadow-xl transition-all hover:bg-white/10 has-[[data-state=checked]]:border-sky-500/50 has-[[data-state=checked]]:bg-sky-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/50"
                      >
                        <RadioGroupItem
                          value={card.id}
                          className="sr-only"
                        />
                        <div className="text-2xl opacity-80">
                          {getCardBrandIcon(card.brand)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white uppercase tracking-tight text-sm">
                              **** **** **** {card.last4}
                            </span>
                            {card.isDefault && (
                              <Badge variant="secondary" className="bg-sky-500/10 text-sky-400 border-sky-500/20 uppercase text-[9px] font-black">Padrão</Badge>
                            )}
                          </div>
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            {card.holderName} • {card.expiryMonth}/
                            {card.expiryYear}
                          </div>
                        </div>
                      </Label>
                    ))}
                    <Separator className="bg-white/10" />
                  </>
                ) : null}

                <Label className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-5 shadow-xl transition-all hover:bg-white/10 has-[[data-state=checked]]:border-sky-500/50 has-[[data-state=checked]]:bg-sky-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/50">
                  <RadioGroupItem
                    value="new"
                    className="sr-only"
                  />
                  <div className="flex size-10 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5">
                    <Plus size={20} className="text-sky-400" strokeWidth={3} />
                  </div>
                  <div>
                    <span className="font-black text-white uppercase tracking-tight text-sm">Novo cartão</span>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      Digite os dados de um novo cartão
                    </div>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* New Card Form - Only show if "new" is selected */}
          {paymentMethod === "new" && <NewCardFormSection {...methods} />}

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
                      void handleInitiatePix();
                    } else {
                      handleSubmit(onSubmit)();
                    }
                  }}
                  disabled={
                    isPixLoading ||
                    isPending ||
                    (paymentMethod === "pix" && !canProceedToPayment) ||
                    (paymentMethod !== "pix" && !canCompleteCheckout())
                  }
                  className="min-w-56 h-12 bg-white text-slate-950 text-base font-bold hover:bg-white/90 border-0 shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                >
                  {isPixLoading
                    ? "Gerando PIX..."
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

function PixQrCodeCard({
  pixSession,
  pixCopied,
  copyPixToClipboard,
  onBack,
  onCheckPayment,
  isPixLoading,
  isVerifyingPayment,
  isPaymentConfirmed,
}: {
  pixSession: any;
  pixCopied: boolean;
  copyPixToClipboard: () => void;
  onBack: () => void;
  onCheckPayment: () => void;
  isPixLoading: boolean;
  isVerifyingPayment: boolean;
  isPaymentConfirmed: boolean;
}) {
  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl shadow-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-xl">
              <QrCode
                className="text-emerald-400"
                size={18}
                strokeWidth={2.5}
              />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-white uppercase tracking-tight">Pague com PIX</CardTitle>
              <CardDescription className="text-slate-400 font-medium">
                Escaneie o QR ou copie o código no app do banco
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {pixSession.pix_qrcode ? (
          <div className="relative mx-auto w-fit">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-emerald-500/0 blur-sm" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pixSession.pix_qrcode}
              alt="QR Code PIX"
              className="relative mx-auto max-w-[320px] rounded-lg border border-border bg-white p-2"
            />
          </div>
        ) : null}

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className={clsx(
              "w-full h-12 text-base font-medium overflow-hidden transition-all duration-300",
              pixCopied
                ? "border-emerald-500/45 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"
                : "hover:border-emerald-500/30 hover:bg-emerald-500/5"
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
                    <Check className="size-5 shrink-0" strokeWidth={3} />
                    Código Copiado!
                  </>
                ) : (
                  <>
                    <QrCode className="size-5 shrink-0" />
                    Copiar código PIX
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </Button>

          <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">
            Após o pagamento, a confirmação é automática e seu pedido
            será processado instantaneamente.
          </p>
        </div>

        <div className="pt-2">
          <Button
            className="w-full h-14 bg-sky-500 hover:bg-sky-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-sky-500/20"
            onClick={onCheckPayment}
            disabled={isPixLoading || isVerifyingPayment || isPaymentConfirmed}
          >
            {isPaymentConfirmed ? (
              <>
                <Check className="mr-2 h-5 w-5" strokeWidth={3} />
                Pagamento confirmado!
              </>
            ) : isVerifyingPayment ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verificando...
              </>
            ) : (
              "Já paguei"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BillingInformationSection({
  methods,
  id,
  savedInfo,
  onAutoFill,
  hasExistingUser,
}: {
  methods: UseFormReturn<NewCardFormInputs>;
  id: string;
  savedInfo?: any;
  onAutoFill?: () => void;
  hasExistingUser?: boolean;
}) {
  const {
    register,
    control,
    formState: { errors },
    setValue,
  } = methods;

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl shadow-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-xl">
            <User className="text-sky-400" size={18} strokeWidth={2.5} />
          </div>
          <div className="flex flex-1 items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-white uppercase tracking-tight">
                Informações de Cobrança
              </CardTitle>
            </div>
            {hasExistingUser && savedInfo && onAutoFill && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAutoFill}
                className="flex items-center gap-2 border-sky-500/30 bg-sky-500/5 text-sky-400 hover:bg-sky-500/10 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] px-4 h-9 shadow-lg shadow-sky-500/10 transition-all hover:scale-105 active:scale-95"
              >
                <UserCheck size={14} />
                Usar dados do perfil
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Personal Information */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${id}-firstName`} className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Nome
            </Label>
            <Input
              id={`${id}-firstName`}
              placeholder="Seu nome"
              autoComplete="given-name"
              {...register("firstName")}
              className={atlasInputClasses}
            />
            {errors.firstName && (
              <p className="text-xs text-red-400">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-lastName`} className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Sobrenome
            </Label>
            <Input
              id={`${id}-lastName`}
              placeholder="Seu sobrenome"
              autoComplete="family-name"
              {...register("lastName")}
              className={atlasInputClasses}
            />
            {errors.lastName && (
              <p className="text-xs text-red-400">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${id}-document`} className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
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
                  className={atlasInputClasses}
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
              className="text-[11px] font-black text-slate-400 uppercase tracking-wider"
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
                  className={atlasInputClasses}
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
            className="text-[11px] font-black text-slate-400 uppercase tracking-wider"
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
                className={atlasInputClasses}
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
                className="text-[11px] font-black text-slate-400 uppercase tracking-wider"
              >
                Rua
              </Label>
              <Input
                id={`${id}-address.street`}
                placeholder="Nome da rua"
                autoComplete="address-line1"
                {...register("address.street")}
                className={atlasInputClasses}
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
                className="text-[11px] font-black text-slate-400 uppercase tracking-wider"
              >
                Número
              </Label>
              <Input
                id={`${id}-address.number`}
                placeholder="123"
                autoComplete="address-line2"
                {...register("address.number")}
                className={atlasInputClasses}
              />
              {errors.address?.number && (
                <p className="text-xs text-red-400">
                  {errors.address.number.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor={`${id}-address.neighborhood`}
                className="text-[11px] font-black text-slate-400 uppercase tracking-wider"
              >
                Bairro
              </Label>
              <Input
                id={`${id}-address.neighborhood`}
                placeholder="Nome do bairro"
                {...register("address.neighborhood")}
                className={atlasInputClasses}
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
                className="text-[11px] font-black text-slate-400 uppercase tracking-wider"
              >
                Cidade
              </Label>
              <Input
                id={`${id}-address.city`}
                placeholder="Nome da cidade"
                autoComplete="address-level2"
                {...register("address.city")}
                className={atlasInputClasses}
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
                className="text-[11px] font-black text-slate-400 uppercase tracking-wider"
              >
                Estado
              </Label>
              <Input
                id={`${id}-address.state`}
                placeholder="SP"
                autoComplete="address-level1"
                maxLength={2}
                {...register("address.state")}
                className={atlasInputClasses}
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
    <Card className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl shadow-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-xl">
              <UserCheck
                className="text-emerald-400 h-5 w-5"
                strokeWidth={3}
              />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-white uppercase tracking-tight">
                Informações de Cobrança
              </CardTitle>
              <CardDescription className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 opacity-80">
                Dados confirmados
              </CardDescription>
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
              <div className="text-slate-400 font-medium">{values.document}</div>
            </div>
            <div>
              <span className="font-medium">Telefone</span>
              <div className="text-slate-400 font-medium">{values.phoneNumber}</div>
            </div>
          </div>
          <div>
            <span className="font-medium">Endereço</span>
            <div className="text-slate-400 font-medium">
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
      className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl shadow-2xl"
    >
      <CardHeader>
        <CardTitle className="text-xl font-black text-white uppercase tracking-tight">Dados do Cartão</CardTitle>
        <CardDescription className="text-slate-400 font-medium">
          Insira os dados do seu cartão de crédito
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="cardNumber" className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
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
                  className={atlasInputClasses}
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
            <Label htmlFor="cardCvv" className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
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
                  className={atlasInputClasses}
                  onAccept={(value) => field.onChange(value)}
                />
              )}
            />
            {errors.cardCvv && touchedFields.cardCvv && (
              <p className="text-xs text-red-400">{errors.cardCvv.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardExpiration" className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
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
                  className={clsx([atlasInputClasses, "text-center"])}
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
        <div className="mt-8 space-y-6">
          <h3 className="text-xs font-black text-sky-500 uppercase tracking-widest">
            Informações do Titular
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Nome do Titular
              </Label>
              <Input
                placeholder="Nome"
                autoComplete="given-name"
                {...register("firstName")}
                className={atlasInputClasses}
              />
              {errors.firstName && (
                <p className="text-xs text-red-400">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Sobrenome do Titular
              </Label>
              <Input
                placeholder="Sobrenome"
                autoComplete="family-name"
                {...register("lastName")}
                className={atlasInputClasses}
              />
              {errors.lastName && (
                <p className="text-xs text-red-400">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="document" className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
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
                  className={atlasInputClasses}
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
