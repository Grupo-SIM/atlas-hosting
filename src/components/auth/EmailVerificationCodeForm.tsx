"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const schema = yup
  .object({
    code: yup
      .string()
      .required("Código é obrigatório")
      .matches(/^\d{5}$/, "O código deve ter exatamente 5 dígitos"),
  })
  .required();

interface EmailVerificationCodeFormInputs {
  code: string;
}

interface EmailVerificationCodeFormProps {
  email?: string;
  redirect?: string;
}

export default function EmailVerificationCodeForm({
  email: initialEmail,
  redirect,
}: EmailVerificationCodeFormProps) {
  const { handleSubmit, control, setValue, watch } =
    useForm<EmailVerificationCodeFormInputs>({
      defaultValues: {
        code: "",
      },
      mode: "onChange",
      resolver: yupResolver(schema),
    });

  const { errors, isValid } = useFormState({ control });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const router = useRouter();
  const codeValue = watch("code") || "";
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Habilita reenviar código depois de 1 minuto
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!initialEmail || resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setResendMessage(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        body: JSON.stringify({ email: initialEmail.toLowerCase() }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        setResendMessage(result.message || "Código reenviado.");
        setResendCooldown(60);
      } else {
        setResendMessage(result.error || "Erro ao reenviar código.");
      }
    } catch (error) {
      setResendMessage("Erro ao reenviar código.");
    } finally {
      setIsResending(false);
    }
  };

  if (!initialEmail) {
    return (
      <div className="space-y-4">
        <p className="text-red-400 text-sm">
          Email não encontrado. Por favor, acesse a página de verificação
          através do link enviado por email.
        </p>
      </div>
    );
  }

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(0, 1);

    if (digit) {
      const newCode = codeValue.split("");
      newCode[index] = digit;
      const updatedCode = newCode.join("").slice(0, 5);
      setValue("code", updatedCode, { shouldValidate: true });

      // Move to next input
      if (index < 4 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !codeValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 5);
    if (pastedData) {
      setValue("code", pastedData, { shouldValidate: true });
      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, 4);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const onSubmit = async (data: EmailVerificationCodeFormInputs) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        body: JSON.stringify({
          code: data.code,
          email: initialEmail.toLowerCase(),
        }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage("Email verificado com sucesso! Redirecionando...");
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href =
            redirect && redirect !== "/" ? redirect : "/home";
        }, 1500);
      } else {
        setMessage(result.error || "Código inválido ou expirado");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("Erro ao verificar código. Tente novamente.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 pb-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              aria-hidden="true"
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h3 className="mb-2 font-semibold text-green-900 text-lg">
            Email verificado!
          </h3>
          <p className="text-green-700 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label className="text-white" htmlFor="code">
          Código de verificação
        </Label>
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3, 4].map(index => (
            <input
              autoComplete="off"
              className="h-14 w-12 rounded-md border border-gray-300 text-center font-semibold text-2xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              inputMode="numeric"
              key={index}
              maxLength={1}
              onChange={e => handleInputChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              ref={el => {
                inputRefs.current[index] = el;
              }}
              type="text"
              value={codeValue[index] || ""}
            />
          ))}
        </div>
        {errors.code && (
          <p className="text-center text-red-400 text-xs">
            {errors.code.message}
          </p>
        )}
        <p className="text-center text-white text-xs">
          Digite o código de 5 dígitos que você recebeu por email
        </p>
      </div>

      <div className="text-center">
        {resendCooldown > 0 ? (
          <p className="text-gray-400 text-xs">
            Reenviar código em {resendCooldown}s
          </p>
        ) : (
          <button
            className="text-blue-400 text-xs underline hover:text-blue-300 disabled:opacity-50"
            disabled={isResending}
            onClick={handleResend}
            type="button"
          >
            {isResending ? "Reenviando..." : "Reenviar código"}
          </button>
        )}
        {resendMessage && (
          <p className="mt-1 text-gray-300 text-xs">{resendMessage}</p>
        )}
      </div>

      {message && !isSuccess && (
        <p className="text-center text-red-400 text-xs">{message}</p>
      )}

      <div className="pt-4 pb-6">
        <Button
          className="h-12 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-base text-white hover:from-blue-700 hover:to-indigo-700"
          disabled={!isValid || isLoading}
          type="submit"
        >
          {isLoading ? (
            <CgSpinner className="h-5 w-5 animate-spin" />
          ) : (
            "Verificar e fazer login"
          )}
        </Button>
      </div>
    </form>
  );
}
