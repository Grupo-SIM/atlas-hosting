"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import { z } from "zod";
import { signup } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/db/schema";
// import GithubAuthButton from "./GithubAuthButton";
// import GoogleAuthButton from "./GoogleAuthButton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SignupForm({
  referrer,
  redirect,
}: {
  referrer?: Pick<User, "name" | "email" | "id">;
  redirect?: string;
}) {
  const [userType, setUserType] = useState<"PF" | "PJ">("PF");

  const { register, handleSubmit, control, setValue, watch, ...methods } =
    useForm<SignupFormInputs>({
      defaultValues: {
        userType: "PF",
      },
      mode: "onChange",
      resolver: zodResolver(schema),
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
      const cookies = document.cookie.split("; ");
      const refCookie = cookies.find(row => row.startsWith("referrer_code="));
      const ref = refCookie ? refCookie.split("=")[1] : undefined;

      // Adaptar campos removidos para o backend (usando email como nome/org temporário se necessário)
      const signupData = {
        ...data,
        firstName: data.email.split("@")[0],
        lastName: userType === "PF" ? "Pessoa Física" : "Pessoa Jurídica",
        organizationName: data.document,
        ref,
        referrerId: referrer?.id,
      };

      const result = await signup(
        { message: "", status: "idle" },
        signupData as any
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

  const handleUserTypeChange = (val: "PF" | "PJ") => {
    setUserType(val);
    setValue("userType", val);
    setValue("document", ""); // Clear document on type change
  };

  const formatDocument = (value: string, type: "PF" | "PJ") => {
    const digits = value.replace(/\D/g, "");
    if (type === "PF") {
      return digits
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return digits
      .slice(0, 14)
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value, userType);
    setValue("document", formatted, { shouldValidate: true });
  };

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="flex h-[72px] w-full max-w-[448px] flex-col items-start gap-1">
        <Label className="ml-1 font-medium text-white" htmlFor="userType">
          Tipo de Conta
        </Label>
        <Select
          defaultValue="PF"
          onValueChange={(val: "PF" | "PJ") => handleUserTypeChange(val)}
        >
          <SelectTrigger
            className="h-11 w-full rounded-md border-none bg-white/80 font-medium text-slate-900 focus:ring-sky-500/50"
            id="userType"
          >
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent className="border-none bg-white text-slate-900">
            <SelectItem value="PF">Pessoa Física (CPF)</SelectItem>
            <SelectItem value="PJ">Pessoa Jurídica (CNPJ)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex h-auto min-h-[72px] w-full max-w-[448px] flex-col items-start gap-1">
        <Label className="ml-1 font-medium text-white" htmlFor="document">
          {userType === "PF" ? "CPF" : "CNPJ"}
        </Label>
        <Input
          className="h-11 rounded-md border-none bg-white/80 font-medium text-slate-900 transition-all placeholder:text-slate-500 focus-visible:bg-white focus-visible:ring-sky-500/50"
          id="document"
          placeholder={
            userType === "PF" ? "000.000.000-00" : "00.000.000/0000-00"
          }
          type="text"
          {...register("document")}
          onChange={handleDocumentChange}
        />
        {errors.document && (
          <p className="mt-1 ml-1 font-medium text-red-400 text-xs">
            {errors.document.message}
          </p>
        )}
      </div>

      <div className="flex h-auto min-h-[72px] w-full max-w-[448px] flex-col items-start gap-1">
        <Label className="ml-1 font-medium text-white" htmlFor="email">
          E-mail
        </Label>
        <Input
          autoComplete="email"
          className="h-11 rounded-md border-none bg-white/80 font-medium text-slate-900 transition-all placeholder:text-slate-500 focus-visible:bg-white focus-visible:ring-sky-500/50"
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
        <Label className="ml-1 font-medium text-white" htmlFor="password">
          Senha
        </Label>
        <Input
          autoComplete="new-password"
          className="h-11 rounded-md border-none bg-white/80 font-medium text-slate-900 transition-all placeholder:text-slate-500 focus-visible:bg-white focus-visible:ring-sky-500/50"
          placeholder="Digite sua senha"
          type="password"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 ml-1 font-medium text-red-400 text-xs">
            {errors.password.message}
          </p>
        )}
      </div>

      {formError && <p className="ml-1 text-red-400 text-xs">{formError}</p>}

      <Button
        className="h-[48px] w-full max-w-[448px] rounded-[6px] bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-sm text-white uppercase tracking-wider shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
        disabled={!isValid || isValidating || isLoading}
        type="submit"
      >
        {isLoading ? (
          <CgSpinner className="h-6 w-6 animate-spin" />
        ) : (
          "Cadastrar"
        )}
      </Button>
    </form>
  );
}

const schema = z.object({
  document: z
    .string()
    .min(11, "Documento inválido")
    .max(18, "Documento inválido"),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Digite um e-mail válido"),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(100, "A senha deve ter no máximo 100 caracteres"),
  userType: z.enum(["PF", "PJ"]),
});

export type SignupFormInputs = z.infer<typeof schema> & {
  referrerId?: string;
  ref?: string;
};
