"use client";

export const dynamic = "force-dynamic";

import { useState, useLayoutEffect, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  Globe,
  Server,
  ShieldCheck,
  Zap,
  HardDrive,
  Cpu,
  Database,
  Network,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  ArrowLeft,
  ChevronUp,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../../../landing/components/Navbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// Base rate for initial render (will be updated by API)
// Base rate for fallback if API fails
const FALLBACK_EUR_RATE = 11.72;

// Euro source values for software licensing
const getPlanImagePrices = (planId: string, defaultPrices: any) => {
  const base = {
    ...defaultPrices,
    cpanel: 25.88,
    pleskLinux: 14.28,
    pleskWin: 14.28,
    pleskPro: 22.61,
    pleskHost: 43.44
  };

  if (planId === "10") {
    return { ...base, windows: 5.65, win2016: 4.76 };
  }
  if (planId === "20") {
    return { ...base, windows: 8.93, win2016: 7.44 };
  }
  if (planId === "30") {
    return { ...base, windows: 18.45, win2016: 14.99 };
  }
  if (planId === "40") {
    return { ...base, windows: 30.94, win2016: 27.49 };
  }
  if (planId === "50") {
    return { ...base, windows: 58.31, win2016: 54.26 };
  }

  return base;
};

// Mock data for Storage VPS plans
const plansData: Record<string, any> = {
  "10": {
    name: "Storage VPS 10 (S)",
    vcpu: "2 núcleos de vCPU",
    ram: "4 GB RAM",
    storage: "300 GB SSD",
    snapshots: "0 Instantâneos",
    traffic: "Porta de 200 Mbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 5.36, setupEur: 5.36, discount: null },
      { id: "6", label: "6 meses", eur: 4.82, setupEur: 2.68, discount: "ECONOMIZE 10%", oldEur: 5.36 },
      { id: "12", label: "12 meses", eur: 4.28, setupEur: 0, discount: "ECONOMIZE 20%", oldEur: 5.36 },
    ],
    storageTypes: [
      { id: "ssd-300", name: "300 GB SSD", price: "Livre" },
    ],
    backupEur: 1.50,
    privateNetworkEur: 2.29,
    additionalIpEur: 3.50,
    managedEur: 109.99,
    monitoringEur: 11.49,
    objectStoragePrices: {
      "250gb": 2.49,
      "500gb": 4.98,
      "750gb": 7.47,
      "1tb": 9.96
    },
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "177 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "136 ms", eur: 0.95 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "177 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "94 ms", eur: 1.40, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "350 ms", eur: 1.95 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "120 ms", eur: 0.95 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "94 ms", eur: 1.40, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "148 ms", eur: 1.15 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "340 ms", eur: 2.30 },
        { id: "jp", name: "Ásia (Japão)", latency: "270 ms", eur: 2.35 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 2.15 },
      ]
    }
  },
  "20": {
    name: "Storage VPS 20 (M)",
    vcpu: "3 núcleos de vCPU",
    ram: "8 GB RAM",
    storage: "400 GB SSD",
    snapshots: "0 Instantâneos",
    traffic: "Porta de 300 Mbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 8.33, setupEur: 0, discount: null },
      { id: "6", label: "6 meses", eur: 7.50, setupEur: 0, discount: "ECONOMIZE 10%", oldEur: 8.33 },
      { id: "12", label: "12 meses", eur: 6.66, setupEur: 0, discount: "ECONOMIZE 20%", oldEur: 8.33 },
    ],
    storageTypes: [
      { id: "ssd-400", name: "400 GB SSD", price: "Livre" },
    ],
    backupEur: 2.00,
    privateNetworkEur: 2.29,
    additionalIpEur: 3.50,
    managedEur: 109.99,
    monitoringEur: 11.49,
    objectStoragePrices: {
      "250gb": 2.49,
      "500gb": 4.98,
      "750gb": 7.47,
      "1tb": 9.96
    },
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "175 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "136 ms", eur: 1.45 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "175 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "92 ms", eur: 2.20, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "350 ms", eur: 3.00 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "120 ms", eur: 1.45 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "92 ms", eur: 2.20, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "148 ms", eur: 1.85 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "338 ms", eur: 3.55 },
        { id: "jp", name: "Ásia (Japão)", latency: "275 ms", eur: 3.65 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 3.35 },
      ]
    }
  },
  "30": {
    name: "Storage VPS 30 (L)",
    vcpu: "6 núcleos de vCPU",
    ram: "18 GB RAM",
    storage: "1 TB SSD",
    snapshots: "0 Instantâneos",
    traffic: "Porta de 600 Mbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 16.66, setupEur: 0, discount: null },
      { id: "6", label: "6 meses", eur: 14.99, setupEur: 0, discount: "ECONOMIZE 10%", oldEur: 16.66 },
      { id: "12", label: "12 meses", eur: 13.33, setupEur: 0, discount: "ECONOMIZE 20%", oldEur: 16.66 },
    ],
    storageTypes: [
      { id: "ssd-1t", name: "1 TB SSD", price: "Livre" },
    ],
    backupEur: 3.50,
    privateNetworkEur: 2.29,
    additionalIpEur: 3.50,
    managedEur: 109.99,
    monitoringEur: 11.49,
    objectStoragePrices: {
      "250gb": 2.49,
      "500gb": 4.98,
      "750gb": 7.47,
      "1tb": 9.96
    },
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "177 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "135 ms", eur: 2.95 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "177 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 4.40, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "351 ms", eur: 6.05 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "121 ms", eur: 2.95 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 4.40, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "150 ms", eur: 3.65 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "347 ms", eur: 7.10 },
        { id: "jp", name: "Ásia (Japão)", latency: "264 ms", eur: 7.30 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 6.70 },
      ]
    }
  },
  "40": {
    name: "Storage VPS 40 (XL)",
    vcpu: "8 núcleos de vCPU",
    ram: "30 GB RAM",
    storage: "1.2 TB SSD",
    snapshots: "0 Instantâneos",
    traffic: "Porta de 800 Mbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 29.75, setupEur: 0, discount: null },
      { id: "6", label: "6 meses", eur: 26.78, setupEur: 0, discount: "ECONOMIZE 10%", oldEur: 29.75 },
      { id: "12", label: "12 meses", eur: 23.80, setupEur: 0, discount: "ECONOMIZE 20%", oldEur: 29.75 },
    ],
    storageTypes: [
      { id: "ssd-12t", name: "1.2 TB SSD", price: "Livre" },
    ],
    backupEur: 4.20,
    privateNetworkEur: 2.29,
    additionalIpEur: 3.50,
    managedEur: 109.99,
    monitoringEur: 11.49,
    objectStoragePrices: {
      "250gb": 2.49,
      "500gb": 4.98,
      "750gb": 7.47,
      "1tb": 9.96
    },
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "175 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "136 ms", eur: 5.25 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "175 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 7.85, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "354 ms", eur: 10.80 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "119 ms", eur: 5.25 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 7.85, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "148 ms", eur: 6.55 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "346 ms", eur: 12.70 },
        { id: "jp", name: "Ásia (Japão)", latency: "263 ms", eur: 13.00 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 11.90 },
      ]
    }
  },
  "50": {
    name: "Storage VPS 50 (XXL)",
    vcpu: "14 núcleos de vCPU",
    ram: "50 GB RAM",
    storage: "1.4 TB SSD",
    snapshots: "0 Instantâneos",
    traffic: "Porta de 1 Gbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 44.03, setupEur: 0, discount: null },
      { id: "6", label: "6 meses", eur: 39.63, setupEur: 0, discount: "ECONOMIZE 10%", oldEur: 44.03 },
      { id: "12", label: "12 meses", eur: 35.22, setupEur: 0, discount: "ECONOMIZE 20%", oldEur: 44.03 },
    ],
    storageTypes: [
      { id: "ssd-14t", name: "1.4 TB SSD", price: "Livre" },
    ],
    backupEur: 4.90,
    privateNetworkEur: 2.29,
    additionalIpEur: 3.50,
    managedEur: 109.99,
    monitoringEur: 11.49,
    objectStoragePrices: {
      "250gb": 2.49,
      "500gb": 4.98,
      "750gb": 7.47,
      "1tb": 9.96
    },
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "174 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "135 ms", eur: 7.80 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "174 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 11.60, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "353 ms", eur: 15.95 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "119 ms", eur: 7.80 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 11.60, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 9.65 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "346 ms", eur: 18.80 },
        { id: "jp", name: "Ásia (Japão)", latency: "263 ms", eur: 19.25 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 17.65 },
      ]
    }
  }
};

const regions = [
  { id: "best", label: "Melhor" },
  { id: "europe", label: "Europa" },
  { id: "america", label: "América" },
  { id: "asia", label: "Ásia" },
  { id: "australia", label: "Austrália" },
];



const imageCategories = [
  { id: "popular", label: "Popular" },
  { id: "os", label: "SO" },
  { id: "apps", label: "Novidade: Aplicativos" },
  { id: "panels", label: "Painéis" },
  { id: "blockchain", label: "Blockchain" },
];

const images = (prices: any) => ({
  popular: [
    { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
    { id: "custom", name: "Imagens personalizadas", price: "Incluído", icon: "/custom-images.png" },
    { id: "windows", name: "Servidor Windows", price: prices.windows, icon: "/windows.png" },
    { id: "cpanel", name: "cPanel", price: prices.cpanel, icon: "/cpanel.png" },
    { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
    { id: "plesk-linux", name: "Plesk + Linux", price: prices.pleskLinux, icon: "/plesk.png" },
    { id: "plesk-win", name: "Plesk + Windows", price: prices.pleskWin, icon: "/plesk.png" },
  ],
  os: [
    { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
    { id: "windows", name: "Servidor Windows", price: prices.windows, icon: "/windows.png" },
    { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
    { id: "debian", name: "Debian", price: "Incluído", icon: "/debian-svgrepo-com.svg" },
    { id: "almalinux", name: "AlmaLinux", price: "Incluído", icon: "/almalinux.png" },
    { id: "rockylinux", name: "Rocky Linux", price: "Incluído", icon: "/rocky.png" },
  ],
  apps: [
    { id: "n8n", name: "n8n Server", price: "Incluído", icon: "/n8n.png" },
    { id: "wireguard", name: "Wireguard Server", price: "Incluído", icon: "/wireguard.png" },
    { id: "nextcloud", name: "Nextcloud Server", price: "Incluído", icon: "/nextcloud.png" },
    { id: "gitlab", name: "Gitlab Server", price: "Incluído", icon: "/gitlab.png" },
    { id: "docker", name: "Docker", price: "Incluído", icon: "/docker.png" },
    { id: "lamp", name: "LAMP", price: "Incluído", icon: "/lamp.png" },
    { id: "openclaw", name: "OpenClaw Server", price: "Incluído", icon: "/openclaw.png" },
  ],
  panels: [
    { id: "cpanel", name: "cPanel", price: prices.cpanel, icon: "/cpanel.png" },
    { id: "plesk-win", name: "Plesk + Windows", price: prices.pleskWin, icon: "/plesk.png" },
    { id: "plesk-linux", name: "Plesk + Linux", price: prices.pleskLinux, icon: "/plesk.png" },
    { id: "webmin", name: "Webmin", price: "Incluído", icon: "/webmin.png" },
    { id: "webmin-lamp", name: "Webmin + LAMP", price: "Incluído", icon: "/lamp.png" },
  ],
  blockchain: [
    { id: "ipfs", name: "IPFS Node", price: "Incluído", icon: "/ipfs.png" },
    { id: "flux", name: "Flux Node", price: "Incluído", icon: "/fluxnode.png" },
    { id: "horizen", name: "Horizen Node", price: "Incluído", icon: "/horizen.png" },
  ]
});

export default function ConfigureStorageVps() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  
  const [currentRate, setCurrentRate] = useState(FALLBACK_EUR_RATE);
  
  const plan = plansData[planId as keyof typeof plansData] || plansData["10"];
  const durations = plan.durations;
  const storageTypes = plan.storageTypes;
  const planLocations = plan.locations || plansData["10"].locations;
  const currentImagePrices = getPlanImagePrices(planId, { windows: 0, win2016: 0, cpanel: 0, pleskLinux: 0, pleskHost: 0, pleskPro: 0, pleskWin: 0 });

  const formatBRL = (eur: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(eur * currentRate);
  };

  const formatBRLPerMonth = (eur: number) => {
    return `${formatBRL(eur)} / mês`;
  };

  const [quantity, setQuantity] = useState("1");
  const [duration, setDuration] = useState("1");
  const [regionTab, setRegionTab] = useState("best");
  const [location, setLocation] = useState("eu");
  const [storageType, setStorageType] = useState(storageTypes[0].id);
  const [imageCategory, setImageCategory] = useState("popular");
  const [osImage, setOsImage] = useState("ubuntu");
  const [autoBackup, setAutoBackup] = useState(false);
  const [showMoreImages, setShowMoreImages] = useState(true);
  const [showAdditionalFeatures, setShowAdditionalFeatures] = useState(true);
  const [showUbuntuModal, setShowUbuntuModal] = useState(false);
  const [ubuntuVersion, setUbuntuVersion] = useState("Ubuntu 24.04");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customImageOption, setCustomImageOption] = useState("existing");
  const [showWindowsModal, setShowWindowsModal] = useState(false);
  const [windowsVersion, setWindowsVersion] = useState("2025");
  const [showCpanelModal, setShowCpanelModal] = useState(false);
  const [cpanelLicence, setCpanelLicence] = useState("5");
  const [cpanelVersion, setCpanelVersion] = useState("Ubuntu 22.04");
  const [showRhelModal, setShowRhelModal] = useState(false);
  const [rhelVersion, setRhelVersion] = useState("AlmaLinux 9");
  const [showPleskModal, setShowPleskModal] = useState(false);
  const [pleskLicence, setPleskLicence] = useState("admin");
  const [showDebianModal, setShowDebianModal] = useState(false);
  const [debianVersion, setDebianVersion] = useState("Debian 13");
  const [showDockerModal, setShowDockerModal] = useState(false);
  const [dockerVersion, setDockerVersion] = useState("Ubuntu 22.04");
  const [showLampModal, setShowLampModal] = useState(false);
  const [lampVersion, setLampVersion] = useState("Ubuntu 22.04");
  const [showPleskWindowsModal, setShowPleskWindowsModal] = useState(false);
  const [pleskWinLicence, setPleskWinLicence] = useState("admin");
  const [pleskWinVersion, setPleskWinVersion] = useState("2016");
  const [showWebminModal, setShowWebminModal] = useState(false);
  const [webminVersion, setWebminVersion] = useState("Ubuntu 22.04");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [privateNetwork, setPrivateNetwork] = useState("none");
  const [ipv4Address, setIpv4Address] = useState("1ip");
  const [objectStorage, setObjectStorage] = useState("none");
  const [serverManagement, setServerManagement] = useState("unmanaged");
  const [monitoring, setMonitoring] = useState("none");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showSummaryDetails, setShowSummaryDetails] = useState(false);

  const isPasswordValid = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+^~[\]{}|;:,.<>?])[A-Za-z\d!@#$%^&*()_+^~[\]{}|;:,.<>?]{8,}$/;
    return regex.test(pwd);
  };

  useEffect(() => {
    fetch("/api/currency/euro")
      .then(res => res.json())
      .then(data => {
        if (data.rate) {
          setCurrentRate(data.rate);
        }
      })
      .catch(err => console.error("Error fetching rate:", err));
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans pb-24">
      <Navbar variant="light" />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-12 space-y-12">

        <h1 className="text-3xl font-bold text-slate-800">Configure seu {plan.name}</h1>

        <div className="flex flex-wrap items-center gap-10">
          <div className="flex-1 border-2 border-sky-400 rounded-lg p-8 grid grid-cols-4 gap-4 relative bg-white">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">CPU</p>
              <p className="text-[11px] font-medium leading-tight">{plan.vcpu}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">RAM</p>
              <p className="text-[11px] font-medium leading-tight">{plan.ram}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">ARMAZENAMENTO</p>
              <p className="text-[11px] font-medium leading-tight">{plan.storage}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">TRÁFEGO</p>
              <p className="text-[11px] font-medium leading-tight">{plan.traffic}</p>
            </div>
            <Link href="/vps-armazenamento" className="absolute bottom-4 right-4 text-[10px] text-sky-500 hover:underline">Mudar</Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-medium text-slate-500">Quantidade de servidores</span>
            <Select value={quantity} onValueChange={setQuantity}>
              <SelectTrigger className="w-16 h-10 border border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 25 }, (_, i) => i + 1).map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Duration Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-700">Selecione o ciclo de faturamento</h2>
            <Info size={16} className="text-slate-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {durations.map((d: any) => (
              <div key={d.id} className="space-y-3">
                <div
                  onClick={() => setDuration(d.id)}
                  className={cn(
                    "cursor-pointer rounded-lg border p-8 flex items-center justify-between transition-all bg-white relative h-24",
                    duration === d.id ? "border-sky-400 border-2 shadow-sm" : "border-slate-100 bg-slate-50/30"
                  )}
                >
                  {d.discount && (
                    <div className="absolute -top-3 left-6 bg-slate-50 text-emerald-500 text-[9px] font-bold px-2 py-0.5 border border-slate-100">
                      {d.discount}
                    </div>
                  )}
                  <span className="text-sm font-medium">{d.label}</span>
                  <div className="text-right">
                    {d.oldEur && <p className="text-[10px] text-rose-500 line-through font-medium">{formatBRLPerMonth(d.oldEur)}</p>}
                    <p className="text-lg font-bold text-slate-800">{formatBRL(d.eur)} <span className="text-xs font-normal text-slate-400">/ mês</span></p>
                  </div>
                </div>
                <div className={cn(
                  "text-center py-1.5 rounded-b-md text-[11px] font-medium transition-colors",
                  d.setupFee === "Sem taxa de instalação" ? "bg-emerald-500/50 text-slate-700" : "text-slate-500"
                )}>
                  {d.setupFee}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator className="bg-slate-100" />

        {/* Region Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-700">Região</h2>
            <Info size={16} className="text-slate-300" />
          </div>

          <div className="flex flex-nowrap items-start gap-8">
            <div className="w-1/3">
              <img src="/1098128_7510-removebg-preview.png" alt="Map" className="w-full h-auto opacity-80" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex border-b border-slate-100">
                {regions.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRegionTab(r.id)}
                    className={cn(
                      "px-8 py-3 text-xs font-medium relative transition-colors",
                      regionTab === r.id ? "text-sky-500" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {r.label}
                    {regionTab === r.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500" />}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {(planLocations[regionTab as keyof typeof planLocations] || []).map((loc: any) => (
                  <button
                    key={loc.id}
                    onClick={() => setLocation(loc.id)}
                    className={cn(
                      "w-full border-2 p-4 flex items-center justify-between text-xs font-medium bg-white relative transition-all",
                      location === loc.id ? "border-sky-400" : "border-slate-100",
                      loc.recommended && "mt-6"
                    )}
                  >
                    {loc.recommended && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[9px] font-bold px-4 py-1 rounded-md shadow-lg shadow-sky-500/20 z-10 whitespace-nowrap">
                        Recomendado - Melhor latência para sua região
                      </div>
                    )}
                    <div className="flex-1 text-left">{loc.name}</div>
                    <div className="flex-1 text-center">– Latência de {loc.latency}</div>
                    <div className="flex-1 text-right font-bold text-slate-900">{loc.price === "Livre" ? "Free" : formatBRLPerMonth(loc.eur)}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Separator className="bg-slate-100" />

        {/* Image Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-700">Imagem</h2>
            <button
              onClick={() => setShowMoreImages(!showMoreImages)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-800"
            >
              {showMoreImages ? (
                <>Fechar imagens <ChevronUp size={14} /></>
              ) : (
                <>Ver mais <ChevronDown size={14} /></>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showMoreImages && (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-8 overflow-hidden"
              >
                <div className="flex justify-center border-b border-slate-100">
                  {imageCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setImageCategory(cat.id)}
                      className={cn(
                        "px-8 py-3 text-[11px] font-bold relative transition-colors",
                        imageCategory === cat.id ? "text-sky-500" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {cat.label}
                      {imageCategory === cat.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500" />}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {(images(currentImagePrices)[imageCategory as keyof ReturnType<typeof images>] || []).map((img: any) => (
                    <button
                      key={img.id}
                      onClick={() => {
                        if (img.id === "plesk-win") setShowPleskWindowsModal(true);
                        else if (img.id === "plesk-linux") setShowPleskModal(true);
                        else if (img.name.toLowerCase().includes("ubuntu")) setShowUbuntuModal(true);
                        else if (img.id === "custom") setShowCustomModal(true);
                        else if (img.name.toLowerCase().includes("windows")) setShowWindowsModal(true);
                        else if (img.name.toLowerCase().includes("cpanel")) setShowCpanelModal(true);
                        setOsImage(img.id);
                      }}
                      className={cn(
                        "cursor-pointer rounded-lg border-2 p-4 flex items-center gap-3 transition-all bg-white",
                        osImage === img.id ? "border-sky-400 shadow-sm" : "border-slate-100"
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden">
                        {img.icon ? <img src={img.icon} alt="" className="w-5 h-5 object-contain" /> : <Server size={16} className="text-slate-300" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[11px] font-bold">{img.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {typeof img.price === "number" ? formatBRLPerMonth(img.price) : img.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <Separator className="bg-slate-100" />

        {/* Data Protection Section */}
        {planId !== "50" && (
          <>
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
              <div className="p-8">
                <div className="flex items-center gap-2 mb-8">
                  <h2 className="text-2xl font-bold text-[#0F172A]">Proteção de Dados com Backup Automático</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-48 h-48 flex-shrink-0">
                      <Image src="/backup-shield.png" alt="Proteção de Backup" width={192} height={192} className="object-contain" />
                    </div>
                    <ul className="space-y-3">
                      {["Backups automáticos diários.", "Recuperação instantânea.", "Mantém as últimas 10 versões.", "Nenhuma configuração necessária."].map((benefit, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                          <span className="text-[15px] font-medium">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => setAutoBackup(true)} className={cn("relative p-6 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center min-h-[160px] bg-white", autoBackup ? "border-[#0091FF] shadow-md" : "border-slate-200 hover:border-slate-300")}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F1F5F9] px-4 py-1 rounded-full border border-slate-200"><span className="text-[10px] font-bold text-[#E9711C] uppercase tracking-wider whitespace-nowrap">Recomendado</span></div>
                      <h3 className="text-lg font-bold text-[#0F172A] mb-1">Backup Automático</h3>
                      <div className="text-xl font-bold text-[#0F172A] mb-2">{formatBRLPerMonth(plan.backupEur)}</div>
                    </button>
                    <button onClick={() => setAutoBackup(false)} className={cn("p-6 rounded-xl border-2 transition-all text-center flex items-center justify-center min-h-[160px] bg-white", !autoBackup ? "border-[#0091FF] shadow-md" : "border-slate-200 hover:border-slate-300")}><h3 className="text-lg font-medium text-slate-600">Sem Proteção</h3></button>
                  </div>
                </div>
              </div>
            </section>

            <Separator className="bg-slate-100" />
          </>
        )}

        {/* Additional Features Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#0F172A]">Recursos Adicionais</h2>
              <button onClick={() => setShowAdditionalFeatures(!showAdditionalFeatures)} className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                {showAdditionalFeatures ? <>Fechar <ChevronUp size={14} /></> : <>Ver mais <ChevronDown size={14} /></>}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {showAdditionalFeatures && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-12 overflow-hidden px-1 py-1">
                  <div className="space-y-8">
                    <h3 className="text-lg font-bold text-[#0F172A]">Rede</h3>
                    <div className="space-y-6 pl-4 pr-1">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3"><span className="text-sm font-bold text-slate-600">Rede Privada</span></div>
                        <div className="md:col-span-9">
                          <Select value={privateNetwork} onValueChange={setPrivateNetwork}>
                            <SelectTrigger className="h-12 border-slate-200 bg-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sem Rede Privada</SelectItem>
                              <SelectItem value="enabled">
                                <div className="flex items-center justify-between w-[300px]">
                                  <span>Rede Privada Ativada</span>
                                  <span className={cn("font-bold", (planId === "20" || planId === "30" || planId === "40" || planId === "50") ? "text-slate-900" : "text-emerald-500")}>
                                    {(planId === "20" || planId === "30" || planId === "40" || planId === "50") ? formatBRLPerMonth(plan.privateNetworkEur) : "Grátis"}
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3"><span className="text-sm font-bold text-slate-600">IPv4</span></div>
                        <div className="md:col-span-9">
                          <Select value={ipv4Address} onValueChange={setIpv4Address}>
                            <SelectTrigger className="h-12 border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="1ip"><div className="flex items-center justify-between w-[300px]"><span>1 Endereço IP</span><span className="text-emerald-500">Grátis</span></div></SelectItem><SelectItem value="2ip"><div className="flex items-center justify-between w-[300px]"><span>+1 IP Adicional</span><span className="font-bold">{formatBRLPerMonth(plan.additionalIpEur)}</span></div></SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-slate-100" />
                  <div className="space-y-8">
                    <h3 className="text-lg font-bold text-[#0F172A]">Add-Ons</h3>
                    <div className="space-y-6 pl-4 pr-1">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3"><span className="text-sm font-bold text-slate-600">Object Storage</span></div>
                        <div className="md:col-span-9">
                          <Select value={objectStorage} onValueChange={setObjectStorage}>
                            <SelectTrigger className="h-12 border-slate-200 text-left"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              <SelectItem value="250gb"><div className="flex justify-between w-[400px]"><span>250 GB nos EUA</span><span className="font-bold">{formatBRLPerMonth(plan.objectStoragePrices["250gb"])}</span></div></SelectItem>
                              <SelectItem value="500gb"><div className="flex justify-between w-[400px]"><span>500 GB nos EUA</span><span className="font-bold">{formatBRLPerMonth(plan.objectStoragePrices["500gb"])}</span></div></SelectItem>
                              <SelectItem value="750gb"><div className="flex justify-between w-[400px]"><span>750 GB nos EUA</span><span className="font-bold">{formatBRLPerMonth(plan.objectStoragePrices["750gb"])}</span></div></SelectItem>
                              <SelectItem value="1000gb"><div className="flex justify-between w-[400px]"><span>1 TB nos EUA</span><span className="font-bold">{formatBRLPerMonth(plan.objectStoragePrices["1tb"])}</span></div></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-600">Server Management</span>
                          <Info size={14} className="text-slate-400 cursor-help" />
                        </div>
                        <div className="md:col-span-9">
                          <Select value={serverManagement} onValueChange={setServerManagement}>
                            <SelectTrigger className="h-12 border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="unmanaged">Não Gerenciado (Grátis)</SelectItem><SelectItem value="managed"><div className="flex justify-between w-[350px]"><span>Gerenciado</span><span className="font-bold">{formatBRLPerMonth(plan.managedEur)}</span></div></SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-600">Monitoring</span>
                          <Info size={14} className="text-slate-400 cursor-help" />
                        </div>
                        <div className="md:col-span-9">
                          <Select value={monitoring} onValueChange={setMonitoring}>
                            <SelectTrigger className="h-12 border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="none">Nenhum</SelectItem><SelectItem value="full"><div className="flex justify-between w-[350px]"><span>Completo</span><span className="font-bold">{formatBRLPerMonth(plan.monitoringEur)}</span></div></SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <Separator className="bg-slate-100" />
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-[#0F172A] mb-8">Login e senha para o seu servidor</h2>
          <div className="max-w-3xl space-y-8">
            {/* Username */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-3">
                <span className="text-sm font-bold text-slate-600">Usuário</span>
              </div>
              <div className="md:col-span-9">
                <span className="text-slate-900 font-medium">root</span>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3 pt-3">
                <span className="text-sm font-bold text-slate-600">Senha</span>
              </div>
              <div className="md:col-span-9 space-y-2">
                <div className="flex justify-start">
                  <button
                    onClick={() => {
                      const chars = "abcdefghijklmnopqrstuvwxyz";
                      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                      const nums = "0123456789";
                      const symbols = "!@#$%^&*()_+";
                      
                      let pass = "";
                      pass += chars[Math.floor(Math.random() * chars.length)];
                      pass += upper[Math.floor(Math.random() * upper.length)];
                      pass += nums[Math.floor(Math.random() * nums.length)];
                      pass += symbols[Math.floor(Math.random() * symbols.length)];
                      
                      const all = chars + upper + nums + symbols;
                      for (let i = 0; i < 8; i++) {
                        pass += all[Math.floor(Math.random() * all.length)];
                      }
                      
                      pass = pass.split('').sort(() => 0.5 - Math.random()).join('');
                      
                      setPassword(pass);
                      setPasswordTouched(true);
                    }}
                    className="text-[#3B82F6] text-xs hover:underline"
                  >
                    Gerar nova senha
                  </button>
                </div>
                <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordTouched(true);
                      }}
                      onBlur={() => setPasswordTouched(true)}
                      className={cn(
                        "h-12 bg-white border-slate-200 focus:border-[#3B82F6] pr-12",
                        passwordTouched && password.length > 0 && !isPasswordValid(password) && "border-red-500 focus:border-red-500"
                      )}
                    />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordTouched && password.length > 0 && !isPasswordValid(password) && (
                  <div className="flex items-center gap-2 text-red-500 text-xs mt-1">
                    <AlertCircle size={14} />
                    <span>Por favor, insira uma senha válida (Mín. 8 caracteres, maiúscula, número e símbolo)</span>
                  </div>
                )}
                {isPasswordValid(password) && (
                  <div className="flex items-center gap-2 text-emerald-500 text-xs mt-1">
                    <Check size={14} />
                    <span>Senha válida e segura</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info List */}
            <div className="md:ml-[25%] pt-4">
              <ul className="list-disc space-y-2 text-slate-500 text-[13px] ml-4">
                <li>Você pode adicionar chaves SSH mais tarde no Painel de Controle.</li>
                <li>Sua senha não será enviada por e-mail.</li>
                <li>Mantenha-a segura para acesso ao Windows. Se perdê-la, será necessária uma reinstalação.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Bottom Summary Bar - UI IDENTICAL TO VPS */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F1F5F9] border-t border-slate-200 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <AnimatePresence>
          {showSummaryDetails && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-slate-200 bg-white">
              <div className="max-w-6xl mx-auto px-10 py-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Detalhamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  {(() => {
                    const selectedDur = durations.find((d:any) => d.id === duration) || durations[0];
                    const durMonths = parseInt(duration);
                    const qty = parseInt(quantity) || 1;
                    const items = [];
                    
                    const baseEur = selectedDur.eur;
                    items.push({ label: `${plan.name} (${durMonths}m)`, price: baseEur * durMonths * qty * currentRate });
                    
                    if (selectedDur.setupEur > 0) {
                      items.push({ label: `Taxa de Configuração`, price: selectedDur.setupEur * qty * currentRate });
                    }
                    
                    const loc = (Object.values(planLocations).flat() as any[]).find((l: any) => l.id === location);
                    if (loc && loc.eur) items.push({ label: `Localização: ${loc.name}`, price: loc.eur * durMonths * qty * currentRate });
                    
                    if (autoBackup) items.push({ label: `Backup Automático`, price: plan.backupEur * durMonths * qty * currentRate });
                    
                    if (privateNetwork === "enabled") {
                      const pnEur = (planId === "20" || planId === "30" || planId === "40" || planId === "50") ? plan.privateNetworkEur : 0;
                      if (pnEur > 0) items.push({ label: `Rede Privada`, price: pnEur * durMonths * qty * currentRate });
                    }
                    
                    if (ipv4Address === "2ip") items.push({ label: `IP Adicional`, price: plan.additionalIpEur * durMonths * qty * currentRate });
                    
                    if (objectStorage !== "none") {
                      const osKey = objectStorage === "1000gb" ? "1tb" : objectStorage;
                      const osEur = plan.objectStoragePrices[osKey as keyof typeof plan.objectStoragePrices] || 0;
                      items.push({ label: `Object Storage (${objectStorage.toUpperCase()})`, price: osEur * durMonths * qty * currentRate });
                    }
                    
                    if (serverManagement === "managed") items.push({ label: `Gerenciado`, price: plan.managedEur * durMonths * qty * currentRate });
                    
                    if (monitoring === "full") items.push({ label: `Monitoramento`, price: plan.monitoringEur * durMonths * qty * currentRate });

                    // Image/OS Pricing
                    if (osImage === "windows") {
                      const eur = windowsVersion === "2016" ? currentImagePrices.win2016 : currentImagePrices.windows;
                      items.push({ label: `Windows Server ${windowsVersion}`, price: eur * durMonths * qty * currentRate });
                    } else if (osImage === "cpanel") {
                      items.push({ label: `cPanel License`, price: currentImagePrices.cpanel * durMonths * qty * currentRate });
                    } else if (osImage === "plesk" || osImage === "plesk-linux") {
                      const licEur = pleskLicence === "admin" ? currentImagePrices.pleskLinux : 
                                     pleskLicence === "host" ? currentImagePrices.pleskHost : 
                                     currentImagePrices.pleskPro;
                      items.push({ label: `Plesk License (${pleskLicence})`, price: licEur * durMonths * qty * currentRate });
                    } else if (osImage === "plesk-win") {
                      const licEur = pleskWinLicence === "admin" ? currentImagePrices.pleskLinux : 
                                     pleskWinLicence === "host" ? currentImagePrices.pleskHost : 
                                     currentImagePrices.pleskPro;
                      const verEur = pleskWinVersion === "2016" ? currentImagePrices.win2016 : currentImagePrices.windows;
                      items.push({ label: `Plesk + Windows (${pleskWinLicence})`, price: (licEur + verEur) * durMonths * qty * currentRate });
                    }

                    return items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-1">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="font-bold text-slate-700">{formatBRL(item.price / currentRate)}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="max-w-6xl mx-auto px-10 h-24 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100"><ShieldCheck className="w-6 h-6 text-slate-400" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-700 text-base">Resumo</h3>
                <button onClick={() => setShowSummaryDetails(!showSummaryDetails)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                  {showSummaryDetails ? <ChevronDown className="w-5 h-5 text-sky-500" /> : <ChevronUp className="w-5 h-5 text-sky-500" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-20">
            {(() => {
              const selectedDur = durations.find((d:any) => d.id === duration) || durations[0];
              const durMonths = parseInt(duration);
              const qty = parseInt(quantity) || 1;
              const RATE = currentRate;

              // Base Price Logic
              const basePriceMonthlyEur = selectedDur.eur;
              const setupFeeEur = selectedDur.setupEur || 0;

              let additionalEur = 0;
              const loc = Object.values(planLocations).flat().find((l: any) => l.id === location) as any;
              
              if (loc && loc.eur) {
                additionalEur += loc.eur || 0;
              }

              if (autoBackup) {
                additionalEur += plan.backupEur || 1.50;
              }

              if (privateNetwork === "enabled") {
                additionalEur += plan.privateNetworkEur || 2.29;
              }

              if (ipv4Address === "2ip") {
                additionalEur += plan.additionalIpEur || 3.50;
              }

              if (objectStorage !== "none") {
                const osKey = objectStorage === "1000gb" ? "1tb" : objectStorage;
                const prices = plan.objectStoragePrices || { "250gb": 2.49, "500gb": 4.98, "750gb": 7.47, "1tb": 9.96 };
                const osEur = (prices as any)[osKey] || 0;
                additionalEur += osEur;
              }

              if (serverManagement === "managed") {
                additionalEur += plan.managedEur || 109.99;
              }

              if (monitoring === "full") {
                additionalEur += plan.monitoringEur || 11.49;
              }

              // Image Pricing
              if (osImage === "windows") {
                additionalEur += windowsVersion === "2016" ? currentImagePrices.win2016 : currentImagePrices.windows;
              } else if (osImage === "cpanel") {
                additionalEur += currentImagePrices.cpanel;
              } else if (osImage === "plesk" || osImage === "plesk-linux") {
                const licEur = pleskLicence === "admin" ? currentImagePrices.pleskLinux : 
                                 pleskLicence === "host" ? currentImagePrices.pleskHost : 
                                 currentImagePrices.pleskPro;
                additionalEur += licEur;
              } else if (osImage === "plesk-win") {
                const licEur = pleskWinLicence === "admin" ? currentImagePrices.pleskWin : 
                                 pleskWinLicence === "host" ? currentImagePrices.pleskHost : 
                                 currentImagePrices.pleskPro;
                const verEur = pleskWinVersion === "2016" ? currentImagePrices.win2016 : currentImagePrices.windows;
                additionalEur += (licEur + verEur);
              }

              const totalMonthly = (basePriceMonthlyEur + additionalEur) * RATE;
              const dueToday = (totalMonthly * durMonths * qty) + (setupFeeEur * RATE * qty);
              
              return (
                <div className="flex items-center gap-12">
                  <div className="flex flex-col gap-1 min-w-[220px]">
                    <div className="flex justify-between items-center text-[11px]"><span className="text-slate-500 font-bold">Mensal</span><span className="font-black text-slate-700">{formatBRL(totalMonthly * qty / RATE)}</span></div>
                    <div className="flex justify-between items-center mt-1"><span className="font-black text-slate-800 text-[13px]">Vencido Hoje</span><span className="text-xl font-black text-slate-900">{formatBRL(dueToday / RATE)}</span></div>
                  </div>
                  <Button disabled={!isPasswordValid(password)} onClick={() => router.push(`/checkout/personal-data?planId=${planId}&qty=${quantity}&duration=${duration}&location=${location}&image=${osImage}&management=${serverManagement}&password=${encodeURIComponent(password)}&type=storage-vps`)} className={cn("font-bold h-14 px-12 rounded-full text-lg shadow-lg", isPasswordValid(password) ? "bg-[#00A8E8] hover:bg-[#0096d1] text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed")}>Próximo</Button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      
      {/* Modals same as VPS */}
      <AnimatePresence>
        {showUbuntuModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowUbuntuModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-[600px] p-10 space-y-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/image.png" alt="Ubuntu" className="w-10 h-10" /><h2 className="text-xl font-bold">Ubuntu</h2></div>
              <div className="space-y-4">
                <label className="text-sm font-bold">Versão</label>
                <Select value={ubuntuVersion} onValueChange={setUbuntuVersion}>
                  <SelectTrigger className="h-14"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Ubuntu 24.04">Ubuntu 24.04 LTS</SelectItem><SelectItem value="Ubuntu 22.04">Ubuntu 22.04 LTS</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4"><Button variant="ghost" onClick={() => setShowUbuntuModal(false)}>Pular</Button><Button onClick={() => setShowUbuntuModal(false)} className="bg-[#00A8E8] text-white">Começar</Button></div>
            </motion.div>
          </div>
        )}

        {showWindowsModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowWindowsModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-[600px] p-10 space-y-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/windows.png" alt="Windows" className="w-10 h-10" /><h2 className="text-xl font-bold">Windows Server</h2></div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-600">Selecione a Versão</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: "2025", name: "Windows Server 2025", price: formatBRLPerMonth(currentImagePrices.windows) },
                    { id: "2022", name: "Windows Server 2022", price: formatBRLPerMonth(currentImagePrices.windows) },
                    { id: "2019", name: "Windows Server 2019", price: formatBRLPerMonth(currentImagePrices.windows) },
                    { id: "2016", name: "Windows Server 2016", price: formatBRLPerMonth(currentImagePrices.win2016) },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setWindowsVersion(v.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                        windowsVersion === v.id ? "border-sky-500 bg-sky-50/50" : "border-slate-100 hover:border-slate-200 bg-white"
                      )}
                    >
                      <span className="font-bold text-slate-700">{v.name}</span>
                      <span className="text-sm font-bold text-slate-900">{v.price}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-4"><Button variant="ghost" onClick={() => setShowWindowsModal(false)}>Pular</Button><Button onClick={() => setShowWindowsModal(false)} className="bg-[#00A8E8] text-white">Configurar</Button></div>
            </motion.div>
          </div>
        )}

        {showPleskWindowsModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPleskWindowsModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-[600px] p-10 space-y-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4">
                <img src="/plesk.png" alt="Plesk" className="w-8 h-8 object-contain" />
                <h2 className="text-xl font-bold text-slate-700">Plesk + Windows</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600">Licence</label>
                  <Select value={pleskWinLicence} onValueChange={setPleskWinLicence}>
                    <SelectTrigger className="h-16 border border-slate-200">
                      <SelectValue>
                        <div className="flex items-center justify-between w-full pr-4 text-[13px] leading-tight">
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-slate-700">
                              {pleskWinLicence === "admin" ? "Plesk Obsidian Web Admin Edition" : 
                               pleskWinLicence === "host" ? "Plesk Obsidian Web Host Edition" : 
                               "Plesk Obsidian Web Pro Edition"}
                            </span>
                            <span className="text-emerald-500 font-bold text-[11px]">1 month free</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <span className="font-medium">
                              {pleskWinLicence === "admin" ? currentImagePrices.pleskWin : 
                               pleskWinLicence === "host" ? currentImagePrices.pleskHost : 
                               currentImagePrices.pleskPro}
                            </span>
                            <span>|</span>
                            <span>R$ 0,00 Setup fee</span>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-[120]">
                      <SelectItem value="admin">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <div className="flex flex-col">
                            <span className="font-bold text-sky-600">Plesk Obsidian Web Admin Edition</span>
                            <span className="text-emerald-500 font-bold text-xs">1 month free</span>
                          </div>
                          <span className="font-black text-slate-800">{currentImagePrices.pleskWin.replace(" /mês", "")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="host">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">Plesk Obsidian Web Host Edition</span>
                            <span className="text-emerald-500 font-bold text-xs">1 month free</span>
                          </div>
                          <span className="font-black text-slate-800">{currentImagePrices.pleskHost.replace(" /mês", "")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pro">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">Plesk Obsidian Web Pro Edition</span>
                            <span className="text-emerald-500 font-bold text-xs">1 month free</span>
                          </div>
                          <span className="font-black text-slate-800">{currentImagePrices.pleskPro.replace(" /mês", "")}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600">Version</label>
                  <Select value={pleskWinVersion} onValueChange={setPleskWinVersion}>
                    <SelectTrigger className="h-16 border border-slate-200">
                      <SelectValue>
                        <div className="flex items-center justify-between w-full pr-4 text-[13px]">
                          <span className="font-medium text-slate-700">Windows Server {pleskWinVersion} Datacenter</span>
                          <div className="flex items-center gap-2 text-slate-500">
                            <span className="font-medium">
                              {pleskWinVersion === "2016" ? currentImagePrices.win2016 : currentImagePrices.windows}
                            </span>
                            <span>|</span>
                            <span>R$ 0,00 Setup fee</span>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-[120]">
                      <SelectItem value="2016">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <span className="font-bold text-sky-600">Windows Server 2016 Datacenter</span>
                          <span className="font-black text-slate-800">{formatBRL(currentImagePrices.win2016)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="2019">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <span className="font-bold text-slate-700">Windows Server 2019 Datacenter</span>
                          <span className="font-black text-slate-800">{formatBRL(currentImagePrices.windows)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="2022">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <span className="font-bold text-slate-700">Windows Server 2022 Datacenter</span>
                          <span className="font-black text-slate-800">{formatBRL(currentImagePrices.windows)}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-4">
                <Button variant="ghost" onClick={() => setShowPleskWindowsModal(false)} className="text-slate-400 font-bold">CANCELAR</Button>
                <Button onClick={() => setShowPleskWindowsModal(false)} className="bg-[#00A8E8] hover:bg-[#0096d1] text-white font-bold px-8">CONFIGURAR</Button>
              </div>
            </motion.div>
          </div>
        )}

        {showPleskModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPleskModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-[600px] p-10 space-y-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4">
                <img src="/plesk.png" alt="Plesk" className="w-8 h-8 object-contain" />
                <h2 className="text-xl font-bold text-slate-700">Plesk + Linux</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600">Licence</label>
                  <Select value={pleskLicence} onValueChange={setPleskLicence}>
                    <SelectTrigger className="h-16 border border-slate-200">
                      <SelectValue>
                        <div className="flex items-center justify-between w-full pr-4 text-[13px] leading-tight">
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-slate-700">
                              {pleskLicence === "admin" ? "Plesk Obsidian Web Admin Edition" : 
                               pleskLicence === "host" ? "Plesk Obsidian Web Host Edition" : 
                               "Plesk Obsidian Web Pro Edition"}
                            </span>
                            <span className="text-emerald-500 font-bold text-[11px]">1 month free</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <span className="font-medium">
                              {pleskLicence === "admin" ? currentImagePrices.pleskLinux : 
                               pleskLicence === "host" ? currentImagePrices.pleskHost : 
                               currentImagePrices.pleskPro}
                            </span>
                            <span>|</span>
                            <span>R$ 0,00 Setup fee</span>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-[120]">
                      <SelectItem value="admin">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <div className="flex flex-col">
                            <span className="font-bold text-sky-600">Plesk Obsidian Web Admin Edition</span>
                            <span className="text-emerald-500 font-bold text-xs">1 month free</span>
                          </div>
                          <span className="font-black text-slate-800">{formatBRL(currentImagePrices.pleskLinux)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="host">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">Plesk Obsidian Web Host Edition</span>
                            <span className="text-emerald-500 font-bold text-xs">1 month free</span>
                          </div>
                          <span className="font-black text-slate-800">{formatBRL(currentImagePrices.pleskHost)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pro">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">Plesk Obsidian Web Pro Edition</span>
                            <span className="text-emerald-500 font-bold text-xs">1 month free</span>
                          </div>
                          <span className="font-black text-slate-800">{formatBRL(currentImagePrices.pleskPro)}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-12 pt-4">
                <button onClick={() => setShowPleskModal(false)} className="text-sky-500 font-bold text-sm hover:underline">Skip</button>
                <Button onClick={() => setShowPleskModal(false)} className="bg-[#00A8E8] hover:bg-[#0096d1] text-white font-bold h-14 px-12 rounded-lg text-lg">Get Started</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
