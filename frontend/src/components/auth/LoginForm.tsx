"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type ReactNode,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { useForm, useFormState } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import * as yup from "yup";
import { type ActionResponse, login } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const { register, getValues, control, ...methods } = useForm<LoginFormInputs>(
    {
      mode: "onChange",
      resolver: yupResolver(schema),
      reValidateMode: "onChange",
    }
  );

  const { errors, isValid, isValidating } = useFormState({ control });
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [formError, setFormError] = useState<ReactNode>(null);
  const [showEmailChangeSuccess, setShowEmailChangeSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [actionState, doLogin, isPending] = useActionState<
    ActionResponse,
    LoginFormInputs
  >(login, {
    message: "",
    status: "idle",
  });

  // Check for email change success message
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "email-changed") {
      setShowEmailChangeSuccess(true);
      toast({
        description:
          "Seu email foi alterado com sucesso. Você pode agora fazer login com o novo endereço.",
        duration: 5000,
        title: "Email alterado com sucesso",
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
        body: JSON.stringify({ email: getValues("email") }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
    };

    if (actionState.status === "success") {
      // The redirect is handled server-side in the login action
      // But we can also handle it client-side as a fallback
      const redirectPath =
        redirectTo?.startsWith("/") && redirectTo !== "/"
          ? redirectTo
          : "/home";
      router.push(redirectPath);
    } else if (actionState.status === "error") {
      if (actionState.error === "email_not_verified") {
        setFormError(
          <span>
            Você precisa verificar seu email antes de fazer login. Verifique sua
            caixa de entrada.{" "}
            <button
              className="all:unset cursor-pointer font-semibold text-red-400 underline"
              disabled={isPending}
              onClick={resendEmail}
              type="button"
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
    <form className="space-y-6" onSubmit={onSubmit}>
      {showEmailChangeSuccess && (
        <Alert className="border-green-500/50 bg-green-500/10 text-green-400">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Email alterado com sucesso!</strong> Você pode agora fazer
            login com o novo endereço de email.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex h-auto min-h-[72px] w-full max-w-[448px] flex-col items-start gap-1">
        <Label className="ml-1 font-medium text-white" htmlFor="email">
          E-mail
        </Label>
        <Input
          autoComplete="email"
          className="h-11 rounded-md border-none bg-white/80 font-medium text-slate-900 transition-all placeholder:text-slate-500 focus-visible:bg-white focus-visible:ring-sky-500/50"
          id="email"
          placeholder="Digite seu e-mail"
          type="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 ml-1 font-medium text-red-400 text-xs">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex h-auto min-h-[72px] w-full max-w-[448px] flex-col items-start gap-1">
        <div className="ml-1 flex w-full items-center justify-between pr-1">
          <Label className="font-medium text-white" htmlFor="password">
            Senha
          </Label>
          <Link
            className="font-medium text-white text-xs transition-colors hover:text-sky-300"
            href="/forgot-password"
          >
            Esqueceu a senha?
          </Link>
        </div>
        <div className="relative w-full">
          <Input
            autoComplete="current-password"
            className="h-11 rounded-md border-none bg-white/80 pr-10 font-medium text-slate-900 transition-all placeholder:text-slate-500 focus-visible:bg-white focus-visible:ring-sky-500/50"
            id="password"
            placeholder="Digite sua senha"
            type={showPassword ? "text" : "password"}
            {...register("password")}
          />
          <button
            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            type="button"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 ml-1 font-medium text-red-400 text-xs">
            {errors.password.message}
          </p>
        )}
      </div>

      {formError && <p className="ml-1 text-red-400 text-xs">{formError}</p>}

      <Button
        className="h-[48px] w-full max-w-[448px] rounded-[6px] bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-sm text-white uppercase tracking-wider shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
        disabled={!isValid || isValidating || isPending}
        type="submit"
      >
        {isPending ? <CgSpinner className="h-5 w-5 animate-spin" /> : "Entrar"}
      </Button>
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
