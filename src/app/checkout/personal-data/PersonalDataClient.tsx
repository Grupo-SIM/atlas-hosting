"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
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
import { ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/app/landing/components/Navbar";

import { useSearchParams, useRouter } from "next/navigation";
import { createVpsInvoice } from "@/app/actions";
import { toast } from "sonner";
import { Suspense } from "react";

function PersonalDataForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    vatNumber: "",
    salutation: "Mr",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postcode: "",
    country: "Brazil",
    state: "",
    telephone: "",
    email: "",
    confirmEmail: "",
  });

  const planId = searchParams.get("planId") || "10";
  const vpsConfig = {
    qty: searchParams.get("qty") || "1",
    duration: searchParams.get("duration") || "1",
    location: searchParams.get("location") || "eu",
    storage: searchParams.get("storage") || "ssd-150",
    image: searchParams.get("image") || "ubuntu",
    backup: searchParams.get("backup") || "false",
    management: searchParams.get("management") || "unmanaged",
    ubuntuVersion: searchParams.get("ubuntuVersion"),
    windowsVersion: searchParams.get("windowsVersion"),
    rhelVersion: searchParams.get("rhelVersion"),
    debianVersion: searchParams.get("debianVersion"),
    pleskLicence: searchParams.get("pleskLicence"),
    cpanelLicence: searchParams.get("cpanelLicence"),
    cpanelVersion: searchParams.get("cpanelVersion"),
    pleskWinLicence: searchParams.get("pleskWinLicence"),
    pleskWinVersion: searchParams.get("pleskWinVersion"),
    webminVersion: searchParams.get("webminVersion"),
    lampVersion: searchParams.get("lampVersion"),
    dockerVersion: searchParams.get("dockerVersion"),
    monitoring: searchParams.get("monitoring"),
    privateNetwork: searchParams.get("privateNetwork"),
    ipv4Address: searchParams.get("ipv4Address"),
    objectStorage: searchParams.get("objectStorage"),
    customImageOption: searchParams.get("customImageOption"),
    password: searchParams.get("password"),
    storageUpgrades: searchParams.get("storageUpgrades") ? JSON.parse(searchParams.get("storageUpgrades")!) : undefined,
    type: searchParams.get("type") || "vps",
  };

  const maskCpfCnpj = (value: string) => {
    const raw = value.replace(/\D/g, "");
    if (raw.length <= 11) {
      return raw
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      return raw
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
  };

  const maskPhone = (value: string) => {
    const raw = value.replace(/\D/g, "");
    if (raw.length <= 10) {
      return raw
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      return raw
        .slice(0, 11)
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
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
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address) {
      toast.error("Por favor, preencha os campos obrigatórios.");
      return;
    }
    setIsPending(true);
    try {
      const result = await createVpsInvoice({
        planId,
        config: vpsConfig,
        guestInfo: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          document: formData.vatNumber,
          phoneNumber: formData.telephone,
          address: {
            street: formData.address,
            number: "SN",
            neighborhood: "Centro",
            city: formData.city,
            state: formData.state || "SP",
            zipCode: formData.postcode,
          },
        },
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

  return (
    <div className="min-h-screen bg-[#000B12] text-white font-sans pb-24 relative overflow-hidden">
      <div className="fixed inset-0 bg-landing-gradient opacity-40 pointer-events-none" />
      <Navbar variant="dark" />

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24 relative z-10">
        <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Dados Pessoais</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
                <Lock className="w-4 h-4 text-sky-400" />
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Privacidade</span>
                  <span className="text-[11px] font-bold text-white uppercase tracking-tight">Protegida</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Checkout</span>
                  <span className="text-[11px] font-bold text-white uppercase tracking-tight">Seguro</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Razão Social / Nome Fantasia <span className="text-sky-500">*</span></Label>
              <Input id="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="Nome da sua empresa" className="h-12 border-white/10 bg-white/5 rounded-xl focus:ring-sky-500 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">CPF / CNPJ <span className="text-sky-500">*</span></Label>
              </div>
              <Input id="vatNumber" value={formData.vatNumber} onChange={handleInputChange} placeholder="Digite seu CPF ou CNPJ" className="h-12 border-white/10 bg-white/5 rounded-xl focus:ring-sky-500 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all" />
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4 space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Saudação</Label>
                <Select value={formData.salutation} onValueChange={(v) => handleSelectChange("salutation", v)}>
                  <SelectTrigger className="h-12 border-white/10 bg-white/5 rounded-xl text-white focus:ring-sky-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white">
                    <SelectItem value="Mr" className="focus:bg-white/10 focus:text-white">Sr.</SelectItem>
                    <SelectItem value="Ms" className="focus:bg-white/10 focus:text-white">Sra.</SelectItem>
                    <SelectItem value="Mrs" className="focus:bg-white/10 focus:text-white">Srta.</SelectItem>
                    <SelectItem value="Dr" className="focus:bg-white/10 focus:text-white">Dr.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-8 space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Nome <span className="text-sky-500">*</span></Label>
                <Input id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Seu primeiro nome" className="h-12 border-white/10 bg-white/5 rounded-xl focus:ring-sky-500 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Sobrenome <span className="text-sky-500">*</span></Label>
              <Input id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Seu sobrenome" className="h-12 border-white/10 bg-white/5 rounded-xl focus:ring-sky-500 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all" />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Endereço <span className="text-sky-500">*</span></Label>
              <Input id="address" value={formData.address} onChange={handleInputChange} placeholder="Digite seu endereço completo" className="h-12 border-white/10 bg-white/5 rounded-xl focus:ring-sky-500 w-full text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all" />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Cidade <span className="text-sky-500">*</span></Label>
              <Input id="city" value={formData.city} onChange={handleInputChange} placeholder="Sua cidade" className="h-12 border-white/10 bg-white/5 rounded-xl focus:ring-sky-500 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all" />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">CEP <span className="text-sky-500">*</span></Label>
              <Input id="postcode" value={formData.postcode} onChange={handleInputChange} placeholder="00000-000" className="h-12 border-white/10 bg-white/5 rounded-xl focus:ring-sky-500 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all" />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">País <span className="text-sky-500">*</span></Label>
              <Select value={formData.country} onValueChange={(v) => handleSelectChange("country", v)}>
                <SelectTrigger className="h-12 border-white/10 bg-white/5 rounded-xl text-white focus:ring-sky-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#000B12] border-white/10 text-white">
                  <SelectItem value="Brazil" className="focus:bg-white/10 focus:text-white">Brasil</SelectItem>
                  <SelectItem value="Portugal" className="focus:bg-white/10 focus:text-white">Portugal</SelectItem>
                  <SelectItem value="USA" className="focus:bg-white/10 focus:text-white">EUA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Estado <span className="text-sky-500">*</span></Label>
              <Input id="state" value={formData.state} onChange={handleInputChange} placeholder="Digite seu estado" className="h-12 border-white/10 bg-white/5 rounded-xl focus:ring-sky-500 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all" />
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-1">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Telefone <span className="text-sky-500">*</span></Label>
              </div>
              <Input id="telephone" value={formData.telephone} onChange={handleInputChange} placeholder="(00) 00000-0000" className="h-12 border-white/10 bg-white/5 rounded-xl focus:ring-sky-500 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all" />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">E-mail <span className="text-sky-500">*</span></Label>
              <Input id="email" value={formData.email} onChange={handleInputChange} placeholder="seu@email.com" className="h-12 border-white/10 bg-white/5 rounded-xl focus:ring-sky-500 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all" />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Confirmar E-mail <span className="text-sky-500">*</span></Label>
              <Input id="confirmEmail" value={formData.confirmEmail} onChange={handleInputChange} placeholder="Repita seu e-mail" className="h-12 border-white/10 bg-white/5 rounded-xl focus:ring-sky-500 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all" />
            </div>
          </div>

          <div className="flex justify-end mt-12">
            <Button
              disabled={isPending || !isFormValid}
              onClick={handleNext}
              className="bg-sky-500 hover:bg-sky-600 text-white font-black h-14 px-16 rounded-2xl text-base uppercase tracking-widest transition-all shadow-lg shadow-sky-500/20 disabled:opacity-30"
            >
              {isPending ? "Processando..." : "Próximo Passo"}
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-3xl mx-auto font-medium">
              Sua privacidade é importante para nós. Processamos seus dados pessoais com a finalidade de criar uma conta de usuário e realizar seu pedido. Tomamos as mais altas precauções para garantir que seus dados estejam seguros e protegidos. Nunca venderemos seus dados a terceiros.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PersonalDataPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#000B12] flex items-center justify-center font-sans relative overflow-hidden">
        <div className="fixed inset-0 bg-landing-gradient opacity-40 pointer-events-none" />
        <div className="animate-pulse flex flex-col items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-sky-500 animate-spin shadow-2xl shadow-sky-500/20" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Preparando Ambiente...</p>
        </div>
      </div>
    }>
      <PersonalDataForm />
    </Suspense>
  );
}
