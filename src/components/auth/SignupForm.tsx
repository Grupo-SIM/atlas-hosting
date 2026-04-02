"use client";

import { signup } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import { z } from "zod";
// import GithubAuthButton from "./GithubAuthButton";
// import GoogleAuthButton from "./GoogleAuthButton";

export default function SignupForm({
  referrer,
  redirect,
}: { referrer?: Pick<User, "name" | "email" | "id">; redirect?: string }) {
  const { register, handleSubmit, control, ...methods } =
    useForm<SignupFormInputs>({
      resolver: zodResolver(schema),
      mode: "onChange",
      reValidateMode: "onChange",
    });

  const { errors, isValid, isValidating } = useFormState({ control });

  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = methods.getValues();

    setFormError(null);
    setIsLoading(true);

    try {
      const result = await signup(
        { status: "idle", message: "" },
        { ...data, referrerId: referrer?.id }
      );

      if (result.status === "success") {
        const email = data.email;
        const verifyUrl = redirect
          ? `/verify-email?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirect)}`
          : `/verify-email?email=${encodeURIComponent(email)}`;
        window.location.href = verifyUrl;
      } else {
        setFormError(result.message ?? "Erro ao criar conta");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setFormError("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Seu nome"
              autoComplete="given-name"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-xs text-red-400">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Seu sobrenome"
              autoComplete="family-name"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-xs text-red-400">{errors.lastName.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            type="email"
            placeholder="Digite seu e-mail"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="organizationName">Nome da organização</Label>
          <Input
            type="text"
            placeholder="Nome da sua organização"
            autoComplete="organizationName"
            {...register("organizationName")}
          />
          {errors.organizationName && (
            <p className="text-xs text-red-400">
              {errors.organizationName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            type="password"
            placeholder="Digite sua senha"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <Input
            type="password"
            placeholder="Confirme sua senha"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {formError && <p className="text-xs text-red-400">{formError}</p>}

        <Button
          type="submit"
          className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          disabled={!isValid || isValidating || isLoading}
        >
          {isLoading ? (
            <CgSpinner className="h-6 w-6 animate-spin" />
          ) : (
            "Cadastrar"
          )}
        </Button>

        {/*
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou cadastre-se com
            </span>
          </div>
        </div>
        */}
      </form>
    </>
  );
}

const schema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "Nome deve ter pelo menos 2 caracteres"),
    lastName: z
      .string()
      .trim()
      .min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
    email: z
      .string()
      .min(1, "E-mail é obrigatório")
      .email("Digite um e-mail válido"),
    organizationName: z
      .string()
      .trim()
      .min(1, "Nome da organização é obrigatório")
      .max(100, "O nome da organização deve ter no máximo 100 caracteres"),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .max(100, "A senha deve ter no máximo 100 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas devem ser iguais",
    path: ["confirmPassword"],
  });

export type SignupFormInputs = z.infer<typeof schema> & {
  referrerId?: string;
};
