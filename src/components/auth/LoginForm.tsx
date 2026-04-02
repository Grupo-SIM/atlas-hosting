"use client";

import { type ActionResponse, login } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  type ReactNode,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { useForm, useFormState } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import * as yup from "yup";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const { register, getValues, control, ...methods } = useForm<LoginFormInputs>(
    {
      resolver: yupResolver(schema),
      mode: "onChange",
      reValidateMode: "onChange",
    }
  );

  const { errors, isValid, isValidating } = useFormState({ control });
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [formError, setFormError] = useState<ReactNode>(null);
  const [showEmailChangeSuccess, setShowEmailChangeSuccess] = useState(false);

  const [actionState, doLogin, isPending] = useActionState<
    ActionResponse,
    LoginFormInputs
  >(login, {
    status: "idle",
    message: "",
  });

  // Check for email change success message
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "email-changed") {
      setShowEmailChangeSuccess(true);
      toast({
        title: "Email alterado com sucesso",
        description: "Seu email foi alterado com sucesso. Você pode agora fazer login com o novo endereço.",
        duration: 5000,
      });
    }
  }, [searchParams, toast]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValidClient = await methods.trigger();
    if (!isValidClient) {
      return;
    }

    const data = getValues();
    setFormError(null);

    startTransition(() => {
      doLogin({ ...data, redirectTo });
    });
  };

  useEffect(() => {
    const resendEmail = async () => {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: getValues("email") }),
      });
    };

    if (actionState.status === "success") {
      // The redirect is handled server-side in the login action
      // But we can also handle it client-side as a fallback
      const redirectPath = redirectTo?.startsWith("/") ? redirectTo : "/";
      router.push(redirectPath);
    } else if (actionState.status === "error") {
      if (actionState.error === "email_not_verified") {
        setFormError(
          <span>
            Você precisa verificar seu email antes de fazer login. Verifique sua
            caixa de entrada.{" "}
            <button
              type="button"
              onClick={resendEmail}
              disabled={isPending}
              className="all:unset text-red-400 font-semibold underline cursor-pointer"
            >
              Clique aqui
            </button>{" "}
            para reenviar o email.
          </span>
        );
        return;
      }
      setFormError(actionState.message ?? "Erro ao fazer login");
    }
  }, [
    actionState.status,
    actionState.message,
    actionState.error,
    isPending,
    getValues,
    router,
    redirectTo,
  ]);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {showEmailChangeSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Email alterado com sucesso!</strong> Você pode agora fazer login com o novo endereço de email.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Esqueceu a senha?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Digite sua senha"
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
        className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        disabled={!isValid || isValidating || isPending}
      >
        {isPending ? <CgSpinner className="animate-spin h-5 w-5" /> : "Entrar"}
      </Button>

      {/*
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou continue com
          </span>
        </div>
      </div>
      */}
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
    redirectTo: yup.string().optional(),
    // remember: yup.boolean().optional(),
  })
  .required();

export type LoginFormInputs = yup.InferType<typeof schema>;
