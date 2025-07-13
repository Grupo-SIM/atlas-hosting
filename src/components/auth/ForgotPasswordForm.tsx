"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import * as yup from "yup";

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
  const { register, handleSubmit, control } = useForm<ForgotPasswordFormInputs>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { errors, isValid } = useFormState({ control });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Email enviado!
          </h3>
          <p className="text-sm text-green-700">
            {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      {message && !isSuccess && (
        <p className="text-xs text-red-400">{message}</p>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        disabled={!isValid || isLoading}
      >
        {isLoading ? (
          <CgSpinner className="animate-spin h-5 w-5" />
        ) : (
          "Enviar link de redefinição"
        )}
      </Button>
    </form>
  );
}
