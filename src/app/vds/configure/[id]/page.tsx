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

// Base rate for fallback if API fails
const FALLBACK_EUR_RATE = 5.86;

// Helper to get OS/Panel prices based on plan and version
const getImagePrices = (id: string) => {
  const base = {
    cpanel: 43.50, // 21.75 * 2
    pleskLinux: 24.00, // 12.00 * 2
    pleskWin: 24.00,
    pleskPro: 38.00,
    pleskHost: 73.00
  };

  if (id === "s") {
    return { ...base, windows: 70.00, windows_setup: 0 }; // 35.00 * 2
  }
  if (id === "m") {
    return { ...base, windows: 90.00, windows_setup: 0 };
  }
  if (id === "l") {
    return { ...base, windows: 110.00, windows_setup: 0 };
  }
  if (id === "xl") {
    return { ...base, windows: 130.00, windows_setup: 0 };
  }
  if (id === "xxl") {
    return { ...base, windows: 150.00, windows_setup: 0 };
  }

  return { ...base, windows: 70.00, windows_setup: 0 };
};

// Mock data for VDS plans
const plansData: Record<string, any> = {
  "s": {
    name: "Cloud VDS S",
    vcpu: "3 Núcleos Físicos",
    cpuModel: "AMD EPYC 7282 2.8 GHz",
    ram: "24 GB RAM",
    storage: "180 GB NVMe",
    storageNote: "Mais armazenamento disponível",
    port: "Porta de 250 Mbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 68.80, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 65.36, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 5%", oldEur: 68.80 },
      { id: "12", label: "12 meses", eur: 55.04, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 68.80 },
    ],
    storageUpgrades: [
      { id: "ssd-1tb", name: "1 TB SSD", eur: 25.00 },
      { id: "ssd-2tb", name: "2 TB SSD", eur: 50.00 },
      { id: "ssd-4tb", name: "4 TB SSD", eur: 100.00 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "149 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "91 ms", eur: 8.20, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "149 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "132 ms", eur: 8.20 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "120 ms", eur: 10.00 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "91 ms", eur: 8.20, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "148 ms", eur: 10.00 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "346 ms", eur: 16.60 },
        { id: "jp", name: "Ásia (Japão)", latency: "271 ms", eur: 16.60 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 16.60 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "351 ms", eur: 16.60 },
      ],
    },
    backupEur: 4.60,
    privateNetworkEur: 5.78,
    additionalIpEur: 7.00,
    managedEur: 109.99,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    }
  },
  "m": {
    name: "Cloud VDS M",
    vcpu: "4 Núcleos Físicos",
    cpuModel: "AMD EPYC 7282 2.8 GHz",
    ram: "32 GB RAM",
    storage: "240 GB NVMe",
    storageNote: "Mais armazenamento disponível",
    port: "Porta de 500 Mbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 89.60, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 85.12, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 5%", oldEur: 89.60 },
      { id: "12", label: "12 meses", eur: 71.68, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 89.60 },
    ],
    storageUpgrades: [
      { id: "ssd-1tb", name: "1 TB SSD", eur: 25.00 },
      { id: "ssd-2tb", name: "2 TB SSD", eur: 50.00 },
      { id: "ssd-4tb", name: "4 TB SSD", eur: 100.00 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "90 ms", eur: 16.40, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "131 ms", eur: 16.40 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "119 ms", eur: 20.00 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "90 ms", eur: 16.40, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 20.00 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "345 ms", eur: 33.20 },
        { id: "jp", name: "Ásia (Japão)", latency: "270 ms", eur: 33.20 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 33.20 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "350 ms", eur: 33.20 },
      ],
    },
    backupEur: 4.60,
    privateNetworkEur: 5.78,
    additionalIpEur: 7.00,
    managedEur: 109.99,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    }
  },
  "l": {
    name: "Cloud VDS L",
    vcpu: "6 Núcleos Físicos",
    cpuModel: "AMD EPYC 7282 2.8 GHz",
    ram: "48 GB RAM",
    storage: "360 GB NVMe",
    storageNote: "Mais armazenamento disponível",
    port: "Porta de 750 Mbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 128.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 121.60, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 5%", oldEur: 128.00 },
      { id: "12", label: "12 meses", eur: 102.40, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 128.00 },
    ],
    storageUpgrades: [
      { id: "ssd-1tb", name: "1 TB SSD", eur: 25.00 },
      { id: "ssd-2tb", name: "2 TB SSD", eur: 50.00 },
      { id: "ssd-4tb", name: "4 TB SSD", eur: 100.00 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "89 ms", eur: 32.80, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "138 ms", eur: 32.80 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "119 ms", eur: 40.00 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "89 ms", eur: 32.80, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "150 ms", eur: 40.00 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "347 ms", eur: 66.40 },
        { id: "jp", name: "Ásia (Japão)", latency: "269 ms", eur: 66.40 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 66.40 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "350 ms", eur: 66.40 },
      ],
    },
    backupEur: 4.60,
    privateNetworkEur: 5.78,
    additionalIpEur: 7.00,
    managedEur: 109.99,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    }
  },
  "xl": {
    name: "Cloud VDS XL",
    vcpu: "8 Núcleos Físicos",
    cpuModel: "AMD EPYC 7282 2.8 GHz",
    ram: "64 GB RAM",
    storage: "480 GB NVMe",
    storageNote: "Mais armazenamento disponível",
    port: "Porta de 1 Gbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 164.80, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 156.56, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 5%", oldEur: 164.80 },
      { id: "12", label: "12 meses", eur: 131.84, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 164.80 },
    ],
    storageUpgrades: [
      { id: "ssd-1tb", name: "1 TB SSD", eur: 25.00 },
      { id: "ssd-2tb", name: "2 TB SSD", eur: 50.00 },
      { id: "ssd-4tb", name: "4 TB SSD", eur: 100.00 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "147 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "89 ms", eur: 49.20, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "147 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "138 ms", eur: 49.20 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "118 ms", eur: 60.00 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "89 ms", eur: 49.20, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "149 ms", eur: 60.00 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "347 ms", eur: 99.60 },
        { id: "jp", name: "Ásia (Japão)", latency: "269 ms", eur: 99.60 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 99.60 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "350 ms", eur: 99.60 },
      ],
    },
    backupEur: 4.60,
    privateNetworkEur: 5.78,
    additionalIpEur: 7.00,
    managedEur: 109.99,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    }
  },
  "xxl": {
    name: "Cloud VDS XXL",
    vcpu: "12 Núcleos Físicos",
    cpuModel: "AMD EPYC 7282 2.8 GHz",
    ram: "96 GB RAM",
    storage: "720 GB NVMe",
    storageNote: "Mais armazenamento disponível",
    port: "Porta de 1 Gbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 238.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 226.10, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 5%", oldEur: 238.00 },
      { id: "12", label: "12 meses", eur: 190.40, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 238.00 },
    ],
    storageUpgrades: [
      { id: "ssd-1tb", name: "1 TB SSD", eur: 25.00 },
      { id: "ssd-2tb", name: "2 TB SSD", eur: 50.00 },
      { id: "ssd-4tb", name: "4 TB SSD", eur: 100.00 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "146 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 82.00, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "146 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "139 ms", eur: 82.00 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", eur: 100.00 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 82.00, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "148 ms", eur: 100.00 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "348 ms", eur: 166.00 },
        { id: "jp", name: "Ásia (Japão)", latency: "268 ms", eur: 166.00 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 166.00 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "349 ms", eur: 166.00 },
      ],
    },
    backupEur: 4.60,
    privateNetworkEur: 5.78,
    additionalIpEur: 7.00,
    managedEur: 109.99,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
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

const images = {
  popular: [
    { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
    { id: "custom", name: "Imagens personalizadas", price: "Incluído", icon: "/custom-images.png" },
    { id: "deepseek", name: "DeepSeek", price: "Incluído", icon: "/deepseek.png" },
    { id: "windows", name: "Servidor Windows", eur: 35.00, icon: "/windows.png" },
    { id: "cpanel", name: "cPanel", eur: 21.75, icon: "/cpanel.png" },
    { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
    { id: "plesk", name: "Plesk + Linux", eur: 12.00, icon: "/plesk.png" },
  ],
  os: [
    { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
    { id: "windows", name: "Servidor Windows", eur: 35.00, icon: "/windows.png" },
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
    { id: "cpanel", name: "cPanel", eur: 21.75, icon: "/cpanel.png" },
    { id: "plesk-win", name: "Plesk + Windows", eur: 12.00, icon: "/plesk.png" },
    { id: "plesk-linux", name: "Plesk + Linux", eur: 12.00, icon: "/plesk.png" },
    { id: "webmin", name: "Webmin", price: "Incluído", icon: "/webmin.png" },
    { id: "webmin-lamp", name: "Webmin + LAMP", price: "Incluído", icon: "/lamp.png" },
  ],
  blockchain: [
    { id: "ipfs", name: "IPFS Node", price: "Incluído", icon: "/ipfs.png" },
    { id: "flux", name: "Flux Node", price: "Incluído", icon: "/fluxnode.png" },
    { id: "horizen", name: "Horizen Node", price: "Incluído", icon: "/horizen.png" },
  ]
};

// (Logic moved up)

export default function VdsConfigurePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;

  const [currentRate, setCurrentRate] = useState(FALLBACK_EUR_RATE);
  const [dynamicImages, setDynamicImages] = useState(images);

  const plan = plansData[id as keyof typeof plansData] || plansData["s"];
  const durations = plan.durations;
  const storageUpgradesData = plan.storageUpgrades;
  const currentImagePrices = getImagePrices(id);

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
  const [duration, setDuration] = useState(sp.get("duration") || "12");
  const [regionTab, setRegionTab] = useState(sp.get("regionTab") || "best");
  const [location, setLocation] = useState(sp.get("location") || "eu");
  const [storageUpgrades, setStorageUpgrades] = useState<Record<string, number>>(() => {
    try { return JSON.parse(sp.get("storageUpgrades") || "{}"); } catch { return {}; }
  });
  const [imageCategory, setImageCategory] = useState(sp.get("imageCategory") || "popular");
  const [osImage, setOsImage] = useState(sp.get("image") || "ubuntu");
  const [showMoreImages, setShowMoreImages] = useState(true);
  const [showAdditionalFeatures, setShowAdditionalFeatures] = useState(true);

  // Modal states
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

  // Auth/Other states
  const [password, setPassword] = useState(sp.get("password") ? decodeURIComponent(sp.get("password")!) : "");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [privateNetwork, setPrivateNetwork] = useState(sp.get("privateNetwork") || "none");
  const [ipv4Address, setIpv4Address] = useState(sp.get("ipv4Address") || "1ip");
  const [backupSpace, setBackupSpace] = useState(sp.get("backupSpace") || "none");
  const [objectStorage, setObjectStorage] = useState(sp.get("objectStorage") || "none");
  const [serverManagement, setServerManagement] = useState(sp.get("management") || "unmanaged");
  const [monitoring, setMonitoring] = useState(sp.get("monitoring") || "none");
  const [showSummaryDetails, setShowSummaryDetails] = useState(false);

  // Sync all selections to URL in real-time
  const planIdForUrl = params.id as string;
  useEffect(() => {
    const p = new URLSearchParams();
    p.set("qty", quantity);
    p.set("duration", duration);
    p.set("regionTab", regionTab);
    p.set("location", location);
    p.set("storageUpgrades", JSON.stringify(storageUpgrades));
    p.set("imageCategory", imageCategory);
    p.set("image", osImage);
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
    p.set("backupSpace", backupSpace);
    p.set("objectStorage", objectStorage);
    p.set("management", serverManagement);
    p.set("monitoring", monitoring);
    if (password) p.set("password", encodeURIComponent(password));
    window.history.replaceState({}, "", `/vds/configure/${planIdForUrl}?${p.toString()}`);
  }, [quantity, duration, regionTab, location, storageUpgrades, imageCategory, osImage,
      ubuntuVersion, windowsVersion, cpanelLicence, cpanelVersion, rhelVersion, pleskLicence,
      debianVersion, dockerVersion, lampVersion, pleskWinLicence, pleskWinVersion, webminVersion,
      customImageOption, privateNetwork, ipv4Address, backupSpace, objectStorage, serverManagement,
      monitoring, password, planIdForUrl]);

  const totalExtraBoxes = Object.values(storageUpgrades).reduce((a, b) => a + b, 0);

  const handleStorageQtyChange = (upgradeId: string, qty: number) => {
    setStorageUpgrades(prev => {
      const next = { ...prev };
      if (qty === 0) {
        delete next[upgradeId];
      } else {
        next[upgradeId] = qty;
      }
      return next;
    });
  };

  const isStorageDisabled = (upgradeId: string) => {
    const currentQty = storageUpgrades[upgradeId] || 0;
    if (currentQty > 0) return false;
    return totalExtraBoxes >= 2;
  };

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

  const calculateItems = () => {
    const items = [];
    const durationObj = durations.find((d: any) => d.id === duration);
    const durationMonths = parseInt(duration);
    const qty = parseInt(quantity) || 1;

    if (durationObj) {
      // Base Plan
      items.push({
        label: `${plan.name} (${durationMonths} ${durationMonths === 1 ? "mês" : "meses"})${qty > 1 ? ` × ${qty}` : ""}`,
        price: durationObj.eur * currentRate * durationMonths * qty
      });

      // Location
      const allLocations = Object.values(plan.locations).flat() as any[];
      const locObj = allLocations.find(l => l.id === location);
      if (locObj && locObj.eur) {
        items.push({
          label: `Localização: ${locObj.name}${qty > 1 ? ` × ${qty}` : ""}`,
          price: locObj.eur * currentRate * durationMonths * qty
        });
      }

      // Storage Upgrades
      Object.entries(storageUpgrades).forEach(([upgradeId, upgradeQty]) => {
        const upgrade = storageUpgradesData.find((u: any) => u.id === upgradeId);
        if (upgrade) {
          items.push({
            label: `Upgrade: ${upgrade.name}${qty > 1 ? ` × ${qty}` : ""}`,
            price: upgrade.eur * currentRate * durationMonths * qty * upgradeQty
          });
        }
      });

      // OS / Panel Pricing
      if (osImage === "windows") {
        items.push({
          label: `Windows Server ${windowsVersion}${qty > 1 ? ` × ${qty}` : ""}`,
          price: currentImagePrices.windows * currentRate * durationMonths * qty
        });
        if (currentImagePrices.windows_setup > 0) {
          items.push({ label: `Taxa de Instalação: Windows Server`, price: currentImagePrices.windows_setup * currentRate * qty });
        }
      } else if (osImage === "cpanel") {
        let eur = currentImagePrices.cpanel;
        const accounts = parseInt(cpanelLicence);
        if (accounts === 30) eur = 34.51;
        else if (accounts === 50) eur = 45.82;
        else if (accounts === 100) eur = 55.93;
        else if (accounts === 150) eur = 69.62;
        else if (accounts >= 200) {
          eur = 93.42 + (Math.floor((accounts - 200) / 50) * 23.80);
        }
        items.push({ label: `cPanel (${cpanelLicence} contas)${qty > 1 ? ` × ${qty}` : ""}`, price: eur * currentRate * durationMonths * qty });
      } else if (osImage === "plesk" || osImage === "plesk-linux") {
        let eur = currentImagePrices.pleskLinux;
        if (pleskLicence === "pro") eur = currentImagePrices.pleskPro;
        else if (pleskLicence === "host") eur = currentImagePrices.pleskHost;
        items.push({ label: `Plesk Linux (${pleskLicence})${qty > 1 ? ` × ${qty}` : ""}`, price: eur * currentRate * durationMonths * qty });
      } else if (osImage === "plesk-win") {
        let eur = currentImagePrices.pleskWin;
        if (pleskWinLicence === "pro") eur = currentImagePrices.pleskPro;
        else if (pleskWinLicence === "host") eur = currentImagePrices.pleskHost;
        items.push({ label: `Plesk Windows (${pleskWinLicence})${qty > 1 ? ` × ${qty}` : ""}`, price: eur * currentRate * durationMonths * qty });
      } else if (osImage) {
        const allImages = Object.values(dynamicImages).flat() as any[];
        const imgObj = allImages.find(i => i.id === osImage);
        if (imgObj && imgObj.eur) {
          items.push({ label: `SO/Painel: ${imgObj.name}${qty > 1 ? ` × ${qty}` : ""}`, price: imgObj.eur * currentRate * durationMonths * qty });
        } else if (imgObj) {
          items.push({ label: `SO: ${imgObj.name}${qty > 1 ? ` × ${qty}` : ""}`, price: 0 });
        }
      }

      // Add-ons
      if (privateNetwork === "enabled") {
        items.push({ label: `Rede Privada${qty > 1 ? ` × ${qty}` : ""}`, price: plan.privateNetworkEur * currentRate * durationMonths * qty });
      }

      if (ipv4Address !== "1ip") {
        const extraIps = parseInt(ipv4Address.replace("ip", "")) - 1;
        items.push({ label: `${extraIps} IP${extraIps > 1 ? "s" : ""} Adicional${extraIps > 1 ? "ais" : ""}${qty > 1 ? ` × ${qty}` : ""}`, price: plan.additionalIpEur * currentRate * extraIps * durationMonths * qty });
      }

      if (backupSpace !== "none") {
        const prices: any = { "100gb": 4.59, "500gb": 13.79, "1tb": 22.99, "2tb": 36.79 };
        const p = (prices[backupSpace] || 0);
        items.push({ label: `Espaço de Backup FTP: ${backupSpace.toUpperCase()}${qty > 1 ? ` × ${qty}` : ""}`, price: p * currentRate * durationMonths * qty });
      }

      if (objectStorage !== "none") {
        const p = (plan.objectStoragePrices[objectStorage] || 0);
        items.push({ label: `Object Storage: ${objectStorage.toUpperCase()}${qty > 1 ? ` × ${qty}` : ""}`, price: p * currentRate * durationMonths * qty });
      }

      if (serverManagement === "managed") {
        items.push({ label: `Gerenciamento de Servidor${qty > 1 ? ` × ${qty}` : ""}`, price: plan.managedEur * currentRate * durationMonths * qty });
      }

      if (monitoring === "full") {
        items.push({ label: `Monitoramento Completo${qty > 1 ? ` × ${qty}` : ""}`, price: plan.monitoringEur * currentRate * durationMonths * qty });
      }

      return items;
    }
    return [];
  };

  const calculateTotal = () => {
    const items = calculateItems() as any[];
    return items.reduce((acc: number, item: any) => acc + item.price, 0);
  };

  return (
    <div className="min-h-screen bg-[#000B12] text-white font-sans pb-40 relative overflow-hidden">
      <div className="fixed inset-0 bg-landing-gradient opacity-40 pointer-events-none" />
      <Navbar variant="dark" />

      <main className="mx-auto max-w-6xl px-6 pt-32 pb-12 space-y-12">
        {/* Header Section */}
        <div className="mb-8">
          <Link href="/vds#plans" className="group mb-6 flex items-center gap-2 text-lg font-bold text-sky-400 transition-all hover:text-sky-300">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Voltar para VDS
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase drop-shadow-sm">Configure seu {plan.name}</h1>
        </div>

        {/* Plan Summary Section */}
        <div className="flex flex-wrap items-center gap-10">
          <div className="flex-1 border-2 border-sky-500/50 bg-white/5 backdrop-blur-md rounded-xl p-8 grid grid-cols-4 gap-8 relative shadow-2xl">
            <div className="space-y-1">
              <p className="text-[14px] font-bold text-slate-400 uppercase">CPU</p>
              <div className="flex flex-col">
                <p className="text-[15px] font-medium leading-tight text-white">{plan.vcpu}</p>
                <p className="text-[15px] font-medium leading-tight text-slate-400">{plan.cpuModel}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[14px] font-bold text-slate-400 uppercase">RAM</p>
              <p className="text-[15px] font-medium leading-tight text-white">{plan.ram}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[14px] font-bold text-slate-400 uppercase">ARMAZENAMENTO</p>
              <div className="flex flex-col">
                <p className="text-[15px] font-medium leading-tight text-white">{plan.storage}</p>
                <p className="text-[15px] font-medium leading-tight text-slate-400">{plan.storageNote}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[14px] font-bold text-slate-400 uppercase">PORTA</p>
              <p className="text-[15px] font-medium leading-tight text-white">{plan.port}</p>
            </div>
            <button 
              onClick={() => router.push('/vds#plans')}
              className="absolute top-1/2 -translate-y-1/2 right-8 text-[15px] font-black text-sky-400 hover:underline uppercase tracking-wider"
            >
              Mudar
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[15px] font-bold text-slate-300 uppercase tracking-wide">Quantidade de servidores</span>
            <Select value={quantity} onValueChange={setQuantity}>
              <SelectTrigger className="w-16 h-10 border border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#000B12] border-white/10 text-white">
                {[1, 2, 3, 4, 5, 10, 15, 20, 25].map(n => <SelectItem key={n} value={n.toString()} className="focus:bg-white/10 focus:text-white">{n}</SelectItem>)}
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
            {plan.durations.map((d: any) => (
              <div key={d.id} className="space-y-3">
                <div
                  onClick={() => setDuration(d.id)}
                  className={cn(
                    "cursor-pointer rounded-xl border p-8 flex items-center justify-between transition-all relative h-24 shadow-xl backdrop-blur-md",
                    duration === d.id ? "border-sky-500 bg-white/10" : "border-white/10 bg-white/5"
                  )}
                >
                  {d.discount && (
                    <div className="absolute -top-3 left-6 bg-[#000B12] text-emerald-400 text-[13px] font-black px-3 py-1 border border-emerald-500/30 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/10">
                      {d.discount}
                    </div>
                  )}
                  <span className="text-lg font-medium">{d.label}</span>
                  <div className="text-right">
                    {d.oldEur && <p className="text-[14px] text-rose-500 line-through font-medium opacity-70">{formatBRLPerMonth(d.oldEur)}</p>}
                    <p className="text-2xl font-black text-white">{formatBRLPerMonth(d.eur)}</p>
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
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Região</h2>
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
                {(plan.locations[regionTab as keyof typeof plan.locations] || []).map((loc: any) => (
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
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[12px] font-black px-4 py-1 rounded-md shadow-lg shadow-sky-500/20 z-10 whitespace-nowrap uppercase tracking-widest">
                        Recomendado - Melhor latência para sua região
                      </div>
                    )}
                    <div className="flex-1 text-left text-white text-base md:text-lg">{loc.name}</div>
                    <div className="flex-1 text-center text-slate-400 font-medium">{loc.latency && `– Latência de ${loc.latency}`}</div>
                    <div className="flex-1 text-right text-white font-black text-base md:text-lg">{loc.eur ? formatBRLPerMonth(loc.eur) : "Grátis"}</div>
                  </button>
                ))}
                {(!plan.locations[regionTab] || plan.locations[regionTab].length === 0) && (
                  <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-xl bg-white/5">
                    <p className="text-sm text-slate-500">Regiões em breve para este plano.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <Separator className="bg-white/10" />

        {/* Storage Section - 2x2 Layout with VPS Styling */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Armazenamento</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fixed Base Box */}
            <div className="flex items-center justify-between rounded-xl border border-sky-500/50 bg-white/10 p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
              <div className="flex flex-col">
                <span className="text-[15px] font-black text-white">{plan.storage} (Incluído)</span>
                <span className="text-[13px] text-sky-400 font-bold uppercase tracking-wider">Livre — Sempre Ativo</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded border border-sky-400 bg-sky-400 text-white shadow-lg shadow-sky-400/20">
                  <Check className="h-3 w-3" strokeWidth={4} />
                </div>
              </div>
            </div>

            {/* Upgrade Boxes */}
            {plan.storageUpgrades.map((upgrade: any) => {
              const qty = storageUpgrades[upgrade.id] || 0;
              const disabled = isStorageDisabled(upgrade.id);
              return (
                <div
                  key={upgrade.id}
                  onClick={() => {
                    if (disabled) return;
                    handleStorageQtyChange(upgrade.id, qty > 0 ? 0 : 1);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-5 transition-all shadow-xl relative overflow-hidden cursor-pointer backdrop-blur-md",
                    qty > 0 ? "border-sky-500 bg-white/10" : "border-white/10 bg-white/5",
                    disabled && "opacity-40 cursor-not-allowed grayscale-[0.5]"
                  )}
                >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                          qty > 0 ? "border-sky-400 bg-sky-400 text-white" : "border-white/20"
                        )}>
                          {qty > 0 && <Check className="h-2.5 w-2.5" strokeWidth={4} />}
                        </div>
                        <span className="text-[15px] font-bold text-white">{upgrade.name}</span>
                      </div>
                      <span className="text-[13px] text-sky-400 font-bold mt-1 ml-6">{formatBRLPerMonth(upgrade.eur)}</span>
                    </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={qty.toString()}
                      onValueChange={(v) => handleStorageQtyChange(upgrade.id, parseInt(v))}
                      disabled={disabled}
                    >
                      <SelectTrigger className="h-9 w-16 border-white/10 bg-white/5 text-white text-[14px] font-bold px-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#000B12] border-white/10 text-white z-[110]">
                        <SelectItem value="0" className="focus:bg-white/10 focus:text-white">0</SelectItem>
                        <SelectItem value="1" disabled={totalExtraBoxes >= 2 && qty === 0} className="focus:bg-white/10 focus:text-white">1</SelectItem>
                        <SelectItem value="2" disabled={(totalExtraBoxes >= 1 && qty === 0) || (totalExtraBoxes >= 2 && qty === 1)} className="focus:bg-white/10 focus:text-white">2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Separator className="bg-white/10" />

        {/* Image Section - Exact VPS Structure */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-widest">Imagem</h2>
            <button
              onClick={() => setShowMoreImages(!showMoreImages)}
              className="flex items-center gap-1 text-[11px] font-black text-white uppercase tracking-wider"
            >
              {showMoreImages ? (
                <>Fechar imagens <ChevronUp size={14} /></>
              ) : (
                <>Ver mais <ChevronDown size={14} /></>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showMoreImages ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-8 overflow-hidden"
              >
                <div className="flex justify-center border-b border-white/10">
                  {imageCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setImageCategory(cat.id)}
                      className={cn(
                        "px-8 py-3 text-[14px] font-black uppercase tracking-widest relative transition-colors",
                        imageCategory === cat.id ? "text-sky-400" : "text-slate-500 hover:text-white"
                      )}
                    >
                      {cat.label}
                      {imageCategory === cat.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500" />}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {(dynamicImages[imageCategory as keyof typeof dynamicImages] || []).map((img: any) => (
                    <button
                      key={img.id}
                      onClick={() => {
                        if (img.id === "plesk-win" || (img.name.toLowerCase().includes("plesk") && img.name.toLowerCase().includes("windows"))) {
                          setShowPleskWindowsModal(true);
                        } else if (img.name.toLowerCase().includes("ubuntu")) {
                          setShowUbuntuModal(true);
                        } else if (img.id === "custom") {
                          setShowCustomModal(true);
                        } else if (img.name.toLowerCase().includes("windows")) {
                          setShowWindowsModal(true);
                        } else if (img.name.toLowerCase().includes("cpanel")) {
                          setShowCpanelModal(true);
                        } else if (img.name.toLowerCase().includes("rhel")) {
                          setShowRhelModal(true);
                        } else if (img.name.toLowerCase().includes("plesk")) {
                          setShowPleskModal(true);
                        } else if (img.name.toLowerCase().includes("debian")) {
                          setShowDebianModal(true);
                        } else if (img.name.toLowerCase().includes("docker")) {
                          setShowDockerModal(true);
                        } else if (img.name.toLowerCase().includes("lamp")) {
                          setShowLampModal(true);
                        } else if (img.name.toLowerCase().includes("webmin")) {
                          setShowWebminModal(true);
                        }
                        setOsImage(img.id);
                      }}
                      className={cn(
                        "cursor-pointer rounded-xl border p-4 flex items-center gap-3 transition-all relative overflow-hidden group",
                        osImage === img.id ? "border-sky-500 bg-sky-500/10 shadow-[0_0_20px_rgba(0,163,255,0.1)]" : "border-white/5 bg-[#000B12]/40 hover:border-white/10 hover:bg-[#000B12]/60"
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        {img.icon ? <img src={img.icon} alt="" className="w-5 h-5 object-contain" /> : <Server size={16} className="text-slate-400" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[14px] font-black text-white uppercase tracking-tight">{img.name}</p>
                        <p className="text-[13px] text-sky-400 font-black">
                          {typeof img.price === "number" ? formatBRLPerMonth(img.price) : img.eur ? formatBRLPerMonth(img.eur) : img.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-end gap-4"
              >
                {images.popular.slice(0, 1).concat(images.popular.slice(2, 3)).map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setOsImage(img.id)}
                    className={cn(
                      "w-64 cursor-pointer rounded-xl border p-4 flex items-center gap-3 transition-all bg-[#000B12]/40 shadow-xl",
                      osImage === img.id ? "border-sky-500 shadow-sky-500/10" : "border-white/5 hover:border-white/10 hover:bg-[#000B12]/60"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      {img.icon ? <img src={img.icon} alt="" className="w-5 h-5 object-contain" /> : <Server size={16} className="text-slate-400" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[14px] font-black text-white uppercase tracking-tight">{img.name}</p>
                      <p className="text-[13px] text-sky-400 font-black uppercase">
                        {(img as any).eur ? formatBRLPerMonth((img as any).eur) : "Incluído"}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <Separator className="bg-white/10" />

        {/* Additional Features Section */}
        <section className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-[2px] rounded-2xl shadow-2xl border border-white/10 overflow-hidden mb-8 transition-all hover:border-white/20 group">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Recursos Adicionais</h2>
              </div>
              <button onClick={() => setShowAdditionalFeatures(!showAdditionalFeatures)} className="flex items-center gap-1 text-[14px] font-black text-white uppercase tracking-widest hover:text-sky-400 transition-colors">
                {showAdditionalFeatures ? <><ChevronUp size={14} /> Fechar</> : <><ChevronDown size={14} /> Mostrar</>}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {showAdditionalFeatures && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-12 overflow-hidden px-1 py-1">
                  {/* Networking */}
                  <div className="space-y-8">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Rede</h3>
                    <div className="space-y-6 pl-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2">
                          <span className="text-base font-black text-white uppercase tracking-tight">Rede Privada</span>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={privateNetwork} onValueChange={setPrivateNetwork}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white text-left justify-start">
                              <SelectValue placeholder="Selecione a rede" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#000B12] border-white/10 text-white">
                              <SelectItem value="none" className="focus:bg-white/10 focus:text-white">Sem Rede Privada</SelectItem>
                              <SelectItem value="enabled" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full min-w-[300px]">
                                  <span>Rede Privada Ativada</span>
                                  <span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(plan.privateNetworkEur)}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Bandwidth (Fixed) */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2">
                          <span className="text-base font-black text-white uppercase tracking-tight">Largura de Banda</span>
                        </div>
                        <div className="md:col-span-9">
                          <div className="h-12 border border-white/10 rounded-xl px-4 flex flex-col justify-center bg-white/5">
                            <span className="text-base font-black text-white uppercase tracking-tight">Tráfego Ilimitado</span>
                            <span className="text-[13px] text-sky-400 font-bold uppercase tracking-wider">Política de Uso Justo</span>
                          </div>
                        </div>
                      </div>
                      {/* IPv4 */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2"><span className="text-base font-black text-white uppercase tracking-tight">IPv4</span></div>
                        <div className="md:col-span-9">
                          <Select value={ipv4Address} onValueChange={setIpv4Address}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white text-left justify-start"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#000B12] border-white/10 text-white">
                              <SelectItem value="1ip" className="focus:bg-white/10 focus:text-white"><div className="flex items-center justify-between w-full min-w-[350px]"><span>1 Endereço IP</span><span className="text-sky-400 font-black ml-4">Grátis</span></div></SelectItem>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(n => (
                                <SelectItem key={n} value={`${n + 1}ip`} className="focus:bg-white/10 focus:text-white">
                                  <div className="flex items-center justify-between w-full">
                                    <span>1 Endereço IP + {n} IP{n > 1 ? "s" : ""} Adicional{n > 1 ? "ais" : ""}</span>
                                    <span className="text-sky-400 font-black ml-4 text-[13px]">{formatBRLPerMonth(plan.additionalIpEur * n)}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Add-Ons */}
                  <div className="space-y-8">
                    <h3 className="text-base font-black text-white uppercase tracking-widest">Complementos</h3>
                    <div className="space-y-6 pl-4">
                      {/* Backup Space */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2">
                          <span className="text-base font-black text-white uppercase tracking-tight">Espaço de Backup</span>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={backupSpace} onValueChange={setBackupSpace}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                            <SelectContent className="bg-[#000B12] border-white/10 text-white">
                              <SelectItem value="none" className="focus:bg-white/10 focus:text-white">Nenhum</SelectItem>
                              <SelectItem value="100gb" className="focus:bg-white/10 focus:text-white"><div className="flex items-center justify-between w-full min-w-[380px]"><span>100 GB Armazenamento FTP</span><span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(4.59)}</span></div></SelectItem>
                              <SelectItem value="500gb" className="focus:bg-white/10 focus:text-white"><div className="flex items-center justify-between w-full"><span>500 GB Armazenamento FTP</span><span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(13.79)}</span></div></SelectItem>
                              <SelectItem value="1tb" className="focus:bg-white/10 focus:text-white"><div className="flex items-center justify-between w-full"><span>1 TB Armazenamento FTP</span><span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(22.99)}</span></div></SelectItem>
                              <SelectItem value="2tb" className="focus:bg-white/10 focus:text-white"><div className="flex items-center justify-between w-full"><span>2 TB Armazenamento FTP</span><span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(36.79)}</span></div></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Object Storage */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2"><span className="text-base font-black text-white uppercase tracking-tight">Armazenamento de Objetos</span></div>
                        <div className="md:col-span-9">
                          <Select value={objectStorage} onValueChange={setObjectStorage}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                            <SelectContent className="bg-[#000B12] border-white/10 text-white">
                              <SelectItem value="none" className="focus:bg-white/10 focus:text-white">Nenhum</SelectItem>
                              <SelectItem value="250gb" className="focus:bg-white/10 focus:text-white"><div className="flex items-center justify-between w-full min-w-[380px]"><span>250 GB Object Storage na União Europeia</span><span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(plan.objectStoragePrices["250gb"])}</span></div></SelectItem>
                              <SelectItem value="500gb" className="focus:bg-white/10 focus:text-white"><div className="flex items-center justify-between w-full"><span>500 GB Object Storage na União Europeia</span><span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(plan.objectStoragePrices["500gb"])}</span></div></SelectItem>
                              <SelectItem value="750gb" className="focus:bg-white/10 focus:text-white"><div className="flex items-center justify-between w-full"><span>750 GB Object Storage na União Europeia</span><span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(plan.objectStoragePrices["750gb"])}</span></div></SelectItem>
                              <SelectItem value="1tb" className="focus:bg-white/10 focus:text-white"><div className="flex items-center justify-between w-full"><span>1 TB Object Storage na União Europeia</span><span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(plan.objectStoragePrices["1tb"])}</span></div></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Management */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2"><span className="text-base font-black text-white uppercase tracking-tight">Gerenciamento</span></div>
                        <div className="md:col-span-9">
                          <Select value={serverManagement} onValueChange={setServerManagement}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#000B12] border-white/10 text-white">
                              <SelectItem value="unmanaged" className="focus:bg-white/10 focus:text-white"><div className="flex items-center justify-between w-full min-w-[340px]"><span>Não Gerenciado</span><span className="text-sky-400 font-black ml-4">Grátis</span></div></SelectItem>
                              <SelectItem value="managed" className="focus:bg-white/10 focus:text-white"><div className="flex items-center justify-between w-full min-w-[340px]"><span>Gerenciado</span><span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(plan.managedEur)}</span></div></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Monitoring */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2"><span className="text-base font-black text-white uppercase tracking-tight">Monitoramento</span></div>
                        <div className="md:col-span-9">
                          <Select value={monitoring} onValueChange={setMonitoring}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                            <SelectContent className="bg-[#000B12] border-white/10 text-white">
                              <SelectItem value="none" className="focus:bg-white/10 focus:text-white">Nenhum</SelectItem>
                              <SelectItem value="full" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full min-w-[340px]">
                                  <span>Monitoramento Completo</span>
                                  <span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(plan.monitoringEur)}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
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

        {/* Auth Section */}
        <section className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-[2px] rounded-2xl p-8 border border-white/10 shadow-2xl transition-all hover:border-white/20 group">
          <h2 className="text-base font-black text-white uppercase tracking-widest mb-8">Login e senha para o seu servidor</h2>
          <div className="max-w-3xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-3"><span className="text-base font-black text-slate-400 uppercase tracking-tight">Usuário</span></div>
              <div className="md:col-span-9"><span className="text-white font-black uppercase tracking-tight text-lg">root</span></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3 pt-3"><span className="text-base font-black text-slate-400 uppercase tracking-tight">Senha</span></div>
              <div className="md:col-span-9 space-y-2">
                <div className="flex justify-start">
                  <button onClick={() => {
                    const pass = Math.random().toString(36).slice(-10) + "A1!";
                    setPassword(pass); setPasswordTouched(true);
                  }} className="text-[#3B82F6] text-sm hover:underline font-bold">Gerar nova senha</button>
                </div>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }} className={cn("h-12 bg-white/5 border-white/5 text-white focus:border-sky-500 pr-12 rounded-xl", passwordTouched && password.length > 0 && !isPasswordValid(password) && "border-red-500")} />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
                {passwordTouched && password.length > 0 && !isPasswordValid(password) && <p className="text-red-500 text-sm font-bold flex items-center gap-1"><AlertCircle size={14} /> Senha inválida (Mín. 8 caracteres, maiúscula, número e símbolo)</p>}
                {isPasswordValid(password) && <p className="text-emerald-500 text-sm font-bold flex items-center gap-1"><Check size={14} /> Senha forte e segura</p>}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Bottom Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#000B12]/90 border-t border-white/10 z-[100] shadow-[0_-4px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <AnimatePresence>
          {showSummaryDetails && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-white/10 bg-white/5 backdrop-blur-md">
              <div className="max-w-7xl mx-auto px-10 py-6">
                <h3 className="text-base font-black text-white mb-4 uppercase tracking-widest">Detalhamento do Pedido</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  {(calculateItems() as any[]).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-lg border-b border-white/5 pb-1">
                      <span className="text-slate-400 font-medium">{item.label}</span>
                      <span className="font-black text-white">{formatBRL(item.price / currentRate)}</span>
                    </div>
                  ))}
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
                <h3 className="font-black text-white text-xl uppercase tracking-widest leading-tight">Resumo do Pedido</h3>
                <button onClick={() => setShowSummaryDetails(!showSummaryDetails)} className="p-1 hover:bg-white/10 rounded-full transition-colors">{showSummaryDetails ? <ChevronDown size={20} className="text-sky-400" /> : <ChevronUp size={20} className="text-sky-400" />}</button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 lg:gap-16">
            {(() => {
              const totalBrl = calculateTotal();
              const durationMonths = parseInt(duration);
              const qty = parseInt(quantity);
              const durationObj = durations.find((d: any) => d.id === duration);
              let totalSavings = 0;
              if (durationObj && durationObj.oldEur) {
                totalSavings = (durationObj.oldEur - durationObj.eur) * durationMonths * qty * currentRate;
              }

              return (
                <>
                  <div className="flex-1 text-center min-w-[150px]">{totalSavings > 0 && <p className="text-emerald-500 font-bold text-lg">Você economiza {formatBRL(totalSavings / currentRate)}.</p>}</div>
                  <div className="flex items-center gap-4 md:gap-6 lg:gap-10">
                    <div className="flex flex-col gap-1 min-w-[200px]">
                      <div className="flex justify-between items-center text-[15px] uppercase tracking-widest"><span className="text-slate-500 font-black flex items-center gap-1 text-[15px]">MENSAL </span><span className="text-white font-black whitespace-nowrap">{formatBRLPerMonth(totalBrl / durationMonths / currentRate)}</span></div>
                      <div className="flex justify-between items-center text-[15px] uppercase tracking-widest"><span className="text-slate-500 font-black flex items-center gap-1 text-[15px]">TAXA ÚNICA </span><span className="text-white font-black whitespace-nowrap">{formatBRL(0)}</span></div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="flex flex-col"><span className="text-[17px] font-black text-white uppercase tracking-tighter">Vencido Hoje</span><span className="text-[14px] text-slate-500 font-black -mt-1 uppercase tracking-widest">Pré-pago {durationMonths} {durationMonths === 1 ? "Mês" : "Meses"}</span></div>
                        <span className="text-3xl font-black text-white whitespace-nowrap drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{formatBRL(totalBrl / currentRate)}</span>
                      </div>
                    </div>
                    <Button disabled={!isPasswordValid(password)} onClick={() => {
                      if (isPasswordValid(password)) {
                        const storageUpgradesJson = encodeURIComponent(JSON.stringify(storageUpgrades));
                        router.push(`/checkout/personal-data?planId=${id}&qty=${quantity}&duration=${duration}&location=${location}&image=${osImage}&management=${serverManagement}&monitoring=${monitoring}&privateNetwork=${privateNetwork}&ipv4Address=${ipv4Address}&objectStorage=${objectStorage}&password=${encodeURIComponent(password)}&type=vds&storageUpgrades=${storageUpgradesJson}`);
                      }
                    }} className={cn("font-black h-14 px-12 rounded-lg text-xl shadow-xl uppercase tracking-widest transition-all min-w-[180px]", isPasswordValid(password) ? "bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20" : "bg-white/10 text-slate-500 cursor-not-allowed shadow-none")}>Próximo</Button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Modals - Exact same as VPS */}
      <AnimatePresence>
        {showUbuntuModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setShowUbuntuModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl p-10 space-y-8 border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/image.png" alt="Ubuntu" className="w-10 h-10" /><h2 className="text-2xl font-black text-white uppercase tracking-tight">Ubuntu</h2></div>
              <p className="text-slate-400 text-[17px] font-medium leading-relaxed">Ubuntu é um sistema operacional livre e de código aberto baseado em Linux.</p>
              <div className="space-y-4">
                <label className="text-base font-bold text-slate-300 uppercase tracking-widest">Versão</label>
                <Select value={ubuntuVersion} onValueChange={setUbuntuVersion}>
                  <SelectTrigger className="h-14 rounded-xl bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white"><SelectItem value="Ubuntu 24.04">Ubuntu 24.04</SelectItem><SelectItem value="Ubuntu 22.04">Ubuntu 22.04</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4"><Button variant="ghost" onClick={() => setShowUbuntuModal(false)} className="text-slate-400 hover:text-white uppercase tracking-widest">Pular</Button><Button onClick={() => setShowUbuntuModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Começar</Button></div>
            </motion.div>
          </div>
        )}
        {showCpanelModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setShowCpanelModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl p-10 space-y-8 border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/cpanel.png" alt="cPanel" className="w-10 h-10" /><h2 className="text-2xl font-black text-white uppercase tracking-tight">cPanel</h2></div>
              <div className="space-y-4">
                <label className="text-base font-bold text-slate-300 uppercase tracking-widest">Licença</label>
                <Select value={cpanelLicence} onValueChange={setCpanelLicence}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl text-white">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="text-base">cPanel/WHM ({cpanelLicence} contas)</span>
                      <span className="text-sm text-sky-400 font-black">
                        {(() => {
                          let eur = currentImagePrices.cpanel;
                          const accounts = parseInt(cpanelLicence);
                          if (accounts === 30) eur = 34.51;
                          else if (accounts === 50) eur = 45.82;
                          else if (accounts === 100) eur = 55.93;
                          else if (accounts === 150) eur = 69.62;
                          else if (accounts >= 200) {
                            eur = 93.42 + (Math.floor((accounts - 200) / 50) * 23.80);
                          }
                          return formatBRL(eur);
                        })()} / mês
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white z-[120] max-h-[300px]">
                    {[5, 30, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000].map(count => (
                      <SelectItem key={count} value={count.toString()} className="focus:bg-white/10 focus:text-white">
                        <div className="flex items-center justify-between w-full min-w-[420px]">
                          <span className={cn("flex-1", cpanelLicence === count.toString() ? "text-sky-400 font-black" : "text-slate-300")}>cPanel/WHM ({count} contas)</span>
                          <span className="text-white font-black ml-4">
                            {(() => {
                              let eur = currentImagePrices.cpanel;
                              if (count === 30) eur = 34.51;
                              else if (count === 50) eur = 45.82;
                              else if (count === 100) eur = 55.93;
                              else if (count === 150) eur = 69.62;
                              else if (count >= 200) {
                                eur = 93.42 + (Math.floor((count - 200) / 50) * 23.80);
                              }
                              return formatBRL(eur);
                            })()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4"><Button variant="ghost" onClick={() => setShowCpanelModal(false)} className="text-slate-400 hover:text-white uppercase tracking-widest">Cancelar</Button><Button onClick={() => setShowCpanelModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Selecionar</Button></div>
            </motion.div>
          </div>
        )}

        {showPleskModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setShowPleskModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl p-10 space-y-8 border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/plesk.png" alt="Plesk" className="w-10 h-10" /><h2 className="text-2xl font-black text-white uppercase tracking-tight">Plesk</h2></div>
              <div className="space-y-4">
                <label className="text-base font-bold text-slate-300 uppercase tracking-widest">Edição</label>
                <Select value={pleskLicence} onValueChange={setPleskLicence}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl text-white">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="text-base">
                        {pleskLicence === "admin" ? "Web Admin Edition" : pleskLicence === "pro" ? "Web Pro Edition" : "Web Host Edition"}
                      </span>
                      <span className="text-sm text-sky-400 font-black">
                        {(() => {
                          let eur = currentImagePrices.pleskLinux;
                          if (pleskLicence === "pro") eur = currentImagePrices.pleskPro;
                          else if (pleskLicence === "host") eur = currentImagePrices.pleskHost;
                          return formatBRL(eur);
                        })()} / mês
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white z-[120]">
                    <SelectItem value="admin" className="focus:bg-white/10 focus:text-white">
                      <div className="flex items-center justify-between w-full min-w-[400px]">
                        <span>Web Admin Edition (10 domínios)</span>
                        <span className="text-white font-black ml-4">{formatBRL(currentImagePrices.pleskLinux)}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="pro" className="focus:bg-white/10 focus:text-white">
                      <div className="flex items-center justify-between w-full min-w-[400px]">
                        <span>Web Pro Edition (30 domínios)</span>
                        <span className="text-white font-black ml-4">{formatBRL(currentImagePrices.pleskPro)}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="host" className="focus:bg-white/10 focus:text-white">
                      <div className="flex items-center justify-between w-full min-w-[400px]">
                        <span>Web Host Edition (ilimitado)</span>
                        <span className="text-white font-black ml-4">{formatBRL(currentImagePrices.pleskHost)}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setShowPleskModal(false)} className="text-slate-400 hover:text-white uppercase tracking-widest">Cancelar</Button>
                <Button onClick={() => setShowPleskModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Selecionar</Button>
              </div>
            </motion.div>
          </div>
        )}
        {showPleskWindowsModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setShowPleskWindowsModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl p-10 space-y-8 border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/plesk.png" alt="Plesk" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">Plesk + Windows</h2></div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Edição</label>
                  <Select value={pleskWinLicence} onValueChange={setPleskWinLicence}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl text-white">
                      <div className="flex items-center justify-between w-full pr-2">
                        <span className="text-sm">
                          {pleskWinLicence === "admin" ? "Web Admin Edition" : pleskWinLicence === "pro" ? "Web Pro Edition" : "Web Host Edition"}
                        </span>
                        <span className="text-xs text-sky-400 font-black">
                          {(() => {
                            let eur = currentImagePrices.pleskWin;
                            if (pleskWinLicence === "pro") eur = currentImagePrices.pleskPro;
                            else if (pleskWinLicence === "host") eur = currentImagePrices.pleskHost;
                            return formatBRL(eur);
                          })()} / mês
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#000B12] border-white/10 text-white z-[120]">
                      <SelectItem value="admin" className="focus:bg-white/10 focus:text-white">
                        <div className="flex items-center justify-between w-full min-w-[400px]">
                          <span>Web Admin Edition (10 domínios)</span>
                          <span className="text-white font-black ml-4">{formatBRL(currentImagePrices.pleskWin)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pro" className="focus:bg-white/10 focus:text-white">
                        <div className="flex items-center justify-between w-full min-w-[400px]">
                          <span>Web Pro Edition (30 domínios)</span>
                          <span className="text-white font-black ml-4">{formatBRL(currentImagePrices.pleskPro)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="host" className="focus:bg-white/10 focus:text-white">
                        <div className="flex items-center justify-between w-full min-w-[400px]">
                          <span>Web Host Edition (ilimitado)</span>
                          <span className="text-white font-black ml-4">{formatBRL(currentImagePrices.pleskHost)}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Versão do Windows</label>
                  <Select value={pleskWinVersion} onValueChange={setPleskWinVersion}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#000B12] border-white/10 text-white z-[120]">
                      <SelectItem value="2025" className="focus:bg-white/10 focus:text-white">Windows Server 2025</SelectItem>
                      <SelectItem value="2022" className="focus:bg-white/10 focus:text-white">Windows Server 2022</SelectItem>
                      <SelectItem value="2019" className="focus:bg-white/10 focus:text-white">Windows Server 2019</SelectItem>
                      <SelectItem value="2016" className="focus:bg-white/10 focus:text-white">Windows Server 2016</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">O preço do Windows Server já está incluído na licença Plesk para Windows.</p>
                </div>
              </div>
              <div className="flex justify-end gap-4"><Button variant="ghost" onClick={() => setShowPleskWindowsModal(false)} className="text-slate-400 hover:text-white uppercase tracking-widest">Cancelar</Button><Button onClick={() => setShowPleskWindowsModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Selecionar</Button></div>
            </motion.div>
          </div>
        )}
        {showWindowsModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setShowWindowsModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-10 space-y-8 border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/windows.png" alt="Windows" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">Windows Server</h2></div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Versão</label>
                <Select value={windowsVersion} onValueChange={setWindowsVersion}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl text-white">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="text-sm">Server {windowsVersion}</span>
                      <span className="text-xs text-sky-400 font-black">
                        {formatBRL(currentImagePrices.windows)} / mês | {formatBRL(currentImagePrices.windows_setup)} Taxa
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white z-[120]">
                    <SelectItem value="2025" className="focus:bg-white/10 focus:text-white">
                      <div className="flex items-center justify-between w-full min-w-[400px]">
                        <span>Server 2025</span>
                        <span className="text-white font-black ml-4">{formatBRL(currentImagePrices.windows)}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="2022" className="focus:bg-white/10 focus:text-white">
                      <div className="flex items-center justify-between w-full min-w-[400px]">
                        <span>Server 2022</span>
                        <span className="text-white font-black ml-4">{formatBRL(currentImagePrices.windows)}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="2019" className="focus:bg-white/10 focus:text-white">
                      <div className="flex items-center justify-between w-full min-w-[400px]">
                        <span>Server 2019</span>
                        <span className="text-white font-black ml-4">{formatBRL(currentImagePrices.windows)}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="2016" className="focus:bg-white/10 focus:text-white">
                      <div className="flex items-center justify-between w-full min-w-[400px]">
                        <span>Server 2016</span>
                        <span className="text-white font-black ml-4">{formatBRL(currentImagePrices.windows)}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4"><Button variant="ghost" onClick={() => setShowWindowsModal(false)} className="text-slate-400 hover:text-white uppercase tracking-widest">Cancelar</Button><Button onClick={() => setShowWindowsModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Selecionar</Button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
