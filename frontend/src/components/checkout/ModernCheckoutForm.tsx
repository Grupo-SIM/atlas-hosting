"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { isValidPhoneNumber } from "libphonenumber-js";
import { isString, pick } from "lodash";
import {
  AlertCircle,
  ArrowLeft,
  Barcode,
  Check,
  Clock,
  CreditCard,
  Loader2,
  Plus,
  QrCode,
  Store,
  User,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  useTransition,
} from "react";
import { Controller, type UseFormReturn, useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";
import { z } from "zod";
import {
  getUserBillingInfo,
  saveUserBillingInfo,
} from "@/app/(auth)/billing/actions";
import { getUserCardsForCheckout } from "@/app/(auth)/wallet/actions";
import {
  completeCheckout,
  completeCheckoutWithSavedCard,
  initiateCheckoutBoleto,
  initiateCheckoutPix,
  markPixPaymentComplete,
  syncCheckoutBoletoPayment,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { isValidCNPJ, isValidCPF } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

const atlasInputClasses =
  "flex h-12 w-full rounded-xl border border-border bg-muted/40 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all outline-none disabled:opacity-50";

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

export interface CheckoutSidebarActionState {
  label: string;
  disabled: boolean;
  hidden?: boolean;
}

interface InstallmentRate {
  n: number;
  domRate: number;
  masterRate: number;
  buyerRate: number;
  fixedFee: number;
}

interface ModernCheckoutFormProps {
  invoiceId: string;
  invoiceType?: string;
  /** Fatura VPS/VDS elegível pra PIX (24 meses por padrão, ou liberado pelo admin —
   * ver isPixEligibleForVpsConfig em actions.ts). Nome mantido por compatibilidade. */
  isAnnualVps?: boolean;
  /** Boleto liberado pra esta fatura — ver isBoletoEligibleForVpsConfig em actions.ts. */
  allowBoleto?: boolean;
  hasExistingUser?: boolean;
  isAuthenticated?: boolean;
  initialStep?: CheckoutStep;
  /** Atualiza texto/estado do botão principal da coluna lateral (checkout-client). */
  onSidebarActionStateChange?: (state: CheckoutSidebarActionState) => void;
  /** Notifica o sidebar quando o método de pagamento muda ("pix", "new", ou ID do cartão salvo). */
  onPaymentMethodChange?: (method: string | null) => void;
  selectedInstallments?: number;
  onInstallmentsChange?: (n: number) => void;
  installmentRates?: InstallmentRate[];
}

export interface ModernCheckoutFormHandle {
  submit: () => void;
}

type CheckoutStep = "billing" | "payment";

const billingAddressSchema = z.object({
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

const newCardSchema = billingAddressSchema.merge(
  z.object({
    cardCvv: z
      .string()
      .min(1, "CVV é obrigatório")
      .refine(v => /^\d{3,4}$/.test(v.replace(/\D/g, "")), "CVV inválido"),
    cardExpiration: z
      .string()
      .min(1, "Data de validade é obrigatória")
      .regex(/^[0-9]{2}\/[0-9]{2}$/, "Data inválida"),
    cardNumber: z
      .string()
      .min(1, "Número do cartão é obrigatório")
      .refine(
        v => /^\d{16}$/.test(v.replace(/\D/g, "")),
        "Número do cartão deve ter 16 dígitos"
      ),
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
>(
  (
    {
      invoiceId,
      invoiceType,
      isAnnualVps = false,
      allowBoleto = false,
      hasExistingUser = false,
      isAuthenticated = false,
      initialStep,
      onSidebarActionStateChange,
      onPaymentMethodChange,
      selectedInstallments = 1,
      onInstallmentsChange,
      installmentRates,
    },
    ref
  ) => {
    const allowPix = invoiceType === "domain" || isAnnualVps;
    const id = useId();
    const sidebarActionCbRef = useRef(onSidebarActionStateChange);
    sidebarActionCbRef.current = onSidebarActionStateChange;
    const paymentMethodCbRef = useRef(onPaymentMethodChange);
    paymentMethodCbRef.current = onPaymentMethodChange;
    const [paymentMethod, setPaymentMethod] = useState<
      "new" | "pix" | string | null
    >();
    const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
    const [isLoadingCards, setIsLoadingCards] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [isPixLoading, setIsPixLoading] = useState(false);
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
    const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
    const [pixSession, setPixSession] = useState<{
      expiresAt: number;
      pix_qrcode: string;
      pix_content: string;
      paymentId: string;
      transactionId: string;
    } | null>(null);
    const [pixCopied, setPixCopied] = useState(false);
    const [isBoletoLoading, setIsBoletoLoading] = useState(false);
    const [boletoSession, setBoletoSession] = useState<{
      boletoUrl: string;
      boletoDigitableLine: string;
      transactionId: string;
    } | null>(null);
    const [boletoCopied, setBoletoCopied] = useState(false);
    /** Mensagem amigável exibida em modal quando o pagamento falha ou é recusado. */
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const pixCopiedResetRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );
    const boletoCopiedResetRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );
    const [currentStep, setCurrentStep] = useState<CheckoutStep>(
      initialStep || "billing"
    );
    const [savedBillingInfo, setSavedBillingInfo] = useState<Awaited<ReturnType<typeof getUserBillingInfo>>>(null);
    const [isLoadingBilling, setIsLoadingBilling] = useState(true);

    // Always use the full schema for form management
    const methods = useForm<NewCardFormInputs>({
      mode: "onChange",
      resolver: zodResolver(newCardSchema),
      shouldUnregister: false,
    });

    const {
      getValues,
      handleSubmit,
      reset,
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

      const options = { shouldDirty: true, shouldValidate: true };

      setValue("firstName", savedBillingInfo.firstName, options);
      setValue("lastName", savedBillingInfo.lastName, options);
      setValue("document", savedBillingInfo.document, options);
      setValue("phoneNumber", savedBillingInfo.phoneNumber, options);
      setValue("address.zipCode", savedBillingInfo.address.zipCode, options);
      setValue("address.street", savedBillingInfo.address.street, options);
      setValue("address.number", savedBillingInfo.address.number, options);
      setValue(
        "address.neighborhood",
        savedBillingInfo.address.neighborhood,
        options
      );
      setValue("address.city", savedBillingInfo.address.city, options);
      setValue("address.state", savedBillingInfo.address.state, options);

      toast.success("Dados preenchidos com as informações do seu perfil!");
    }, [savedBillingInfo, setValue]);

    // Hydrate before showing the form, so saved data never overwrites typing.
    useEffect(() => {
      let active = true;
      const loadBilling = async () => {
        try {
          const info = await getUserBillingInfo();
          if (!active) return;
          setSavedBillingInfo(info);
          if (info) {
            reset({ ...getValues(), ...info });
          }
          setCurrentStep(billingAddressSchema.safeParse(info).success ? "payment" : "billing");
        } catch {
          if (active) {
            setCurrentStep("billing");
            toast.error("Não foi possível carregar seus dados de cobrança. Preencha os dados para continuar.");
          }
        } finally {
          if (active) setIsLoadingBilling(false);
        }
      };
      void loadBilling();
      return () => { active = false; };
    }, [getValues, reset]);

    // Load saved cards only
    useEffect(() => {
      const loadCards = async () => {
        if (!isAuthenticated) {
          setIsLoadingCards(false);
          setSavedCards([]);
          return;
        }

        setIsLoadingCards(true);

        try {
          const cards = await getUserCardsForCheckout();
          setSavedCards(cards);

          // Set default card as selected if available
          const defaultCard = cards.find(card => card.isDefault) ?? cards[0];
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
    }, [isAuthenticated]);

    useEffect(() => {
      if (paymentMethod !== "pix") {
        setPixSession(null);
      }
      if (paymentMethod !== "boleto") {
        setBoletoSession(null);
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
          if (pixCopiedResetRef.current)
            clearTimeout(pixCopiedResetRef.current);
          setPixCopied(true);
          pixCopiedResetRef.current = setTimeout(() => {
            setPixCopied(false);
            pixCopiedResetRef.current = null;
          }, 2200);
        })
        .catch(() => toast.error("Não foi possível copiar."));
    }, [pixSession]);

    useEffect(() => {
      setBoletoCopied(false);
      if (boletoCopiedResetRef.current) {
        clearTimeout(boletoCopiedResetRef.current);
        boletoCopiedResetRef.current = null;
      }
    }, [boletoSession?.boletoDigitableLine]);

    useEffect(
      () => () => {
        if (boletoCopiedResetRef.current)
          clearTimeout(boletoCopiedResetRef.current);
      },
      []
    );

    const copyBoletoToClipboard = useCallback(() => {
      if (!boletoSession) return;
      void navigator.clipboard
        .writeText(boletoSession.boletoDigitableLine)
        .then(() => {
          if (boletoCopiedResetRef.current)
            clearTimeout(boletoCopiedResetRef.current);
          setBoletoCopied(true);
          boletoCopiedResetRef.current = setTimeout(() => {
            setBoletoCopied(false);
            boletoCopiedResetRef.current = null;
          }, 2200);
        })
        .catch(() => toast.error("Não foi possível copiar."));
    }, [boletoSession]);

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
          address: v.address,
          document: v.document,
          firstName: v.firstName,
          invoiceId,
          lastName: v.lastName,
          phoneNumber: v.phoneNumber,
        });
        if (res.status === "success") {
          setPixSession({
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            paymentId: res.paymentId,
            pix_content: res.pix_content,
            pix_qrcode: res.pix_qrcode,
            transactionId: res.transactionId,
          });
          toast.success("PIX gerado. Escaneie ou copie o código.");
          // Save billing info for future use
          void saveUserBillingInfo({
            address: v.address,
            document: v.document,
            phoneNumber: v.phoneNumber,
          });
        } else {
          setPaymentError(res.message);
        }
      } catch {
        setPaymentError(
          "Não foi possível gerar o PIX no momento. Tente novamente em instantes."
        );
      } finally {
        setIsPixLoading(false);
      }
    }, [invoiceId, getValues, trigger]);

    const handleInitiateBoleto = useCallback(async () => {
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
      setIsBoletoLoading(true);
      try {
        const res = await initiateCheckoutBoleto({
          address: v.address,
          document: v.document,
          firstName: v.firstName,
          invoiceId,
          lastName: v.lastName,
          phoneNumber: v.phoneNumber,
        });
        if (res.status === "success") {
          setBoletoSession({
            boletoDigitableLine: res.boletoDigitableLine,
            boletoUrl: res.boletoUrl,
            transactionId: res.transactionId,
          });
          toast.success("Boleto gerado.");
          void saveUserBillingInfo({
            address: v.address,
            document: v.document,
            phoneNumber: v.phoneNumber,
          });
        } else {
          setPaymentError(res.message);
        }
      } catch {
        setPaymentError(
          "Não foi possível gerar o boleto no momento. Tente novamente em instantes."
        );
      } finally {
        setIsBoletoLoading(false);
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
                installments: selectedInstallments,
                invoiceId,
              });

              if (result.status === "success") {
                toast.success(result.message);
                void saveUserBillingInfo(values);
                router.push(
                  `/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`
                );
              } else {
                setPaymentError(result.message);
              }
            } catch (error) {
              setPaymentError(
                "Não foi possível processar o pagamento. Nenhuma cobrança foi confirmada. Tente novamente em instantes."
              );
            }
          });
        } else {
          // Saved card payment
          const selectedCard = savedCards.find(
            card => card.id === paymentMethod
          );
          if (!selectedCard) {
            toast.error("Cartão selecionado não encontrado");
            return;
          }

          startTransition(async () => {
            try {
              const result = await completeCheckoutWithSavedCard(null, {
                ...values,
                card: selectedCard,
                installments: selectedInstallments,
                invoiceId,
              });

              if (result.status === "success") {
                toast.success(result.message);
                router.push(
                  `/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`
                );
              } else {
                setPaymentError(result.message);
              }
            } catch (error) {
              setPaymentError(
                "Não foi possível processar o pagamento. Nenhuma cobrança foi confirmada. Tente novamente em instantes."
              );
            }
          });
        }
      },
      [paymentMethod, savedCards, invoiceId, router]
    );

    const submitCardPayment = useCallback(() => {
      if (paymentMethod === "new") {
        void handleSubmit(onSubmit)();
      } else if (billingAddressSchema.safeParse(getValues()).success) {
        onSubmit(getValues());
      }
    }, [paymentMethod, handleSubmit, onSubmit, getValues]);

    const handleCheckPayment = useCallback(async () => {
      setIsVerifyingPayment(true);
      try {
        const result = await syncCheckoutPixPayment(invoiceId);
        if (result.status === "COMPLETED") {
          setIsPaymentConfirmed(true);
          router.push(
            `/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`
          );
          return;
        }
        toast.info(
          "O gateway ainda não confirmou o pagamento. Continuaremos verificando automaticamente."
        );
      } catch {
        toast.error(
          "Não foi possível consultar o pagamento agora. Tente novamente em instantes."
        );
      } finally {
        setIsVerifyingPayment(false);
      }
    }, [invoiceId, router]);

    const handleCheckBoletoPayment = useCallback(async () => {
      setIsVerifyingPayment(true);
      try {
        const result = await syncCheckoutBoletoPayment(invoiceId);
        if (result.status === "COMPLETED") {
          setIsPaymentConfirmed(true);
          router.push(
            `/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`
          );
          return;
        }
        toast.info(
          "O gateway ainda não confirmou o pagamento. Continuaremos verificando automaticamente."
        );
      } catch {
        toast.error(
          "Não foi possível consultar o pagamento agora. Tente novamente em instantes."
        );
      } finally {
        setIsVerifyingPayment(false);
      }
    }, [invoiceId, router]);

    // Simplified submit for existing users (only payment method)
    const onSimpleSubmit = useCallback(() => {
      if (paymentMethod === "new") {
        // For new card with existing user, we need card data and billing data
        const values = getValues();
        const {
          cardNumber,
          cardExpiration,
          cardCvv,
          firstName,
          lastName,
          document,
        } = values;

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
              address: {
                city: "",
                neighborhood: "",
                number: "",
                state: "",
                street: "",
                zipCode: "",
              },
              cardCvv,
              cardExpiration,
              cardNumber,
              document: document.replace(/\D/g, ""),
              firstName: firstName.trim(),
              installments: selectedInstallments,
              invoiceId,
              lastName: lastName.trim(),
              phoneNumber: "", // Will be populated from existing user data on server
            });

            if (result.status === "success") {
              router.push(
                `/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`
              );
            } else {
              setPaymentError(result.message);
            }
          } catch (error) {
            setPaymentError(
              "Não foi possível processar o pagamento. Nenhuma cobrança foi confirmada. Tente novamente em instantes."
            );
          }
        });
        return;
      }

      const selectedCard = savedCards.find(card => card.id === paymentMethod);
      if (!selectedCard) {
        toast.error("Cartão selecionado não encontrado");
        return;
      }

      startTransition(async () => {
        try {
          const result = await completeCheckoutWithSavedCard(null, {
            address: {
              city: "",
              neighborhood: "",
              number: "",
              state: "",
              street: "",
              zipCode: "",
            },
            card: selectedCard,
            document: "",
            firstName: "", // Will be populated from existing user data on server
            installments: selectedInstallments,
            invoiceId,
            lastName: "",
            phoneNumber: "",
          });

          if (result.status === "success") {
            toast.success(result.message);
          } else {
            setPaymentError(result.message);
          }
        } catch (error) {
          setPaymentError(
            "Não foi possível processar o pagamento. Nenhuma cobrança foi confirmada. Tente novamente em instantes."
          );
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
      if (paymentMethod === "pix" || paymentMethod === "boleto") {
        return true;
      }
      if (paymentMethod === "new") {
        const values = getValues();
        return values.cardNumber && values.cardCvv && values.cardExpiration;
      }
      return (
        !!paymentMethod &&
        paymentMethod !== "new" &&
        paymentMethod !== "pix" &&
        paymentMethod !== "boleto"
      );
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
        pick(
          billingFields,
          "firstName",
          "lastName",
          "document",
          "phoneNumber",
          "address"
        )
      ).every(e => {
        if (!isString(e)) {
          return e && Object.values(e).every(v => !!v);
        }
        return !!e;
      });

      if (!isTouched) {
        return false;
      }

      const isValid = Object.values(
        pick(
          errors,
          "firstName",
          "lastName",
          "document",
          "phoneNumber",
          "address"
        )
      ).every(e => {
        if (!isString(e)) {
          return Object.values(e).some(v => !v);
        }
        return !e;
      });

      return isValid;
    }

    const canProceedToPayment = isFirstStepValid();

    const canCompleteCheckout = () => {
      if (paymentMethod === "pix" || paymentMethod === "boleto") {
        return canProceedToPayment;
      }
      return canProceedToPayment && isPaymentComplete();
    };

    const allowCardFinalize = canCompleteCheckout();

    const handleContinueToPayment = () => {
      if (canProceedToPayment) {
        startTransition(async () => {
          if (isAuthenticated) {
            const result = await saveUserBillingInfo(getValues());
            if (result.status === "error") toast.error(result.message);
          }
          setCurrentStep("payment");
        });
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
            if (paymentMethod === "boleto") {
              if (!boletoSession) {
                void handleInitiateBoleto();
              } else {
                void handleCheckBoletoPayment();
              }
              return;
            }
            onSimpleSubmit();
            return;
          }
          if (currentStep === "billing") {
            handleContinueToPayment();
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
          if (paymentMethod === "boleto") {
            if (!boletoSession) {
              void handleInitiateBoleto();
            } else {
              void handleCheckBoletoPayment();
            }
            return;
          }
          submitCardPayment();
        },
      }),
      [
        hasExistingUser,
        isAuthenticated,
        submitCardPayment,
        currentStep,
        canProceedToPayment,
        paymentMethod,
        pixSession,
        boletoSession,
        handleSubmit,
        onSubmit,
        onSimpleSubmit,
        handleInitiatePix,
        handleCheckPayment,
        handleInitiateBoleto,
        handleCheckBoletoPayment,
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
      } else if (paymentMethod === "boleto") {
        if (isBoletoLoading) {
          label = "Gerando Boleto...";
          disabled = true;
        } else if (boletoSession) {
          // Boleto visível: oculta o botão lateral, o usuário usa "Já paguei"
          hidden = true;
          disabled = true;
          label = "";
        } else {
          label = "Gerar Boleto";
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

      if (isLoadingBilling || isLoadingCards || isPending) disabled = true;
      notify({ disabled, hidden, label });
    }, [
      hasExistingUser,
      isLoadingBilling,
      isLoadingCards,
      currentStep,
      paymentMethod,
      pixSession,
      isPixLoading,
      boletoSession,
      isBoletoLoading,
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
      const simApi = (
        process.env.NEXT_PUBLIC_SIMPAY_API_URL ??
        "https://simpay-back.simintermediacoes.com"
      ).replace(/\/+$/, "");
      let done = false;

      // Chamado quando SSE indica pagamento. O servidor re-verifica na Simpay
      // e só marca como pago se o gateway confirmar de fato.
      const handleSseConfirmed = async () => {
        if (done) return;
        try {
          const { confirmed } = await markPixPaymentComplete(invoiceId);
          // Não confirmado pelo gateway: mantém o polling de fallback ativo.
          if (!confirmed || done) return;
          done = true;
          setIsPaymentConfirmed(true);
          router.push(
            `/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`
          );
        } catch (error) {
          console.error("[CHECKOUT-PIX] Falha após confirmação SSE:", error);
        }
      };

      // SSE primário: Simpay faz push instantâneo ao confirmar o pagamento
      let es: EventSource | null = new EventSource(
        `${simApi}/checkout/pix/${paymentId}/sse`
      );
      es.addEventListener("payment-status", e => {
        try {
          const d = JSON.parse((e as MessageEvent).data) as { status?: string };
          if (d.status === "COMPLETED") {
            es?.close();
            void handleSseConfirmed();
          }
        } catch {
          /* ignore */
        }
      });
      es.addEventListener("heartbeat", () => {
        /* keepalive */
      });
      es.onerror = () => {
        es?.close();
        es = null;
      };

      // Fallback: polling via servidor a cada 1.5s (caso SSE não esteja disponível)
      const intervalId = setInterval(async () => {
        if (done) {
          clearInterval(intervalId);
          return;
        }
        try {
          const result = await syncCheckoutPixPayment(invoiceId);
          if (!done && result.status === "COMPLETED") {
            done = true;
            clearInterval(intervalId);
            es?.close();
            setIsPaymentConfirmed(true);
            router.push(
              `/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`
            );
          }
        } catch (error) {
          console.error("[CHECKOUT-PIX] Falha no polling:", error);
        }
      }, 1500);

      const stopAt = setTimeout(
        () => {
          done = true;
          clearInterval(intervalId);
          es?.close();
          setIsVerifyingPayment(false);
        },
        // SimIntPay solicita 24 horas de validade para cobranças PIX Atlas.
        Math.max(0, pixSession.expiresAt - Date.now())
      );

      return () => {
        done = true;
        clearInterval(intervalId);
        clearTimeout(stopAt);
        es?.close();
      };
    }, [pixSession, isPixLoading, invoiceId, router]);

    // Detecção do pagamento do boleto: só polling (confirmação assíncrona, pode levar dias —
    // o webhook do DOM Pagamentos é a fonte de verdade fora desta sessão de checkout).
    useEffect(() => {
      if (!boletoSession || isBoletoLoading) return;

      let done = false;
      const intervalId = setInterval(async () => {
        if (done) {
          clearInterval(intervalId);
          return;
        }
        try {
          const result = await syncCheckoutBoletoPayment(invoiceId);
          if (!done && result.status === "COMPLETED") {
            done = true;
            clearInterval(intervalId);
            setIsPaymentConfirmed(true);
            router.push(
              `/payment/success?invoiceId=${encodeURIComponent(invoiceId)}`
            );
          }
        } catch (error) {
          console.error("[CHECKOUT-BOLETO] Falha no polling:", error);
        }
      }, 5000);

      const stopAt = setTimeout(
        () => {
          done = true;
          clearInterval(intervalId);
          setIsVerifyingPayment(false);
        },
        15 * 60 * 1000
      );

      return () => {
        done = true;
        clearInterval(intervalId);
        clearTimeout(stopAt);
      };
    }, [boletoSession, isBoletoLoading, invoiceId, router]);

    // Modal amigável de falha de pagamento (sem detalhes técnicos/sensíveis).
    const paymentErrorModal = (
      <Dialog
        onOpenChange={open => {
          if (!open) setPaymentError(null);
        }}
        open={!!paymentError}
      >
        <DialogContent className="border-border bg-background text-foreground sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle className="text-red-400" size={24} strokeWidth={2} />
            </div>
            <DialogTitle className="text-center">
              Pagamento não concluído
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {paymentError}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              className="w-full sm:w-auto"
              onClick={() => setPaymentError(null)}
              type="button"
            >
              Entendi, tentar novamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    // Render simplified version for existing users with domId
    if (isLoadingBilling || isLoadingCards) {
      return (
        <div aria-busy="true" aria-label="Carregando dados de cobrança e cartões" className="space-y-4">
          <Skeleton className="h-52 w-full rounded-3xl" />
          <Skeleton className="h-72 w-full rounded-3xl" />
        </div>
      );
    }

    if (hasExistingUser) {
      return (
        <div className="space-y-6">
          {paymentErrorModal}
          <Card className="overflow-hidden rounded-3xl border-border bg-muted/40 shadow-2xl backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 shadow-xl">
                  <Store className="text-sky-400" size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <CardTitle className="font-black text-foreground text-xl uppercase tracking-tight">
                    Método de Pagamento
                  </CardTitle>
                  <CardDescription className="mt-0.5 font-bold text-[11px] text-muted-foreground uppercase tracking-widest opacity-80">
                    Escolha como deseja pagar
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                className="grid gap-3"
                onValueChange={setPaymentMethod}
                value={paymentMethod}
              >
                {allowPix && (
                  <Label className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-muted/40 p-5 shadow-xl transition-all hover:bg-muted/60 has-[[data-state=checked]]:border-sky-500/50 has-[[data-state=checked]]:bg-sky-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/50">
                    <RadioGroupItem className="sr-only" value="pix" />
                    <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-emerald-500/20 shadow-lg">
                      <QrCode className="text-emerald-400" size={20} />
                    </div>
                    <div>
                      <span className="font-black text-foreground text-sm uppercase tracking-tight">
                        PIX
                      </span>
                      <div className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                        QR Code no app do banco
                      </div>
                    </div>
                  </Label>
                )}

                {allowBoleto && (
                  <Label className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-muted/40 p-5 shadow-xl transition-all hover:bg-muted/60 has-[[data-state=checked]]:border-sky-500/50 has-[[data-state=checked]]:bg-sky-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/50">
                    <RadioGroupItem className="sr-only" value="boleto" />
                    <div className="flex size-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 shadow-amber-500/20 shadow-lg">
                      <Barcode className="text-amber-400" size={20} />
                    </div>
                    <div>
                      <span className="font-black text-foreground text-sm uppercase tracking-tight">
                        Boleto
                      </span>
                      <div className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                        Vencimento em 3 dias úteis
                      </div>
                    </div>
                  </Label>
                )}

                {(isLoadingCards || savedCards.length > 0) && (
                  <Separator className="bg-muted/60" />
                )}

                {isLoadingCards ? (
                  <Skeleton className="h-21 w-full" />
                ) : (
                  savedCards.length > 0 &&
                  savedCards.map(card => (
                    <Label
                      className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-muted/40 p-5 shadow-xl transition-all hover:bg-muted/60 has-[[data-state=checked]]:border-sky-500/50 has-[[data-state=checked]]:bg-sky-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/50"
                      key={card.id}
                    >
                      <RadioGroupItem className="sr-only" value={card.id} />
                      <div className="text-2xl opacity-80">
                        {getCardBrandIcon(card.brand)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-foreground text-sm uppercase tracking-tight">
                            **** **** **** {card.last4}
                          </span>
                          {card.isDefault && (
                            <Badge
                              className="border-sky-500/20 bg-sky-500/10 font-black text-[9px] text-sky-400 uppercase"
                              variant="secondary"
                            >
                              Padrão
                            </Badge>
                          )}
                        </div>
                        <div className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                          {card.holderName} • {card.expiryMonth}/
                          {card.expiryYear}
                        </div>
                      </div>
                    </Label>
                  ))
                )}

                {(isLoadingCards || savedCards.length > 0) && (
                  <Separator className="bg-muted/60" />
                )}

                <Label className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-muted/40 p-5 shadow-xl transition-all hover:bg-muted/60 has-[[data-state=checked]]:border-sky-500/50 has-[[data-state=checked]]:bg-sky-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/50">
                  <RadioGroupItem className="sr-only" value="new" />
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border border-dashed bg-muted/40">
                    <Plus className="text-sky-400" size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <span className="font-black text-foreground text-sm uppercase tracking-tight">
                      Novo cartão
                    </span>
                    <div className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                      Digite os dados de um novo cartão
                    </div>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>

          {paymentMethod === "pix" &&
            (pixSession ? (
              <PixQrCodeCard
                copyPixToClipboard={copyPixToClipboard}
                isPaymentConfirmed={isPaymentConfirmed}
                isPixLoading={isPixLoading}
                isVerifyingPayment={isVerifyingPayment}
                onBack={() => setPixSession(null)}
                onCheckPayment={() => void handleCheckPayment()}
                pixCopied={pixCopied}
                pixSession={pixSession}
              />
            ) : (
              <BillingInformationSection
                hasExistingUser={hasExistingUser}
                id={id}
                methods={methods}
                onAutoFill={handleAutoFill}
                savedInfo={savedBillingInfo}
              />
            ))}

          {paymentMethod === "boleto" &&
            (boletoSession ? (
              <BoletoCard
                boletoCopied={boletoCopied}
                boletoSession={boletoSession}
                copyBoletoToClipboard={copyBoletoToClipboard}
                isBoletoLoading={isBoletoLoading}
                isPaymentConfirmed={isPaymentConfirmed}
                isVerifyingPayment={isVerifyingPayment}
                onBack={() => setBoletoSession(null)}
                onCheckPayment={() => void handleCheckBoletoPayment()}
              />
            ) : (
              <BillingInformationSection
                hasExistingUser={hasExistingUser}
                id={id}
                methods={methods}
                onAutoFill={handleAutoFill}
                savedInfo={savedBillingInfo}
              />
            ))}

          <AnimatePresence>
            {paymentMethod === "new" && <NewCardFormSection {...methods} />}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {paymentErrorModal}
        {/* Billing Information Step */}
        {currentStep === "billing" && (
          <>
            {paymentMethod === "pix" && pixSession ? (
              <PixQrCodeCard
                copyPixToClipboard={copyPixToClipboard}
                isPaymentConfirmed={isPaymentConfirmed}
                isPixLoading={isPixLoading}
                isVerifyingPayment={isVerifyingPayment}
                onBack={() => setPixSession(null)}
                onCheckPayment={() => void handleCheckPayment()}
                pixCopied={pixCopied}
                pixSession={pixSession}
              />
            ) : paymentMethod === "boleto" && boletoSession ? (
              <BoletoCard
                boletoCopied={boletoCopied}
                boletoSession={boletoSession}
                copyBoletoToClipboard={copyBoletoToClipboard}
                isBoletoLoading={isBoletoLoading}
                isPaymentConfirmed={isPaymentConfirmed}
                isVerifyingPayment={isVerifyingPayment}
                onBack={() => setBoletoSession(null)}
                onCheckPayment={() => void handleCheckBoletoPayment()}
              />
            ) : (
              <BillingInformationSection
                hasExistingUser={hasExistingUser}
                id={id}
                methods={methods}
                onAutoFill={handleAutoFill}
                savedInfo={savedBillingInfo}
              />
            )}

            {/* Payment Card - Collapsed/Preview */}
            <Card className="overflow-hidden rounded-3xl border-border bg-muted/40 opacity-50 shadow-2xl backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 shadow-xl">
                    <CreditCard
                      className="text-sky-400"
                      size={18}
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <CardTitle className="font-black text-foreground text-xl uppercase tracking-tight">
                      Pagamento
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Continue Button */}
            <div className="flex items-center justify-between pt-8">
              <Button
                className="font-black text-muted-foreground text-xs uppercase tracking-widest transition-all hover:text-foreground"
                onClick={() => router.back()}
                type="button"
                variant="ghost"
              >
                <ArrowLeft className="mr-2" size={16} strokeWidth={3} />
                Voltar
              </Button>
              <Button
                className="h-12 min-w-44 border-0 bg-primary font-bold text-base text-primary-foreground shadow-lg transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-95"
                disabled={!canProceedToPayment}
                onClick={handleContinueToPayment}
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
                copyPixToClipboard={copyPixToClipboard}
                isPaymentConfirmed={isPaymentConfirmed}
                isPixLoading={isPixLoading}
                isVerifyingPayment={isVerifyingPayment}
                onBack={() => setPixSession(null)}
                onCheckPayment={() => void handleCheckPayment()}
                pixCopied={pixCopied}
                pixSession={pixSession}
              />
            ) : paymentMethod === "boleto" && boletoSession ? (
              <BoletoCard
                boletoCopied={boletoCopied}
                boletoSession={boletoSession}
                copyBoletoToClipboard={copyBoletoToClipboard}
                isBoletoLoading={isBoletoLoading}
                isPaymentConfirmed={isPaymentConfirmed}
                isVerifyingPayment={isVerifyingPayment}
                onBack={() => setBoletoSession(null)}
                onCheckPayment={() => void handleCheckBoletoPayment()}
              />
            ) : (
              <BillingSummaryCard
                onEdit={handleBackToBilling}
                values={allValues}
              />
            )}

            <Card className="overflow-hidden rounded-3xl border-border bg-muted/40 shadow-2xl backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 shadow-xl">
                    <CreditCard
                      className="text-sky-400"
                      size={18}
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <CardTitle className="font-black text-foreground text-xl uppercase tracking-tight">
                      Método de Pagamento
                    </CardTitle>
                    <CardDescription className="mt-0.5 font-bold text-[11px] text-muted-foreground uppercase tracking-widest opacity-80">
                      Escolha como deseja pagar
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  className="grid gap-3"
                  onValueChange={setPaymentMethod}
                  value={paymentMethod}
                >
                  {allowPix && (
                    <Label className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-muted/40 p-5 shadow-xl transition-all hover:bg-muted/60 has-[[data-state=checked]]:border-sky-500/50 has-[[data-state=checked]]:bg-sky-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/50">
                      <RadioGroupItem className="sr-only" value="pix" />
                      <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-emerald-500/20 shadow-lg">
                        <QrCode className="text-emerald-400" size={20} />
                      </div>
                      <div>
                        <span className="font-black text-foreground text-sm uppercase tracking-tight">
                          PIX
                        </span>
                        <div className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                          QR Code no app do banco
                        </div>
                      </div>
                    </Label>
                  )}

                  {allowBoleto && (
                    <Label className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-muted/40 p-5 shadow-xl transition-all hover:bg-muted/60 has-[[data-state=checked]]:border-sky-500/50 has-[[data-state=checked]]:bg-sky-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/50">
                      <RadioGroupItem className="sr-only" value="boleto" />
                      <div className="flex size-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 shadow-amber-500/20 shadow-lg">
                        <Barcode className="text-amber-400" size={20} />
                      </div>
                      <div>
                        <span className="font-black text-foreground text-sm uppercase tracking-tight">
                          Boleto
                        </span>
                        <div className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                          Vencimento em 3 dias úteis
                        </div>
                      </div>
                    </Label>
                  )}

                  {(isLoadingCards || savedCards.length > 0) && (
                    <Separator className="bg-muted/60" />
                  )}

                  {isLoadingCards ? (
                    <div className="py-4 text-center text-muted-foreground text-sm">
                      <Skeleton className="h-21 w-full" />
                    </div>
                  ) : savedCards.length > 0 ? (
                    <>
                      {savedCards.map(card => (
                        <Label
                          className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-muted/40 p-5 shadow-xl transition-all hover:bg-muted/60 has-[[data-state=checked]]:border-sky-500/50 has-[[data-state=checked]]:bg-sky-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/50"
                          key={card.id}
                        >
                          <RadioGroupItem className="sr-only" value={card.id} />
                          <div className="text-2xl opacity-80">
                            {getCardBrandIcon(card.brand)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-foreground text-sm uppercase tracking-tight">
                                **** **** **** {card.last4}
                              </span>
                              {card.isDefault && (
                                <Badge
                                  className="border-sky-500/20 bg-sky-500/10 font-black text-[9px] text-sky-400 uppercase"
                                  variant="secondary"
                                >
                                  Padrão
                                </Badge>
                              )}
                            </div>
                            <div className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
                              {card.holderName} • {card.expiryMonth}/
                              {card.expiryYear}
                            </div>
                          </div>
                        </Label>
                      ))}
                      <Separator className="bg-muted/60" />
                    </>
                  ) : null}

                  <Label className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-muted/40 p-5 shadow-xl transition-all hover:bg-muted/60 has-[[data-state=checked]]:border-sky-500/50 has-[[data-state=checked]]:bg-sky-500/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/50">
                    <RadioGroupItem className="sr-only" value="new" />
                    <div className="flex size-10 items-center justify-center rounded-xl border border-border border-dashed bg-muted/40">
                      <Plus
                        className="text-sky-400"
                        size={20}
                        strokeWidth={3}
                      />
                    </div>
                    <div>
                      <span className="font-black text-foreground text-sm uppercase tracking-tight">
                        Novo cartão
                      </span>
                      <div className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
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
                className="flex items-center gap-2"
                onClick={handleBackToBilling}
                variant="outline"
              >
                <ArrowLeft size={16} />
                Voltar
              </Button>

              <Button
                className="h-12 min-w-56 border-0 bg-primary font-bold text-base text-primary-foreground shadow-lg transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-95"
                disabled={
                  isPixLoading ||
                  isBoletoLoading ||
                  isPending ||
                  (paymentMethod === "pix" && !canProceedToPayment) ||
                  (paymentMethod === "boleto" && !canProceedToPayment) ||
                  (paymentMethod !== "pix" &&
                    paymentMethod !== "boleto" &&
                    !canCompleteCheckout())
                }
                onClick={() => {
                  if (paymentMethod === "pix") {
                    void handleInitiatePix();
                  } else if (paymentMethod === "boleto") {
                    void handleInitiateBoleto();
                  } else {
                    submitCardPayment();
                  }
                }}
              >
                {isPixLoading
                  ? "Gerando PIX..."
                  : isBoletoLoading
                    ? "Gerando Boleto..."
                    : paymentMethod === "pix"
                      ? "Gerar PIX"
                      : paymentMethod === "boleto"
                        ? "Gerar Boleto"
                        : isPending
                          ? "Processando..."
                          : "Finalizar Transação"}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }
);

function InstallmentSelector({
  rates,
  selected,
  onChange,
}: {
  rates: InstallmentRate[];
  selected: number;
  onChange: (n: number) => void;
}) {
  const toBrlLocal = (v: number) =>
    v.toLocaleString("pt-BR", { currency: "BRL", style: "currency" });

  return (
    <Card className="border border-border bg-muted/40">
      <CardHeader className="pb-3">
        <CardTitle className="font-black text-foreground text-sm uppercase tracking-tight">
          Parcelas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {rates.map(r => {
            const isSelected = selected === r.n;
            const label =
              r.buyerRate === 0
                ? `${r.n}x sem juros`
                : `${r.n}x +${(r.buyerRate * 100).toFixed(2)}% + R$${r.fixedFee}`;
            return (
              <button
                className={`rounded-xl border px-3 py-2 text-left text-xs transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-border bg-muted/40 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
                key={r.n}
                onClick={() => onChange(r.n)}
                type="button"
              >
                <span className="font-black">{r.n}x</span>
                <br />
                {r.buyerRate === 0 ? (
                  <span className="text-emerald-400">sem juros</span>
                ) : (
                  <span>
                    {(r.buyerRate * 100).toFixed(2)}% + {toBrlLocal(r.fixedFee)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

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
    <Card className="overflow-hidden rounded-3xl border-border bg-muted/40 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 shadow-xl">
              <QrCode
                className="text-emerald-400"
                size={18}
                strokeWidth={2.5}
              />
            </div>
            <div>
              <CardTitle className="font-black text-foreground text-xl uppercase tracking-tight">
                Pague com PIX
              </CardTitle>
              <CardDescription className="font-medium text-muted-foreground">
                Escaneie o QR ou copie o código no app do banco
              </CardDescription>
            </div>
          </div>
          <Button
            className="text-muted-foreground transition-colors hover:text-foreground"
            onClick={onBack}
            size="sm"
            variant="ghost"
          >
            <ArrowLeft className="mr-2" size={16} />
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
              alt="QR Code PIX"
              className="relative mx-auto max-w-[320px] rounded-lg border border-border bg-primary p-2"
              src={pixSession.pix_qrcode}
            />
          </div>
        ) : null}

        <div className="space-y-3">
          <Button
            className={clsx(
              "h-12 w-full overflow-hidden font-medium text-base transition-all duration-300",
              pixCopied
                ? "border-emerald-500/45 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"
                : "hover:border-emerald-500/30 hover:bg-emerald-500/5"
            )}
            onClick={copyPixToClipboard}
            type="button"
            variant="outline"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center justify-center gap-2"
                exit={{ opacity: 0, y: -8 }}
                initial={{ opacity: 0, y: 8 }}
                key={pixCopied ? "copied" : "copy"}
                transition={{ duration: 0.18, ease: "easeOut" }}
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

          <p className="px-4 text-center font-black text-[10px] text-muted-foreground uppercase tracking-widest">
            Após o pagamento, a confirmação é automática e seu pedido será
            processado instantaneamente.
          </p>
        </div>

        <div className="pt-2">
          <Button
            className="h-14 w-full rounded-2xl bg-sky-500 font-black text-white uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:bg-sky-600"
            disabled={isPixLoading || isVerifyingPayment || isPaymentConfirmed}
            onClick={onCheckPayment}
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

function BoletoCard({
  boletoSession,
  boletoCopied,
  copyBoletoToClipboard,
  onBack,
  onCheckPayment,
  isBoletoLoading,
  isVerifyingPayment,
  isPaymentConfirmed,
}: {
  boletoSession: {
    boletoUrl: string;
    boletoDigitableLine: string;
    transactionId: string;
  };
  boletoCopied: boolean;
  copyBoletoToClipboard: () => void;
  onBack: () => void;
  onCheckPayment: () => void;
  isBoletoLoading: boolean;
  isVerifyingPayment: boolean;
  isPaymentConfirmed: boolean;
}) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleCheckPaymentClick = () => {
    setShowInfoModal(true);
    onCheckPayment();
  };

  return (
    <Card className="overflow-hidden rounded-3xl border-border bg-muted/40 shadow-2xl backdrop-blur-md">
      <Dialog onOpenChange={setShowInfoModal} open={showInfoModal}>
        <DialogContent className="border-border bg-background text-foreground sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-500/10">
              <Clock className="text-amber-400" size={24} strokeWidth={2} />
            </div>
            <DialogTitle className="text-center">
              Pagamento em processamento
            </DialogTitle>
            <DialogDescription className="space-y-2 text-center text-muted-foreground">
              <span className="block">
                Recebemos seu clique de confirmação. Boletos não são compensados
                na hora — o banco pode levar até 2 dias úteis pra processar o
                pagamento.
              </span>
              <span className="block">
                Assim que a compensação for confirmada, sua compra é liberada
                automaticamente e você recebe um e-mail. Não precisa ficar com
                esta página aberta.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              className="w-full sm:w-auto"
              onClick={() => setShowInfoModal(false)}
              type="button"
            >
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 shadow-xl">
              <Barcode className="text-amber-400" size={18} strokeWidth={2.5} />
            </div>
            <div>
              <CardTitle className="font-black text-foreground text-xl uppercase tracking-tight">
                Pague com Boleto
              </CardTitle>
              <CardDescription className="font-medium text-muted-foreground">
                Pague no app do banco ou lotérica com a linha digitável
              </CardDescription>
            </div>
          </div>
          <Button
            className="text-muted-foreground transition-colors hover:text-foreground"
            onClick={onBack}
            size="sm"
            variant="ghost"
          >
            <ArrowLeft className="mr-2" size={16} />
            Voltar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Button
            className={clsx(
              "h-12 w-full overflow-hidden font-medium text-base transition-all duration-300",
              boletoCopied
                ? "border-emerald-500/45 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"
                : "hover:border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
            )}
            onClick={copyBoletoToClipboard}
            type="button"
            variant="outline"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center justify-center gap-2"
                exit={{ opacity: 0, y: -8 }}
                initial={{ opacity: 0, y: 8 }}
                key={boletoCopied ? "copied" : "copy"}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {boletoCopied ? (
                  <>
                    <Check className="size-5 shrink-0" strokeWidth={3} />
                    Linha Digitável Copiada!
                  </>
                ) : (
                  <>
                    <Barcode className="size-5 shrink-0" />
                    Copiar linha digitável
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </Button>

          <Button
            asChild
            className="h-12 w-full font-medium text-base hover:border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
            type="button"
            variant="outline"
          >
            <a
              href={boletoSession.boletoUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Visualizar / imprimir boleto (PDF)
            </a>
          </Button>

          <p className="px-4 text-center font-black text-[10px] text-muted-foreground uppercase tracking-widest">
            Após o pagamento, a compensação pode levar até 2 dias úteis. A
            confirmação é automática assim que o banco processar.
          </p>
        </div>

        <div className="pt-2">
          <Button
            className="h-14 w-full rounded-2xl bg-sky-500 font-black text-white uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:bg-sky-600"
            disabled={
              isBoletoLoading || isVerifyingPayment || isPaymentConfirmed
            }
            onClick={handleCheckPaymentClick}
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
    <Card className="overflow-hidden rounded-3xl border-border bg-muted/40 shadow-2xl backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 shadow-xl">
            <User className="text-sky-400" size={18} strokeWidth={2.5} />
          </div>
          <div className="flex flex-1 items-center justify-between">
            <div>
              <CardTitle className="font-black text-foreground text-xl uppercase tracking-tight">
                Informações de Cobrança
              </CardTitle>
            </div>
            {hasExistingUser && savedInfo && onAutoFill && (
              <Button
                className="flex h-9 items-center gap-2 rounded-xl border-sky-500/30 bg-sky-500/5 px-4 font-black text-[10px] text-sky-400 uppercase tracking-[0.2em] shadow-lg shadow-sky-500/10 transition-all hover:scale-105 hover:bg-sky-500/10 active:scale-95"
                onClick={onAutoFill}
                size="sm"
                type="button"
                variant="outline"
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
            <Label
              className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
              htmlFor={`${id}-firstName`}
            >
              Nome
            </Label>
            <Input
              autoComplete="given-name"
              id={`${id}-firstName`}
              placeholder="Seu nome"
              {...register("firstName")}
              className={atlasInputClasses}
            />
            {errors.firstName && (
              <p className="text-red-400 text-xs">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
              htmlFor={`${id}-lastName`}
            >
              Sobrenome
            </Label>
            <Input
              autoComplete="family-name"
              id={`${id}-lastName`}
              placeholder="Seu sobrenome"
              {...register("lastName")}
              className={atlasInputClasses}
            />
            {errors.lastName && (
              <p className="text-red-400 text-xs">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label
              className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
              htmlFor={`${id}-document`}
            >
              CPF ou CNPJ
            </Label>
            <Controller
              control={control}
              name="document"
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  autoComplete="off"
                  className={atlasInputClasses}
                  mask={[
                    { mask: "000.000.000-00" },
                    { mask: "00.000.000/0000-00" },
                  ]}
                  onAccept={value => field.onChange(value)}
                  placeholder="000.000.000-00"
                />
              )}
            />
            {errors.document && (
              <p className="text-red-400 text-xs">{errors.document.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
              htmlFor={`${id}-phoneNumber`}
            >
              Telefone
            </Label>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  autoComplete="tel"
                  className={atlasInputClasses}
                  mask="(00) 00000-0000"
                  onAccept={value => field.onChange(value)}
                  placeholder="(11) 99999-9999"
                />
              )}
            />
            {errors.phoneNumber && (
              <p className="text-red-400 text-xs">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label
            className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
            htmlFor={`${id}-address.zipCode`}
          >
            CEP
          </Label>
          <Controller
            control={control}
            name="address.zipCode"
            render={({ field }) => (
              <IMaskInput
                {...field}
                autoComplete="postal-code"
                className={atlasInputClasses}
                mask="00000-000"
                onAccept={value => {
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

        {/* Address Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label
                className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
                htmlFor={`${id}-address.street`}
              >
                Rua
              </Label>
              <Input
                autoComplete="address-line1"
                id={`${id}-address.street`}
                placeholder="Nome da rua"
                {...register("address.street")}
                className={atlasInputClasses}
              />
              {errors.address?.street && (
                <p className="text-red-400 text-xs">
                  {errors.address.street.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
                htmlFor={`${id}-address.number`}
              >
                Número
              </Label>
              <Input
                autoComplete="address-line2"
                id={`${id}-address.number`}
                placeholder="123"
                {...register("address.number")}
                className={atlasInputClasses}
              />
              {errors.address?.number && (
                <p className="text-red-400 text-xs">
                  {errors.address.number.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label
                className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
                htmlFor={`${id}-address.neighborhood`}
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
                <p className="text-red-400 text-xs">
                  {errors.address.neighborhood.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
                htmlFor={`${id}-address.city`}
              >
                Cidade
              </Label>
              <Input
                autoComplete="address-level2"
                id={`${id}-address.city`}
                placeholder="Nome da cidade"
                {...register("address.city")}
                className={atlasInputClasses}
              />
              {errors.address?.city && (
                <p className="text-red-400 text-xs">
                  {errors.address.city.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
                htmlFor={`${id}-address.state`}
              >
                Estado
              </Label>
              <Input
                autoComplete="address-level1"
                id={`${id}-address.state`}
                maxLength={2}
                placeholder="SP"
                {...register("address.state")}
                className={atlasInputClasses}
              />
              {errors.address?.state && (
                <p className="text-red-400 text-xs">
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
    <Card className="overflow-hidden rounded-3xl border-border bg-muted/40 shadow-2xl backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 shadow-xl">
              <UserCheck className="h-5 w-5 text-emerald-400" strokeWidth={3} />
            </div>
            <div>
              <CardTitle className="font-black text-foreground text-xl uppercase tracking-tight">
                Informações de Cobrança
              </CardTitle>
              <CardDescription className="mt-0.5 font-bold text-[11px] text-muted-foreground uppercase tracking-widest opacity-80">
                Dados confirmados
              </CardDescription>
            </div>
          </div>
          <Button onClick={onEdit} size="sm" variant="outline">
            Editar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <span className="font-medium">
                {values.firstName} {values.lastName}
              </span>
              <div className="font-medium text-muted-foreground">
                {values.document}
              </div>
            </div>
            <div>
              <span className="font-medium">Telefone</span>
              <div className="font-medium text-muted-foreground">
                {values.phoneNumber}
              </div>
            </div>
          </div>
          <div>
            <span className="font-medium">Endereço</span>
            <div className="font-medium text-muted-foreground">
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
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border-border bg-muted/40 shadow-2xl backdrop-blur-md"
      exit={{ opacity: 0, y: -20 }}
      initial={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
    >
      <CardHeader>
        <CardTitle className="font-black text-foreground text-xl uppercase tracking-tight">
          Dados do Cartão
        </CardTitle>
        <CardDescription className="font-medium text-muted-foreground">
          Insira os dados do seu cartão de crédito
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="col-span-2 space-y-2">
            <Label
              className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
              htmlFor="cardNumber"
            >
              Número do Cartão
            </Label>
            <Controller
              control={control}
              name="cardNumber"
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  autoComplete="cc-number"
                  className={atlasInputClasses}
                  mask="0000 0000 0000 0000"
                  onAccept={value => field.onChange(value)}
                  placeholder="0000 0000 0000 0000"
                  unmask={true}
                />
              )}
            />
            {errors.cardNumber && touchedFields.cardNumber && (
              <p className="text-red-400 text-xs">
                {errors.cardNumber.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
              htmlFor="cardCvv"
            >
              CVV
            </Label>
            <Controller
              control={control}
              name="cardCvv"
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  autoComplete="cc-csc"
                  className={atlasInputClasses}
                  mask="000"
                  onAccept={value => field.onChange(value)}
                  placeholder="123"
                  unmask={true}
                />
              )}
            />
            {errors.cardCvv && touchedFields.cardCvv && (
              <p className="text-red-400 text-xs">{errors.cardCvv.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
              htmlFor="cardExpiration"
            >
              Data de Validade
            </Label>
            <Controller
              control={control}
              name="cardExpiration"
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  autoComplete="cc-exp"
                  className={clsx([atlasInputClasses, "text-center"])}
                  lazy={false}
                  mask="00/00"
                  onAccept={value => field.onChange(value)}
                  placeholder="MM/AA"
                  placeholderChar=" "
                />
              )}
            />
            {errors.cardExpiration && touchedFields.cardExpiration && (
              <p className="text-red-400 text-xs">
                {errors.cardExpiration.message}
              </p>
            )}
          </div>
        </div>

        {/* Billing Information for Card Holder */}
        <div className="mt-8 space-y-6">
          <h3 className="font-black text-sky-500 text-xs uppercase tracking-widest">
            Informações do Titular
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
                htmlFor="firstName"
              >
                Nome do Titular
              </Label>
              <Input
                autoComplete="given-name"
                placeholder="Nome"
                {...register("firstName")}
                className={atlasInputClasses}
              />
              {errors.firstName && (
                <p className="text-red-400 text-xs">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
                htmlFor="lastName"
              >
                Sobrenome do Titular
              </Label>
              <Input
                autoComplete="family-name"
                placeholder="Sobrenome"
                {...register("lastName")}
                className={atlasInputClasses}
              />
              {errors.lastName && (
                <p className="text-red-400 text-xs">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label
              className="font-black text-[11px] text-muted-foreground uppercase tracking-wider"
              htmlFor="document"
            >
              CPF ou CNPJ do titular
            </Label>
            <Controller
              control={control}
              name="document"
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  autoComplete="document"
                  className={atlasInputClasses}
                  mask={[
                    { mask: "000.000.000-00" },
                    { mask: "00.000.000/0000-00" },
                  ]}
                  onAccept={value => field.onChange(value)}
                  placeholder="000.000.000-00"
                />
              )}
            />
            {errors.document && (
              <p className="text-red-400 text-xs">{errors.document.message}</p>
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
