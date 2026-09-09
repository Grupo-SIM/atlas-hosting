"use client";

export const dynamic = "force-dynamic";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Server,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  DISPLAY_CURRENCY_CHANGE_EVENT,
  type DisplayCurrency,
  readDisplayCurrency,
} from "@/lib/display-currency";
import { cn } from "@/lib/utils";
import { convertVpsPriceFromEuro } from "@/lib/vps-price-display";
import { Navbar } from "../../../landing/components/Navbar";

// Base rate for fallback if API fails
const FALLBACK_EUR_RATE = 5.86;

// Helper to get OS/Panel prices based on plan and version
const getImagePrices = (id: string) => {
  const base = {
    cpanel: 43.5, // 21.75 * 2
    pleskHost: 73.0,
    pleskLinux: 24.0, // 12.00 * 2
    pleskPro: 38.0,
    pleskWin: 24.0,
  };

  if (id === "s") {
    return { ...base, windows: 70.0, windows_setup: 0 }; // 35.00 * 2
  }
  if (id === "m") {
    return { ...base, windows: 100.0, windows_setup: 0 };
  }
  if (id === "l") {
    return { ...base, windows: 110.0, windows_setup: 0 };
  }
  if (id === "xl") {
    return { ...base, windows: 130.0, windows_setup: 0 };
  }
  if (id === "xxl") {
    return { ...base, windows: 150.0, windows_setup: 0 };
  }

  return { ...base, windows: 70.0, windows_setup: 0 };
};

// Mock data for VDS plans
const plansData: Record<string, any> = {
  l: {
    additionalIpEur: 7.0,
    backupEur: 4.6,
    cpuModel: "AMD EPYC 7282 2.8 GHz",
    durations: [
      {
        discount: null,
        eur: 138.0,
        id: "1",
        label: "1 mês",
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 15%",
        eur: 117.3,
        id: "12",
        label: "12 meses",
        oldEur: 138.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 110.4,
        id: "24",
        label: "24 meses",
        oldEur: 138.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    locations: {
      america: [
        {
          eur: 31.9,
          id: "us-central",
          latency: "119 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 47.1,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 39.5,
          id: "us-west",
          latency: "147 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 77.4, id: "sg", latency: "333 ms", name: "Ásia (Singapura)" },
        { eur: 78.9, id: "jp", latency: "318 ms", name: "Ásia (Japão)" },
        { eur: 72.9, id: "in", latency: "287 ms", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 65.3,
          id: "au-sydney",
          latency: "310 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "186 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 47.1,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "186 ms", name: "União Europeia", price: "Livre" },
        { eur: 31.9, id: "uk", latency: "156 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 109.99,
    monitoringEur: 22.98,
    name: "Cloud VDS L",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    port: "Porta de 750 Mbit/s",
    privateNetworkEur: 5.78,
    ram: "48 GB RAM",
    storage: "360 GB NVMe",
    storageNote: "Mais armazenamento disponível",
    storageUpgrades: [
      { eur: 49.98, id: "ssd-1tb", name: "1 TB SSD" },
      { eur: 78.18, id: "ssd-2tb", name: "2 TB SSD" },
      { eur: 206.98, id: "ssd-4tb", name: "4 TB SSD" },
    ],
    vcpu: "12 Núcleos Virtuais",
  },
  m: {
    additionalIpEur: 7.0,
    backupEur: 4.6,
    cpuModel: "AMD EPYC 7282 2.8 GHz",
    durations: [
      {
        discount: null,
        eur: 98.0,
        id: "1",
        label: "1 mês",
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 15%",
        eur: 83.3,
        id: "12",
        label: "12 meses",
        oldEur: 98.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 78.4,
        id: "24",
        label: "24 meses",
        oldEur: 98.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    locations: {
      america: [
        {
          eur: 22.6,
          id: "us-central",
          latency: "119 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 33.4,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 28.0,
          id: "us-west",
          latency: "147 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 55.0, id: "sg", latency: "304 ms", name: "Ásia (Singapura)" },
        { eur: 56.1, id: "jp", latency: "239 ms", name: "Ásia (Japão)" },
        { eur: 51.7, id: "in", latency: "363 ms", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 46.4,
          id: "au-sydney",
          latency: "310 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "186 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 33.4,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "186 ms", name: "União Europeia", price: "Livre" },
        { eur: 22.6, id: "uk", latency: "157 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 109.99,
    monitoringEur: 22.98,
    name: "Cloud VDS M",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    port: "Porta de 500 Mbit/s",
    privateNetworkEur: 5.78,
    ram: "32 GB RAM",
    storage: "240 GB NVMe",
    storageNote: "Mais armazenamento disponível",
    storageUpgrades: [
      { eur: 49.98, id: "ssd-1tb", name: "1 TB SSD" },
      { eur: 78.18, id: "ssd-2tb", name: "2 TB SSD" },
      { eur: 206.98, id: "ssd-4tb", name: "4 TB SSD" },
    ],
    vcpu: "8 Núcleos Virtuais",
  },
  s: {
    additionalIpEur: 7.0,
    backupEur: 4.6,
    cpuModel: "AMD EPYC 7282 2.8 GHz",
    durations: [
      {
        discount: null,
        eur: 78.0,
        id: "1",
        label: "1 mês",
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 15%",
        eur: 66.3,
        id: "12",
        label: "12 meses",
        oldEur: 78.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 62.4,
        id: "24",
        label: "24 meses",
        oldEur: 78.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    locations: {
      america: [
        {
          eur: 18.0,
          id: "us-central",
          latency: "121 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 26.6,
          id: "us-east",
          latency: "90 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 22.3,
          id: "us-west",
          latency: "148 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 43.8, id: "sg", latency: "305 ms", name: "Ásia (Singapura)" },
        { eur: 44.6, id: "jp", latency: "238 ms", name: "Ásia (Japão)" },
        { eur: 41.2, id: "in", latency: "286 ms", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 36.9,
          id: "au-sydney",
          latency: "312 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "186 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 26.6,
          id: "us-east",
          latency: "90 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "186 ms", name: "União Europeia", price: "Livre" },
        { eur: 18.0, id: "uk", latency: "156 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 109.99,
    monitoringEur: 22.98,
    name: "Cloud VDS S",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    port: "Porta de 250 Mbit/s",
    privateNetworkEur: 5.78,
    ram: "24 GB RAM",
    storage: "180 GB NVMe",
    storageNote: "Mais armazenamento disponível",
    storageUpgrades: [
      { eur: 49.98, id: "ssd-1tb", name: "1 TB SSD" },
      { eur: 78.18, id: "ssd-2tb", name: "2 TB SSD" },
      { eur: 206.98, id: "ssd-4tb", name: "4 TB SSD" },
    ],
    vcpu: "6 Núcleos Virtuais",
  },
  xl: {
    additionalIpEur: 7.0,
    backupEur: 4.6,
    cpuModel: "AMD EPYC 7282 2.8 GHz",
    durations: [
      {
        discount: null,
        eur: 188.0,
        id: "1",
        label: "1 mês",
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 15%",
        eur: 159.8,
        id: "12",
        label: "12 meses",
        oldEur: 188.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 150.4,
        id: "24",
        label: "24 meses",
        oldEur: 188.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    locations: {
      america: [
        {
          eur: 42.0,
          id: "us-central",
          latency: "119 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 64.0,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 52.0,
          id: "us-west",
          latency: "147 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 104.0, id: "sg", latency: "335 ms", name: "Ásia (Singapura)" },
        { eur: 106.0, id: "jp", latency: "319 ms", name: "Ásia (Japão)" },
        { eur: 98.0, id: "in", latency: "286 ms", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 88.0,
          id: "au-sydney",
          latency: "310 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "186 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 64.0,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "186 ms", name: "União Europeia", price: "Livre" },
        { eur: 42.0, id: "uk", latency: "156 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 109.99,
    monitoringEur: 22.98,
    name: "Cloud VDS XL",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    port: "Porta de 1 Gbit/s",
    privateNetworkEur: 5.78,
    ram: "64 GB RAM",
    storage: "480 GB NVMe",
    storageNote: "Mais armazenamento disponível",
    storageUpgrades: [
      { eur: 49.98, id: "ssd-1tb", name: "1 TB SSD" },
      { eur: 78.18, id: "ssd-2tb", name: "2 TB SSD" },
      { eur: 206.98, id: "ssd-4tb", name: "4 TB SSD" },
    ],
    vcpu: "16 Núcleos Virtuais",
  },
  xxl: {
    additionalIpEur: 7.0,
    backupEur: 4.6,
    cpuModel: "AMD EPYC 7282 2.8 GHz",
    durations: [
      {
        discount: null,
        eur: 278.0,
        id: "1",
        label: "1 mês",
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 15%",
        eur: 236.3,
        id: "12",
        label: "12 meses",
        oldEur: 278.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 222.4,
        id: "24",
        label: "24 meses",
        oldEur: 278.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    locations: {
      america: [
        {
          eur: 64.0,
          id: "us-central",
          latency: "118 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 94.0,
          id: "us-east",
          latency: "89 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 78.0,
          id: "us-west",
          latency: "147 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 156.0, id: "sg", latency: "337 ms", name: "Ásia (Singapura)" },
        { eur: 158.0, id: "jp", latency: "320 ms", name: "Ásia (Japão)" },
        { eur: 146.0, id: "in", latency: "286 ms", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 130.0,
          id: "au-sydney",
          latency: "310 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "185 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 94.0,
          id: "us-east",
          latency: "89 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "185 ms", name: "União Europeia", price: "Livre" },
        { eur: 64.0, id: "uk", latency: "156 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 109.99,
    monitoringEur: 22.98,
    name: "Cloud VDS XXL",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    port: "Porta de 1 Gbit/s",
    privateNetworkEur: 5.78,
    ram: "96 GB RAM",
    storage: "720 GB NVMe",
    storageNote: "Mais armazenamento disponível",
    // Storage upgrade prices not screenshotted for XXL specifically — carried over from
    // S/M/L/XL, which were all confirmed identical (flat across the VDS line).
    storageUpgrades: [
      { eur: 49.98, id: "ssd-1tb", name: "1 TB SSD" },
      { eur: 78.18, id: "ssd-2tb", name: "2 TB SSD" },
      { eur: 206.98, id: "ssd-4tb", name: "4 TB SSD" },
    ],
    vcpu: "24 Núcleos Virtuais",
  },
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
  { id: "panels", label: "Painéis" },
];

const images = {
  apps: [
    { icon: "/n8n.png", id: "n8n", name: "n8n Server", price: "Incluído" },
    {
      icon: "/wireguard.png",
      id: "wireguard",
      name: "Wireguard Server",
      price: "Incluído",
    },
    {
      icon: "/nextcloud.png",
      id: "nextcloud",
      name: "Nextcloud Server",
      price: "Incluído",
    },
    {
      icon: "/gitlab.png",
      id: "gitlab",
      name: "Gitlab Server",
      price: "Incluído",
    },
    { icon: "/docker.png", id: "docker", name: "Docker", price: "Incluído" },
    { icon: "/lamp.png", id: "lamp", name: "LAMP", price: "Incluído" },
    {
      icon: "/openclaw.png",
      id: "openclaw",
      name: "OpenClaw Server",
      price: "Incluído",
    },
  ],
  blockchain: [
    { icon: "/ipfs.png", id: "ipfs", name: "IPFS Node", price: "Incluído" },
    { icon: "/fluxnode.png", id: "flux", name: "Flux Node", price: "Incluído" },
    {
      icon: "/horizen.png",
      id: "horizen",
      name: "Horizen Node",
      price: "Incluído",
    },
  ],
  os: [
    { icon: "/image.png", id: "ubuntu", name: "Ubuntu", price: "Incluído" },
    {
      eur: 35.0,
      icon: "/windows.png",
      id: "windows",
      name: "Servidor Windows",
    },
    {
      icon: "/centos-svgrepo-com.svg",
      id: "rhel",
      name: "RHEL Variants",
      price: "Incluído",
    },
    {
      icon: "/debian-svgrepo-com.svg",
      id: "debian",
      name: "Debian",
      price: "Incluído",
    },
    {
      icon: "/almalinux.png",
      id: "almalinux",
      name: "AlmaLinux",
      price: "Incluído",
    },
    {
      icon: "/rocky.png",
      id: "rockylinux",
      name: "Rocky Linux",
      price: "Incluído",
    },
  ],
  panels: [
    { eur: 21.75, icon: "/cpanel.png", id: "cpanel", name: "cPanel" },
    { eur: 12.0, icon: "/plesk.png", id: "plesk-win", name: "Plesk + Windows" },
    { eur: 12.0, icon: "/plesk.png", id: "plesk-linux", name: "Plesk + Linux" },
    { icon: "/webmin.png", id: "webmin", name: "Webmin", price: "Incluído" },
    {
      icon: "/lamp.png",
      id: "webmin-lamp",
      name: "Webmin + LAMP",
      price: "Incluído",
    },
  ],
  popular: [
    { icon: "/image.png", id: "ubuntu", name: "Ubuntu", price: "Incluído" },
    {
      icon: "/custom-images.png",
      id: "custom",
      name: "Imagens personalizadas",
      price: "Incluído",
    },
    {
      icon: "/deepseek.png",
      id: "deepseek",
      name: "DeepSeek",
      price: "Incluído",
    },
    {
      eur: 35.0,
      icon: "/windows.png",
      id: "windows",
      name: "Servidor Windows",
    },
    { eur: 21.75, icon: "/cpanel.png", id: "cpanel", name: "cPanel" },
    {
      icon: "/centos-svgrepo-com.svg",
      id: "rhel",
      name: "RHEL Variants",
      price: "Incluído",
    },
    { eur: 12.0, icon: "/plesk.png", id: "plesk", name: "Plesk + Linux" },
  ],
};

// (Logic moved up)

export default function VdsConfigurePage({
  embedded = false,
}: {
  embedded?: boolean;
} = {}) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;

  const [currentRate, setCurrentRate] = useState(FALLBACK_EUR_RATE);
  const [usdRate, setUsdRate] = useState(1.08);
  const [displayCurrency, setDisplayCurrency] =
    useState<DisplayCurrency>("BRL");
  const [dynamicImages, setDynamicImages] = useState(images);

  const plan = plansData[id as keyof typeof plansData] || plansData.s;
  const durations = plan.durations;
  const storageUpgradesData = plan.storageUpgrades;
  const currentImagePrices = getImagePrices(id);

  const formatBRL = (eur: number) => {
    const amount = convertVpsPriceFromEuro(eur, displayCurrency, {
      eurToBrl: currentRate,
      eurToUsd: usdRate,
    });
    return new Intl.NumberFormat(
      displayCurrency === "BRL" ? "pt-BR" : "en-US",
      {
        currency: displayCurrency,
        style: "currency",
      }
    ).format(amount);
  };

  const formatBRLPerMonth = (eur: number) => {
    return `${formatBRL(eur)} / mês`;
  };

  const sp = searchParams;
  const [quantity, setQuantity] = useState(sp.get("qty") || "1");
  const [duration, setDuration] = useState(sp.get("duration") || "12");
  const [regionTab, setRegionTab] = useState(sp.get("regionTab") || "best");
  const [location, setLocation] = useState(sp.get("location") || "eu");
  const [storageUpgrades, setStorageUpgrades] = useState<
    Record<string, number>
  >(() => {
    try {
      return JSON.parse(sp.get("storageUpgrades") || "{}");
    } catch {
      return {};
    }
  });
  const [imageCategory, setImageCategory] = useState(
    sp.get("imageCategory") || "popular"
  );
  const [osImage, setOsImage] = useState(sp.get("image") || "ubuntu");
  const [showMoreImages, setShowMoreImages] = useState(true);
  const [showAdditionalFeatures, setShowAdditionalFeatures] = useState(true);

  // Modal states
  const [showUbuntuModal, setShowUbuntuModal] = useState(false);
  const [ubuntuVersion, setUbuntuVersion] = useState(
    sp.get("ubuntuVersion") || "Ubuntu 24.04"
  );
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customImageOption, setCustomImageOption] = useState(
    sp.get("customImageOption") || "existing"
  );
  const [showWindowsModal, setShowWindowsModal] = useState(false);
  const [windowsVersion, setWindowsVersion] = useState(
    sp.get("windowsVersion") || "2025"
  );
  const [showCpanelModal, setShowCpanelModal] = useState(false);
  const [cpanelLicence, setCpanelLicence] = useState(
    sp.get("cpanelLicence") || "5"
  );
  const [cpanelVersion, setCpanelVersion] = useState(
    sp.get("cpanelVersion") || "Ubuntu 22.04"
  );
  const [showRhelModal, setShowRhelModal] = useState(false);
  const [rhelVersion, setRhelVersion] = useState(
    sp.get("rhelVersion") || "AlmaLinux 9"
  );
  const [showPleskModal, setShowPleskModal] = useState(false);
  const [pleskLicence, setPleskLicence] = useState(
    sp.get("pleskLicence") || "admin"
  );
  const [showDebianModal, setShowDebianModal] = useState(false);
  const [debianVersion, setDebianVersion] = useState(
    sp.get("debianVersion") || "Debian 13"
  );
  const [showDockerModal, setShowDockerModal] = useState(false);
  const [dockerVersion, setDockerVersion] = useState(
    sp.get("dockerVersion") || "Ubuntu 22.04"
  );
  const [showLampModal, setShowLampModal] = useState(false);
  const [lampVersion, setLampVersion] = useState(
    sp.get("lampVersion") || "Ubuntu 22.04"
  );
  const [showPleskWindowsModal, setShowPleskWindowsModal] = useState(false);
  const [pleskWinLicence, setPleskWinLicence] = useState(
    sp.get("pleskWinLicence") || "admin"
  );
  const [pleskWinVersion, setPleskWinVersion] = useState(
    sp.get("pleskWinVersion") || "2016"
  );
  const [showWebminModal, setShowWebminModal] = useState(false);
  const [webminVersion, setWebminVersion] = useState(
    sp.get("webminVersion") || "Ubuntu 22.04"
  );

  // Auth/Other states
  const [password, setPassword] = useState(
    sp.get("password") ? decodeURIComponent(sp.get("password")!) : ""
  );
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [privateNetwork, setPrivateNetwork] = useState(
    sp.get("privateNetwork") || "none"
  );
  const [ipv4Address, setIpv4Address] = useState(
    sp.get("ipv4Address") || "1ip"
  );
  const [backupSpace, setBackupSpace] = useState(
    sp.get("backupSpace") || "none"
  );
  const [objectStorage, setObjectStorage] = useState(
    sp.get("objectStorage") || "none"
  );
  const [serverManagement, setServerManagement] = useState(
    sp.get("management") || "unmanaged"
  );
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
    window.history.replaceState(
      {},
      "",
      `/vds/configure/${planIdForUrl}?${p.toString()}`
    );
  }, [
    quantity,
    duration,
    regionTab,
    location,
    storageUpgrades,
    imageCategory,
    osImage,
    ubuntuVersion,
    windowsVersion,
    cpanelLicence,
    cpanelVersion,
    rhelVersion,
    pleskLicence,
    debianVersion,
    dockerVersion,
    lampVersion,
    pleskWinLicence,
    pleskWinVersion,
    webminVersion,
    customImageOption,
    privateNetwork,
    ipv4Address,
    backupSpace,
    objectStorage,
    serverManagement,
    monitoring,
    password,
    planIdForUrl,
  ]);

  const totalExtraBoxes = Object.values(storageUpgrades).reduce(
    (a, b) => a + b,
    0
  );

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
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(pwd);
  };

  useEffect(() => {
    fetch("/api/currency/euro")
      .then(res => res.json())
      .then(data => {
        if (data.rate) {
          setCurrentRate(data.rate);
        }
        if (data.usdRate) {
          setUsdRate(data.usdRate);
        }
      })
      .catch(err => console.error("Error fetching rate:", err));
  }, []);

  useEffect(() => {
    const syncCurrency = () => setDisplayCurrency(readDisplayCurrency());
    syncCurrency();
    window.addEventListener(DISPLAY_CURRENCY_CHANGE_EVENT, syncCurrency);
    return () =>
      window.removeEventListener(DISPLAY_CURRENCY_CHANGE_EVENT, syncCurrency);
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
    const durationMonths = Number.parseInt(duration, 10);
    const qty = Number.parseInt(quantity, 10) || 1;

    if (durationObj) {
      // Base Plan
      items.push({
        label: `${plan.name} (${durationMonths} ${durationMonths === 1 ? "mês" : "meses"})${qty > 1 ? ` × ${qty}` : ""}`,
        price: durationObj.eur * currentRate * durationMonths * qty,
      });

      // Location
      const allLocations = Object.values(plan.locations).flat() as any[];
      const locObj = allLocations.find(l => l.id === location);
      if (locObj?.eur) {
        items.push({
          label: `Localização: ${locObj.name}${qty > 1 ? ` × ${qty}` : ""}`,
          price: locObj.eur * currentRate * durationMonths * qty,
        });
      }

      // Storage Upgrades
      Object.entries(storageUpgrades).forEach(([upgradeId, upgradeQty]) => {
        const upgrade = storageUpgradesData.find(
          (u: any) => u.id === upgradeId
        );
        if (upgrade) {
          items.push({
            label: `Upgrade: ${upgrade.name}${qty > 1 ? ` × ${qty}` : ""}`,
            price:
              upgrade.eur * currentRate * durationMonths * qty * upgradeQty,
          });
        }
      });

      // OS / Panel Pricing
      if (osImage === "windows") {
        items.push({
          label: `Windows Server ${windowsVersion}${qty > 1 ? ` × ${qty}` : ""}`,
          price:
            currentImagePrices.windows * currentRate * durationMonths * qty,
        });
        if (currentImagePrices.windows_setup > 0) {
          items.push({
            label: "Taxa de Instalação: Windows Server",
            price: currentImagePrices.windows_setup * currentRate * qty,
          });
        }
      } else if (osImage === "cpanel") {
        let eur = currentImagePrices.cpanel;
        const accounts = Number.parseInt(cpanelLicence, 10);
        if (accounts === 30) eur = 34.51;
        else if (accounts === 50) eur = 45.82;
        else if (accounts === 100) eur = 55.93;
        else if (accounts === 150) eur = 69.62;
        else if (accounts >= 200) {
          eur = 93.42 + Math.floor((accounts - 200) / 50) * 23.8;
        }
        items.push({
          label: `cPanel (${cpanelLicence} contas)${qty > 1 ? ` × ${qty}` : ""}`,
          price: eur * currentRate * durationMonths * qty,
        });
      } else if (osImage === "plesk" || osImage === "plesk-linux") {
        let eur = currentImagePrices.pleskLinux;
        if (pleskLicence === "pro") eur = currentImagePrices.pleskPro;
        else if (pleskLicence === "host") eur = currentImagePrices.pleskHost;
        items.push({
          label: `Plesk Linux (${pleskLicence})${qty > 1 ? ` × ${qty}` : ""}`,
          price: eur * currentRate * durationMonths * qty,
        });
      } else if (osImage === "plesk-win") {
        let eur = currentImagePrices.pleskWin;
        if (pleskWinLicence === "pro") eur = currentImagePrices.pleskPro;
        else if (pleskWinLicence === "host") eur = currentImagePrices.pleskHost;
        items.push({
          label: `Plesk Windows (${pleskWinLicence})${qty > 1 ? ` × ${qty}` : ""}`,
          price: eur * currentRate * durationMonths * qty,
        });
      } else if (osImage) {
        const allImages = Object.values(dynamicImages).flat() as any[];
        const imgObj = allImages.find(i => i.id === osImage);
        if (imgObj?.eur) {
          items.push({
            label: `SO/Painel: ${imgObj.name}${qty > 1 ? ` × ${qty}` : ""}`,
            price: imgObj.eur * currentRate * durationMonths * qty,
          });
        } else if (imgObj) {
          items.push({
            label: `SO: ${imgObj.name}${qty > 1 ? ` × ${qty}` : ""}`,
            price: 0,
          });
        }
      }

      // Add-ons
      if (privateNetwork === "enabled") {
        items.push({
          label: `Rede Privada${qty > 1 ? ` × ${qty}` : ""}`,
          price: plan.privateNetworkEur * currentRate * durationMonths * qty,
        });
      }

      if (ipv4Address !== "1ip") {
        const extraIps = Number.parseInt(ipv4Address.replace("ip", ""), 10) - 1;
        items.push({
          label: `${extraIps} IP${extraIps > 1 ? "s" : ""} Adicional${extraIps > 1 ? "ais" : ""}${qty > 1 ? ` × ${qty}` : ""}`,
          price:
            plan.additionalIpEur *
            currentRate *
            extraIps *
            durationMonths *
            qty,
        });
      }

      if (backupSpace !== "none") {
        const prices: any = {
          "1tb": 22.99,
          "2tb": 36.79,
          "100gb": 4.59,
          "500gb": 13.79,
        };
        const p = prices[backupSpace] || 0;
        items.push({
          label: `Espaço de Backup FTP: ${backupSpace.toUpperCase()}${qty > 1 ? ` × ${qty}` : ""}`,
          price: p * currentRate * durationMonths * qty,
        });
      }

      // Object Storage and Server Management discontinued by Contabo — commented out (not deleted) per request
      // if (objectStorage !== "none") {
      //   const p = (plan.objectStoragePrices[objectStorage] || 0);
      //   items.push({ label: `Object Storage: ${objectStorage.toUpperCase()}${qty > 1 ? ` × ${qty}` : ""}`, price: p * currentRate * durationMonths * qty });
      // }

      // if (serverManagement === "managed") {
      //   items.push({ label: `Gerenciamento de Servidor${qty > 1 ? ` × ${qty}` : ""}`, price: plan.managedEur * currentRate * durationMonths * qty });
      // }

      if (monitoring === "full") {
        items.push({
          label: `Monitoramento Completo${qty > 1 ? ` × ${qty}` : ""}`,
          price: plan.monitoringEur * currentRate * durationMonths * qty,
        });
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
    <div
      className={`${embedded ? "min-h-full bg-background text-foreground" : "min-h-screen bg-[#000B12] text-white"} relative pb-40 font-sans ${embedded ? "" : "overflow-hidden"}`}
    >
      {!embedded && (
        <div className="pointer-events-none fixed inset-0 bg-landing-gradient opacity-40" />
      )}
      {!embedded && <Navbar variant="dark" />}

      <main
        className={`mx-auto max-w-6xl px-4 md:px-6 ${embedded ? "pt-6 md:pt-10" : "pt-24 md:pt-32"} space-y-8 pb-12 md:space-y-12`}
      >
        {/* Header Section */}
        <div className="mb-8">
          <Link
            className="group mb-6 flex items-center gap-2 font-bold text-lg text-sky-400 transition-all hover:text-sky-300"
            href={embedded ? "/vps-plans" : "/vds#plans"}
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Voltar para VDS
          </Link>
          <h1
            className={`font-black text-2xl tracking-tight md:text-3xl ${embedded ? "text-foreground" : "text-white"} uppercase drop-shadow-sm`}
          >
            Configure seu {plan.name}
          </h1>
        </div>

        {/* Plan Summary Section */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-10">
          <div
            className={`flex-1 border-2 border-sky-500/50 ${embedded ? "bg-muted/40" : "bg-white/5"} relative rounded-xl p-4 shadow-2xl backdrop-blur-md md:p-8`}
          >
            {/* Mobile: label→value list */}
            <div className="space-y-2 pb-6 xl:hidden">
              {[
                {
                  label: "CPU",
                  value: `${plan.vcpu}${plan.cpuModel ? ` — ${plan.cpuModel}` : ""}`,
                },
                { label: "RAM", value: plan.ram },
                {
                  label: "Armazenamento",
                  value: `${plan.storage}${plan.storageNote ? ` — ${plan.storageNote}` : ""}`,
                },
                { label: "Porta", value: plan.port },
              ].map(spec => (
                <div
                  className="flex items-start justify-between gap-3"
                  key={spec.label}
                >
                  <span
                    className={`font-bold text-[14px] ${embedded ? "text-muted-foreground" : "text-slate-400"} flex-shrink-0 uppercase tracking-wide`}
                  >
                    {spec.label}
                  </span>
                  <span
                    className={`font-medium text-[15px] ${embedded ? "text-foreground" : "text-white"} text-right leading-tight`}
                  >
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
            {/* Desktop: 4-col grid */}
            <div className="hidden gap-8 xl:grid xl:grid-cols-4">
              <div className="space-y-1">
                <p
                  className={`font-bold text-[14px] ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase`}
                >
                  CPU
                </p>
                <div className="flex flex-col">
                  <p
                    className={`font-medium text-[15px] leading-tight ${embedded ? "text-foreground" : "text-white"}`}
                  >
                    {plan.vcpu}
                  </p>
                  <p
                    className={`font-medium text-[15px] leading-tight ${embedded ? "text-muted-foreground" : "text-slate-400"}`}
                  >
                    {plan.cpuModel}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p
                  className={`font-bold text-[14px] ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase`}
                >
                  RAM
                </p>
                <p
                  className={`font-medium text-[15px] leading-tight ${embedded ? "text-foreground" : "text-white"}`}
                >
                  {plan.ram}
                </p>
              </div>
              <div className="space-y-1">
                <p
                  className={`font-bold text-[14px] ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase`}
                >
                  ARMAZENAMENTO
                </p>
                <div className="flex flex-col">
                  <p
                    className={`font-medium text-[15px] leading-tight ${embedded ? "text-foreground" : "text-white"}`}
                  >
                    {plan.storage}
                  </p>
                  <p
                    className={`font-medium text-[15px] leading-tight ${embedded ? "text-muted-foreground" : "text-slate-400"}`}
                  >
                    {plan.storageNote}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p
                  className={`font-bold text-[14px] ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase`}
                >
                  PORTA
                </p>
                <p
                  className={`font-medium text-[15px] leading-tight ${embedded ? "text-foreground" : "text-white"}`}
                >
                  {plan.port}
                </p>
              </div>
            </div>
            <button
              className="absolute right-4 bottom-4 font-black text-[14px] text-sky-400 uppercase tracking-wider hover:underline"
              onClick={() =>
                router.push(embedded ? "/vps-plans" : "/vds#plans")
              }
            >
              Mudar
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`font-bold text-[15px] ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-wide`}
            >
              Quantidade de servidores
            </span>
            <Select onValueChange={setQuantity} value={quantity}>
              <SelectTrigger
                className={`h-10 w-16 border ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"}`}
              >
                {[1, 2, 3, 4, 5, 10, 15, 20, 25].map(n => (
                  <SelectItem
                    className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                    key={n}
                    value={n.toString()}
                  >
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className={`${embedded ? "bg-muted" : "bg-white/10"}`} />

        {/* Duration Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2
              className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
            >
              Selecione o ciclo de faturamento
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {plan.durations.map((d: any) => (
              <div className="space-y-3" key={d.id}>
                <div
                  className={cn(
                    "relative flex h-24 cursor-pointer items-center justify-between rounded-xl border p-8 shadow-xl backdrop-blur-md transition-all",
                    duration === d.id
                      ? embedded
                        ? "border-sky-500 bg-accent"
                        : "border-sky-500 bg-white/10"
                      : embedded
                        ? "border-border bg-muted/40"
                        : "border-white/10 bg-white/5"
                  )}
                  onClick={() => setDuration(d.id)}
                >
                  {d.discount && (
                    <div
                      className={`absolute -top-3 left-6 ${embedded ? "bg-card" : "bg-[#000B12]"} rounded-full border border-emerald-500/30 px-3 py-1 font-black text-[13px] text-emerald-400 uppercase tracking-widest shadow-emerald-500/10 shadow-lg`}
                    >
                      {d.discount}
                    </div>
                  )}
                  <span className="font-medium text-lg">{d.label}</span>
                  <div className="text-right">
                    {d.oldEur && (
                      <p className="font-medium text-[14px] text-rose-500 line-through opacity-70">
                        {formatBRLPerMonth(d.oldEur)}
                      </p>
                    )}
                    <p
                      className={`font-black text-2xl ${embedded ? "text-foreground" : "text-white"}`}
                    >
                      {formatBRLPerMonth(d.eur)}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "rounded-b-md py-1.5 text-center font-bold text-[15px] uppercase tracking-wider transition-colors",
                    d.setupFee === "Sem taxa de instalação"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : embedded
                        ? "text-muted-foreground"
                        : "text-slate-400"
                  )}
                >
                  {d.setupFee}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator className={`${embedded ? "bg-muted" : "bg-white/10"}`} />

        {/* Region Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2
              className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
            >
              Região
            </h2>
          </div>

          <div className="flex flex-nowrap items-start gap-8">
            <div className="w-1/3">
              <img
                alt="Map"
                className="h-auto w-full opacity-80"
                src="/1098128_7510-removebg-preview.png"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div
                className={`flex border-b ${embedded ? "border-border" : "border-white/10"}`}
              >
                {regions.map(r => (
                  <button
                    className={cn(
                      "relative px-8 py-3 font-bold text-[15px] uppercase tracking-wider transition-colors",
                      regionTab === r.id
                        ? "text-sky-400"
                        : embedded
                          ? "text-muted-foreground hover:text-foreground"
                          : "text-slate-500 hover:text-white"
                    )}
                    key={r.id}
                    onClick={() => setRegionTab(r.id)}
                  >
                    {r.label}
                    {regionTab === r.id && (
                      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {(
                  plan.locations[regionTab as keyof typeof plan.locations] || []
                ).map((loc: any) => (
                  <button
                    className={cn(
                      "relative flex w-full items-center justify-between rounded-lg border p-4 font-bold text-base backdrop-blur-md transition-all",
                      embedded ? "bg-muted/40" : "bg-white/5",
                      location === loc.id
                        ? embedded
                          ? "border-sky-500 bg-accent"
                          : "border-sky-500 bg-white/10"
                        : embedded
                          ? "border-border"
                          : "border-white/10",
                      loc.recommended && "mt-6"
                    )}
                    key={loc.id}
                    onClick={() => setLocation(loc.id)}
                  >
                    {loc.recommended && (
                      <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-sky-500 px-2 py-0.5 font-black text-[10px] text-white uppercase tracking-widest shadow-lg shadow-sky-500/20 md:px-4 md:py-1 md:text-[12px]">
                        Recomendado - Melhor latência para sua região
                      </div>
                    )}
                    <div
                      className={`flex-1 text-left ${embedded ? "text-foreground" : "text-white"} text-base md:text-lg`}
                    >
                      {loc.name}
                    </div>
                    <div
                      className={`flex-1 text-center ${embedded ? "text-muted-foreground" : "text-slate-400"} font-medium`}
                    >
                      {loc.latency && `– Latência de ${loc.latency}`}
                    </div>
                    <div
                      className={`flex-1 text-right ${embedded ? "text-foreground" : "text-white"} font-black text-base md:text-lg`}
                    >
                      {loc.eur ? formatBRLPerMonth(loc.eur) : "Grátis"}
                    </div>
                  </button>
                ))}
                {(!plan.locations[regionTab] ||
                  plan.locations[regionTab].length === 0) && (
                  <div
                    className={`rounded-xl border-2 border-white/5 border-dashed py-8 text-center ${embedded ? "bg-muted/40" : "bg-white/5"}`}
                  >
                    <p
                      className={`text-sm ${embedded ? "text-muted-foreground" : "text-slate-500"}`}
                    >
                      Regiões em breve para este plano.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <Separator className={`${embedded ? "bg-muted" : "bg-white/10"}`} />

        {/* Storage Section - 2x2 Layout with VPS Styling */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2
              className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
            >
              Armazenamento
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Fixed Base Box */}
            <div
              className={`flex items-center justify-between rounded-xl border border-sky-500/50 ${embedded ? "bg-accent" : "bg-white/10"} relative overflow-hidden p-5 shadow-xl backdrop-blur-md`}
            >
              <div className="flex flex-col">
                <span
                  className={`font-black text-[15px] ${embedded ? "text-foreground" : "text-white"}`}
                >
                  {plan.storage} (Incluído)
                </span>
                <span className="font-bold text-[13px] text-sky-400 uppercase tracking-wider">
                  Livre — Sempre Ativo
                </span>
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
                  className={cn(
                    "hidden relative flex cursor-pointer items-center justify-between overflow-hidden rounded-xl border p-5 shadow-xl backdrop-blur-md transition-all",
                    qty > 0
                      ? embedded
                        ? "border-sky-500 bg-accent"
                        : "border-sky-500 bg-white/10"
                      : embedded
                        ? "border-border bg-muted/40"
                        : "border-white/10 bg-white/5",
                    disabled && "cursor-not-allowed opacity-40 grayscale-[0.5]"
                  )}
                  key={upgrade.id}
                  onClick={() => {
                    if (disabled) return;
                    handleStorageQtyChange(upgrade.id, qty > 0 ? 0 : 1);
                  }}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                          qty > 0
                            ? "border-sky-400 bg-sky-400 text-white"
                            : "border-white/20"
                        )}
                      >
                        {qty > 0 && (
                          <Check className="h-2.5 w-2.5" strokeWidth={4} />
                        )}
                      </div>
                      <span
                        className={`font-bold text-[15px] ${embedded ? "text-foreground" : "text-white"}`}
                      >
                        {upgrade.name}
                      </span>
                    </div>
                    <span className="mt-1 ml-6 font-bold text-[13px] text-sky-400">
                      {formatBRLPerMonth(upgrade.eur)}
                    </span>
                  </div>

                  <div onClick={e => e.stopPropagation()}>
                    <Select
                      disabled={disabled}
                      onValueChange={v =>
                        handleStorageQtyChange(
                          upgrade.id,
                          Number.parseInt(v, 10)
                        )
                      }
                      value={qty.toString()}
                    >
                      <SelectTrigger
                        className={`h-9 w-16 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"} px-3 font-bold text-[14px]`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[110]`}
                      >
                        <SelectItem
                          className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                          value="0"
                        >
                          0
                        </SelectItem>
                        <SelectItem
                          className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                          disabled={totalExtraBoxes >= 2 && qty === 0}
                          value="1"
                        >
                          1
                        </SelectItem>
                        <SelectItem
                          className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                          disabled={
                            (totalExtraBoxes >= 1 && qty === 0) ||
                            (totalExtraBoxes >= 2 && qty === 1)
                          }
                          value="2"
                        >
                          2
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Separator className={`${embedded ? "bg-muted" : "bg-white/10"}`} />

        {/* Image Section - Exact VPS Structure */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2
              className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
            >
              Imagem
            </h2>
            <button
              className={`flex items-center gap-1 font-black text-[11px] ${embedded ? "text-foreground" : "text-white"} uppercase tracking-wider`}
              onClick={() => setShowMoreImages(!showMoreImages)}
            >
              {showMoreImages ? (
                <>
                  Fechar imagens <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Ver mais <ChevronDown size={14} />
                </>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showMoreImages ? (
              <motion.div
                animate={{ height: "auto", opacity: 1 }}
                className="space-y-8 overflow-hidden"
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
                key="expanded"
              >
                <div
                  className={`flex justify-center border-b ${embedded ? "border-border" : "border-white/10"}`}
                >
                  {imageCategories.map(cat => (
                    <button
                      className={cn(
                        "relative px-8 py-3 font-black text-[14px] uppercase tracking-widest transition-colors",
                        imageCategory === cat.id
                          ? "text-sky-400"
                          : embedded
                            ? "text-muted-foreground hover:text-foreground"
                            : "text-slate-500 hover:text-white"
                      )}
                      key={cat.id}
                      onClick={() => setImageCategory(cat.id)}
                    >
                      {cat.label}
                      {imageCategory === cat.id && (
                        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-500" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {(
                    dynamicImages[
                      imageCategory as keyof typeof dynamicImages
                    ] || []
                  )
                    .filter(
                      (img: any) =>
                        ![
                          "cpanel", "plesk-win", "n8n", "wireguard",
                          "nextcloud", "gitlab", "docker", "lamp",
                          "openclaw", "ipfs", "flux", "horizen", "deepseek",
                        ].includes(img.id)
                    )
                    .map((img: any) => (
                    <button
                      className={cn(
                        "group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border p-4 transition-all",
                        osImage === img.id
                          ? "border-sky-500 bg-sky-500/10 shadow-[0_0_20px_rgba(0,163,255,0.1)]"
                          : `border-white/5 ${embedded ? "bg-card/40 hover:border-border hover:bg-card/60" : "bg-[#000B12]/40 hover:border-white/10 hover:bg-[#000B12]/60"}`
                      )}
                      key={img.id}
                      onClick={() => {
                        if (
                          img.id === "plesk-win" ||
                          (img.name.toLowerCase().includes("plesk") &&
                            img.name.toLowerCase().includes("windows"))
                        ) {
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
                    >
                      <div
                        className={`h-8 w-8 rounded-full ${embedded ? "bg-muted" : "bg-white/10"} flex items-center justify-center overflow-hidden`}
                      >
                        {img.icon ? (
                          <img
                            alt=""
                            className="h-5 w-5 object-contain"
                            src={img.icon}
                          />
                        ) : (
                          <Server
                            className={
                              embedded
                                ? "text-muted-foreground"
                                : "text-slate-400"
                            }
                            size={16}
                          />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p
                          className={`font-black text-[14px] ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                        >
                          {img.name}
                        </p>
                        <p className="font-black text-[13px] text-sky-400">
                          {typeof img.price === "number"
                            ? formatBRLPerMonth(img.price)
                            : img.eur
                              ? formatBRLPerMonth(img.eur)
                              : img.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                animate={{ opacity: 1 }}
                className="flex justify-end gap-4"
                initial={{ opacity: 0 }}
                key="collapsed"
              >
                {images.popular
                  .slice(0, 1)
                  .concat(images.popular.slice(2, 3))
                  .map((img: any) => (
                    <button
                      className={cn(
                        `flex w-64 cursor-pointer items-center gap-3 rounded-xl border p-4 shadow-xl transition-all ${embedded ? "bg-card/40" : "bg-[#000B12]/40"}`,
                        osImage === img.id
                          ? "border-sky-500 shadow-sky-500/10"
                          : `border-white/5 ${embedded ? "hover:border-border hover:bg-card/60" : "hover:border-white/10 hover:bg-[#000B12]/60"}`
                      )}
                      key={img.id}
                      onClick={() => setOsImage(img.id)}
                    >
                      <div
                        className={`h-8 w-8 rounded-full ${embedded ? "bg-muted" : "bg-white/10"} flex items-center justify-center overflow-hidden`}
                      >
                        {img.icon ? (
                          <img
                            alt=""
                            className="h-5 w-5 object-contain"
                            src={img.icon}
                          />
                        ) : (
                          <Server
                            className={
                              embedded
                                ? "text-muted-foreground"
                                : "text-slate-400"
                            }
                            size={16}
                          />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p
                          className={`font-black text-[14px] ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                        >
                          {img.name}
                        </p>
                        <p className="font-black text-[13px] text-sky-400 uppercase">
                          {(img as any).eur
                            ? formatBRLPerMonth((img as any).eur)
                            : "Incluído"}
                        </p>
                      </div>
                    </button>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <Separator className={`${embedded ? "bg-muted" : "bg-white/10"}`} />

        {/* Additional Features Section */}
        <section
          className={`rounded-2xl border bg-gradient-to-br from-white/5 to-transparent shadow-2xl backdrop-blur-[2px] ${embedded ? "border-border" : "border-white/10"} group mb-8 overflow-hidden transition-all hover:border-white/20`}
        >
          <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2
                  className={`font-black text-2xl md:text-3xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Recursos Adicionais
                </h2>
              </div>
              <button
                className={`flex items-center gap-1 font-black text-[14px] ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest transition-colors hover:text-sky-400`}
                onClick={() =>
                  setShowAdditionalFeatures(!showAdditionalFeatures)
                }
              >
                {showAdditionalFeatures ? (
                  <>
                    <ChevronUp size={14} /> Fechar
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} /> Mostrar
                  </>
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {showAdditionalFeatures && (
                <motion.div
                  animate={{ height: "auto", opacity: 1 }}
                  className="space-y-12 overflow-hidden px-1 py-1"
                  exit={{ height: 0, opacity: 0 }}
                  initial={{ height: 0, opacity: 0 }}
                >
                  {/* Networking */}
                  <div className="space-y-8">
                    <h3
                      className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                    >
                      Rede
                    </h3>
                    <div className="space-y-6 pl-4">
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="flex items-center gap-2 md:col-span-3">
                          <span
                            className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                          >
                            Rede Privada
                          </span>
                        </div>
                        <div className="md:col-span-9">
                          <Select
                            onValueChange={setPrivateNetwork}
                            value={privateNetwork}
                          >
                            <SelectTrigger
                              className={`h-12 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"} justify-start text-left`}
                            >
                              <SelectValue placeholder="Selecione a rede" />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"}`}
                            >
                              <SelectItem
                                className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                                value="none"
                              >
                                Sem Rede Privada
                              </SelectItem>
                              <SelectItem
                                className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                                value="enabled"
                              >
                                <div className="flex w-full min-w-[300px] items-center justify-between">
                                  <span>Rede Privada Ativada</span>
                                  <span className="ml-4 font-black text-sky-400">
                                    {formatBRLPerMonth(plan.privateNetworkEur)}
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Bandwidth (Fixed) */}
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="flex items-center gap-2 md:col-span-3">
                          <span
                            className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                          >
                            Largura de Banda
                          </span>
                        </div>
                        <div className="md:col-span-9">
                          <div
                            className={`h-12 border ${embedded ? "border-border bg-muted/40" : "border-white/10 bg-white/5"} flex flex-col justify-center rounded-xl px-4`}
                          >
                            <span
                              className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                            >
                              Tráfego Ilimitado
                            </span>
                            <span className="font-bold text-[13px] text-sky-400 uppercase tracking-wider">
                              Política de Uso Justo
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* IPv4 */}
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="flex items-center gap-2 md:col-span-3">
                          <span
                            className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                          >
                            IPv4
                          </span>
                        </div>
                        <div className="md:col-span-9">
                          <Select
                            onValueChange={setIpv4Address}
                            value={ipv4Address}
                          >
                            <SelectTrigger
                              className={`h-12 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"} justify-start text-left`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"}`}
                            >
                              <SelectItem
                                className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                                value="1ip"
                              >
                                <div className="flex w-full min-w-[350px] items-center justify-between">
                                  <span>1 Endereço IP</span>
                                  <span className="ml-4 font-black text-sky-400">
                                    Grátis
                                  </span>
                                </div>
                              </SelectItem>
                              {[
                                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
                                15,
                              ].map(n => (
                                <SelectItem
                                  className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                                  key={n}
                                  value={`${n + 1}ip`}
                                >
                                  <div className="flex w-full items-center justify-between">
                                    <span>
                                      1 Endereço IP + {n} IP{n > 1 ? "s" : ""}{" "}
                                      Adicional{n > 1 ? "ais" : ""}
                                    </span>
                                    <span className="ml-4 font-black text-[13px] text-sky-400">
                                      {formatBRLPerMonth(
                                        plan.additionalIpEur * n
                                      )}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator
                    className={`${embedded ? "bg-muted" : "bg-white/10"}`}
                  />

                  {/* Add-Ons */}
                  <div className="space-y-8">
                    <h3
                      className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
                    >
                      Complementos
                    </h3>
                    <div className="space-y-6 pl-4">
                      {/* Backup Space */}
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="flex items-center gap-2 md:col-span-3">
                          <span
                            className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                          >
                            Espaço de Backup
                          </span>
                        </div>
                        <div className="md:col-span-9">
                          <Select
                            onValueChange={setBackupSpace}
                            value={backupSpace}
                          >
                            <SelectTrigger
                              className={`h-12 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}
                            >
                              <SelectValue placeholder="Nenhum" />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"}`}
                            >
                              <SelectItem
                                className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                                value="none"
                              >
                                Nenhum
                              </SelectItem>
                              <SelectItem
                                className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                                value="100gb"
                              >
                                <div className="flex w-full min-w-[380px] items-center justify-between">
                                  <span>100 GB Armazenamento FTP</span>
                                  <span className="ml-4 font-black text-sky-400">
                                    {formatBRLPerMonth(4.59)}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                                value="500gb"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span>500 GB Armazenamento FTP</span>
                                  <span className="ml-4 font-black text-sky-400">
                                    {formatBRLPerMonth(13.79)}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                                value="1tb"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span>1 TB Armazenamento FTP</span>
                                  <span className="ml-4 font-black text-sky-400">
                                    {formatBRLPerMonth(22.99)}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                                value="2tb"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span>2 TB Armazenamento FTP</span>
                                  <span className="ml-4 font-black text-sky-400">
                                    {formatBRLPerMonth(36.79)}
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Object Storage — Contabo discontinued this add-on, commented out (not deleted) per request */}
                      {/* <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2"><span className={`text-base font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}>Armazenamento de Objetos</span></div>
                        <div className="md:col-span-9">
                          <Select value={objectStorage} onValueChange={setObjectStorage}>
                            <SelectTrigger className={`h-12 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}><SelectValue placeholder="Nenhum" /></SelectTrigger>
                            <SelectContent className={`${embedded ? "bg-card border-border text-foreground" : "bg-[#000B12] border-white/10 text-white"}`}>
                              <SelectItem value="none" className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}>Nenhum</SelectItem>
                              <SelectItem value="250gb" className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}><div className="flex items-center justify-between w-full min-w-[380px]"><span>250 GB Object Storage na União Europeia</span><span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(plan.objectStoragePrices["250gb"])}</span></div></SelectItem>
                              <SelectItem value="500gb" className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}><div className="flex items-center justify-between w-full"><span>500 GB Object Storage na União Europeia</span><span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(plan.objectStoragePrices["500gb"])}</span></div></SelectItem>
                              <SelectItem value="750gb" className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}><div className="flex items-center justify-between w-full"><span>750 GB Object Storage na União Europeia</span><span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(plan.objectStoragePrices["750gb"])}</span></div></SelectItem>
                              <SelectItem value="1tb" className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}><div className="flex items-center justify-between w-full"><span>1 TB Object Storage na União Europeia</span><span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(plan.objectStoragePrices["1tb"])}</span></div></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div> */}
                      {/* Management — Contabo discontinued this add-on, commented out (not deleted) per request */}
                      {/* <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2"><span className={`text-base font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}>Gerenciamento</span></div>
                        <div className="md:col-span-9">
                          <Select value={serverManagement} onValueChange={setServerManagement}>
                            <SelectTrigger className={`h-12 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}><SelectValue /></SelectTrigger>
                            <SelectContent className={`${embedded ? "bg-card border-border text-foreground" : "bg-[#000B12] border-white/10 text-white"}`}>
                              <SelectItem value="unmanaged" className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}><div className="flex items-center justify-between w-full min-w-[340px]"><span>Não Gerenciado</span><span className="text-sky-400 font-black ml-4">Grátis</span></div></SelectItem>
                              <SelectItem value="managed" className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}><div className="flex items-center justify-between w-full min-w-[340px]"><span>Gerenciado</span><span className="text-sky-400 font-black ml-4">{formatBRLPerMonth(plan.managedEur)}</span></div></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div> */}
                      {/* Monitoring */}
                      <div className="hidden grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="flex items-center gap-2 md:col-span-3">
                          <span
                            className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                          >
                            Monitoramento
                          </span>
                        </div>
                        <div className="md:col-span-9">
                          <Select
                            onValueChange={setMonitoring}
                            value={monitoring}
                          >
                            <SelectTrigger
                              className={`h-12 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}
                            >
                              <SelectValue placeholder="Nenhum" />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"}`}
                            >
                              <SelectItem
                                className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                                value="none"
                              >
                                Nenhum
                              </SelectItem>
                              <SelectItem
                                className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                                value="full"
                              >
                                <div className="flex w-full min-w-[340px] items-center justify-between">
                                  <span>Monitoramento Completo</span>
                                  <span className="ml-4 font-black text-sky-400">
                                    {formatBRLPerMonth(plan.monitoringEur)}
                                  </span>
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

        <Separator className={`${embedded ? "bg-muted" : "bg-white/10"}`} />

        {/* Auth Section */}
        <section
          className={`rounded-2xl border bg-gradient-to-br from-white/5 to-transparent p-8 backdrop-blur-[2px] ${embedded ? "border-border" : "border-white/10"} group shadow-2xl transition-all hover:border-white/20`}
        >
          <h2
            className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} mb-8 uppercase tracking-widest`}
          >
            Login e senha para o seu servidor
          </h2>
          <div className="max-w-3xl space-y-8">
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
              <div className="md:col-span-3">
                <span
                  className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
                >
                  Usuário
                </span>
              </div>
              <div className="md:col-span-9">
                <span
                  className={`${embedded ? "text-foreground" : "text-white"} font-black text-lg uppercase tracking-tight`}
                >
                  root
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="pt-3 md:col-span-3">
                <span
                  className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
                >
                  Senha
                </span>
              </div>
              <div className="space-y-2 md:col-span-9">
                <div className="flex justify-start">
                  <button
                    className="font-bold text-[#3B82F6] text-sm hover:underline"
                    onClick={() => {
                      const chars = "abcdefghijklmnopqrstuvwxyz";
                      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                      const nums = "0123456789";
                      let pass = "";
                      pass += chars[Math.floor(Math.random() * chars.length)];
                      pass += upper[Math.floor(Math.random() * upper.length)];
                      pass += nums[Math.floor(Math.random() * nums.length)];
                      const all = chars + upper + nums;
                      for (let i = 0; i < 9; i++)
                        pass += all[Math.floor(Math.random() * all.length)];
                      pass = pass
                        .split("")
                        .sort(() => 0.5 - Math.random())
                        .join("");
                      setPassword(pass);
                      setPasswordTouched(true);
                    }}
                  >
                    Gerar nova senha
                  </button>
                </div>
                <div className="relative">
                  <Input
                    className={cn(
                      `h-12 rounded-xl border-white/5 pr-12 focus:border-sky-500 ${embedded ? "bg-muted/40 text-foreground" : "bg-white/5 text-white"}`,
                      passwordTouched &&
                        password.length > 0 &&
                        !isPasswordValid(password) &&
                        "border-red-500"
                    )}
                    onChange={e => {
                      setPassword(e.target.value);
                      setPasswordTouched(true);
                    }}
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />
                  <button
                    className={`absolute top-1/2 right-4 -translate-y-1/2 ${embedded ? "text-muted-foreground hover:text-foreground" : "text-slate-500 hover:text-white"} transition-colors`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordTouched &&
                  password.length > 0 &&
                  !isPasswordValid(password) && (
                    <p className="flex items-center gap-1 font-bold text-red-500 text-sm">
                      <AlertCircle size={14} /> Senha inválida (Mín. 8
                      caracteres, maiúscula, número e símbolo)
                    </p>
                  )}
                {isPasswordValid(password) && (
                  <p className="flex items-center gap-1 font-bold text-emerald-500 text-sm">
                    <Check size={14} /> Senha forte e segura
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Bottom Summary Bar */}
      <div
        className={`${embedded ? "sticky" : "fixed right-0 left-0"} bottom-0 ${embedded ? "bg-card/90" : "bg-[#000B12]/90"} border-t ${embedded ? "border-border" : "border-white/10"} z-[100] pr-16 shadow-[0_-4px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl md:pr-0`}
      >
        <AnimatePresence>
          {showSummaryDetails && (
            <motion.div
              animate={{ height: "auto", opacity: 1 }}
              className={`overflow-hidden border-b ${embedded ? "border-border bg-muted/40" : "border-white/10 bg-white/5"} backdrop-blur-md`}
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
            >
              <div className="mx-auto max-w-7xl px-10 py-6">
                <h3
                  className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} mb-4 uppercase tracking-widest`}
                >
                  Detalhamento do Pedido
                </h3>
                <div className="grid grid-cols-1 gap-x-12 gap-y-2 md:grid-cols-2">
                  {(calculateItems() as any[]).map((item: any, idx: number) => (
                    <div
                      className="flex items-center justify-between border-white/5 border-b pb-1 text-lg"
                      key={idx}
                    >
                      <span
                        className={`${embedded ? "text-muted-foreground" : "text-slate-400"} font-medium`}
                      >
                        {item.label}
                      </span>
                      <span
                        className={`font-black ${embedded ? "text-foreground" : "text-white"}`}
                      >
                        {formatBRL(item.price / currentRate)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto flex h-auto max-w-7xl items-center justify-between px-2 py-2 md:h-24 md:px-10 md:py-0">
          <div className="flex items-center gap-6">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full border shadow-lg ${embedded ? "border-border bg-muted/40" : "border-white/10 bg-white/5"}`}
            >
              <ShieldCheck className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`font-black ${embedded ? "text-foreground" : "text-white"} text-sm uppercase leading-tight tracking-widest md:text-xl`}
                >
                  Resumo
                </h3>
                <button
                  className={`p-1 ${embedded ? "hover:bg-accent" : "hover:bg-white/10"} rounded-full transition-colors`}
                  onClick={() => setShowSummaryDetails(!showSummaryDetails)}
                >
                  {showSummaryDetails ? (
                    <ChevronDown className="text-sky-400" size={20} />
                  ) : (
                    <ChevronUp className="text-sky-400" size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 lg:gap-16">
            {(() => {
              const totalBrl = calculateTotal();
              const durationMonths = Number.parseInt(duration, 10);
              const qty = Number.parseInt(quantity, 10);
              const durationObj = durations.find((d: any) => d.id === duration);
              let totalSavings = 0;
              if (durationObj?.oldEur) {
                totalSavings =
                  (durationObj.oldEur - durationObj.eur) *
                  durationMonths *
                  qty *
                  currentRate;
              }

              return (
                <>
                  <div className="hidden min-w-[150px] flex-1 text-center md:block">
                    {totalSavings > 0 && (
                      <p className="font-bold text-emerald-500 text-lg">
                        Você economiza {formatBRL(totalSavings / currentRate)}.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 md:gap-6 lg:gap-10">
                    <div className="flex min-w-0 flex-col gap-0.5 md:min-w-[200px] md:gap-1">
                      <div className="hidden items-center justify-between text-[15px] uppercase tracking-widest md:flex">
                        <span
                          className={`${embedded ? "text-muted-foreground" : "text-slate-500"} flex items-center gap-1 font-black text-[15px]`}
                        >
                          MENSAL{" "}
                        </span>
                        <span
                          className={`${embedded ? "text-foreground" : "text-white"} whitespace-nowrap font-black`}
                        >
                          {formatBRLPerMonth(
                            totalBrl / durationMonths / currentRate
                          )}
                        </span>
                      </div>
                      <div className="hidden items-center justify-between text-[15px] uppercase tracking-widest md:flex">
                        <span
                          className={`${embedded ? "text-muted-foreground" : "text-slate-500"} flex items-center gap-1 font-black text-[15px]`}
                        >
                          TAXA ÚNICA{" "}
                        </span>
                        <span
                          className={`${embedded ? "text-foreground" : "text-white"} whitespace-nowrap font-black`}
                        >
                          {formatBRL(0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between md:mt-1">
                        <div className="flex flex-col">
                          <span
                            className={`font-black text-[10px] md:text-[17px] ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                          >
                            Vencido Hoje
                          </span>
                          <span
                            className={`hidden text-[14px] md:block ${embedded ? "text-muted-foreground" : "text-slate-500"} -mt-1 font-black uppercase tracking-widest`}
                          >
                            Pré-pago {durationMonths}{" "}
                            {durationMonths === 1 ? "Mês" : "Meses"}
                          </span>
                        </div>
                        <span
                          className={`font-black text-sm md:text-3xl ${embedded ? "text-foreground" : "text-white"} ml-1 whitespace-nowrap drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] md:ml-0`}
                        >
                          {formatBRL(totalBrl / currentRate)}
                        </span>
                      </div>
                    </div>
                    <Button
                      className={cn(
                        "h-9 min-w-0 rounded-lg px-3 font-black text-sm uppercase tracking-widest shadow-xl transition-all md:h-14 md:min-w-[180px] md:px-12 md:text-xl",
                        isPasswordValid(password)
                          ? "bg-sky-500 text-white shadow-sky-500/20 hover:bg-sky-400"
                          : embedded
                            ? "cursor-not-allowed bg-muted text-muted-foreground shadow-none"
                            : "cursor-not-allowed bg-white/10 text-slate-500 shadow-none"
                      )}
                      disabled={!isPasswordValid(password)}
                      onClick={() => {
                        if (isPasswordValid(password)) {
                          const storageUpgradesJson = encodeURIComponent(
                            JSON.stringify(storageUpgrades)
                          );
                          router.push(
                            `/checkout/personal-data?planId=${id}&qty=${quantity}&duration=${duration}&location=${location}&image=${osImage}&management=${serverManagement}&monitoring=${monitoring}&privateNetwork=${privateNetwork}&ipv4Address=${ipv4Address}&objectStorage=${objectStorage}&password=${encodeURIComponent(password)}&type=vds&storageUpgrades=${storageUpgradesJson}`
                          );
                        }
                      }}
                    >
                      Próximo
                    </Button>
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
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowUbuntuModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "border-border bg-card" : "border-white/10 bg-[#000B12]"} w-full max-w-[600px] space-y-8 overflow-hidden rounded-2xl border p-10 shadow-2xl`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img alt="Ubuntu" className="h-10 w-10" src="/image.png" />
                <h2
                  className={`font-black text-2xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Ubuntu
                </h2>
              </div>
              <p
                className={`${embedded ? "text-muted-foreground" : "text-slate-400"} font-medium text-[17px] leading-relaxed`}
              >
                Ubuntu é um sistema operacional livre e de código aberto baseado
                em Linux.
              </p>
              <div className="space-y-4">
                <label
                  className={`font-bold text-base ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                >
                  Versão
                </label>
                <Select onValueChange={setUbuntuVersion} value={ubuntuVersion}>
                  <SelectTrigger
                    className={`h-14 rounded-xl ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"}`}
                  >
                    <SelectItem value="Ubuntu 24.04">Ubuntu 24.04</SelectItem>
                    <SelectItem value="Ubuntu 22.04">Ubuntu 22.04</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground hover:text-foreground" : "text-slate-400 hover:text-white"} uppercase tracking-widest`}
                  onClick={() => setShowUbuntuModal(false)}
                  variant="ghost"
                >
                  Pular
                </Button>
                <Button
                  className="bg-sky-500 px-8 font-black text-white uppercase tracking-widest hover:bg-sky-400"
                  onClick={() => setShowUbuntuModal(false)}
                >
                  Começar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
        {showCpanelModal && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowCpanelModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "border-border bg-card" : "border-white/10 bg-[#000B12]"} w-full max-w-[600px] space-y-8 overflow-hidden rounded-2xl border p-10 shadow-2xl`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img alt="cPanel" className="h-10 w-10" src="/cpanel.png" />
                <h2
                  className={`font-black text-2xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  cPanel
                </h2>
              </div>
              <div className="space-y-4">
                <label
                  className={`font-bold text-base ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                >
                  Licença
                </label>
                <Select onValueChange={setCpanelLicence} value={cpanelLicence}>
                  <SelectTrigger
                    className={`h-14 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"} rounded-xl`}
                  >
                    <div className="flex w-full items-center justify-between pr-2">
                      <span className="text-base">
                        cPanel/WHM ({cpanelLicence} contas)
                      </span>
                      <span className="font-black text-sky-400 text-sm">
                        {(() => {
                          let eur = currentImagePrices.cpanel;
                          const accounts = Number.parseInt(cpanelLicence, 10);
                          if (accounts === 30) eur = 34.51;
                          else if (accounts === 50) eur = 45.82;
                          else if (accounts === 100) eur = 55.93;
                          else if (accounts === 150) eur = 69.62;
                          else if (accounts >= 200) {
                            eur =
                              93.42 + Math.floor((accounts - 200) / 50) * 23.8;
                          }
                          return formatBRL(eur);
                        })()} / mês
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[120] max-h-[300px]`}
                  >
                    {[
                      5, 30, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500,
                      550, 600, 650, 700, 750, 800, 850, 900, 950, 1000,
                    ].map(count => (
                      <SelectItem
                        className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                        key={count}
                        value={count.toString()}
                      >
                        <div className="flex w-full min-w-[420px] items-center justify-between">
                          <span
                            className={cn(
                              "flex-1",
                              cpanelLicence === count.toString()
                                ? "font-black text-sky-400"
                                : embedded
                                  ? "text-muted-foreground"
                                  : "text-slate-300"
                            )}
                          >
                            cPanel/WHM ({count} contas)
                          </span>
                          <span
                            className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-black`}
                          >
                            {(() => {
                              let eur = currentImagePrices.cpanel;
                              if (count === 30) eur = 34.51;
                              else if (count === 50) eur = 45.82;
                              else if (count === 100) eur = 55.93;
                              else if (count === 150) eur = 69.62;
                              else if (count >= 200) {
                                eur =
                                  93.42 + Math.floor((count - 200) / 50) * 23.8;
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
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground hover:text-foreground" : "text-slate-400 hover:text-white"} uppercase tracking-widest`}
                  onClick={() => setShowCpanelModal(false)}
                  variant="ghost"
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-sky-500 px-8 font-black text-white uppercase tracking-widest hover:bg-sky-400"
                  onClick={() => setShowCpanelModal(false)}
                >
                  Selecionar
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {showPleskModal && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowPleskModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "border-border bg-card" : "border-white/10 bg-[#000B12]"} w-full max-w-[600px] space-y-8 overflow-hidden rounded-2xl border p-10 shadow-2xl`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img alt="Plesk" className="h-10 w-10" src="/plesk.png" />
                <h2
                  className={`font-black text-2xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Plesk
                </h2>
              </div>
              <div className="space-y-4">
                <label
                  className={`font-bold text-base ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                >
                  Edição
                </label>
                <Select onValueChange={setPleskLicence} value={pleskLicence}>
                  <SelectTrigger
                    className={`h-14 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"} rounded-xl`}
                  >
                    <div className="flex w-full items-center justify-between pr-2">
                      <span className="text-base">
                        {pleskLicence === "admin"
                          ? "Web Admin Edition"
                          : pleskLicence === "pro"
                            ? "Web Pro Edition"
                            : "Web Host Edition"}
                      </span>
                      <span className="font-black text-sky-400 text-sm">
                        {(() => {
                          let eur = currentImagePrices.pleskLinux;
                          if (pleskLicence === "pro")
                            eur = currentImagePrices.pleskPro;
                          else if (pleskLicence === "host")
                            eur = currentImagePrices.pleskHost;
                          return formatBRL(eur);
                        })()} / mês
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[120]`}
                  >
                    <SelectItem
                      className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                      value="admin"
                    >
                      <div className="flex w-full min-w-[400px] items-center justify-between">
                        <span>Web Admin Edition (10 domínios)</span>
                        <span
                          className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-black`}
                        >
                          {formatBRL(currentImagePrices.pleskLinux)}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                      value="pro"
                    >
                      <div className="flex w-full min-w-[400px] items-center justify-between">
                        <span>Web Pro Edition (30 domínios)</span>
                        <span
                          className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-black`}
                        >
                          {formatBRL(currentImagePrices.pleskPro)}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                      value="host"
                    >
                      <div className="flex w-full min-w-[400px] items-center justify-between">
                        <span>Web Host Edition (ilimitado)</span>
                        <span
                          className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-black`}
                        >
                          {formatBRL(currentImagePrices.pleskHost)}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground hover:text-foreground" : "text-slate-400 hover:text-white"} uppercase tracking-widest`}
                  onClick={() => setShowPleskModal(false)}
                  variant="ghost"
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-sky-500 px-8 font-black text-white uppercase tracking-widest hover:bg-sky-400"
                  onClick={() => setShowPleskModal(false)}
                >
                  Selecionar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
        {showPleskWindowsModal && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowPleskWindowsModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "border-border bg-card" : "border-white/10 bg-[#000B12]"} w-full max-w-[600px] space-y-8 overflow-hidden rounded-2xl border p-10 shadow-2xl`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img alt="Plesk" className="h-10 w-10" src="/plesk.png" />
                <h2
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Plesk + Windows
                </h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <label
                    className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                  >
                    Edição
                  </label>
                  <Select
                    onValueChange={setPleskWinLicence}
                    value={pleskWinLicence}
                  >
                    <SelectTrigger
                      className={`h-14 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"} rounded-xl`}
                    >
                      <div className="flex w-full items-center justify-between pr-2">
                        <span className="text-sm">
                          {pleskWinLicence === "admin"
                            ? "Web Admin Edition"
                            : pleskWinLicence === "pro"
                              ? "Web Pro Edition"
                              : "Web Host Edition"}
                        </span>
                        <span className="font-black text-sky-400 text-xs">
                          {(() => {
                            let eur = currentImagePrices.pleskWin;
                            if (pleskWinLicence === "pro")
                              eur = currentImagePrices.pleskPro;
                            else if (pleskWinLicence === "host")
                              eur = currentImagePrices.pleskHost;
                            return formatBRL(eur);
                          })()} / mês
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[120]`}
                    >
                      <SelectItem
                        className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                        value="admin"
                      >
                        <div className="flex w-full min-w-[400px] items-center justify-between">
                          <span>Web Admin Edition (10 domínios)</span>
                          <span
                            className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-black`}
                          >
                            {formatBRL(currentImagePrices.pleskWin)}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                        value="pro"
                      >
                        <div className="flex w-full min-w-[400px] items-center justify-between">
                          <span>Web Pro Edition (30 domínios)</span>
                          <span
                            className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-black`}
                          >
                            {formatBRL(currentImagePrices.pleskPro)}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                        value="host"
                      >
                        <div className="flex w-full min-w-[400px] items-center justify-between">
                          <span>Web Host Edition (ilimitado)</span>
                          <span
                            className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-black`}
                          >
                            {formatBRL(currentImagePrices.pleskHost)}
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <label
                    className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                  >
                    Versão do Windows
                  </label>
                  <Select
                    onValueChange={setPleskWinVersion}
                    value={pleskWinVersion}
                  >
                    <SelectTrigger
                      className={`h-14 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"} rounded-xl`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[120]`}
                    >
                      <SelectItem
                        className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                        value="2025"
                      >
                        Windows Server 2025
                      </SelectItem>
                      <SelectItem
                        className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                        value="2022"
                      >
                        Windows Server 2022
                      </SelectItem>
                      <SelectItem
                        className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                        value="2019"
                      >
                        Windows Server 2019
                      </SelectItem>
                      <SelectItem
                        className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                        value="2016"
                      >
                        Windows Server 2016
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p
                    className={`text-[10px] ${embedded ? "text-muted-foreground" : "text-slate-400"} font-medium uppercase tracking-wider`}
                  >
                    O preço do Windows Server já está incluído na licença Plesk
                    para Windows.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground hover:text-foreground" : "text-slate-400 hover:text-white"} uppercase tracking-widest`}
                  onClick={() => setShowPleskWindowsModal(false)}
                  variant="ghost"
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-sky-500 px-8 font-black text-white uppercase tracking-widest hover:bg-sky-400"
                  onClick={() => setShowPleskWindowsModal(false)}
                >
                  Selecionar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
        {showWindowsModal && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowWindowsModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "border-border bg-card" : "border-white/10 bg-[#000B12]"} w-full max-w-[600px] space-y-8 rounded-2xl border p-10 shadow-2xl`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img alt="Windows" className="h-10 w-10" src="/windows.png" />
                <h2
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Windows Server
                </h2>
              </div>
              <div className="space-y-4">
                <label
                  className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                >
                  Versão
                </label>
                <Select
                  onValueChange={setWindowsVersion}
                  value={windowsVersion}
                >
                  <SelectTrigger
                    className={`h-14 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"} rounded-xl`}
                  >
                    <div className="flex w-full items-center justify-between pr-2">
                      <span className="text-sm">Server {windowsVersion}</span>
                      <span className="font-black text-sky-400 text-xs">
                        {formatBRL(currentImagePrices.windows)} / mês |{" "}
                        {formatBRL(currentImagePrices.windows_setup)} Taxa
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[120]`}
                  >
                    <SelectItem
                      className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                      value="2025"
                    >
                      <div className="flex w-full min-w-[400px] items-center justify-between">
                        <span>Server 2025</span>
                        <span
                          className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-black`}
                        >
                          {formatBRL(currentImagePrices.windows)}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                      value="2022"
                    >
                      <div className="flex w-full min-w-[400px] items-center justify-between">
                        <span>Server 2022</span>
                        <span
                          className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-black`}
                        >
                          {formatBRL(currentImagePrices.windows)}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                      value="2019"
                    >
                      <div className="flex w-full min-w-[400px] items-center justify-between">
                        <span>Server 2019</span>
                        <span
                          className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-black`}
                        >
                          {formatBRL(currentImagePrices.windows)}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      className={`${embedded ? "focus:bg-accent focus:text-foreground" : "focus:bg-white/10 focus:text-white"}`}
                      value="2016"
                    >
                      <div className="flex w-full min-w-[400px] items-center justify-between">
                        <span>Server 2016</span>
                        <span
                          className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-black`}
                        >
                          {formatBRL(currentImagePrices.windows)}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground hover:text-foreground" : "text-slate-400 hover:text-white"} uppercase tracking-widest`}
                  onClick={() => setShowWindowsModal(false)}
                  variant="ghost"
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-sky-500 px-8 font-black text-white uppercase tracking-widest hover:bg-sky-400"
                  onClick={() => setShowWindowsModal(false)}
                >
                  Selecionar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
