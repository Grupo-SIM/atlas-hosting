"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = yup
  .object({
    email: yup
      .string()
      .email("Digite um email válido")
      .required("Email é obrigatório"),
  })
  .required();

type EmailVerificationFormInputs = yup.InferType<typeof schema>;

interface EmailVerificationFormProps {
  token?: string;
}

export default function EmailVerificationForm({
  token,
}: EmailVerificationFormProps) {
  const { register, handleSubmit, control } =
    useForm<EmailVerificationFormInputs>({
      mode: "onChange",
      resolver: yupResolver(schema),
    });

  const { errors, isValid } = useFormState({ control });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  // Auto-verify if token is provided
  useEffect(() => {
    if (token && !isVerifying) {
      setIsVerifying(true);
      verifyEmail(token);
    }
  }, [token, isVerifying]);

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        body: JSON.stringify({ token: verificationToken }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessage(result.error || "Erro ao verificar email");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("Erro ao verificar email");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EmailVerificationFormInputs) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        setIsSuccess(true);
      } else {
        setMessage(result.error || "Erro ao enviar email de verificação");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("Erro ao enviar email de verificação");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // If token is provided, show verification status
  if (token) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          {isLoading ? (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <CgSpinner className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : isSuccess ? (
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
          ) : (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                aria-hidden="true"
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
          )}

          <h3
            className={`mb-2 font-semibold text-lg ${
              isSuccess
                ? "text-green-900"
                : isLoading
                  ? "text-blue-900"
                  : "text-red-900"
            }`}
          >
            {isLoading
              ? "Verificando email..."
              : isSuccess
                ? "Email verificado!"
                : "Erro na verificação"}
          </h3>

          {message && (
            <p
              className={`text-sm ${
                isSuccess
                  ? "text-green-700"
                  : isLoading
                    ? "text-blue-700"
                    : "text-red-700"
              }`}
            >
              {message}
            </p>
          )}

          {isSuccess && (
            <p className="mt-2 text-muted-foreground text-xs">
              Redirecionando para o login...
            </p>
          )}
        </div>
      </div>
    );
  }

  // If no token, show resend verification form
  if (isSuccess) {
    return (
      <div className="space-y-4">
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
            Email enviado!
          </h3>
          <p className="text-green-700 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          autoComplete="email"
          id="email"
          placeholder="seu@email.com"
          type="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-red-400 text-xs">{errors.email.message}</p>
        )}
      </div>

      {message && !isSuccess && (
        <p className="text-red-400 text-xs">{message}</p>
      )}

      <Button
        className="h-12 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-base text-white hover:from-blue-700 hover:to-indigo-700"
        disabled={!isValid || isLoading}
        type="submit"
      >
        {isLoading ? (
          <CgSpinner className="h-5 w-5 animate-spin" />
        ) : (
          "Enviar email de verificação"
        )}
      </Button>
    </form>
  );
}
