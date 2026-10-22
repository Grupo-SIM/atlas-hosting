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
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "As senhas devem coincidir")
      .required("Confirmação de senha é obrigatória"),
    password: yup
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .required("Senha é obrigatória"),
  })
  .required();

type ResetPasswordFormInputs = yup.InferType<typeof schema>;

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { register, handleSubmit, control, trigger, watch } =
    useForm<ResetPasswordFormInputs>({
      mode: "onChange",
      resolver: yupResolver(schema),
    });

  const { errors, isValid } = useFormState({ control });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  // Re-validar confirmação quando a senha principal mudar
  useEffect(() => {
    if (confirmPassword) {
      trigger("confirmPassword");
    }
  }, [password, confirmPassword, trigger]);

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        body: JSON.stringify({
          confirmPassword: data.confirmPassword,
          password: data.password,
          token,
        }),
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
        setMessage(result.error || "Erro ao redefinir senha");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("Erro ao redefinir senha");
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
            Senha redefinida!
          </h3>
          <p className="text-green-700 text-sm">{message}</p>
          <p className="mt-2 text-muted-foreground text-xs">
            Redirecionando para o login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="password">Nova senha</Label>
        <Input
          autoComplete="new-password"
          id="password"
          placeholder="Digite sua nova senha"
          type="password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-red-400 text-xs">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input
          autoComplete="new-password"
          id="confirmPassword"
          placeholder="Confirme sua nova senha"
          type="password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-red-400 text-xs">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {message && !isSuccess && (
        <p className="text-red-400 text-xs">{message}</p>
      )}

      <Button
        className="h-12 w-full bg-gradient-to-r from-sky-500 to-sky-600 font-bold text-base text-white hover:brightness-110"
        disabled={!isValid || isLoading}
        type="submit"
      >
        {isLoading ? (
          <CgSpinner className="h-5 w-5 animate-spin" />
        ) : (
          "Redefinir senha"
        )}
      </Button>
    </form>
  );
}
