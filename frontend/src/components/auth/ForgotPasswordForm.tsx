"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
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

type ForgotPasswordFormInputs = yup.InferType<typeof schema>;

export default function ForgotPasswordForm() {
  const { register, handleSubmit, control } = useForm<ForgotPasswordFormInputs>(
    {
      mode: "onChange",
      resolver: yupResolver(schema),
    }
  );

  const { errors, isValid } = useFormState({ control });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
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
        setMessage(result.error || "Erro ao enviar email de redefinição");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("Erro ao enviar email de redefinição");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

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
          "Enviar link de redefinição"
        )}
      </Button>
    </form>
  );
}
