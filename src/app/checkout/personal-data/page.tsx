"use client";

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

import { Footer } from "@/app/landing/components/Footer";

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
    <div className="min-h-screen bg-[#000B12] font-sans relative overflow-hidden">
      <div className="fixed inset-0 bg-landing-gradient opacity-40 pointer-events-none" />

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24 relative z-10">
        <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/10 p-8 md:p-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-14">
            <div>
              <h1 className="text-5xl font-black text-white uppercase tracking-tight mb-2">Dados Pessoais</h1>
              <p className="text-base font-bold text-slate-500 uppercase tracking-widest">Preencha suas informações para continuar</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 shadow-xl">
                <Lock className="w-4 h-4 text-sky-400" />
                <div className="flex flex-col leading-none">
                  <span className="text-[13px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Privacidade</span>
                  <span className="text-[14px] font-bold text-white uppercase">Protegida</span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 shadow-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div className="flex flex-col leading-none">
                  <span className="text-[13px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Checkout</span>
                  <span className="text-[14px] font-bold text-white uppercase">Seguro</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="space-y-3">
              <Label className="text-[14px] font-black text-slate-400 uppercase tracking-wider ml-1">Razão Social / Nome Fantasia <span className="text-rose-500">*</span></Label>
              <Input id="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="Nome da sua empresa" className="h-14 border-white/10 bg-white/5 rounded-2xl focus:ring-sky-500/50 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all outline-none" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-1">
                <Label className="text-[14px] font-black text-slate-400 uppercase tracking-wider">CPF / CNPJ <span className="text-rose-500">*</span></Label>

              </div>
              <Input id="vatNumber" value={formData.vatNumber} onChange={handleInputChange} placeholder="000.000.000-00" className="h-14 border-white/10 bg-white/5 rounded-2xl focus:ring-sky-500/50 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all outline-none" />
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4 space-y-3">
                <Label className="text-[14px] font-black text-slate-400 uppercase tracking-wider ml-1">Saudação</Label>
                <Select value={formData.salutation} onValueChange={(v) => handleSelectChange("salutation", v)}>
                  <SelectTrigger className="h-14 border-white/10 bg-white/5 rounded-2xl text-white focus:ring-sky-500/50 transition-all outline-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white rounded-2xl">
                    <SelectItem value="Mr" className="focus:bg-white/5 focus:text-white cursor-pointer">Sr.</SelectItem>
                    <SelectItem value="Ms" className="focus:bg-white/5 focus:text-white cursor-pointer">Sra.</SelectItem>
                    <SelectItem value="Mrs" className="focus:bg-white/5 focus:text-white cursor-pointer">Srta.</SelectItem>
                    <SelectItem value="Dr" className="focus:bg-white/5 focus:text-white cursor-pointer">Dr.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-8 space-y-3">
                <Label className="text-[14px] font-black text-slate-400 uppercase tracking-wider ml-1">Nome <span className="text-rose-500">*</span></Label>
                <Input id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Seu primeiro nome" className="h-14 border-white/10 bg-white/5 rounded-2xl focus:ring-sky-500/50 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all outline-none" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[14px] font-black text-slate-400 uppercase tracking-wider ml-1">Sobrenome <span className="text-rose-500">*</span></Label>
              <Input id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Seu sobrenome" className="h-14 border-white/10 bg-white/5 rounded-2xl focus:ring-sky-500/50 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all outline-none" />
            </div>
            <div className="md:col-span-2 space-y-3">
              <Label className="text-[14px] font-black text-slate-400 uppercase tracking-wider ml-1">Endereço <span className="text-rose-500">*</span></Label>
              <Input id="address" value={formData.address} onChange={handleInputChange} placeholder="Digite seu endereço completo" className="h-14 border-white/10 bg-white/5 rounded-2xl focus:ring-sky-500/50 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all outline-none w-full" />
            </div>
            <div className="space-y-3">
              <Label className="text-[14px] font-black text-slate-400 uppercase tracking-wider ml-1">Cidade <span className="text-rose-500">*</span></Label>
              <Input id="city" value={formData.city} onChange={handleInputChange} placeholder="Sua cidade" className="h-14 border-white/10 bg-white/5 rounded-2xl focus:ring-sky-500/50 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all outline-none" />
            </div>
            <div className="space-y-3">
              <Label className="text-[14px] font-black text-slate-400 uppercase tracking-wider ml-1">CEP <span className="text-rose-500">*</span></Label>
              <Input id="postcode" value={formData.postcode} onChange={handleInputChange} placeholder="00000-000" className="h-14 border-white/10 bg-white/5 rounded-2xl focus:ring-sky-500/50 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all outline-none" />
            </div>
            <div className="space-y-3">
              <Label className="text-[14px] font-black text-slate-400 uppercase tracking-wider ml-1">País <span className="text-rose-500">*</span></Label>
              <Select value={formData.country} onValueChange={(v) => handleSelectChange("country", v)}>
                <SelectTrigger className="h-14 border-white/10 bg-white/5 rounded-2xl text-white focus:ring-sky-500/50 transition-all outline-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#000B12] border-white/10 text-white rounded-2xl">
                  <SelectItem value="Brazil" className="focus:bg-white/5 focus:text-white cursor-pointer">Brasil</SelectItem>
                  <SelectItem value="Portugal" className="focus:bg-white/5 focus:text-white cursor-pointer">Portugal</SelectItem>
                  <SelectItem value="USA" className="focus:bg-white/5 focus:text-white cursor-pointer">EUA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[14px] font-black text-slate-400 uppercase tracking-wider ml-1">Estado <span className="text-rose-500">*</span></Label>
              <Input id="state" value={formData.state} onChange={handleInputChange} placeholder="Digite seu estado" className="h-14 border-white/10 bg-white/5 rounded-2xl focus:ring-sky-500/50 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all outline-none" />
            </div>
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2 ml-1">
                <Label className="text-[14px] font-black text-slate-400 uppercase tracking-wider">Telefone <span className="text-rose-500">*</span></Label>

              </div>
              <Input id="telephone" value={formData.telephone} onChange={handleInputChange} placeholder="(00) 00000-0000" className="h-14 border-white/10 bg-white/5 rounded-2xl focus:ring-sky-500/50 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all outline-none" />
            </div>
            <div className="space-y-3">
              <Label className="text-[14px] font-black text-slate-400 uppercase tracking-wider ml-1">E-mail <span className="text-rose-500">*</span></Label>
              <Input id="email" value={formData.email} onChange={handleInputChange} placeholder="seu@email.com" className="h-14 border-white/10 bg-white/5 rounded-2xl focus:ring-sky-500/50 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all outline-none" />
            </div>
            <div className="space-y-3">
              <Label className="text-[14px] font-black text-slate-400 uppercase tracking-wider ml-1">Confirmar E-mail <span className="text-rose-500">*</span></Label>
              <Input id="confirmEmail" value={formData.confirmEmail} onChange={handleInputChange} placeholder="Repita seu e-mail" className="h-14 border-white/10 bg-white/5 rounded-2xl focus:ring-sky-500/50 text-white placeholder:text-slate-600 focus:border-sky-500/50 transition-all outline-none" />
            </div>
          </div>
          <div className="flex justify-end mt-16">
            <Button 
              disabled={isPending || !isFormValid} 
              onClick={handleNext} 
              className="bg-sky-500 hover:bg-sky-600 text-white font-black h-16 px-16 rounded-[2rem] text-lg shadow-xl shadow-sky-500/20 disabled:opacity-50 uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
            >
              {isPending ? "Processando..." : "Próximo"}
            </Button>
          </div>
          <div className="mt-16 pt-10 border-t border-white/5 text-center">
            <p className="text-[14px] font-black text-slate-500 uppercase tracking-widest leading-relaxed max-w-3xl mx-auto opacity-80">
              Sua privacidade é importante para nós. Processamos seus dados pessoais com a finalidade de criar uma conta de usuário e realizar seu pedido. Tomamos as mais altas precauções para garantir que seus dados estejam seguros e protegidos. Nunca venderemos seus dados a terceiros.
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#000B12] flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin shadow-[0_0_15px_rgba(14,165,233,0.3)]" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Carregando checkout...</p>
        </div>
      </div>
    }>
      <PersonalDataForm />
    </Suspense>
  );
}
