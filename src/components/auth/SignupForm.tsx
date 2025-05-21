"use client";

import { signup } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useForm, useFormState } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import { FaGithub, FaGoogle } from "react-icons/fa6";
import * as yup from "yup";

export default function SignupForm() {
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
  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const data = methods.getValues();

      setFormError(null);

      startTransition(() => {
        doSignup(data);
      });
    },
    [doSignup, methods]
  );

  useEffect(() => {
    if (actionState.status === "success") {
      router.push("/");
    } else if (actionState.status === "error") {
      setFormError(actionState.message ?? "Erro ao criar conta");
    }
  }, [actionState.message, actionState.status, router]);

  return (
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
        className="w-full mt-2 flex items-center justify-center"
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

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          type="button"
          className="flex items-center justify-center gap-2"
        >
          <FaGithub className="h-4 w-4" />
          GitHub
        </Button>
        <Button
          variant="outline"
          type="button"
          className="flex items-center justify-center gap-2"
        >
          <FaGoogle className="h-4 w-4" />
          Google
        </Button>
      </div>
    </form>
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

export type SignupFormInputs = yup.InferType<typeof schema>;
