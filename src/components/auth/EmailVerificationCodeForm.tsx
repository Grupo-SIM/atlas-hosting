"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import * as yup from "yup";

const schema = yup
  .object({
    code: yup
      .string()
      .required("Código é obrigatório")
      .matches(/^\d{5}$/, "O código deve ter exatamente 5 dígitos"),
  })
  .required();

type EmailVerificationCodeFormInputs = {
  code: string;
};

interface EmailVerificationCodeFormProps {
  email?: string;
  redirect?: string;
}

export default function EmailVerificationCodeForm({ email: initialEmail, redirect }: EmailVerificationCodeFormProps) {
  const { handleSubmit, control, setValue, watch } = useForm<EmailVerificationCodeFormInputs>({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      code: "",
    },
  });

  const { errors, isValid } = useFormState({ control });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const codeValue = watch("code") || "";
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  if (!initialEmail) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-400">
          Email não encontrado. Por favor, acesse a página de verificação através do link enviado por email.
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

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codeValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: data.code,
          email: initialEmail.toLowerCase(),
        }),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage("Email verificado com sucesso! Redirecionando...");
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = redirect && redirect !== "/" ? redirect : "/home";
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
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Email verificado!
          </h3>
          <p className="text-sm text-green-700">
            {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="code">Código de verificação</Label>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3, 4].map((index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={codeValue[index] || ""}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoComplete="off"
            />
          ))}
        </div>
        {errors.code && (
          <p className="text-xs text-red-400 text-center">{errors.code.message}</p>
        )}
        <p className="text-xs text-white text-center">
          Digite o código de 5 dígitos que você recebeu por email
        </p>
      </div>

      {message && !isSuccess && (
        <p className="text-xs text-red-400 text-center">{message}</p>
      )}

      <div className="pt-4 pb-6">
        <Button
          type="submit"
          className="w-full h-12 text-base text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <CgSpinner className="animate-spin h-5 w-5" />
          ) : (
            "Verificar e fazer login"
          )}
        </Button>
      </div>
    </form>
  );
}

