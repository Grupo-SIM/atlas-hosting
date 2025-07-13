"use client";

import { signup } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/db/schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import * as yup from "yup";
import GithubAuthButton from "./GithubAuthButton";
import GoogleAuthButton from "./GoogleAuthButton";
import { signInWithGithub } from "@/app/actions";

export default function SignupForm({
  referrer,
}: { referrer?: Pick<User, "name" | "email" | "id"> }) {
  const { register, handleSubmit, control, ...methods } =
    useForm<SignupFormInputs>({
      resolver: yupResolver(schema),
      mode: "onChange",
      reValidateMode: "onChange",
    });

  const { errors, isValid, isValidating } = useFormState({ control });

  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const [actionState, doSignup, isPending] = useActionState(signup, {
    status: "idle",
    message: "",
  });

  // Define the submit handler
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = methods.getValues();

    setFormError(null);

    startTransition(() => {
      doSignup({ ...data, referrerId: referrer?.id });
    });
  };

  useEffect(() => {
    if (actionState.status === "success") {
      router.push("/verify-email");
    } else if (actionState.status === "error") {
      setFormError(actionState.message ?? "Erro ao criar conta");
    }
  }, [actionState.message, actionState.status, router]);

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome completo</Label>
          <Input
            type="text"
            placeholder="Seu nome completo"
            autoComplete="name"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-xs text-red-400">{errors.fullName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            type="email"
            placeholder="exemplo@exemplo.com"
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
          disabled={!isValid || isValidating || isPending}
        >
          {isPending ? (
            <CgSpinner className="h-6 w-6 animate-spin" />
          ) : (
            "Cadastrar"
          )}
        </Button>

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
      </form>
    </>
  );
}

const schema = yup
  .object({
    fullName: yup
      .string()
      .trim()
      .required("Nome completo é obrigatório")
      .matches(/(\s)/, "Digite seu nome completo"),
    email: yup
      .string()
      .email("Digite um e-mail válido")
      .required("E-mail é obrigatório"),
    organizationName: yup
      .string()
      .trim()
      .max(100, "O nome da organização deve ter no máximo 100 caracteres")
      .required("Nome da organização é obrigatório"),
    password: yup
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .max(100, "A senha deve ter no máximo 100 caracteres")
      .required("Senha é obrigatória"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "As senhas devem ser iguais")
      .required("Confirmação de senha é obrigatória"),
  })
  .required();

export type SignupFormInputs = yup.InferType<typeof schema> & {
  referrerId?: string;
};
