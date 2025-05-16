"use client";

import { startTransition, useCallback, useEffect, useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useForm, useFormState } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { login, ActionResponse } from "@/app/actions"; // Renamed LoginProps to avoid conflict
import { CgSpinner } from "react-icons/cg";
import { FaGithub, FaGithubAlt, FaGoogle } from "react-icons/fa6";

export default function LoginForm() {
  const { register, getValues, control, ...methods} = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { errors, isValid, isValidating } = useFormState({ control });
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const [actionState, doLogin, isPending] = useActionState<ActionResponse, LoginFormInputs>(login, {
    status: "idle",
  });

  const onSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValidClient = await methods.trigger();
    if (!isValidClient) return;

    const data = getValues();
    setFormError(null);

    startTransition(() => {
      doLogin(data);
    });
  }, [doLogin, getValues, methods]);

  useEffect(() => {
    if (actionState.status === "success") {
      router.push("/");
    } else if (actionState.status === "error") {
      setFormError(actionState.message ?? "Erro ao fazer login");
    }
  }, [actionState.status, actionState.message, router]);

  console.log(!isValid, isValidating, isPending);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Link
            href="#"
            className="text-sm text-primary hover:underline"
          >
            Esqueceu a senha?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      {/* <div className="flex items-center space-x-2">
        <Checkbox id="remember" {...register("remember")} />
        <Label htmlFor="remember" className="text-sm font-normal">
          Lembrar por 30 dias
        </Label>
      </div> */}

      {formError && <p className="text-xs text-red-400">{formError}</p>}

      <Button
        type="submit"
        className="w-full flex items-center justify-center"
        disabled={!isValid || isValidating || isPending}
      >
        {isPending ? (
          <CgSpinner className="animate-spin h-5 w-5" />
        ) : (
          "Entrar"
        )}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
          <FaGithub className="h-4 w-4" />
          GitHub
        </Button>
        <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
          <FaGoogle className="h-4 w-4" />
          Google
        </Button>
      </div>
    </form>
  );
}

const schema = yup
  .object({
    email: yup
      .string()
      .email("Digite um e-mail válido")
      .required("E-mail é obrigatório"),
    password: yup.string().required("Senha é obrigatória"),
    // remember: yup.boolean().optional(),
  })
  .required();

export type LoginFormInputs = yup.InferType<typeof schema>;