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
import { Navbar } from "@/app/landing/components/Navbar";

import { useSearchParams, useRouter } from "next/navigation";
import { createVpsInvoice } from "@/app/actions";
import { toast } from "sonner";

export default function PersonalDataPage() {
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
      // CPF: 000.000.000-00
      return raw
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      // CNPJ: 00.000.000/0000-00
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
    
    if (id === "vatNumber") {
      finalValue = maskCpfCnpj(value);
    } else if (id === "telephone") {
      finalValue = maskPhone(value);
    } else if (id === "postcode") {
      finalValue = maskCep(value);
    }
    
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
            number: "SN", // Default since not in UI
            neighborhood: "Centro", // Default since not in UI
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
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar variant="light" />

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <h1 className="text-3xl font-bold text-slate-800">Dados Pessoais</h1>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
                <Lock className="w-4 h-4 text-slate-400" />
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Privacidade</span>
                  <span className="text-[11px] font-medium text-slate-700">Protegida</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Checkout</span>
                  <span className="text-[11px] font-medium text-slate-700">Seguro</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-600">Razão Social / Nome Fantasia <span className="text-red-500">*</span></Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Nome da sua empresa"
                className="h-12 border-slate-200 bg-white rounded-lg focus:ring-sky-500"
              />
            </div>

            {/* VAT Number */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label className="text-sm font-semibold text-slate-600">CPF / CNPJ <span className="text-red-500">*</span></Label>
                <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 cursor-help font-bold">?</div>
              </div>
              <Input
                id="vatNumber"
                value={formData.vatNumber}
                onChange={handleInputChange}
                placeholder="Digite seu CPF ou CNPJ"
                className="h-12 border-slate-200 bg-white rounded-lg focus:ring-sky-500"
              />
            </div>

            {/* Salutation & First Name */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3 space-y-2">
                <Label className="text-sm font-semibold text-slate-600">Saudação</Label>
                <Select
                  value={formData.salutation}
                  onValueChange={(v) => handleSelectChange("salutation", v)}
                >
                  <SelectTrigger className="h-12 border-slate-200 bg-white rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Sr.</SelectItem>
                    <SelectItem value="Ms">Sra.</SelectItem>
                    <SelectItem value="Mrs">Srta.</SelectItem>
                    <SelectItem value="Dr">Dr.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-9 space-y-2">
                <Label className="text-sm font-semibold text-slate-600">Nome <span className="text-red-500">*</span></Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Seu primeiro nome"
                  className="h-12 border-slate-200 bg-white rounded-lg focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-600">Sobrenome <span className="text-red-500">*</span></Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Seu sobrenome"
                className="h-12 border-slate-200 bg-white rounded-lg focus:ring-sky-500"
              />
            </div>

            {/* Address (Full Width) */}
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-semibold text-slate-600">Endereço <span className="text-red-500">*</span></Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Digite seu endereço completo"
                className="h-12 border-slate-200 bg-white rounded-lg focus:ring-sky-500 w-full"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-600">Cidade <span className="text-red-500">*</span></Label>
              <Input
                id="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Sua cidade"
                className="h-12 border-slate-200 bg-white rounded-lg focus:ring-sky-500"
              />
            </div>

            {/* Postcode */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-600">CEP <span className="text-red-500">*</span></Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={handleInputChange}
                placeholder="00000-000"
                className="h-12 border-slate-200 bg-white rounded-lg focus:ring-sky-500"
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-600">País <span className="text-red-500">*</span></Label>
              <Select
                value={formData.country}
                onValueChange={(v) => handleSelectChange("country", v)}
              >
                <SelectTrigger className="h-12 border-slate-200 bg-white rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brazil">Brasil</SelectItem>
                  <SelectItem value="Portugal">Portugal</SelectItem>
                  <SelectItem value="USA">EUA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-600">Estado <span className="text-red-500">*</span></Label>
              <Input
                id="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Digite seu estado"
                className="h-12 border-slate-200 bg-white rounded-lg focus:ring-sky-500"
              />
            </div>

            {/* Telephone */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-1">
                <Label className="text-sm font-semibold text-slate-600">Telefone <span className="text-red-500">*</span></Label>
                <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 cursor-help font-bold">?</div>
              </div>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
                className="h-12 border-slate-200 bg-white rounded-lg focus:ring-sky-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-600">E-mail <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="h-12 border-slate-200 bg-white rounded-lg focus:ring-sky-500"
              />
            </div>

            {/* Confirm Email */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-600">Confirmar E-mail <span className="text-red-500">*</span></Label>
              <Input
                id="confirmEmail"
                value={formData.confirmEmail}
                onChange={handleInputChange}
                placeholder="Repita seu e-mail"
                className="h-12 border-slate-200 bg-white rounded-lg focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end mt-12">
            <Button
              disabled={isPending || !isFormValid}
              onClick={handleNext}
              className="bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold h-12 px-12 rounded-full text-base disabled:opacity-50"
            >
              {isPending ? "Processando..." : "Próximo"}
            </Button>
          </div>

          {/* Privacy Footer */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-3xl mx-auto">
              Sua privacidade é importante para nós. Processamos seus dados pessoais com a finalidade de criar uma conta de usuário e realizar seu pedido de acordo com nosso <Link href="/privacy" className="text-sky-500 hover:underline">aviso de privacidade</Link>. Tomamos as mais altas precauções para garantir que seus dados estejam seguros e protegidos. Nunca venderemos seus dados a terceiros.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
