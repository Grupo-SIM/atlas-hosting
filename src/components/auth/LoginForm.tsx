"use client";

import { type ActionResponse, login } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { yupResolver } from "@hookform/resolvers/yup";
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
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

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
    <form onSubmit={onSubmit} className="space-y-6">
      {showEmailChangeSuccess && (
        <Alert className="border-green-500/50 bg-green-500/10 text-green-400">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Email alterado com sucesso!</strong> Você pode agora fazer login com o novo endereço de email.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col items-start gap-1 w-full max-w-[448px] h-[72px]">
        <Label htmlFor="email" className="text-white font-medium ml-1">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="Digite seu e-mail"
          autoComplete="email"
          className="h-11 bg-white/80 border-none text-slate-900 placeholder:text-slate-500 rounded-md focus-visible:ring-sky-500/50 focus-visible:bg-white transition-all font-medium"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-[10px] text-red-400 ml-1 leading-none">{errors.email.message}</p>
        )}
      </div>
      
      <div className="flex flex-col items-start gap-1 w-full max-w-[448px] h-[72px]">
        <div className="flex items-center justify-between w-full ml-1 pr-1">
          <Label htmlFor="password" className="text-white font-medium">Senha</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-white hover:text-sky-300 transition-colors font-medium"
          >
            Esqueceu a senha?
          </Link>
        </div>
        <div className="relative w-full">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            className="h-11 bg-white/80 border-none text-slate-900 placeholder:text-slate-500 rounded-md pr-10 focus-visible:ring-sky-500/50 focus-visible:bg-white transition-all font-medium"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-[10px] text-red-400 ml-1 leading-none">{errors.password.message}</p>
        )}
      </div>

      {formError && <p className="text-xs text-red-400 ml-1">{formError}</p>}

      <Button
        type="submit"
        className={`w-full max-w-[448px] h-[48px] text-sm font-bold rounded-[6px] transition-all shadow-lg uppercase tracking-wider ${
          isValid && !isValidating && !isPending
            ? "bg-white text-slate-900 hover:bg-white/90"
            : "bg-[#1A73FF] text-white opacity-50"
        }`}
        disabled={!isValid || isValidating || isPending}
      >
        {isPending ? <CgSpinner className="animate-spin h-5 w-5" /> : "Entrar"}
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
