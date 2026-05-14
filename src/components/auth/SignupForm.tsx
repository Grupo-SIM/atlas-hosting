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

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function SignupForm({
  referrer,
  redirect,
}: { referrer?: Pick<User, "name" | "email" | "id">; redirect?: string }) {
  const [userType, setUserType] = useState<"PF" | "PJ">("PF");
  
  const { register, handleSubmit, control, setValue, watch, ...methods } =
    useForm<SignupFormInputs>({
      resolver: zodResolver(schema),
      mode: "onChange",
      reValidateMode: "onChange",
      defaultValues: {
        userType: "PF",
      }
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
        referrerId: referrer?.id,
        ref
      };

      const result = await signup(
        { status: "idle", message: "" },
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
    } else {
      return digits
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value, userType);
    setValue("document", formatted, { shouldValidate: true });
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex flex-col items-start gap-1 w-full max-w-[448px] h-[72px]">
          <Label htmlFor="userType" className="text-white font-medium ml-1">Tipo de Conta</Label>
          <Select 
            onValueChange={(val: "PF" | "PJ") => handleUserTypeChange(val)} 
            defaultValue="PF"
          >
            <SelectTrigger id="userType" className="w-full h-11 bg-white/80 border-none text-slate-900 rounded-md focus:ring-sky-500/50 font-medium">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent className="bg-white border-none text-slate-900">
              <SelectItem value="PF">Pessoa Física (CPF)</SelectItem>
              <SelectItem value="PJ">Pessoa Jurídica (CNPJ)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col items-start gap-1 w-full max-w-[448px] min-h-[72px] h-auto">
          <Label htmlFor="document" className="text-white font-medium ml-1">
            {userType === "PF" ? "CPF" : "CNPJ"}
          </Label>
          <Input
            id="document"
            type="text"
            placeholder={userType === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
            className="h-11 bg-white/80 border-none text-slate-900 placeholder:text-slate-500 rounded-md focus-visible:ring-sky-500/50 focus-visible:bg-white transition-all font-medium"
            {...register("document")}
            onChange={handleDocumentChange}
          />
          {errors.document && (
            <p className="text-xs font-medium text-red-400 ml-1 mt-1">{errors.document.message}</p>
          )}
        </div>

        <div className="flex flex-col items-start gap-1 w-full max-w-[448px] min-h-[72px] h-auto">
          <Label htmlFor="email" className="text-white font-medium ml-1">E-mail</Label>
          <Input
            type="email"
            placeholder="Digite seu e-mail"
            autoComplete="email"
            className="h-11 bg-white/80 border-none text-slate-900 placeholder:text-slate-500 rounded-md focus-visible:ring-sky-500/50 focus-visible:bg-white transition-all font-medium"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs font-medium text-red-400 ml-1 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col items-start gap-1 w-full max-w-[448px] min-h-[72px] h-auto">
          <Label htmlFor="password" className="text-white font-medium ml-1">Senha</Label>
          <Input
            type="password"
            placeholder="Digite sua senha"
            autoComplete="new-password"
            className="h-11 bg-white/80 border-none text-slate-900 placeholder:text-slate-500 rounded-md focus-visible:ring-sky-500/50 focus-visible:bg-white transition-all font-medium"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs font-medium text-red-400 ml-1 mt-1">{errors.password.message}</p>
          )}
        </div>

        {formError && <p className="text-xs text-red-400 ml-1">{formError}</p>}

        <Button
          type="submit"
          className="w-full max-w-[448px] h-[48px] text-sm font-bold text-white rounded-[6px] transition-all shadow-lg uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
          disabled={!isValid || isValidating || isLoading}
        >
          {isLoading ? (
            <CgSpinner className="h-6 w-6 animate-spin" />
          ) : (
            "Cadastrar"
          )}
        </Button>
      </form>
    </>
  );
}

const schema = z.object({
  userType: z.enum(["PF", "PJ"]),
  document: z.string().min(11, "Documento inválido").max(18, "Documento inválido"),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Digite um e-mail válido"),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(100, "A senha deve ter no máximo 100 caracteres"),
});

export type SignupFormInputs = z.infer<typeof schema> & {
  referrerId?: string;
  ref?: string;
};
