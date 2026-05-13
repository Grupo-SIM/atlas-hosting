"use client";

export const dynamic = "force-dynamic";

import { useState, useLayoutEffect, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
const FALLBACK_EUR_RATE = 5.86;

// Euro source values for software licensing
const getPlanImagePrices = (planId: string, defaultPrices: any) => {
  const base = {
    ...defaultPrices,
    cpanel: 43.50, // 21.75 * 2
    pleskLinux: 24.00, // 12.00 * 2
    pleskWin: 32.00, // 16.00 * 2
    pleskPro: 45.22,
    pleskHost: 86.88
  };

  if (planId === "10") {
    return { ...base, windows: 9.50, win2016: 9.50 }; // 4.75 * 2
  }
  if (planId === "20") {
    return { ...base, windows: 15.00, win2016: 15.00 }; // 7.50 * 2
  }
  if (planId === "30") {
    return { ...base, windows: 31.00, win2016: 31.00 }; // 15.50 * 2
  }
  if (planId === "40") {
    return { ...base, windows: 52.00, win2016: 52.00 }; // 26.00 * 2
  }
  if (planId === "50") {
    return { ...base, windows: 98.00, win2016: 98.00 }; // 49.00 * 2
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
      { id: "1", label: "1 mês", eur: 9.00, setupEur: 9.00, setupFee: "+ Taxa de instalação única", discount: null },
      { id: "6", label: "6 meses", eur: 8.10, setupEur: 4.50, setupFee: "+ Taxa de instalação única", discount: "ECONOMIZE 10%", oldEur: 9.00 },
      { id: "12", label: "12 meses", eur: 7.20, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 9.00 },
    ],
    storageTypes: [
      { id: "ssd-300", name: "300 GB SSD", price: "Livre" },
    ],
    backupEur: 3.00,
    privateNetworkEur: 4.58,
    additionalIpEur: 7.00,
    managedEur: 109.99,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    },
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "177 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "136 ms", eur: 1.90 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "177 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "94 ms", eur: 2.80, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "350 ms", eur: 3.90 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "120 ms", eur: 1.90 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "94 ms", eur: 2.80, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "148 ms", eur: 2.30 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "340 ms", eur: 4.30 },
        { id: "jp", name: "Ásia (Japão)", latency: "270 ms", eur: 4.30 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 4.30 },
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
      { id: "1", label: "1 mês", eur: 14.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 12.60, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldEur: 14.00 },
      { id: "12", label: "12 meses", eur: 11.20, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 14.00 },
    ],
    storageTypes: [
      { id: "ssd-400", name: "400 GB SSD", price: "Livre" },
    ],
    backupEur: 4.00,
    privateNetworkEur: 4.58,
    additionalIpEur: 7.00,
    managedEur: 109.99,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    },
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "175 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "136 ms", eur: 2.90 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "175 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "92 ms", eur: 2.90, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "350 ms", eur: 6.00 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "120 ms", eur: 2.90 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "92 ms", eur: 2.90, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "148 ms", eur: 3.70 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "338 ms", eur: 6.00 },
        { id: "jp", name: "Ásia (Japão)", latency: "275 ms", eur: 6.00 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 6.00 },
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
      { id: "1", label: "1 mês", eur: 28.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 25.20, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldEur: 28.00 },
      { id: "12", label: "12 meses", eur: 22.40, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 28.00 },
    ],
    storageTypes: [
      { id: "ssd-1t", name: "1 TB SSD", price: "Livre" },
    ],
    backupEur: 7.00,
    privateNetworkEur: 4.58,
    additionalIpEur: 7.00,
    managedEur: 109.99,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    },
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "177 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "135 ms", eur: 5.90 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "177 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 5.90, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "351 ms", eur: 12.00 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "121 ms", eur: 5.90 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 5.90, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "150 ms", eur: 7.30 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "347 ms", eur: 12.00 },
        { id: "jp", name: "Ásia (Japão)", latency: "264 ms", eur: 12.00 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 12.00 },
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
      { id: "1", label: "1 mês", eur: 50.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 45.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldEur: 50.00 },
      { id: "12", label: "12 meses", eur: 40.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 50.00 },
    ],
    storageTypes: [
      { id: "ssd-12t", name: "1.2 TB SSD", price: "Livre" },
    ],
    backupEur: 8.40,
    privateNetworkEur: 4.58,
    additionalIpEur: 7.00,
    managedEur: 109.99,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    },
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "175 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "136 ms", eur: 10.50 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "175 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 10.50, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "354 ms", eur: 20.00 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "119 ms", eur: 10.50 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 10.50, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "148 ms", eur: 13.10 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "346 ms", eur: 20.00 },
        { id: "jp", name: "Ásia (Japão)", latency: "263 ms", eur: 20.00 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 20.00 },
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
      { id: "1", label: "1 mês", eur: 74.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 66.60, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldEur: 74.00 },
      { id: "12", label: "12 meses", eur: 59.20, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 74.00 },
    ],
    storageTypes: [
      { id: "ssd-14t", name: "1.4 TB SSD", price: "Livre" },
    ],
    backupEur: 9.80,
    privateNetworkEur: 4.58,
    additionalIpEur: 7.00,
    managedEur: 109.99,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    },
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "174 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "135 ms", eur: 15.60 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "174 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 23.20, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "353 ms", eur: 30.00 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "119 ms", eur: 15.60 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 23.20, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 19.30 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "346 ms", eur: 30.00 },
        { id: "jp", name: "Ásia (Japão)", latency: "263 ms", eur: 30.00 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 30.00 },
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
  const searchParams = useSearchParams();
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

  const sp = searchParams;
  const [quantity, setQuantity] = useState(sp.get("qty") || "1");
  const [duration, setDuration] = useState(sp.get("duration") || "1");
  const [regionTab, setRegionTab] = useState(sp.get("regionTab") || "best");
  const [location, setLocation] = useState(sp.get("location") || "eu");
  const [storageType, setStorageType] = useState(sp.get("storage") || storageTypes[0].id);
  const [imageCategory, setImageCategory] = useState(sp.get("imageCategory") || "popular");
  const [osImage, setOsImage] = useState(sp.get("image") || "ubuntu");
  const [autoBackup, setAutoBackup] = useState(sp.get("backup") === "true");
  const [showMoreImages, setShowMoreImages] = useState(true);
  const [showAdditionalFeatures, setShowAdditionalFeatures] = useState(true);
  const [showUbuntuModal, setShowUbuntuModal] = useState(false);
  const [ubuntuVersion, setUbuntuVersion] = useState(sp.get("ubuntuVersion") || "Ubuntu 24.04");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customImageOption, setCustomImageOption] = useState(sp.get("customImageOption") || "existing");
  const [showWindowsModal, setShowWindowsModal] = useState(false);
  const [windowsVersion, setWindowsVersion] = useState(sp.get("windowsVersion") || "2025");
  const [showCpanelModal, setShowCpanelModal] = useState(false);
  const [cpanelLicence, setCpanelLicence] = useState(sp.get("cpanelLicence") || "5");
  const [cpanelVersion, setCpanelVersion] = useState(sp.get("cpanelVersion") || "Ubuntu 22.04");
  const [showRhelModal, setShowRhelModal] = useState(false);
  const [rhelVersion, setRhelVersion] = useState(sp.get("rhelVersion") || "AlmaLinux 9");
  const [showPleskModal, setShowPleskModal] = useState(false);
  const [pleskLicence, setPleskLicence] = useState(sp.get("pleskLicence") || "admin");
  const [showDebianModal, setShowDebianModal] = useState(false);
  const [debianVersion, setDebianVersion] = useState(sp.get("debianVersion") || "Debian 13");
  const [showDockerModal, setShowDockerModal] = useState(false);
  const [dockerVersion, setDockerVersion] = useState(sp.get("dockerVersion") || "Ubuntu 22.04");
  const [showLampModal, setShowLampModal] = useState(false);
  const [lampVersion, setLampVersion] = useState(sp.get("lampVersion") || "Ubuntu 22.04");
  const [showPleskWindowsModal, setShowPleskWindowsModal] = useState(false);
  const [pleskWinLicence, setPleskWinLicence] = useState(sp.get("pleskWinLicence") || "admin");
  const [pleskWinVersion, setPleskWinVersion] = useState(sp.get("pleskWinVersion") || "2016");
  const [showWebminModal, setShowWebminModal] = useState(false);
  const [webminVersion, setWebminVersion] = useState(sp.get("webminVersion") || "Ubuntu 22.04");
  const [password, setPassword] = useState(sp.get("password") ? decodeURIComponent(sp.get("password")!) : "");
  const [showPassword, setShowPassword] = useState(false);
  const [privateNetwork, setPrivateNetwork] = useState(sp.get("privateNetwork") || "none");
  const [ipv4Address, setIpv4Address] = useState(sp.get("ipv4Address") || "1ip");
  const [objectStorage, setObjectStorage] = useState(sp.get("objectStorage") || "none");
  const [serverManagement, setServerManagement] = useState(sp.get("management") || "unmanaged");
  const [monitoring, setMonitoring] = useState(sp.get("monitoring") || "none");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showSummaryDetails, setShowSummaryDetails] = useState(false);

  // Sync all selections to URL in real-time
  useEffect(() => {
    const p = new URLSearchParams();
    p.set("qty", quantity);
    p.set("duration", duration);
    p.set("regionTab", regionTab);
    p.set("location", location);
    p.set("storage", storageType);
    p.set("imageCategory", imageCategory);
    p.set("image", osImage);
    p.set("backup", String(autoBackup));
    p.set("ubuntuVersion", ubuntuVersion);
    p.set("windowsVersion", windowsVersion);
    p.set("cpanelLicence", cpanelLicence);
    p.set("cpanelVersion", cpanelVersion);
    p.set("rhelVersion", rhelVersion);
    p.set("pleskLicence", pleskLicence);
    p.set("debianVersion", debianVersion);
    p.set("dockerVersion", dockerVersion);
    p.set("lampVersion", lampVersion);
    p.set("pleskWinLicence", pleskWinLicence);
    p.set("pleskWinVersion", pleskWinVersion);
    p.set("webminVersion", webminVersion);
    p.set("customImageOption", customImageOption);
    p.set("privateNetwork", privateNetwork);
    p.set("ipv4Address", ipv4Address);
    p.set("objectStorage", objectStorage);
    p.set("management", serverManagement);
    p.set("monitoring", monitoring);
    if (password) p.set("password", encodeURIComponent(password));
    window.history.replaceState({}, "", `/vps-armazenamento/configure/${planId}?${p.toString()}`);
  }, [quantity, duration, regionTab, location, storageType, imageCategory, osImage, autoBackup,
      ubuntuVersion, windowsVersion, cpanelLicence, cpanelVersion, rhelVersion, pleskLicence,
      debianVersion, dockerVersion, lampVersion, pleskWinLicence, pleskWinVersion, webminVersion,
      customImageOption, privateNetwork, ipv4Address, objectStorage, serverManagement, monitoring,
      password, planId]);

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
    <div className="min-h-screen bg-[#000B12] text-white font-sans pb-24 relative overflow-hidden">
      <div className="fixed inset-0 bg-landing-gradient opacity-40 pointer-events-none" />
      <Navbar variant="dark" />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-12 space-y-12">

        <Link href="/vps-armazenamento#plans" className="group mb-6 flex items-center gap-2 text-lg font-bold text-sky-400 transition-all hover:text-sky-300">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Voltar para VPS de Armazenamento
        </Link>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Configure seu {plan.name}</h1>

        <div className="flex flex-wrap items-center gap-10">
          <div className="flex-1 border-2 border-sky-500/50 rounded-xl p-8 grid grid-cols-4 gap-4 relative bg-white/5 backdrop-blur-md shadow-2xl">
            <div className="space-y-1">
              <p className="text-[14px] font-bold text-slate-400 uppercase">CPU</p>
              <p className="text-[15px] font-medium leading-tight">{plan.vcpu}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[14px] font-bold text-slate-400 uppercase">RAM</p>
              <p className="text-[15px] font-medium leading-tight">{plan.ram}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[14px] font-bold text-slate-400 uppercase">ARMAZENAMENTO</p>
              <p className="text-[15px] font-medium leading-tight">{plan.storage}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[14px] font-bold text-slate-400 uppercase">TRÁFEGO</p>
              <p className="text-[15px] font-medium leading-tight">{plan.traffic}</p>
            </div>
            <Link href="/vps-armazenamento#plans" className="absolute bottom-4 right-4 text-[14px] font-bold text-sky-400 hover:underline uppercase tracking-wider">Mudar</Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[15px] font-bold text-slate-300 uppercase tracking-wide">Quantidade de servidores</span>
            <Select value={quantity} onValueChange={setQuantity}>
              <SelectTrigger className="w-16 h-10 border border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#000B12] border-white/10 text-white">
                {Array.from({ length: 25 }, (_, i) => i + 1).map(n => <SelectItem key={n} value={n.toString()} className="focus:bg-white/10 focus:text-white">{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Duration Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Selecione o ciclo de faturamento</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {durations.map((d: any) => (
              <div key={d.id} className="space-y-3">
                <div
                  onClick={() => setDuration(d.id)}
                  className={cn(
                    "cursor-pointer rounded-xl border p-8 flex items-center justify-between transition-all relative h-24 shadow-xl backdrop-blur-md",
                    duration === d.id ? "border-sky-500 bg-white/10" : "border-white/10 bg-white/5"
                  )}
                >
                  {d.discount && (
                    <div className="absolute -top-3 left-6 bg-slate-50 text-emerald-500 text-[13px] font-bold px-2 py-0.5 border border-slate-100">
                      {d.discount}
                    </div>
                  )}
                  <span className="text-lg font-medium">{d.label}</span>
                  <div className="text-right">
                    {d.oldEur && <p className="text-[14px] text-rose-500 line-through font-medium opacity-70">{formatBRLPerMonth(d.oldEur)}</p>}
                    <p className="text-2xl font-black text-white">{formatBRL(d.eur)} <span className="text-base font-normal text-slate-400">/ mês</span></p>
                  </div>
                </div>
                <div className={cn(
                  "text-center py-1.5 rounded-b-md text-[15px] font-bold transition-colors uppercase tracking-wider",
                  d.setupFee === "Sem taxa de instalação" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400"
                )}>
                  {d.setupFee}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator className="bg-white/10" />

        {/* Region Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white uppercase tracking-widest">Região</h2>
          </div>

          <div className="flex flex-nowrap items-start gap-8">
            <div className="w-1/3">
              <img src="/1098128_7510-removebg-preview.png" alt="Map" className="w-full h-auto opacity-80" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex border-b border-white/10">
                {regions.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRegionTab(r.id)}
                    className={cn(
                      "px-8 py-3 text-[15px] font-bold uppercase tracking-wider relative transition-colors",
                      regionTab === r.id ? "text-sky-400" : "text-slate-500 hover:text-white"
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
                      "w-full border p-4 flex items-center justify-between text-base font-bold bg-white/5 backdrop-blur-md relative transition-all rounded-lg",
                      location === loc.id ? "border-sky-500 bg-white/10" : "border-white/10",
                      loc.recommended && "mt-6"
                    )}
                  >
                    {loc.recommended && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[13px] font-black px-4 py-1 rounded-md shadow-lg shadow-sky-500/20 z-10 whitespace-nowrap uppercase tracking-widest">
                        Recomendado - Melhor latência para sua região
                      </div>
                    )}
                    <div className="flex-1 text-left text-white text-base md:text-lg">{loc.name}</div>
                    <div className="flex-1 text-center text-slate-400 font-medium">– Latência de {loc.latency}</div>
                    <div className="flex-1 text-right text-white font-black text-base md:text-lg">{loc.price === "Livre" ? "Grátis" : formatBRLPerMonth(loc.eur)}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Separator className="bg-white/10" />

        {/* Image Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-widest">Imagem</h2>
            <button
              onClick={() => setShowMoreImages(!showMoreImages)}
              className="flex items-center gap-1 text-[13px] font-black text-white uppercase tracking-wider"
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
                        "px-8 py-3 text-[15px] font-bold relative transition-colors",
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
                        else if (img.id === "cpanel" || img.name.toLowerCase().includes("cpanel")) setShowCpanelModal(true);
                        setOsImage(img.id);
                      }}
                      className={cn(
                        "cursor-pointer rounded-lg border p-4 flex items-center gap-3 transition-all bg-white/5 backdrop-blur-md",
                        osImage === img.id ? "border-sky-500 bg-white/10" : "border-white/10"
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                        {img.icon ? <img src={img.icon} alt="" className="w-5 h-5 object-contain" /> : <Server size={16} className="text-slate-500" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[15px] font-bold text-white">{img.name}</p>
                        <p className="text-[14px] text-slate-400 font-medium uppercase tracking-wide">
                          {typeof img.price === "number" ? formatBRLPerMonth(img.price) : img.eur ? formatBRLPerMonth(img.eur) : img.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <Separator className="bg-white/10" />

        {/* Data Protection Section */}
        {planId !== "50" && (
          <>
            <section className="bg-white/5 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden mb-8">
              <div className="p-8">
                <div className="flex items-center gap-2 mb-8">
                  <h2 className="text-4xl font-black text-white uppercase tracking-tight">Proteção de Dados com Backup Automático</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-5 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative w-64 h-64 flex-shrink-0">
                      <Image src="/4870961_54433-nobg.svg" alt="Proteção de Backup" width={256} height={256} className="object-contain" />
                    </div>
                    <div className="flex-1">
                      <ul className="space-y-4">
                        {["Backups automáticos diários.", "Recuperação instantânea.", "Mantém as últimas 10 versões.", "Nenhuma configuração necessária."].map((benefit, i) => (
                          <li key={i} className="flex items-center gap-3 text-slate-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(0,163,255,0.5)] flex-shrink-0" />
                            <span className="text-base font-bold uppercase tracking-tight leading-snug">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={() => setAutoBackup(true)} className={cn("relative p-6 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center min-h-[160px] bg-white/5 backdrop-blur-md", autoBackup ? "border-sky-500 shadow-lg shadow-sky-500/20" : "border-white/10 hover:border-white/20")}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#000B12] px-4 py-1 rounded-full border border-sky-500/30"><span className="text-[14px] font-black text-sky-400 uppercase tracking-widest whitespace-nowrap">Recomendado</span></div>
                      <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">Backup Automático</h3>
                      <div className="text-3xl font-black text-white mb-2">{formatBRLPerMonth(plan.backupEur)}</div>
                    </button>
                    <button onClick={() => setAutoBackup(false)} className={cn("p-6 rounded-xl border-2 transition-all text-center flex items-center justify-center min-h-[160px] bg-white/5 backdrop-blur-md", !autoBackup ? "border-sky-500 shadow-lg" : "border-white/10 hover:border-white/20")}><h3 className="text-2xl font-bold text-slate-500 uppercase tracking-tight">Sem Proteção</h3></button>
                  </div>
                </div>
              </div>
            </section>

            <Separator className="bg-white/10" />
          </>
        )}

        {/* Additional Features Section */}
        <section className="bg-white/5 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-black text-white uppercase tracking-tight">Recursos Adicionais</h2>
              <button onClick={() => setShowAdditionalFeatures(!showAdditionalFeatures)} className="flex items-center gap-1 text-[15px] font-black text-white uppercase tracking-wider">
                {showAdditionalFeatures ? <>Fechar <ChevronUp size={14} /></> : <>Ver mais <ChevronDown size={14} /></>}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {showAdditionalFeatures && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-12 overflow-hidden px-1 py-1">
                  <div className="space-y-8">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">Rede</h3>
                    <div className="space-y-6 pl-4 pr-1">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3"><span className="text-lg font-black text-slate-400 uppercase tracking-tight">Rede Privada</span></div>
                        <div className="md:col-span-9">
                          <Select value={privateNetwork} onValueChange={setPrivateNetwork}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                        <div className="md:col-span-3"><span className="text-lg font-black text-slate-400 uppercase tracking-tight">IPv4</span></div>
                        <div className="md:col-span-9">
                          <Select value={ipv4Address} onValueChange={setIpv4Address}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#000B12] border-white/10 text-white"><SelectItem value="1ip"><div className="flex items-center justify-between w-[300px]"><span>1 Endereço IP</span><span className="text-emerald-500">Grátis</span></div></SelectItem><SelectItem value="2ip"><div className="flex items-center justify-between w-[300px]"><span>+1 IP Adicional</span><span className="font-black text-white">{formatBRLPerMonth(plan.additionalIpEur)}</span></div></SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="space-y-8">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">Add-Ons</h3>
                    <div className="space-y-6 pl-4 pr-1">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3"><span className="text-lg font-black text-slate-400 uppercase tracking-tight">Armazenamento de Objetos</span></div>
                        <div className="md:col-span-9">
                          <Select value={objectStorage} onValueChange={setObjectStorage}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white text-left"><SelectValue /></SelectTrigger>
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
                          <span className="text-lg font-black text-slate-400 uppercase tracking-tight">Gerenciamento de Servidor</span>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={serverManagement} onValueChange={setServerManagement}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#000B12] border-white/10 text-white"><SelectItem value="unmanaged">Não Gerenciado (Grátis)</SelectItem><SelectItem value="managed"><div className="flex justify-between w-[350px]"><span>Gerenciado</span><span className="font-bold text-white">{formatBRLPerMonth(plan.managedEur)}</span></div></SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2">
                          <span className="text-lg font-black text-slate-400 uppercase tracking-tight">Monitoramento</span>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={monitoring} onValueChange={setMonitoring}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#000B12] border-white/10 text-white"><SelectItem value="none">Nenhum</SelectItem><SelectItem value="full"><div className="flex justify-between w-[350px]"><span>Completo</span><span className="font-bold text-white">{formatBRLPerMonth(plan.monitoringEur)}</span></div></SelectItem></SelectContent>
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

        <Separator className="bg-white/10" />
        <section className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Login e senha para o seu servidor</h2>
          <div className="max-w-3xl space-y-8">
            {/* Username */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-3">
                <span className="text-lg font-bold text-slate-300 uppercase tracking-wider">Usuário</span>
              </div>
              <div className="md:col-span-9">
                <span className="text-white font-black text-lg">root</span>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3 pt-3">
                <span className="text-lg font-bold text-slate-400 uppercase tracking-tight">Senha</span>
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
                    className="text-[#3B82F6] text-sm hover:underline font-bold"
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
                      "h-12 bg-white/5 border-white/10 focus:border-sky-500 pr-12 text-white",
                      passwordTouched && password.length > 0 && !isPasswordValid(password) && "border-rose-500 focus:border-rose-500"
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
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-1 font-bold">
                    <AlertCircle size={14} />
                    <span>Por favor, insira uma senha válida (Mín. 8 caracteres, maiúscula, número e símbolo)</span>
                  </div>
                )}
                {isPasswordValid(password) && (
                  <div className="flex items-center gap-2 text-emerald-500 text-sm mt-1 font-bold">
                    <Check size={14} />
                    <span>Senha válida e segura</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info List */}
            <div className="md:ml-[25%] pt-4">
              <ul className="list-disc space-y-2 text-slate-400 text-[15px] ml-4 font-medium leading-relaxed">
                <li>Você pode adicionar chaves SSH mais tarde no Painel de Controle.</li>
                <li>Sua senha não será enviada por e-mail.</li>
                <li>Mantenha-a segura para acesso ao servidor. Se perdê-la, será necessária uma reinstalação.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Bottom Summary Bar - UI IDENTICAL TO VPS */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#000B12]/90 border-t border-white/10 z-[100] shadow-[0_-4px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <AnimatePresence>
          {showSummaryDetails && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-white/10 bg-white/5 backdrop-blur-md">
              <div className="max-w-7xl mx-auto px-10 py-6">
                <h3 className="text-base font-black text-white mb-4 uppercase tracking-widest">Detalhamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  {(() => {
                    const selectedDur = durations.find((d: any) => d.id === duration) || durations[0];
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
                      items.push({ label: `Armazenamento de Objetos (${objectStorage.toUpperCase()})`, price: osEur * durMonths * qty * currentRate });
                    }

                    if (serverManagement === "managed") items.push({ label: `Gerenciado`, price: plan.managedEur * durMonths * qty * currentRate });

                    if (monitoring === "full") items.push({ label: `Monitoramento`, price: plan.monitoringEur * durMonths * qty * currentRate });

                    // Image/OS Pricing
                    if (osImage === "windows") {
                      const eur = windowsVersion === "2016" ? currentImagePrices.win2016 : currentImagePrices.windows;
                      items.push({ label: `Windows Server ${windowsVersion}`, price: eur * durMonths * qty * currentRate });
                    } else if (osImage === "cpanel") {
                      const cpanelPricesMap: Record<string, number> = {
                        "5": 43.50, "30": 58.00, "50": 77.00, "100": 94.00, "150": 117.00,
                        "200": 157.00, "250": 197.00, "300": 237.00
                      };
                      let licPrice = cpanelPricesMap[cpanelLicence];
                      if (!licPrice) {
                        const accounts = parseInt(cpanelLicence);
                        licPrice = 237.00 + (Math.floor((accounts - 300) / 50) * 40.00);
                      }
                      items.push({ label: `Licença cPanel (${cpanelLicence} contas)`, price: licPrice * durMonths * qty * currentRate });
                    } else if (osImage === "plesk" || osImage === "plesk-linux") {
                      const licEur = pleskLicence === "admin" ? currentImagePrices.pleskLinux :
                        pleskLicence === "host" ? currentImagePrices.pleskHost :
                          currentImagePrices.pleskPro;
                      items.push({ label: `Licença Plesk (${pleskLicence})`, price: licEur * durMonths * qty * currentRate });
                    } else if (osImage === "plesk-win") {
                      const licEur = pleskWinLicence === "admin" ? currentImagePrices.pleskLinux :
                        pleskWinLicence === "host" ? currentImagePrices.pleskHost :
                          currentImagePrices.pleskPro;
                      const verEur = pleskWinVersion === "2016" ? currentImagePrices.win2016 : currentImagePrices.windows;
                      items.push({ label: `Plesk + Windows (${pleskWinLicence})`, price: (licEur + verEur) * durMonths * qty * currentRate });
                    }

                    return items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-base border-b border-white/5 pb-1">
                        <span className="text-slate-400 font-medium">{item.label}</span>
                        <span className="font-black text-white">{formatBRL(item.price / currentRate)}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="max-w-7xl mx-auto px-10 h-24 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center shadow-lg border border-white/10"><ShieldCheck className="w-6 h-6 text-sky-400" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-lg uppercase tracking-widest">Resumo</h3>
                <button onClick={() => setShowSummaryDetails(!showSummaryDetails)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  {showSummaryDetails ? <ChevronDown className="w-5 h-5 text-sky-400 shadow-sky-400/20" /> : <ChevronUp className="w-5 h-5 text-sky-400 shadow-sky-400/20" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-8 lg:gap-16">
            {(() => {
              const selectedDur = durations.find((d: any) => d.id === duration) || durations[0];
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
                const cpanelPricesMap: Record<string, number> = {
                  "5": 43.50, "30": 58.00, "50": 77.00, "100": 94.00, "150": 117.00,
                  "200": 157.00, "250": 197.00, "300": 237.00
                };
                let eur = cpanelPricesMap[cpanelLicence];
                if (!eur) {
                  const accounts = parseInt(cpanelLicence);
                  eur = 237.00 + (Math.floor((accounts - 300) / 50) * 40.00);
                }
                additionalEur += eur;
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
                <div className="flex items-center gap-4 md:gap-6 lg:gap-10">
                  <div className="flex flex-col gap-1 min-w-[200px]">
                    <div className="flex justify-between items-center text-[13px] uppercase tracking-widest"><span className="text-slate-400 font-bold">Mensal</span><span className="font-black text-white whitespace-nowrap">{formatBRL(totalMonthly * qty / RATE)}</span></div>
                    <div className="flex justify-between items-center mt-1"><span className="font-black text-white text-[15px] uppercase tracking-tighter">Vencido Hoje</span><span className="text-2xl font-black text-white whitespace-nowrap drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{formatBRL(dueToday / RATE)}</span></div>
                  </div>
                  <Button disabled={!isPasswordValid(password)} onClick={() => router.push(`/checkout/personal-data?planId=${planId}&qty=${quantity}&duration=${duration}&location=${location}&image=${osImage}&management=${serverManagement}&password=${encodeURIComponent(password)}&type=storage-vps`)} className={cn("font-black h-14 px-12 rounded-lg text-xl shadow-xl uppercase tracking-widest transition-all", isPasswordValid(password) ? "bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20" : "bg-white/10 text-slate-500 cursor-not-allowed")}>Próximo</Button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Modals same as VPS */}
      <AnimatePresence>
        {showUbuntuModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowUbuntuModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-10 space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/image.png" alt="Ubuntu" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">Ubuntu</h2></div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Versão</label>
                <Select value={ubuntuVersion} onValueChange={setUbuntuVersion}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white"><SelectItem value="Ubuntu 24.04">Ubuntu 24.04 LTS</SelectItem><SelectItem value="Ubuntu 22.04">Ubuntu 22.04 LTS</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4"><Button variant="ghost" onClick={() => setShowUbuntuModal(false)} className="text-slate-400 hover:text-white uppercase tracking-widest">Pular</Button><Button onClick={() => setShowUbuntuModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Começar</Button></div>
            </motion.div>
          </div>
        )}

        {showWindowsModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowWindowsModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-10 space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/windows.png" alt="Windows" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">Windows Server</h2></div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Selecione a Versão</label>
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
                        "flex items-center justify-between p-4 rounded-xl border transition-all bg-white/5 backdrop-blur-md",
                        windowsVersion === v.id ? "border-sky-500 bg-white/10 shadow-lg shadow-sky-500/20" : "border-white/10"
                      )}
                    >
                      <span className="font-black text-white">{v.name}</span>
                      <span className="text-sm font-black text-sky-400">{v.price}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-4"><Button variant="ghost" onClick={() => setShowWindowsModal(false)} className="text-slate-400 hover:text-white uppercase tracking-widest">Pular</Button><Button onClick={() => setShowWindowsModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Configurar</Button></div>
            </motion.div>
          </div>
        )}

        {showPleskWindowsModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPleskWindowsModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-10 space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4">
                <img src="/plesk.png" alt="Plesk" className="w-8 h-8 object-contain" />
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Plesk + Windows</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Licença</label>
                  <Select value={pleskWinLicence} onValueChange={setPleskWinLicence}>
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 text-white">
                      <SelectValue>
                        <div className="flex items-center justify-between w-full pr-4 text-[13px] leading-tight">
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-white">
                              {pleskWinLicence === "admin" ? "Plesk Obsidian Web Admin Edition" :
                                pleskWinLicence === "host" ? "Plesk Obsidian Web Host Edition" :
                                  "Plesk Obsidian Web Pro Edition"}
                            </span>
                            <span className="text-emerald-400 font-black text-[11px] uppercase tracking-widest">1 mês grátis</span>
                          </div>
                          <div className="flex items-center gap-2 text-sky-400 font-black">
                            <span>
                              {pleskWinLicence === "admin" ? currentImagePrices.pleskWin :
                                pleskWinLicence === "host" ? currentImagePrices.pleskHost :
                                  currentImagePrices.pleskPro}
                            </span>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#000B12] border-white/10 text-white z-[130]">
                      <SelectItem value="admin">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <div className="flex flex-col">
                            <span className="font-black text-sky-400 uppercase tracking-tighter">Plesk Obsidian Web Admin Edition</span>
                            <span className="text-emerald-400 font-black text-xs uppercase">1 mês grátis</span>
                          </div>
                          <span className="font-black text-white">{currentImagePrices.pleskWin.replace(" /mês", "")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="host">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <div className="flex flex-col">
                            <span className="font-black text-white uppercase tracking-tighter">Plesk Obsidian Web Host Edition</span>
                            <span className="text-emerald-400 font-black text-xs uppercase">1 mês grátis</span>
                          </div>
                          <span className="font-black text-white">{currentImagePrices.pleskHost.replace(" /mês", "")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pro">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <div className="flex flex-col">
                            <span className="font-black text-white uppercase tracking-tighter">Plesk Obsidian Web Pro Edition</span>
                            <span className="text-emerald-400 font-black text-xs uppercase">1 mês grátis</span>
                          </div>
                          <span className="font-black text-white">{currentImagePrices.pleskPro.replace(" /mês", "")}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Versão</label>
                  <Select value={pleskWinVersion} onValueChange={setPleskWinVersion}>
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 text-white">
                      <SelectValue>
                        <div className="flex items-center justify-between w-full pr-4 text-[13px]">
                          <span className="font-bold text-white">Windows Server {pleskWinVersion} Datacenter</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#000B12] border-white/10 text-white z-[130]">
                      <SelectItem value="2016">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <span className="font-black text-sky-400 uppercase tracking-tighter">Windows Server 2016 Datacenter</span>
                          <span className="font-black text-white">{formatBRL(currentImagePrices.win2016)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="2019">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <span className="font-black text-white uppercase tracking-tighter">Windows Server 2019 Datacenter</span>
                          <span className="font-black text-white">{formatBRL(currentImagePrices.windows)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="2022">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <span className="font-black text-white uppercase tracking-tighter">Windows Server 2022 Datacenter</span>
                          <span className="font-black text-white">{formatBRL(currentImagePrices.windows)}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-4">
                <Button variant="ghost" onClick={() => setShowPleskWindowsModal(false)} className="text-slate-400 hover:text-white uppercase tracking-widest font-black">CANCELAR</Button>
                <Button onClick={() => setShowPleskWindowsModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">CONFIGURAR</Button>
              </div>
            </motion.div>
          </div>
        )}

        {showPleskModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPleskModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-10 space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4">
                <img src="/plesk.png" alt="Plesk" className="w-8 h-8 object-contain" />
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Plesk + Linux</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Licença</label>
                  <Select value={pleskLicence} onValueChange={setPleskLicence}>
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 text-white">
                      <SelectValue>
                        <div className="flex items-center justify-between w-full pr-4 text-[13px] leading-tight">
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-white">
                              {pleskLicence === "admin" ? "Plesk Obsidian Web Admin Edition" :
                                pleskLicence === "host" ? "Plesk Obsidian Web Host Edition" :
                                  "Plesk Obsidian Web Pro Edition"}
                            </span>
                            <span className="text-emerald-400 font-black text-[11px] uppercase tracking-widest">1 mês grátis</span>
                          </div>
                          <div className="flex items-center gap-2 text-sky-400 font-black">
                            <span>
                              {pleskLicence === "admin" ? currentImagePrices.pleskLinux :
                                pleskLicence === "host" ? currentImagePrices.pleskHost :
                                  currentImagePrices.pleskPro}
                            </span>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#000B12] border-white/10 text-white z-[130]">
                      <SelectItem value="admin">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <div className="flex flex-col">
                            <span className="font-black text-sky-400 uppercase tracking-tighter">Plesk Obsidian Web Admin Edition</span>
                            <span className="text-emerald-400 font-black text-xs uppercase">1 mês grátis</span>
                          </div>
                          <span className="font-black text-white">{formatBRL(currentImagePrices.pleskLinux)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="host">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <div className="flex flex-col">
                            <span className="font-black text-white uppercase tracking-tighter">Plesk Obsidian Web Host Edition</span>
                            <span className="text-emerald-400 font-black text-xs uppercase">1 mês grátis</span>
                          </div>
                          <span className="font-black text-white">{formatBRL(currentImagePrices.pleskHost)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pro">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <div className="flex flex-col">
                            <span className="font-black text-white uppercase tracking-tighter">Plesk Obsidian Web Pro Edition</span>
                            <span className="text-emerald-400 font-black text-xs uppercase">1 mês grátis</span>
                          </div>
                          <span className="font-black text-white">{formatBRL(currentImagePrices.pleskPro)}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-12 pt-4">
                <button onClick={() => setShowPleskModal(false)} className="text-slate-400 hover:text-white uppercase tracking-widest font-black text-sm">Pular</button>
                <Button onClick={() => setShowPleskModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black h-14 px-12 rounded-lg text-lg uppercase tracking-widest">Começar</Button>
              </div>
            </motion.div>
          </div>
        )}

        {showCpanelModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCpanelModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-10 space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4">
                <img src="/cpanel.png" alt="cPanel" className="w-10 h-10 object-contain" />
                <h2 className="text-xl font-black text-white uppercase tracking-tight">cPanel/WHM</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Licença (Número de Contas)</label>
                  <Select value={cpanelLicence} onValueChange={setCpanelLicence}>
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#000B12] border-white/10 text-white z-[130] max-h-[300px]">
                      {[
                        { id: "5", name: "cPanel Admin (até 5 contas)", price: 43.50 },
                        { id: "30", name: "cPanel Pro (até 30 contas)", price: 58.00 },
                        { id: "50", name: "cPanel Plus (até 50 contas)", price: 77.00 },
                        { id: "100", name: "cPanel Premier (até 100 contas)", price: 94.00 },
                        { id: "150", name: "cPanel Premier (até 150 contas)", price: 117.00 },
                        { id: "200", name: "cPanel Premier (até 200 contas)", price: 157.00 },
                        { id: "250", name: "cPanel Premier (até 250 contas)", price: 197.00 },
                        { id: "300", name: "cPanel Premier (até 300 contas)", price: 237.00 },
                        { id: "350", name: "cPanel Premier (até 350 contas)", price: 277.00 },
                        { id: "400", name: "cPanel Premier (até 400 contas)", price: 317.00 },
                        { id: "450", name: "cPanel Premier (até 450 contas)", price: 357.00 },
                        { id: "500", name: "cPanel Premier (até 500 contas)", price: 397.00 },
                        { id: "550", name: "cPanel Premier (até 550 contas)", price: 437.00 },
                        { id: "600", name: "cPanel Premier (até 600 contas)", price: 477.00 },
                        { id: "650", name: "cPanel Premier (até 650 contas)", price: 517.00 },
                        { id: "700", name: "cPanel Premier (até 700 contas)", price: 557.00 },
                        { id: "750", name: "cPanel Premier (até 750 contas)", price: 597.00 },
                        { id: "800", name: "cPanel Premier (até 800 contas)", price: 637.00 },
                        { id: "850", name: "cPanel Premier (até 850 contas)", price: 677.00 },
                        { id: "900", name: "cPanel Premier (até 900 contas)", price: 717.00 },
                        { id: "950", name: "cPanel Premier (até 950 contas)", price: 757.00 },
                        { id: "1000", name: "cPanel Premier (até 1000 contas)", price: 797.00 },
                      ].map((lic) => (
                        <SelectItem key={lic.id} value={lic.id}>
                          <div className="flex items-center justify-between w-[480px] py-1">
                            <span className="font-black text-white uppercase tracking-tighter">{lic.name}</span>
                            <span className="font-black text-sky-400">{formatBRL(lic.price)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Sistema Operacional</label>
                  <Select value={cpanelVersion} onValueChange={setCpanelVersion}>
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#000B12] border-white/10 text-white z-[130]">
                      <SelectItem value="Ubuntu 22.04">Ubuntu 22.04 LTS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-4">
                <Button variant="ghost" onClick={() => setShowCpanelModal(false)} className="text-slate-400 hover:text-white uppercase tracking-widest font-black">CANCELAR</Button>
                <Button onClick={() => setShowCpanelModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">CONFIGURAR</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
