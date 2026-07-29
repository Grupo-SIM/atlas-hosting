"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { createVpsInvoice } from "@/app/actions";

import { Footer } from "@/app/landing/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOptionalUser } from "@/lib/auth";

function PersonalDataForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  // null = ainda checando sessão; true = logado (pula o form); false = visitante (mostra o form)
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    address: "",
    businessName: "",
    city: "",
    confirmEmail: "",
    country: "Brazil",
    email: "",
    firstName: "",
    lastName: "",
    postcode: "",
    salutation: "Mr",
    state: "",
    telephone: "",
    vatNumber: "",
  });

  const planId = searchParams.get("planId") || "10";
  const vpsConfig = {
    backup: searchParams.get("backup") || "false",
    cpanelLicence: searchParams.get("cpanelLicence"),
    cpanelVersion: searchParams.get("cpanelVersion"),
    customImageOption: searchParams.get("customImageOption"),
    customLinkAllowBoleto:
      searchParams.get("customLinkAllowBoleto") || undefined,
    customLinkAllowPix: searchParams.get("customLinkAllowPix") || undefined,
    // Admin-generated payment link (arbitrary period + admin-typed price) — see /pay/[linkId]
    customLinkAmountBrl: searchParams.get("customLinkAmountBrl") || undefined,
    debianVersion: searchParams.get("debianVersion"),
    dockerVersion: searchParams.get("dockerVersion"),
    duration: searchParams.get("duration") || "1",
    image: searchParams.get("image") || "ubuntu",
    ipv4Address: searchParams.get("ipv4Address"),
    lampVersion: searchParams.get("lampVersion"),
    location: searchParams.get("location") || "eu",
    management: searchParams.get("management") || "unmanaged",
    monitoring: searchParams.get("monitoring"),
    objectStorage: searchParams.get("objectStorage"),
    password: searchParams.get("password"),
    paymentLinkId: searchParams.get("paymentLinkId") || undefined,
    pleskLicence: searchParams.get("pleskLicence"),
    pleskWinLicence: searchParams.get("pleskWinLicence"),
    pleskWinVersion: searchParams.get("pleskWinVersion"),
    privateNetwork: searchParams.get("privateNetwork"),
    qty: searchParams.get("qty") || "1",
    rhelVersion: searchParams.get("rhelVersion"),
    storage: searchParams.get("storage") || "ssd-150",
    storageUpgrades: searchParams.get("storageUpgrades")
      ? JSON.parse(searchParams.get("storageUpgrades")!)
      : undefined,
    type: searchParams.get("type") || "vps",
    ubuntuVersion: searchParams.get("ubuntuVersion"),
    webminVersion: searchParams.get("webminVersion"),
    windowsVersion: searchParams.get("windowsVersion"),
  };

  // Cliente já logado não precisa preencher dados pessoais de novo — cria a
  // fatura direto com a conta atual e pula pro checkout.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await getOptionalUser().catch(() => null);
      if (cancelled) return;
      if (!user) {
        setIsAuthed(false);
        return;
      }
      setIsAuthed(true);
      try {
        const result = await createVpsInvoice({ config: vpsConfig, planId });
        if (cancelled) return;
        if (result.status === "success") {
          // replace (não push): visita automática, não deve virar um passo no
          // histórico — senão "Voltar" no checkout cai aqui de novo e cria outra fatura.
          router.replace(result.redirectUrl as string);
        } else {
          toast.error(result.message);
          setIsAuthed(false);
        }
      } catch {
        if (!cancelled) {
          toast.error("Erro ao processar o pedido.");
          setIsAuthed(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maskCpfCnpj = (value: string) => {
    const raw = value.replace(/\D/g, "");
    if (raw.length <= 11) {
      return raw
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return raw
      .slice(0, 14)
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  const maskPhone = (value: string) => {
    const raw = value.replace(/\D/g, "");
    if (raw.length <= 10) {
      return raw
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return raw
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  const maskCep = (value: string) => {
    const raw = value.replace(/\D/g, "");
    return raw.slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let finalValue = value;
    if (id === "vatNumber") finalValue = maskCpfCnpj(value);
    else if (id === "telephone") finalValue = maskPhone(value);
    else if (id === "postcode") finalValue = maskCep(value);
    setFormData(prev => ({ ...prev, [id]: finalValue }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const isFormValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.address.trim() !== "" &&
    formData.city.trim() !== "" &&
    formData.postcode.trim() !== "" &&
    formData.country.trim() !== "" &&
    formData.state.trim() !== "" &&
    formData.telephone.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.confirmEmail.trim() !== "" &&
    formData.email === formData.confirmEmail &&
    formData.vatNumber.trim() !== "" &&
    formData.businessName.trim() !== "";

  const handleNext = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.address
    ) {
      toast.error("Por favor, preencha os campos obrigatórios.");
      return;
    }
    setIsPending(true);
    try {
      const result = await createVpsInvoice({
        config: vpsConfig,
        guestInfo: {
          address: {
            city: formData.city,
            neighborhood: "Centro",
            number: "SN",
            state: formData.state || "SP",
            street: formData.address,
            zipCode: formData.postcode,
          },
          document: formData.vatNumber,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.telephone,
        },
        planId,
      });
      if (result.status === "success") {
        router.push(result.redirectUrl as string);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao processar o pedido.");
    } finally {
      setIsPending(false);
    }
  };

  if (isAuthed === null || isAuthed === true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#000B12] font-sans">
        <div className="flex animate-pulse flex-col items-center gap-6">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-sky-500/20 border-t-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.3)]" />
          <p className="font-black text-slate-400 text-sm uppercase tracking-widest">
            {isAuthed ? "Confirmando pedido..." : "Carregando checkout..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#000B12] font-sans">
      <div className="pointer-events-none fixed inset-0 bg-landing-gradient opacity-40" />

      <main className="relative z-10 mx-auto max-w-5xl px-6 pt-32 pb-24">
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md md:p-14">
          <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h1 className="mb-2 font-black text-5xl text-white uppercase tracking-tight">
                Dados Pessoais
              </h1>
              <p className="font-bold text-base text-slate-500 uppercase tracking-widest">
                Preencha suas informações para continuar
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 shadow-xl">
                <Lock className="h-4 w-4 text-sky-400" />
                <div className="flex flex-col leading-none">
                  <span className="mb-0.5 font-black text-[13px] text-slate-500 uppercase tracking-widest">
                    Privacidade
                  </span>
                  <span className="font-bold text-[14px] text-white uppercase">
                    Protegida
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 shadow-xl">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <div className="flex flex-col leading-none">
                  <span className="mb-0.5 font-black text-[13px] text-slate-500 uppercase tracking-widest">
                    Checkout
                  </span>
                  <span className="font-bold text-[14px] text-white uppercase">
                    Seguro
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="ml-1 font-black text-[14px] text-slate-400 uppercase tracking-wider">
                Razão Social / Nome Fantasia{" "}
                <span className="text-rose-500">*</span>
              </Label>
              <Input
                className="h-14 rounded-2xl border-white/10 bg-white/5 text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-sky-500/50"
                id="businessName"
                onChange={handleInputChange}
                placeholder="Nome da sua empresa"
                value={formData.businessName}
              />
            </div>
            <div className="space-y-3">
              <div className="ml-1 flex items-center gap-2">
                <Label className="font-black text-[14px] text-slate-400 uppercase tracking-wider">
                  CPF / CNPJ <span className="text-rose-500">*</span>
                </Label>
              </div>
              <Input
                className="h-14 rounded-2xl border-white/10 bg-white/5 text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-sky-500/50"
                id="vatNumber"
                onChange={handleInputChange}
                placeholder="000.000.000-00"
                value={formData.vatNumber}
              />
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4 space-y-3">
                <Label className="ml-1 font-black text-[14px] text-slate-400 uppercase tracking-wider">
                  Saudação
                </Label>
                <Select
                  onValueChange={v => handleSelectChange("salutation", v)}
                  value={formData.salutation}
                >
                  <SelectTrigger className="h-14 rounded-2xl border-white/10 bg-white/5 text-white outline-none transition-all focus:ring-sky-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/10 bg-[#000B12] text-white">
                    <SelectItem
                      className="cursor-pointer focus:bg-white/5 focus:text-white"
                      value="Mr"
                    >
                      Sr.
                    </SelectItem>
                    <SelectItem
                      className="cursor-pointer focus:bg-white/5 focus:text-white"
                      value="Ms"
                    >
                      Sra.
                    </SelectItem>
                    <SelectItem
                      className="cursor-pointer focus:bg-white/5 focus:text-white"
                      value="Mrs"
                    >
                      Srta.
                    </SelectItem>
                    <SelectItem
                      className="cursor-pointer focus:bg-white/5 focus:text-white"
                      value="Dr"
                    >
                      Dr.
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-8 space-y-3">
                <Label className="ml-1 font-black text-[14px] text-slate-400 uppercase tracking-wider">
                  Nome <span className="text-rose-500">*</span>
                </Label>
                <Input
                  className="h-14 rounded-2xl border-white/10 bg-white/5 text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-sky-500/50"
                  id="firstName"
                  onChange={handleInputChange}
                  placeholder="Seu primeiro nome"
                  value={formData.firstName}
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="ml-1 font-black text-[14px] text-slate-400 uppercase tracking-wider">
                Sobrenome <span className="text-rose-500">*</span>
              </Label>
              <Input
                className="h-14 rounded-2xl border-white/10 bg-white/5 text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-sky-500/50"
                id="lastName"
                onChange={handleInputChange}
                placeholder="Seu sobrenome"
                value={formData.lastName}
              />
            </div>
            <div className="space-y-3 md:col-span-2">
              <Label className="ml-1 font-black text-[14px] text-slate-400 uppercase tracking-wider">
                Endereço <span className="text-rose-500">*</span>
              </Label>
              <Input
                className="h-14 w-full rounded-2xl border-white/10 bg-white/5 text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-sky-500/50"
                id="address"
                onChange={handleInputChange}
                placeholder="Digite seu endereço completo"
                value={formData.address}
              />
            </div>
            <div className="space-y-3">
              <Label className="ml-1 font-black text-[14px] text-slate-400 uppercase tracking-wider">
                Cidade <span className="text-rose-500">*</span>
              </Label>
              <Input
                className="h-14 rounded-2xl border-white/10 bg-white/5 text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-sky-500/50"
                id="city"
                onChange={handleInputChange}
                placeholder="Sua cidade"
                value={formData.city}
              />
            </div>
            <div className="space-y-3">
              <Label className="ml-1 font-black text-[14px] text-slate-400 uppercase tracking-wider">
                CEP <span className="text-rose-500">*</span>
              </Label>
              <Input
                className="h-14 rounded-2xl border-white/10 bg-white/5 text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-sky-500/50"
                id="postcode"
                onChange={handleInputChange}
                placeholder="00000-000"
                value={formData.postcode}
              />
            </div>
            <div className="space-y-3">
              <Label className="ml-1 font-black text-[14px] text-slate-400 uppercase tracking-wider">
                País <span className="text-rose-500">*</span>
              </Label>
              <Select
                onValueChange={v => handleSelectChange("country", v)}
                value={formData.country}
              >
                <SelectTrigger className="h-14 rounded-2xl border-white/10 bg-white/5 text-white outline-none transition-all focus:ring-sky-500/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-[#000B12] text-white">
                  <SelectItem
                    className="cursor-pointer focus:bg-white/5 focus:text-white"
                    value="Brazil"
                  >
                    Brasil
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer focus:bg-white/5 focus:text-white"
                    value="Portugal"
                  >
                    Portugal
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer focus:bg-white/5 focus:text-white"
                    value="USA"
                  >
                    EUA
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="ml-1 font-black text-[14px] text-slate-400 uppercase tracking-wider">
                Estado <span className="text-rose-500">*</span>
              </Label>
              <Input
                className="h-14 rounded-2xl border-white/10 bg-white/5 text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-sky-500/50"
                id="state"
                onChange={handleInputChange}
                placeholder="Digite seu estado"
                value={formData.state}
              />
            </div>
            <div className="space-y-3 md:col-span-2">
              <div className="ml-1 flex items-center gap-2">
                <Label className="font-black text-[14px] text-slate-400 uppercase tracking-wider">
                  Telefone <span className="text-rose-500">*</span>
                </Label>
              </div>
              <Input
                className="h-14 rounded-2xl border-white/10 bg-white/5 text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-sky-500/50"
                id="telephone"
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
                value={formData.telephone}
              />
            </div>
            <div className="space-y-3">
              <Label className="ml-1 font-black text-[14px] text-slate-400 uppercase tracking-wider">
                E-mail <span className="text-rose-500">*</span>
              </Label>
              <Input
                className="h-14 rounded-2xl border-white/10 bg-white/5 text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-sky-500/50"
                id="email"
                onChange={handleInputChange}
                placeholder="seu@email.com"
                value={formData.email}
              />
            </div>
            <div className="space-y-3">
              <Label className="ml-1 font-black text-[14px] text-slate-400 uppercase tracking-wider">
                Confirmar E-mail <span className="text-rose-500">*</span>
              </Label>
              <Input
                className="h-14 rounded-2xl border-white/10 bg-white/5 text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-sky-500/50"
                id="confirmEmail"
                onChange={handleInputChange}
                placeholder="Repita seu e-mail"
                value={formData.confirmEmail}
              />
            </div>
          </div>
          <div className="mt-16 flex justify-end">
            <Button
              className="h-16 rounded-[2rem] bg-sky-500 px-16 font-black text-lg text-white uppercase tracking-widest shadow-sky-500/20 shadow-xl transition-all hover:scale-105 hover:bg-sky-600 active:scale-95 disabled:opacity-50"
              disabled={isPending || !isFormValid}
              onClick={handleNext}
            >
              {isPending ? "Processando..." : "Próximo"}
            </Button>
          </div>
          <div className="mt-16 border-white/5 border-t pt-10 text-center">
            <p className="mx-auto max-w-3xl font-black text-[14px] text-slate-500 uppercase leading-relaxed tracking-widest opacity-80">
              Sua privacidade é importante para nós. Processamos seus dados
              pessoais com a finalidade de criar uma conta de usuário e realizar
              seu pedido. Tomamos as mais altas precauções para garantir que
              seus dados estejam seguros e protegidos. Nunca venderemos seus
              dados a terceiros.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PersonalDataPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#000B12] font-sans">
          <div className="flex animate-pulse flex-col items-center gap-6">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-sky-500/20 border-t-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.3)]" />
            <p className="font-black text-slate-400 text-sm uppercase tracking-widest">
              Carregando checkout...
            </p>
          </div>
        </div>
      }
    >
      <PersonalDataForm />
    </Suspense>
  );
}
