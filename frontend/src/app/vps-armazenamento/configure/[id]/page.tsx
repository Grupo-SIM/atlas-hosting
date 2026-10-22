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
import Image from "next/image";
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

// Base rate for initial render (will be updated by API)
// Base rate for fallback if API fails
const FALLBACK_EUR_RATE = 5.86;

// Euro source values for software licensing
const getPlanImagePrices = (planId: string, defaultPrices: any) => {
  const base = {
    ...defaultPrices,
    cpanel: 43.5, // 21.75 * 2
    pleskHost: 86.88,
    pleskLinux: 24.0, // 12.00 * 2
    pleskPro: 45.22,
    pleskWin: 32.0, // 16.00 * 2
  };

  if (planId === "10") {
    return { ...base, win2016: 9.5, windows: 9.5 }; // 4.75 * 2
  }
  if (planId === "20") {
    return { ...base, win2016: 15.0, windows: 15.0 }; // 7.50 * 2
  }
  if (planId === "30") {
    return { ...base, win2016: 31.0, windows: 31.0 }; // 15.50 * 2
  }
  if (planId === "40") {
    return { ...base, win2016: 52.0, windows: 52.0 }; // 26.00 * 2
  }
  if (planId === "50") {
    return { ...base, win2016: 98.0, windows: 98.0 }; // 49.00 * 2
  }

  return base;
};

// Mock data for Storage VPS plans
const plansData: Record<string, any> = {
  "10": {
    additionalIpEur: 7.0,
    backupEur: 3.0,
    durations: [
      {
        discount: null,
        eur: 11.0,
        id: "1",
        label: "1 mês",
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 15%",
        eur: 9.36,
        id: "12",
        label: "12 meses",
        oldEur: 11.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 8.8,
        id: "24",
        label: "24 meses",
        oldEur: 11.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    locations: {
      america: [
        {
          eur: 2.1,
          id: "us-central",
          latency: "119 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 3.1,
          id: "us-east",
          latency: "89 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 2.6,
          id: "us-west",
          latency: "146 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 5.0, id: "sg", latency: "338 ms", name: "Ásia (Singapura)" },
        { eur: 5.1, id: "jp", latency: "320 ms", name: "Ásia (Japão)" },
        { eur: 4.8, id: "in", latency: "286 ms", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 4.3,
          id: "au-sydney",
          latency: "310 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "185 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 3.1,
          id: "us-east",
          latency: "89 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "185 ms", name: "União Europeia", price: "Livre" },
        { eur: 2.1, id: "uk", latency: "156 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 109.99,
    monitoringEur: 22.98,
    name: "Storage VPS 10 (S)",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    privateNetworkEur: 4.58,
    ram: "4 GB RAM",
    snapshots: "0 Instantâneos",
    storage: "300 GB SSD",
    storageTypes: [{ id: "ssd-300", name: "300 GB SSD", price: "Livre" }],
    traffic: "Porta de 200 Mbit/s",
    vcpu: "2 núcleos de vCPU",
  },
  "20": {
    additionalIpEur: 7.0,
    backupEur: 4.0,
    durations: [
      {
        discount: null,
        eur: 15.0,
        id: "1",
        label: "1 mês",
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 15%",
        eur: 12.76,
        id: "12",
        label: "12 meses",
        oldEur: 15.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 12.0,
        id: "24",
        label: "24 meses",
        oldEur: 15.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    locations: {
      america: [
        {
          eur: 3.2,
          id: "us-central",
          latency: "118 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 4.8,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 4.0,
          id: "us-west",
          latency: "146 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 7.9, id: "sg", latency: "332 ms", name: "Ásia (Singapura)" },
        { eur: 8.0, id: "jp", latency: "322 ms", name: "Ásia (Japão)" },
        { eur: 7.4, id: "in", latency: "286 ms", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 6.6,
          id: "au-sydney",
          latency: "310 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "185 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 4.8,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "185 ms", name: "União Europeia", price: "Livre" },
        { eur: 3.2, id: "uk", latency: "156 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 109.99,
    monitoringEur: 22.98,
    name: "Storage VPS 20 (M)",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    privateNetworkEur: 4.58,
    ram: "8 GB RAM",
    snapshots: "0 Instantâneos",
    storage: "400 GB SSD",
    storageTypes: [{ id: "ssd-400", name: "400 GB SSD", price: "Livre" }],
    traffic: "Porta de 300 Mbit/s",
    vcpu: "3 núcleos de vCPU",
  },
  "30": {
    additionalIpEur: 7.0,
    backupEur: 7.0,
    durations: [
      {
        discount: null,
        eur: 28.0,
        id: "1",
        label: "1 mês",
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 15%",
        eur: 23.8,
        id: "12",
        label: "12 meses",
        oldEur: 28.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 22.4,
        id: "24",
        label: "24 meses",
        oldEur: 28.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    locations: {
      america: [
        {
          eur: 6.5,
          id: "us-central",
          latency: "118 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 9.5,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 8.0,
          id: "us-west",
          latency: "146 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 15.7, id: "sg", latency: "332 ms", name: "Ásia (Singapura)" },
        { eur: 16.0, id: "jp", latency: "296 ms", name: "Ásia (Japão)" },
        { eur: 14.8, id: "in", latency: "286 ms", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 13.2,
          id: "au-sydney",
          latency: "310 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "186 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 9.5,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "186 ms", name: "União Europeia", price: "Livre" },
        { eur: 6.5, id: "uk", latency: "156 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 109.99,
    monitoringEur: 22.98,
    name: "Storage VPS 30 (L)",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    privateNetworkEur: 4.58,
    ram: "18 GB RAM",
    snapshots: "0 Instantâneos",
    storage: "1 TB SSD",
    storageTypes: [{ id: "ssd-1t", name: "1 TB SSD", price: "Livre" }],
    traffic: "Porta de 600 Mbit/s",
    vcpu: "6 núcleos de vCPU",
  },
  "40": {
    additionalIpEur: 7.0,
    backupEur: 8.4,
    durations: [
      {
        discount: null,
        eur: 50.0,
        id: "1",
        label: "1 mês",
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 15%",
        eur: 42.5,
        id: "12",
        label: "12 meses",
        oldEur: 50.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 40.0,
        id: "24",
        label: "24 meses",
        oldEur: 50.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    locations: {
      america: [
        {
          eur: 11.6,
          id: "us-central",
          latency: "119 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 17.1,
          id: "us-east",
          latency: "87 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 14.3,
          id: "us-west",
          latency: "148 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 28.1, id: "sg", latency: "346 ms", name: "Ásia (Singapura)" },
        { eur: 28.6, id: "jp", latency: "263 ms", name: "Ásia (Japão)" },
        { eur: 26.4, id: "in", latency: "N/A", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 23.7,
          id: "au-sydney",
          latency: "354 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "175 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 17.1,
          id: "us-east",
          latency: "87 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "175 ms", name: "União Europeia", price: "Livre" },
        { eur: 11.6, id: "uk", latency: "136 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 109.99,
    monitoringEur: 22.98,
    name: "Storage VPS 40 (XL)",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    privateNetworkEur: 4.58,
    ram: "30 GB RAM",
    snapshots: "0 Instantâneos",
    storage: "1.2 TB SSD",
    storageTypes: [{ id: "ssd-12t", name: "1.2 TB SSD", price: "Livre" }],
    traffic: "Porta de 800 Mbit/s",
    vcpu: "8 núcleos de vCPU",
  },
  "50": {
    additionalIpEur: 7.0,
    backupEur: 9.8,
    durations: [
      {
        discount: null,
        eur: 74.0,
        id: "1",
        label: "1 mês",
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 15%",
        eur: 62.9,
        id: "12",
        label: "12 meses",
        oldEur: 74.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 59.2,
        id: "24",
        label: "24 meses",
        oldEur: 74.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    locations: {
      america: [
        {
          eur: 17.1,
          id: "us-central",
          latency: "118 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 25.2,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 21.2,
          id: "us-west",
          latency: "146 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 41.5, id: "sg", latency: "325 ms", name: "Ásia (Singapura)" },
        { eur: 41.5, id: "jp", latency: "266 ms", name: "Ásia (Japão)" },
        { eur: 39.1, id: "in", latency: "287 ms", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 35.0,
          id: "au-sydney",
          latency: "310 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "189 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 25.2,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "189 ms", name: "União Europeia", price: "Livre" },
        { eur: 17.1, id: "uk", latency: "156 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 109.99,
    monitoringEur: 22.98,
    name: "Storage VPS 50 (XXL)",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    privateNetworkEur: 4.58,
    ram: "50 GB RAM",
    snapshots: "0 Instantâneos",
    storage: "1.4 TB SSD",
    storageTypes: [{ id: "ssd-14t", name: "1.4 TB SSD", price: "Livre" }],
    traffic: "Porta de 1 Gbit/s",
    vcpu: "14 núcleos de vCPU",
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

const images = (prices: any) => ({
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
      icon: "/windows.png",
      id: "windows",
      name: "Servidor Windows",
      price: prices.windows,
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
    { icon: "/cpanel.png", id: "cpanel", name: "cPanel", price: prices.cpanel },
    {
      icon: "/plesk.png",
      id: "plesk-win",
      name: "Plesk + Windows",
      price: prices.pleskWin,
    },
    {
      icon: "/plesk.png",
      id: "plesk-linux",
      name: "Plesk + Linux",
      price: prices.pleskLinux,
    },
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
      icon: "/windows.png",
      id: "windows",
      name: "Servidor Windows",
      price: prices.windows,
    },
    { icon: "/cpanel.png", id: "cpanel", name: "cPanel", price: prices.cpanel },
    {
      icon: "/centos-svgrepo-com.svg",
      id: "rhel",
      name: "RHEL Variants",
      price: "Incluído",
    },
    {
      icon: "/plesk.png",
      id: "plesk-linux",
      name: "Plesk + Linux",
      price: prices.pleskLinux,
    },
    {
      icon: "/plesk.png",
      id: "plesk-win",
      name: "Plesk + Windows",
      price: prices.pleskWin,
    },
  ],
});

export default function ConfigureStorageVps({
  embedded = false,
}: {
  embedded?: boolean;
} = {}) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = params.id as string;

  const [currentRate, setCurrentRate] = useState(FALLBACK_EUR_RATE);
  const [usdRate, setUsdRate] = useState(1.08);
  const [displayCurrency, setDisplayCurrency] =
    useState<DisplayCurrency>("BRL");

  useEffect(() => {
    const syncCurrency = () => setDisplayCurrency(readDisplayCurrency());
    syncCurrency();
    window.addEventListener(DISPLAY_CURRENCY_CHANGE_EVENT, syncCurrency);
    return () =>
      window.removeEventListener(DISPLAY_CURRENCY_CHANGE_EVENT, syncCurrency);
  }, []);

  const plan = plansData[planId as keyof typeof plansData] || plansData["10"];
  const durations = plan.durations;
  const storageTypes = plan.storageTypes;
  const planLocations = plan.locations || plansData["10"].locations;
  const currentImagePrices = getPlanImagePrices(planId, {
    cpanel: 0,
    pleskHost: 0,
    pleskLinux: 0,
    pleskPro: 0,
    pleskWin: 0,
    win2016: 0,
    windows: 0,
  });

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
  const [duration, setDuration] = useState(sp.get("duration") || "1");
  const [regionTab, setRegionTab] = useState(sp.get("regionTab") || "best");
  const [location, setLocation] = useState(sp.get("location") || "eu");
  const [storageType, setStorageType] = useState(
    sp.get("storage") || storageTypes[0].id
  );
  const [imageCategory, setImageCategory] = useState(
    sp.get("imageCategory") || "popular"
  );
  const [osImage, setOsImage] = useState(sp.get("image") || "ubuntu");
  const [autoBackup, setAutoBackup] = useState(sp.get("backup") === "true");
  const [showMoreImages, setShowMoreImages] = useState(true);
  const [showAdditionalFeatures, setShowAdditionalFeatures] = useState(true);
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
  const [password, setPassword] = useState(
    sp.get("password") ? decodeURIComponent(sp.get("password")!) : ""
  );
  const [showPassword, setShowPassword] = useState(false);
  const [privateNetwork, setPrivateNetwork] = useState(
    sp.get("privateNetwork") || "none"
  );
  const [ipv4Address, setIpv4Address] = useState(
    sp.get("ipv4Address") || "1ip"
  );
  const [objectStorage, setObjectStorage] = useState(
    sp.get("objectStorage") || "none"
  );
  const [serverManagement, setServerManagement] = useState(
    sp.get("management") || "unmanaged"
  );
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
    window.history.replaceState(
      {},
      "",
      `/vps-armazenamento/configure/${planId}?${p.toString()}`
    );
  }, [
    quantity,
    duration,
    regionTab,
    location,
    storageType,
    imageCategory,
    osImage,
    autoBackup,
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
    objectStorage,
    serverManagement,
    monitoring,
    password,
    planId,
  ]);

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

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`${embedded ? "min-h-full" : "min-h-screen"} ${embedded ? "bg-background" : "bg-[#000B12]"} ${embedded ? "text-foreground" : "text-white"} relative pb-24 font-sans ${embedded ? "" : "overflow-hidden"}`}
    >
      {!embedded && (
        <div className="pointer-events-none fixed inset-0 bg-landing-gradient opacity-40" />
      )}
      {!embedded && <Navbar variant="dark" />}
      <div
        className={`mx-auto max-w-6xl px-6 ${embedded ? "pt-6 md:pt-10" : "pt-32"} space-y-12 pb-12`}
      >
        <Link
          className="group mb-6 flex items-center gap-2 font-bold text-lg text-sky-400 transition-all hover:text-sky-300"
          href={embedded ? "/vps-plans" : "/vps-armazenamento#plans"}
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Voltar para VPS de Armazenamento
        </Link>
        <h1
          className={`font-black text-4xl md:text-5xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
        >
          Configure seu {plan.name}
        </h1>

        <div className="flex flex-wrap items-center gap-10">
          <div
            className={`relative grid flex-1 grid-cols-4 gap-4 rounded-xl border-2 border-sky-500/50 p-8 ${embedded ? "bg-muted/40" : "bg-white/5"} shadow-2xl backdrop-blur-md`}
          >
            <div className="space-y-1">
              <p
                className={`font-bold text-[14px] ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase`}
              >
                CPU
              </p>
              <p className="font-medium text-[15px] leading-tight">
                {plan.vcpu}
              </p>
            </div>
            <div className="space-y-1">
              <p
                className={`font-bold text-[14px] ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase`}
              >
                RAM
              </p>
              <p className="font-medium text-[15px] leading-tight">
                {plan.ram}
              </p>
            </div>
            <div className="space-y-1">
              <p
                className={`font-bold text-[14px] ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase`}
              >
                ARMAZENAMENTO
              </p>
              <p className="font-medium text-[15px] leading-tight">
                {plan.storage}
              </p>
            </div>
            <div className="space-y-1">
              <p
                className={`font-bold text-[14px] ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase`}
              >
                TRÁFEGO
              </p>
              <p className="font-medium text-[15px] leading-tight">
                {plan.traffic}
              </p>
            </div>
            <Link
              className="absolute right-4 bottom-4 font-bold text-[14px] text-sky-400 uppercase tracking-wider hover:underline"
              href="/vps-armazenamento#plans"
            >
              Mudar
            </Link>
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
                {Array.from({ length: 25 }, (_, i) => i + 1).map(n => (
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

        <Separator className={`${embedded ? "bg-border" : "bg-white/10"}`} />

        {/* Duration Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2
              className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
            >
              Selecione o ciclo de faturamento
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {durations.map((d: any) => (
              <div className="space-y-3" key={d.id}>
                <div
                  className={cn(
                    "relative flex h-24 cursor-pointer items-center justify-between rounded-xl border p-8 shadow-xl backdrop-blur-md transition-all",
                    duration === d.id
                      ? `border-sky-500 ${embedded ? "bg-accent" : "bg-white/10"}`
                      : `${embedded ? "border-border bg-muted/40" : "border-white/10 bg-white/5"}`
                  )}
                  onClick={() => setDuration(d.id)}
                >
                  {d.discount && (
                    <div className="absolute -top-3 left-6 border border-slate-100 bg-slate-50 px-2 py-0.5 font-bold text-[13px] text-emerald-500">
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
                      {formatBRL(d.eur)}{" "}
                      <span
                        className={`font-normal text-base ${embedded ? "text-muted-foreground" : "text-slate-400"}`}
                      >
                        / mês
                      </span>
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "rounded-b-md py-1.5 text-center font-bold text-[15px] uppercase tracking-wider transition-colors",
                    d.setupFee === "Sem taxa de instalação"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : `${embedded ? "text-muted-foreground" : "text-slate-400"}`
                  )}
                >
                  {d.setupFee}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator className={`${embedded ? "bg-border" : "bg-white/10"}`} />

        {/* Region Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2
              className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
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
                        : `${embedded ? "text-muted-foreground hover:text-foreground" : "text-slate-500 hover:text-white"}`
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
                  planLocations[regionTab as keyof typeof planLocations] || []
                ).map((loc: any) => (
                  <button
                    className={cn(
                      `flex w-full items-center justify-between border p-4 font-bold text-base ${embedded ? "bg-muted/40" : "bg-white/5"} relative rounded-lg backdrop-blur-md transition-all`,
                      location === loc.id
                        ? `border-sky-500 ${embedded ? "bg-accent" : "bg-white/10"}`
                        : `${embedded ? "border-border" : "border-white/10"}`,
                      loc.recommended && "mt-6"
                    )}
                    key={loc.id}
                    onClick={() => setLocation(loc.id)}
                  >
                    {loc.recommended && (
                      <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-sky-500 px-2 py-0.5 font-black text-[10px] text-white uppercase tracking-widest shadow-lg shadow-sky-500/20 md:px-4 md:py-1 md:text-[13px]">
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
                      – Latência de {loc.latency}
                    </div>
                    <div
                      className={`flex-1 text-right ${embedded ? "text-foreground" : "text-white"} font-black text-base md:text-lg`}
                    >
                      {loc.price === "Livre"
                        ? "Grátis"
                        : formatBRLPerMonth(loc.eur)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Separator className={`${embedded ? "bg-border" : "bg-white/10"}`} />

        {/* Image Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2
              className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
            >
              Imagem
            </h2>
            <button
              className={`flex items-center gap-1 font-black text-[13px] ${embedded ? "text-foreground" : "text-white"} uppercase tracking-wider`}
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
            {showMoreImages && (
              <motion.div
                animate={{ height: "auto", opacity: 1 }}
                className="space-y-8 overflow-hidden"
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
                key="expanded"
              >
                <div className="flex justify-center border-slate-100 border-b">
                  {imageCategories.map(cat => (
                    <button
                      className={cn(
                        "relative px-8 py-3 font-bold text-[15px] transition-colors",
                        imageCategory === cat.id
                          ? "text-sky-500"
                          : `${embedded ? "text-muted-foreground" : "text-slate-400"} hover:text-slate-600`
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  {(
                    images(currentImagePrices)[
                      imageCategory as keyof ReturnType<typeof images>
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
                        `flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${embedded ? "bg-muted/40" : "bg-white/5"} backdrop-blur-md`,
                        osImage === img.id
                          ? `border-sky-500 ${embedded ? "bg-accent" : "bg-white/10"}`
                          : `${embedded ? "border-border" : "border-white/10"}`
                      )}
                      key={img.id}
                      onClick={() => {
                        if (img.id === "plesk-win")
                          setShowPleskWindowsModal(true);
                        else if (img.id === "plesk-linux")
                          setShowPleskModal(true);
                        else if (img.name.toLowerCase().includes("ubuntu"))
                          setShowUbuntuModal(true);
                        else if (img.id === "custom") setShowCustomModal(true);
                        else if (img.name.toLowerCase().includes("windows"))
                          setShowWindowsModal(true);
                        else if (
                          img.id === "cpanel" ||
                          img.name.toLowerCase().includes("cpanel")
                        )
                          setShowCpanelModal(true);
                        setOsImage(img.id);
                      }}
                    >
                      <div
                        className={`h-8 w-8 rounded-full ${embedded ? "bg-muted/40" : "bg-white/5"} flex items-center justify-center overflow-hidden`}
                      >
                        {img.icon ? (
                          <img
                            alt=""
                            className="h-5 w-5 object-contain"
                            src={img.icon}
                          />
                        ) : (
                          <Server
                            className={`${embedded ? "text-muted-foreground" : "text-slate-500"}`}
                            size={16}
                          />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p
                          className={`font-bold text-[15px] ${embedded ? "text-foreground" : "text-white"}`}
                        >
                          {img.name}
                        </p>
                        <p
                          className={`text-[14px] ${embedded ? "text-muted-foreground" : "text-slate-400"} font-medium uppercase tracking-wide`}
                        >
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
            )}
          </AnimatePresence>
        </section>

        <Separator className={`${embedded ? "bg-border" : "bg-white/10"}`} />

        {/* Data Protection Section */}
        {planId !== "50" && (
          <>
            <section
              className={`${embedded ? "bg-muted/40" : "bg-white/5"} rounded-xl border shadow-2xl backdrop-blur-md ${embedded ? "border-border" : "border-white/10"} mb-8 overflow-hidden`}
            >
              <div className="p-8">
                <div className="mb-8 flex items-center gap-2">
                  <h2
                    className={`font-black text-4xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                  >
                    Proteção de Dados com Backup Automático
                  </h2>
                </div>
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                  <div className="flex flex-col items-center gap-4 md:flex-row lg:col-span-5">
                    <div className="relative h-64 w-64 flex-shrink-0">
                      <Image
                        alt="Proteção de Backup"
                        className="object-contain"
                        height={256}
                        src="/4870961_54433-nobg.svg"
                        width={256}
                      />
                    </div>
                    <div className="flex-1">
                      <ul className="space-y-4">
                        {[
                          "Backups automáticos diários.",
                          "Recuperação instantânea.",
                          "Mantém as últimas 10 versões.",
                          "Nenhuma configuração necessária.",
                        ].map((benefit, i) => (
                          <li
                            className={`flex items-center gap-3 ${embedded ? "text-muted-foreground" : "text-slate-200"}`}
                            key={i}
                          >
                            <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(0,163,255,0.5)]" />
                            <span className="font-bold text-base uppercase leading-snug tracking-tight">
                              {benefit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-7">
                    <button
                      className={cn(
                        `relative flex min-h-[160px] flex-col items-center justify-center rounded-xl border-2 p-6 text-center transition-all ${embedded ? "bg-muted/40" : "bg-white/5"} backdrop-blur-md`,
                        autoBackup
                          ? "border-sky-500 shadow-lg shadow-sky-500/20"
                          : `${embedded ? "border-border" : "border-white/10"} hover:border-white/20`
                      )}
                      onClick={() => setAutoBackup(true)}
                    >
                      <div
                        className={`absolute -top-3 left-1/2 -translate-x-1/2 ${embedded ? "bg-card" : "bg-[#000B12]"} rounded-full border border-sky-500/30 px-2 py-0.5 md:px-4 md:py-1`}
                      >
                        <span className="whitespace-nowrap font-black text-[10px] text-sky-400 uppercase tracking-widest md:text-[14px]">
                          Recomendado
                        </span>
                      </div>
                      <h3
                        className={`font-black text-2xl ${embedded ? "text-foreground" : "text-white"} mb-1 uppercase tracking-tight`}
                      >
                        Backup Automático
                      </h3>
                      <div
                        className={`font-black text-3xl ${embedded ? "text-foreground" : "text-white"} mb-2`}
                      >
                        {formatBRLPerMonth(plan.backupEur)}
                      </div>
                    </button>
                    <button
                      className={cn(
                        `flex min-h-[160px] items-center justify-center rounded-xl border-2 p-6 text-center transition-all ${embedded ? "bg-muted/40" : "bg-white/5"} backdrop-blur-md`,
                        !autoBackup
                          ? "border-sky-500 shadow-lg"
                          : `${embedded ? "border-border" : "border-white/10"} hover:border-white/20`
                      )}
                      onClick={() => setAutoBackup(false)}
                    >
                      <h3
                        className={`font-bold text-2xl ${embedded ? "text-muted-foreground" : "text-slate-500"} uppercase tracking-tight`}
                      >
                        Sem Proteção
                      </h3>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <Separator
              className={`${embedded ? "bg-border" : "bg-white/10"}`}
            />
          </>
        )}

        {/* Additional Features Section */}
        <section
          className={`${embedded ? "bg-muted/40" : "bg-white/5"} rounded-xl border shadow-2xl backdrop-blur-md ${embedded ? "border-border" : "border-white/10"} mb-8 overflow-hidden`}
        >
          <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
              <h2
                className={`font-black text-2xl md:text-4xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
              >
                Recursos Adicionais
              </h2>
              <button
                className={`flex items-center gap-1 font-black text-[15px] ${embedded ? "text-foreground" : "text-white"} uppercase tracking-wider`}
                onClick={() =>
                  setShowAdditionalFeatures(!showAdditionalFeatures)
                }
              >
                {showAdditionalFeatures ? (
                  <>
                    Fechar <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    Ver mais <ChevronDown size={14} />
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
                  <div className="space-y-8">
                    <h3
                      className={`font-black text-lg ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
                    >
                      Rede
                    </h3>
                    <div className="space-y-6 pr-1 pl-4">
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="md:col-span-3">
                          <span
                            className={`font-black text-lg ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
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
                              className={`h-12 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}
                            >
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                Sem Rede Privada
                              </SelectItem>
                              <SelectItem value="enabled">
                                <div className="flex w-[300px] items-center justify-between">
                                  <span>Rede Privada Ativada</span>
                                  <span
                                    className={cn(
                                      "font-bold",
                                      planId === "20" ||
                                        planId === "30" ||
                                        planId === "40" ||
                                        planId === "50"
                                        ? "text-slate-900"
                                        : "text-emerald-500"
                                    )}
                                  >
                                    {planId === "20" ||
                                    planId === "30" ||
                                    planId === "40" ||
                                    planId === "50"
                                      ? formatBRLPerMonth(
                                          plan.privateNetworkEur
                                        )
                                      : "Grátis"}
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="md:col-span-3">
                          <span
                            className={`font-black text-lg ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
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
                              className={`h-12 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"}`}
                            >
                              <SelectItem value="1ip">
                                <div className="flex w-[300px] items-center justify-between">
                                  <span>1 Endereço IP</span>
                                  <span className="text-emerald-500">
                                    Grátis
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value="2ip">
                                <div className="flex w-[300px] items-center justify-between">
                                  <span>+1 IP Adicional</span>
                                  <span
                                    className={`font-black ${embedded ? "text-foreground" : "text-white"}`}
                                  >
                                    {formatBRLPerMonth(plan.additionalIpEur)}
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator
                    className={`${embedded ? "bg-border" : "bg-white/10"}`}
                  />
                  <div className="hidden space-y-8">
                    <h3
                      className={`font-black text-lg ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
                    >
                      Add-Ons
                    </h3>
                    <div className="space-y-6 pr-1 pl-4">
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="md:col-span-3">
                          <span
                            className={`font-black text-lg ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
                          >
                            Armazenamento de Objetos
                          </span>
                        </div>
                        <div className="md:col-span-9">
                          <Select
                            onValueChange={setObjectStorage}
                            value={objectStorage}
                          >
                            <SelectTrigger
                              className={`h-12 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"} text-left`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              <SelectItem value="250gb">
                                <div className="flex w-[400px] justify-between">
                                  <span>250 GB nos EUA</span>
                                  <span className="font-bold">
                                    {formatBRLPerMonth(
                                      plan.objectStoragePrices["250gb"]
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value="500gb">
                                <div className="flex w-[400px] justify-between">
                                  <span>500 GB nos EUA</span>
                                  <span className="font-bold">
                                    {formatBRLPerMonth(
                                      plan.objectStoragePrices["500gb"]
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value="750gb">
                                <div className="flex w-[400px] justify-between">
                                  <span>750 GB nos EUA</span>
                                  <span className="font-bold">
                                    {formatBRLPerMonth(
                                      plan.objectStoragePrices["750gb"]
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value="1000gb">
                                <div className="flex w-[400px] justify-between">
                                  <span>1 TB nos EUA</span>
                                  <span className="font-bold">
                                    {formatBRLPerMonth(
                                      plan.objectStoragePrices["1tb"]
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="flex items-center gap-2 md:col-span-3">
                          <span
                            className={`font-black text-lg ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
                          >
                            Gerenciamento de Servidor
                          </span>
                        </div>
                        <div className="md:col-span-9">
                          <Select
                            onValueChange={setServerManagement}
                            value={serverManagement}
                          >
                            <SelectTrigger
                              className={`h-12 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"}`}
                            >
                              <SelectItem value="unmanaged">
                                Não Gerenciado (Grátis)
                              </SelectItem>
                              <SelectItem value="managed">
                                <div className="flex w-[350px] justify-between">
                                  <span>Gerenciado</span>
                                  <span
                                    className={`font-bold ${embedded ? "text-foreground" : "text-white"}`}
                                  >
                                    {formatBRLPerMonth(plan.managedEur)}
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="flex items-center gap-2 md:col-span-3">
                          <span
                            className={`font-black text-lg ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
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
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"}`}
                            >
                              <SelectItem value="none">Nenhum</SelectItem>
                              <SelectItem value="full">
                                <div className="flex w-[350px] justify-between">
                                  <span>Completo</span>
                                  <span
                                    className={`font-bold ${embedded ? "text-foreground" : "text-white"}`}
                                  >
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

        <Separator className={`${embedded ? "bg-border" : "bg-white/10"}`} />
        <section
          className={`${embedded ? "bg-muted/40" : "bg-white/5"} rounded-2xl border p-8 backdrop-blur-md ${embedded ? "border-border" : "border-white/10"} shadow-2xl`}
        >
          <h2
            className={`font-black text-lg md:text-2xl ${embedded ? "text-foreground" : "text-white"} mb-8 uppercase tracking-tight`}
          >
            Login e senha para o seu servidor
          </h2>
          <div className="max-w-3xl space-y-8">
            {/* Username */}
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
              <div className="md:col-span-3">
                <span
                  className={`font-bold text-lg ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-wider`}
                >
                  Usuário
                </span>
              </div>
              <div className="md:col-span-9">
                <span
                  className={`${embedded ? "text-foreground" : "text-white"} font-black text-lg`}
                >
                  root
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="pt-3 md:col-span-3">
                <span
                  className={`font-bold text-lg ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
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
                      for (let i = 0; i < 9; i++) {
                        pass += all[Math.floor(Math.random() * all.length)];
                      }

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
                      `h-12 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"} pr-12 focus:border-sky-500`,
                      passwordTouched &&
                        password.length > 0 &&
                        !isPasswordValid(password) &&
                        "border-rose-500 focus:border-rose-500"
                    )}
                    onBlur={() => setPasswordTouched(true)}
                    onChange={e => {
                      setPassword(e.target.value);
                      setPasswordTouched(true);
                    }}
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />
                  <button
                    className={`absolute top-1/2 right-4 -translate-y-1/2 ${embedded ? "text-muted-foreground" : "text-slate-400"} hover:text-slate-600`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordTouched &&
                  password.length > 0 &&
                  !isPasswordValid(password) && (
                    <div className="mt-1 flex items-center gap-2 font-bold text-red-500 text-sm">
                      <AlertCircle size={14} />
                      <span>
                        Por favor, insira uma senha válida (Mín. 8 caracteres,
                        maiúscula, número e símbolo)
                      </span>
                    </div>
                  )}
                {isPasswordValid(password) && (
                  <div className="mt-1 flex items-center gap-2 font-bold text-emerald-500 text-sm">
                    <Check size={14} />
                    <span>Senha válida e segura</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info List */}
            <div className="pt-4 md:ml-[25%]">
              <ul
                className={`list-disc space-y-2 ${embedded ? "text-muted-foreground" : "text-slate-400"} ml-4 font-medium text-[15px] leading-relaxed`}
              >
                <li>
                  Você pode adicionar chaves SSH mais tarde no Painel de
                  Controle.
                </li>
                <li>Sua senha não será enviada por e-mail.</li>
                <li>
                  Mantenha-a segura para acesso ao servidor. Se perdê-la, será
                  necessária uma reinstalação.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Bottom Summary Bar - UI IDENTICAL TO VPS */}
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
                  Detalhamento
                </h3>
                <div className="grid grid-cols-1 gap-x-12 gap-y-2 md:grid-cols-2">
                  {(() => {
                    const selectedDur =
                      durations.find((d: any) => d.id === duration) ||
                      durations[0];
                    const durMonths = Number.parseInt(duration, 10);
                    const qty = Number.parseInt(quantity, 10) || 1;
                    const items = [];

                    const baseEur = selectedDur.eur;
                    items.push({
                      label: `${plan.name} (${durMonths}m)`,
                      price: baseEur * durMonths * qty * currentRate,
                    });

                    if (selectedDur.setupEur > 0) {
                      items.push({
                        label: "Taxa de Configuração",
                        price: selectedDur.setupEur * qty * currentRate,
                      });
                    }

                    const loc = (
                      Object.values(planLocations).flat() as any[]
                    ).find((l: any) => l.id === location);
                    if (loc?.eur)
                      items.push({
                        label: `Localização: ${loc.name}`,
                        price: loc.eur * durMonths * qty * currentRate,
                      });

                    if (autoBackup)
                      items.push({
                        label: "Backup Automático",
                        price: plan.backupEur * durMonths * qty * currentRate,
                      });

                    if (privateNetwork === "enabled") {
                      const pnEur =
                        planId === "20" ||
                        planId === "30" ||
                        planId === "40" ||
                        planId === "50"
                          ? plan.privateNetworkEur
                          : 0;
                      if (pnEur > 0)
                        items.push({
                          label: "Rede Privada",
                          price: pnEur * durMonths * qty * currentRate,
                        });
                    }

                    if (ipv4Address === "2ip")
                      items.push({
                        label: "IP Adicional",
                        price:
                          plan.additionalIpEur * durMonths * qty * currentRate,
                      });

                    if (objectStorage !== "none") {
                      const osKey =
                        objectStorage === "1000gb" ? "1tb" : objectStorage;
                      const osEur =
                        plan.objectStoragePrices[
                          osKey as keyof typeof plan.objectStoragePrices
                        ] || 0;
                      items.push({
                        label: `Armazenamento de Objetos (${objectStorage.toUpperCase()})`,
                        price: osEur * durMonths * qty * currentRate,
                      });
                    }

                    if (serverManagement === "managed")
                      items.push({
                        label: "Gerenciado",
                        price: plan.managedEur * durMonths * qty * currentRate,
                      });

                    if (monitoring === "full")
                      items.push({
                        label: "Monitoramento",
                        price:
                          plan.monitoringEur * durMonths * qty * currentRate,
                      });

                    // Image/OS Pricing
                    if (osImage === "windows") {
                      const eur =
                        windowsVersion === "2016"
                          ? currentImagePrices.win2016
                          : currentImagePrices.windows;
                      items.push({
                        label: `Windows Server ${windowsVersion}`,
                        price: eur * durMonths * qty * currentRate,
                      });
                    } else if (osImage === "cpanel") {
                      const cpanelPricesMap: Record<string, number> = {
                        "5": 43.5,
                        "30": 58.0,
                        "50": 77.0,
                        "100": 94.0,
                        "150": 117.0,
                        "200": 157.0,
                        "250": 197.0,
                        "300": 237.0,
                      };
                      let licPrice = cpanelPricesMap[cpanelLicence];
                      if (!licPrice) {
                        const accounts = Number.parseInt(cpanelLicence, 10);
                        licPrice =
                          237.0 + Math.floor((accounts - 300) / 50) * 40.0;
                      }
                      items.push({
                        label: `Licença cPanel (${cpanelLicence} contas)`,
                        price: licPrice * durMonths * qty * currentRate,
                      });
                    } else if (
                      osImage === "plesk" ||
                      osImage === "plesk-linux"
                    ) {
                      const licEur =
                        pleskLicence === "admin"
                          ? currentImagePrices.pleskLinux
                          : pleskLicence === "host"
                            ? currentImagePrices.pleskHost
                            : currentImagePrices.pleskPro;
                      items.push({
                        label: `Licença Plesk (${pleskLicence})`,
                        price: licEur * durMonths * qty * currentRate,
                      });
                    } else if (osImage === "plesk-win") {
                      const licEur =
                        pleskWinLicence === "admin"
                          ? currentImagePrices.pleskLinux
                          : pleskWinLicence === "host"
                            ? currentImagePrices.pleskHost
                            : currentImagePrices.pleskPro;
                      const verEur =
                        pleskWinVersion === "2016"
                          ? currentImagePrices.win2016
                          : currentImagePrices.windows;
                      items.push({
                        label: `Plesk + Windows (${pleskWinLicence})`,
                        price:
                          (licEur + verEur) * durMonths * qty * currentRate,
                      });
                    }

                    return items.map((item, idx) => (
                      <div
                        className="flex items-center justify-between border-white/5 border-b pb-1 text-base"
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
                    ));
                  })()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mx-auto flex h-auto max-w-7xl items-center justify-between px-2 py-2 md:h-24 md:px-10 md:py-0">
          <div className="flex items-center gap-6">
            <div
              className={`h-14 w-14 ${embedded ? "bg-muted/40" : "bg-white/5"} flex items-center justify-center rounded-full border shadow-lg ${embedded ? "border-border" : "border-white/10"}`}
            >
              <ShieldCheck className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`font-black ${embedded ? "text-foreground" : "text-white"} text-sm uppercase tracking-widest md:text-lg`}
                >
                  Resumo
                </h3>
                <button
                  className={`p-1 ${embedded ? "hover:bg-accent" : "hover:bg-white/10"} rounded-full transition-colors`}
                  onClick={() => setShowSummaryDetails(!showSummaryDetails)}
                >
                  {showSummaryDetails ? (
                    <ChevronDown className="h-5 w-5 text-sky-400 shadow-sky-400/20" />
                  ) : (
                    <ChevronUp className="h-5 w-5 text-sky-400 shadow-sky-400/20" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-8 lg:gap-16">
            {(() => {
              const selectedDur =
                durations.find((d: any) => d.id === duration) || durations[0];
              const durMonths = Number.parseInt(duration, 10);
              const qty = Number.parseInt(quantity, 10) || 1;
              const RATE = currentRate;

              // Base Price Logic
              const basePriceMonthlyEur = selectedDur.eur;
              const setupFeeEur = selectedDur.setupEur || 0;

              let additionalEur = 0;
              const loc = Object.values(planLocations)
                .flat()
                .find((l: any) => l.id === location) as any;

              if (loc?.eur) {
                additionalEur += loc.eur || 0;
              }

              if (autoBackup) {
                additionalEur += plan.backupEur || 1.5;
              }

              if (privateNetwork === "enabled") {
                additionalEur += plan.privateNetworkEur || 2.29;
              }

              if (ipv4Address === "2ip") {
                additionalEur += plan.additionalIpEur || 3.5;
              }

              if (objectStorage !== "none") {
                const osKey =
                  objectStorage === "1000gb" ? "1tb" : objectStorage;
                const prices = plan.objectStoragePrices || {
                  "1tb": 9.96,
                  "250gb": 2.49,
                  "500gb": 4.98,
                  "750gb": 7.47,
                };
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
                additionalEur +=
                  windowsVersion === "2016"
                    ? currentImagePrices.win2016
                    : currentImagePrices.windows;
              } else if (osImage === "cpanel") {
                const cpanelPricesMap: Record<string, number> = {
                  "5": 43.5,
                  "30": 58.0,
                  "50": 77.0,
                  "100": 94.0,
                  "150": 117.0,
                  "200": 157.0,
                  "250": 197.0,
                  "300": 237.0,
                };
                let eur = cpanelPricesMap[cpanelLicence];
                if (!eur) {
                  const accounts = Number.parseInt(cpanelLicence, 10);
                  eur = 237.0 + Math.floor((accounts - 300) / 50) * 40.0;
                }
                additionalEur += eur;
              } else if (osImage === "plesk" || osImage === "plesk-linux") {
                const licEur =
                  pleskLicence === "admin"
                    ? currentImagePrices.pleskLinux
                    : pleskLicence === "host"
                      ? currentImagePrices.pleskHost
                      : currentImagePrices.pleskPro;
                additionalEur += licEur;
              } else if (osImage === "plesk-win") {
                const licEur =
                  pleskWinLicence === "admin"
                    ? currentImagePrices.pleskWin
                    : pleskWinLicence === "host"
                      ? currentImagePrices.pleskHost
                      : currentImagePrices.pleskPro;
                const verEur =
                  pleskWinVersion === "2016"
                    ? currentImagePrices.win2016
                    : currentImagePrices.windows;
                additionalEur += licEur + verEur;
              }

              const totalMonthly = (basePriceMonthlyEur + additionalEur) * RATE;
              const dueToday =
                totalMonthly * durMonths * qty + setupFeeEur * RATE * qty;

              return (
                <div className="flex items-center gap-4 md:gap-6 lg:gap-10">
                  <div className="flex min-w-0 flex-col gap-0.5 md:min-w-[200px] md:gap-1">
                    <div className="hidden items-center justify-between text-[13px] uppercase tracking-widest md:flex">
                      <span
                        className={`${embedded ? "text-muted-foreground" : "text-slate-400"} font-bold`}
                      >
                        Mensal
                      </span>
                      <span
                        className={`font-black ${embedded ? "text-foreground" : "text-white"} whitespace-nowrap`}
                      >
                        {formatBRL((totalMonthly * qty) / RATE)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between md:mt-1">
                      <span
                        className={`font-black ${embedded ? "text-foreground" : "text-white"} text-[10px] uppercase tracking-tighter md:text-[15px]`}
                      >
                        Vencido Hoje
                      </span>
                      <span
                        className={`font-black text-sm md:text-2xl ${embedded ? "text-foreground" : "text-white"} whitespace-nowrap drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`}
                      >
                        {formatBRL(dueToday / RATE)}
                      </span>
                    </div>
                  </div>
                  <Button
                    className={cn(
                      "h-9 rounded-lg px-3 font-black text-sm uppercase tracking-widest shadow-xl transition-all md:h-14 md:px-12 md:text-xl",
                      isPasswordValid(password)
                        ? "bg-sky-500 text-white shadow-sky-500/20 hover:bg-sky-400"
                        : `${embedded ? "bg-muted text-muted-foreground" : "bg-white/10 text-slate-500"} cursor-not-allowed`
                    )}
                    disabled={!isPasswordValid(password)}
                    onClick={() =>
                      router.push(
                        `/checkout/personal-data?planId=${planId}&qty=${quantity}&duration=${duration}&location=${location}&image=${osImage}&management=${serverManagement}&password=${encodeURIComponent(password)}&type=storage-vps`
                      )
                    }
                  >
                    Próximo
                  </Button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Modals same as VPS */}
      <AnimatePresence>
        {showUbuntuModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowUbuntuModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-8 rounded-2xl border p-10 shadow-2xl ${embedded ? "border-border" : "border-white/10"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img alt="Ubuntu" className="h-10 w-10" src="/image.png" />
                <h2
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Ubuntu
                </h2>
              </div>
              <div className="space-y-4">
                <label
                  className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                >
                  Versão
                </label>
                <Select onValueChange={setUbuntuVersion} value={ubuntuVersion}>
                  <SelectTrigger
                    className={`h-14 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"}`}
                  >
                    <SelectItem value="Ubuntu 24.04">
                      Ubuntu 24.04 LTS
                    </SelectItem>
                    <SelectItem value="Ubuntu 22.04">
                      Ubuntu 22.04 LTS
                    </SelectItem>
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

        {showWindowsModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowWindowsModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-8 rounded-2xl border p-10 shadow-2xl ${embedded ? "border-border" : "border-white/10"}`}
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
                  Selecione a Versão
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      id: "2025",
                      name: "Windows Server 2025",
                      price: formatBRLPerMonth(currentImagePrices.windows),
                    },
                    {
                      id: "2022",
                      name: "Windows Server 2022",
                      price: formatBRLPerMonth(currentImagePrices.windows),
                    },
                    {
                      id: "2019",
                      name: "Windows Server 2019",
                      price: formatBRLPerMonth(currentImagePrices.windows),
                    },
                    {
                      id: "2016",
                      name: "Windows Server 2016",
                      price: formatBRLPerMonth(currentImagePrices.win2016),
                    },
                  ].map(v => (
                    <button
                      className={cn(
                        `flex items-center justify-between rounded-xl border p-4 transition-all ${embedded ? "bg-muted/40" : "bg-white/5"} backdrop-blur-md`,
                        windowsVersion === v.id
                          ? `border-sky-500 ${embedded ? "bg-accent" : "bg-white/10"} shadow-lg shadow-sky-500/20`
                          : `${embedded ? "border-border" : "border-white/10"}`
                      )}
                      key={v.id}
                      onClick={() => setWindowsVersion(v.id)}
                    >
                      <span
                        className={`font-black ${embedded ? "text-foreground" : "text-white"}`}
                      >
                        {v.name}
                      </span>
                      <span className="font-black text-sky-400 text-sm">
                        {v.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground hover:text-foreground" : "text-slate-400 hover:text-white"} uppercase tracking-widest`}
                  onClick={() => setShowWindowsModal(false)}
                  variant="ghost"
                >
                  Pular
                </Button>
                <Button
                  className="bg-sky-500 px-8 font-black text-white uppercase tracking-widest hover:bg-sky-400"
                  onClick={() => setShowWindowsModal(false)}
                >
                  Configurar
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {showPleskWindowsModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowPleskWindowsModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-8 rounded-2xl border p-10 shadow-2xl ${embedded ? "border-border" : "border-white/10"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img
                  alt="Plesk"
                  className="h-8 w-8 object-contain"
                  src="/plesk.png"
                />
                <h2
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Plesk + Windows
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label
                    className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                  >
                    Licença
                  </label>
                  <Select
                    onValueChange={setPleskWinLicence}
                    value={pleskWinLicence}
                  >
                    <SelectTrigger
                      className={`h-16 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}
                    >
                      <SelectValue>
                        <div className="flex w-full items-center justify-between pr-4 text-[13px] leading-tight">
                          <div className="flex flex-col text-left">
                            <span
                              className={`font-bold ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              {pleskWinLicence === "admin"
                                ? "Plesk Obsidian Web Admin Edition"
                                : pleskWinLicence === "host"
                                  ? "Plesk Obsidian Web Host Edition"
                                  : "Plesk Obsidian Web Pro Edition"}
                            </span>
                            <span className="font-black text-[11px] text-emerald-400 uppercase tracking-widest">
                              1 mês grátis
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-black text-sky-400">
                            <span>
                              {pleskWinLicence === "admin"
                                ? currentImagePrices.pleskWin
                                : pleskWinLicence === "host"
                                  ? currentImagePrices.pleskHost
                                  : currentImagePrices.pleskPro}
                            </span>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[130]`}
                    >
                      <SelectItem value="admin">
                        <div className="flex w-[480px] items-center justify-between py-1">
                          <div className="flex flex-col">
                            <span className="font-black text-sky-400 uppercase tracking-tighter">
                              Plesk Obsidian Web Admin Edition
                            </span>
                            <span className="font-black text-emerald-400 text-xs uppercase">
                              1 mês grátis
                            </span>
                          </div>
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"}`}
                          >
                            {currentImagePrices.pleskWin.replace(" /mês", "")}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="host">
                        <div className="flex w-[480px] items-center justify-between py-1">
                          <div className="flex flex-col">
                            <span
                              className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                            >
                              Plesk Obsidian Web Host Edition
                            </span>
                            <span className="font-black text-emerald-400 text-xs uppercase">
                              1 mês grátis
                            </span>
                          </div>
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"}`}
                          >
                            {currentImagePrices.pleskHost.replace(" /mês", "")}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pro">
                        <div className="flex w-[480px] items-center justify-between py-1">
                          <div className="flex flex-col">
                            <span
                              className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                            >
                              Plesk Obsidian Web Pro Edition
                            </span>
                            <span className="font-black text-emerald-400 text-xs uppercase">
                              1 mês grátis
                            </span>
                          </div>
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"}`}
                          >
                            {currentImagePrices.pleskPro.replace(" /mês", "")}
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label
                    className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                  >
                    Versão
                  </label>
                  <Select
                    onValueChange={setPleskWinVersion}
                    value={pleskWinVersion}
                  >
                    <SelectTrigger
                      className={`h-16 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}
                    >
                      <SelectValue>
                        <div className="flex w-full items-center justify-between pr-4 text-[13px]">
                          <span
                            className={`font-bold ${embedded ? "text-foreground" : "text-white"}`}
                          >
                            Windows Server {pleskWinVersion} Datacenter
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[130]`}
                    >
                      <SelectItem value="2016">
                        <div className="flex w-[480px] items-center justify-between py-1">
                          <span className="font-black text-sky-400 uppercase tracking-tighter">
                            Windows Server 2016 Datacenter
                          </span>
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"}`}
                          >
                            {formatBRL(currentImagePrices.win2016)}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="2019">
                        <div className="flex w-[480px] items-center justify-between py-1">
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                          >
                            Windows Server 2019 Datacenter
                          </span>
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"}`}
                          >
                            {formatBRL(currentImagePrices.windows)}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="2022">
                        <div className="flex w-[480px] items-center justify-between py-1">
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                          >
                            Windows Server 2022 Datacenter
                          </span>
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"}`}
                          >
                            {formatBRL(currentImagePrices.windows)}
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-4">
                <Button
                  className={`${embedded ? "text-muted-foreground hover:text-foreground" : "text-slate-400 hover:text-white"} font-black uppercase tracking-widest`}
                  onClick={() => setShowPleskWindowsModal(false)}
                  variant="ghost"
                >
                  CANCELAR
                </Button>
                <Button
                  className="bg-sky-500 px-8 font-black text-white uppercase tracking-widest hover:bg-sky-400"
                  onClick={() => setShowPleskWindowsModal(false)}
                >
                  CONFIGURAR
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {showPleskModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowPleskModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-8 rounded-2xl border p-10 shadow-2xl ${embedded ? "border-border" : "border-white/10"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img
                  alt="Plesk"
                  className="h-8 w-8 object-contain"
                  src="/plesk.png"
                />
                <h2
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Plesk + Linux
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label
                    className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                  >
                    Licença
                  </label>
                  <Select onValueChange={setPleskLicence} value={pleskLicence}>
                    <SelectTrigger
                      className={`h-16 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}
                    >
                      <SelectValue>
                        <div className="flex w-full items-center justify-between pr-4 text-[13px] leading-tight">
                          <div className="flex flex-col text-left">
                            <span
                              className={`font-bold ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              {pleskLicence === "admin"
                                ? "Plesk Obsidian Web Admin Edition"
                                : pleskLicence === "host"
                                  ? "Plesk Obsidian Web Host Edition"
                                  : "Plesk Obsidian Web Pro Edition"}
                            </span>
                            <span className="font-black text-[11px] text-emerald-400 uppercase tracking-widest">
                              1 mês grátis
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-black text-sky-400">
                            <span>
                              {pleskLicence === "admin"
                                ? currentImagePrices.pleskLinux
                                : pleskLicence === "host"
                                  ? currentImagePrices.pleskHost
                                  : currentImagePrices.pleskPro}
                            </span>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[130]`}
                    >
                      <SelectItem value="admin">
                        <div className="flex w-[480px] items-center justify-between py-1">
                          <div className="flex flex-col">
                            <span className="font-black text-sky-400 uppercase tracking-tighter">
                              Plesk Obsidian Web Admin Edition
                            </span>
                            <span className="font-black text-emerald-400 text-xs uppercase">
                              1 mês grátis
                            </span>
                          </div>
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"}`}
                          >
                            {formatBRL(currentImagePrices.pleskLinux)}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="host">
                        <div className="flex w-[480px] items-center justify-between py-1">
                          <div className="flex flex-col">
                            <span
                              className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                            >
                              Plesk Obsidian Web Host Edition
                            </span>
                            <span className="font-black text-emerald-400 text-xs uppercase">
                              1 mês grátis
                            </span>
                          </div>
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"}`}
                          >
                            {formatBRL(currentImagePrices.pleskHost)}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pro">
                        <div className="flex w-[480px] items-center justify-between py-1">
                          <div className="flex flex-col">
                            <span
                              className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                            >
                              Plesk Obsidian Web Pro Edition
                            </span>
                            <span className="font-black text-emerald-400 text-xs uppercase">
                              1 mês grátis
                            </span>
                          </div>
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"}`}
                          >
                            {formatBRL(currentImagePrices.pleskPro)}
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-12 pt-4">
                <button
                  className={`${embedded ? "text-muted-foreground hover:text-foreground" : "text-slate-400 hover:text-white"} font-black text-sm uppercase tracking-widest`}
                  onClick={() => setShowPleskModal(false)}
                >
                  Pular
                </button>
                <Button
                  className="h-14 rounded-lg bg-sky-500 px-12 font-black text-lg text-white uppercase tracking-widest hover:bg-sky-400"
                  onClick={() => setShowPleskModal(false)}
                >
                  Começar
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {showCpanelModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowCpanelModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-8 rounded-2xl border p-10 shadow-2xl ${embedded ? "border-border" : "border-white/10"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img
                  alt="cPanel"
                  className="h-10 w-10 object-contain"
                  src="/cpanel.png"
                />
                <h2
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  cPanel/WHM
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label
                    className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                  >
                    Licença (Número de Contas)
                  </label>
                  <Select
                    onValueChange={setCpanelLicence}
                    value={cpanelLicence}
                  >
                    <SelectTrigger
                      className={`h-16 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[130] max-h-[300px]`}
                    >
                      {[
                        {
                          id: "5",
                          name: "cPanel Admin (até 5 contas)",
                          price: 43.5,
                        },
                        {
                          id: "30",
                          name: "cPanel Pro (até 30 contas)",
                          price: 58.0,
                        },
                        {
                          id: "50",
                          name: "cPanel Plus (até 50 contas)",
                          price: 77.0,
                        },
                        {
                          id: "100",
                          name: "cPanel Premier (até 100 contas)",
                          price: 94.0,
                        },
                        {
                          id: "150",
                          name: "cPanel Premier (até 150 contas)",
                          price: 117.0,
                        },
                        {
                          id: "200",
                          name: "cPanel Premier (até 200 contas)",
                          price: 157.0,
                        },
                        {
                          id: "250",
                          name: "cPanel Premier (até 250 contas)",
                          price: 197.0,
                        },
                        {
                          id: "300",
                          name: "cPanel Premier (até 300 contas)",
                          price: 237.0,
                        },
                        {
                          id: "350",
                          name: "cPanel Premier (até 350 contas)",
                          price: 277.0,
                        },
                        {
                          id: "400",
                          name: "cPanel Premier (até 400 contas)",
                          price: 317.0,
                        },
                        {
                          id: "450",
                          name: "cPanel Premier (até 450 contas)",
                          price: 357.0,
                        },
                        {
                          id: "500",
                          name: "cPanel Premier (até 500 contas)",
                          price: 397.0,
                        },
                        {
                          id: "550",
                          name: "cPanel Premier (até 550 contas)",
                          price: 437.0,
                        },
                        {
                          id: "600",
                          name: "cPanel Premier (até 600 contas)",
                          price: 477.0,
                        },
                        {
                          id: "650",
                          name: "cPanel Premier (até 650 contas)",
                          price: 517.0,
                        },
                        {
                          id: "700",
                          name: "cPanel Premier (até 700 contas)",
                          price: 557.0,
                        },
                        {
                          id: "750",
                          name: "cPanel Premier (até 750 contas)",
                          price: 597.0,
                        },
                        {
                          id: "800",
                          name: "cPanel Premier (até 800 contas)",
                          price: 637.0,
                        },
                        {
                          id: "850",
                          name: "cPanel Premier (até 850 contas)",
                          price: 677.0,
                        },
                        {
                          id: "900",
                          name: "cPanel Premier (até 900 contas)",
                          price: 717.0,
                        },
                        {
                          id: "950",
                          name: "cPanel Premier (até 950 contas)",
                          price: 757.0,
                        },
                        {
                          id: "1000",
                          name: "cPanel Premier (até 1000 contas)",
                          price: 797.0,
                        },
                      ].map(lic => (
                        <SelectItem key={lic.id} value={lic.id}>
                          <div className="flex w-[480px] items-center justify-between py-1">
                            <span
                              className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                            >
                              {lic.name}
                            </span>
                            <span className="font-black text-sky-400">
                              {formatBRL(lic.price)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label
                    className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                  >
                    Sistema Operacional
                  </label>
                  <Select
                    onValueChange={setCpanelVersion}
                    value={cpanelVersion}
                  >
                    <SelectTrigger
                      className={`h-16 ${embedded ? "border-border bg-muted/40 text-foreground" : "border-white/10 bg-white/5 text-white"}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[130]`}
                    >
                      <SelectItem value="Ubuntu 22.04">
                        Ubuntu 22.04 LTS
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-4">
                <Button
                  className={`${embedded ? "text-muted-foreground hover:text-foreground" : "text-slate-400 hover:text-white"} font-black uppercase tracking-widest`}
                  onClick={() => setShowCpanelModal(false)}
                  variant="ghost"
                >
                  CANCELAR
                </Button>
                <Button
                  className="bg-sky-500 px-8 font-black text-white uppercase tracking-widest hover:bg-sky-400"
                  onClick={() => setShowCpanelModal(false)}
                >
                  CONFIGURAR
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
