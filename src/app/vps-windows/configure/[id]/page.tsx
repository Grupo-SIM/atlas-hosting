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

// Euro source values for software licensing
const WINDOWS_LICENSE_EUR = {
  "10": { windows: 15.00, win2016: 15.00, cpanel: 43.50, pleskLinux: 24.00, pleskHost: 71.90, pleskPro: 37.40, pleskWin: 36.50 },
  "20": { windows: 31.00, win2016: 31.00, cpanel: 43.50, pleskLinux: 24.00, pleskHost: 71.90, pleskPro: 37.40, pleskWin: 36.50 },
  "30": { windows: 52.00, win2016: 52.00, cpanel: 43.50, pleskLinux: 24.00, pleskHost: 73.00, pleskPro: 38.00, pleskWin: 73.00 },
  "40": { windows: 98.00, win2016: 98.00, cpanel: 43.50, pleskLinux: 24.00, pleskHost: 71.90, pleskPro: 37.40, pleskWin: 112.80 },
  "50": { windows: 117.00, win2016: 117.00, cpanel: 43.50, pleskLinux: 24.00, pleskHost: 73.00, pleskPro: 38.00, pleskWin: 145.60 },
  "60": { windows: 140.00, win2016: 140.00, cpanel: 43.50, pleskLinux: 24.00, pleskHost: 73.00, pleskPro: 38.00, pleskWin: 170.20 }
};

const getPlanImagePrices = (planId: string, defaultPrices: any = {}) => {
  const prices = WINDOWS_LICENSE_EUR[planId as keyof typeof WINDOWS_LICENSE_EUR] || WINDOWS_LICENSE_EUR["10"];
  return { ...prices };
};

const plansData: Record<string, any> = {
  "10": {
    name: "Cloud VPS 10 (S) Windows",
    vcpu: "4 núcleos de vCPU",
    ram: "8 GB RAM",
    storage: "75 GB NVMe ou SSD 150 GB",
    snapshots: "1 Instantâneo",
    port: "200 Mbit/s",
    traffic: "32 TB de tráfego",
    durations: [
      { id: "1", label: "1 mês", eur: 9.00, setupEur: 9.00, discount: null },
      { id: "6", label: "6 meses", eur: 8.10, setupEur: 4.50, discount: "ECONOMIZE 10%", oldEur: 9.00 },
      { id: "12", label: "12 meses", eur: 7.20, setupEur: 0, discount: "ECONOMIZE 20%", oldEur: 9.00 },
    ],
    storageTypes: [
      { id: "ssd-150", name: "150 GB SSD", price: "Livre" },
      { id: "ssd-300", name: "300 GB SSD", eur: 3.10 },
      { id: "nvme-75", name: "75 GB NVMe", price: "Livre" },
      { id: "nvme-150", name: "150 GB NVMe", eur: 3.70 },
    ],
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "173 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "135 ms", eur: 1.90 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "173 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 2.80, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "349 ms", eur: 3.90 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", eur: 1.90 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 2.80, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 2.30 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "347 ms", eur: 4.30 },
        { id: "jp", name: "Ásia (Japão)", latency: "262 ms", eur: 4.70 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 4.30 },
      ],
    },
    backupEur: 3.00,
    objectStorageTiers: [
      { id: "250gb", name: "250 GB", eur: 2.49 },
      { id: "500gb", name: "500 GB", eur: 4.98 },
      { id: "750gb", name: "750 GB", eur: 7.47 },
      { id: "1tb", name: "1 TB", eur: 9.96 },
    ]
  },
  "20": {
    name: "Cloud VPS 20 (M) Windows",
    vcpu: "6 núcleos de vCPU",
    ram: "12 GB RAM",
    storage: "100 GB NVMe ou SSD 200 GB",
    snapshots: "2 Instantâneos",
    port: "300 Mbit/s",
    backupEur: 4.00,
    privateNetworkEur: 4.58,
    additionalIpEur: 7.00,
    durations: [
      { id: "1", label: "1 mês", eur: 14.00, setupEur: 0, discount: null },
      { id: "6", label: "6 meses", eur: 12.60, setupEur: 0, discount: "ECONOMIZE 10%", oldEur: 14.00 },
      { id: "12", label: "12 meses", eur: 11.20, setupEur: 0, discount: "ECONOMIZE 20%", oldEur: 14.00 },
    ],
    storageTypes: [
      { id: "ssd-200", name: "200 GB SSD", price: "Livre" },
      { id: "ssd-400", name: "400 GB SSD", eur: 3.90 },
      { id: "nvme-100", name: "100 GB NVMe", price: "Livre" },
      { id: "nvme-200", name: "200 GB NVMe", eur: 5.10 },
    ],
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "170 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "140 ms", eur: 2.90 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "170 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 2.90, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "350 ms", eur: 8.10 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "118 ms", eur: 2.90 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 2.90, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "148 ms", eur: 3.70 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "346 ms", eur: 8.90 },
        { id: "jp", name: "Ásia (Japão)", latency: "262 ms", eur: 8.90 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 8.90 },
      ]
    },
    objectStorageTiers: [
      { id: "250gb", name: "250 GB", eur: 4.98 },
      { id: "500gb", name: "500 GB", eur: 9.96 },
      { id: "750gb", name: "750 GB", eur: 14.94 },
      { id: "1tb", name: "1 TB", eur: 19.92 },
    ]
  },
  "30": {
    name: "Cloud VPS 30 (L) Windows",
    vcpu: "8 núcleos de vCPU",
    ram: "24 GB RAM",
    storage: "200 GB NVMe ou SSD 400 GB",
    snapshots: "3 Instantâneos",
    port: "600 Mbit/s",
    traffic: "32 TB de tráfego",
    durations: [
      { id: "1", label: "1 mês", eur: 28.00, setupEur: 28.00, discount: null },
      { id: "6", label: "6 meses", eur: 25.20, setupEur: 14.00, discount: "ECONOMIZE 10%", oldEur: 28.00 },
      { id: "12", label: "12 meses", eur: 22.40, setupEur: 0, discount: "ECONOMIZE 20%", oldEur: 28.00 },
    ],
    storageTypes: [
      { id: "ssd-400", name: "400 GB SSD", price: "Livre" },
      { id: "ssd-800", name: "800 GB SSD", eur: 7.70 },
      { id: "nvme-200", name: "200 GB NVMe", price: "Livre" },
      { id: "nvme-400", name: "400 GB NVMe", eur: 6.50 },
    ],
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "135 ms", eur: 5.90 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 5.90, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "349 ms", eur: 16.20 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", eur: 5.90 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 5.90, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 7.30 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "338 ms", eur: 17.80 },
        { id: "jp", name: "Ásia (Japão)", latency: "269 ms", eur: 17.80 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 17.80 },
      ]
    },
    backupEur: 7.00,
    objectStorageTiers: [
      { id: "250gb", name: "250 GB", eur: 4.98 },
      { id: "500gb", name: "500 GB", eur: 9.96 },
      { id: "2tb", name: "2 TB", eur: 36.50 },
      { id: "5tb", name: "5 TB", eur: 91.20 },
    ]
  },
  "40": {
    name: "Cloud VPS 40 (XL) Windows",
    vcpu: "12 núcleos de vCPU",
    ram: "48 GB RAM",
    storage: "250 GB NVMe ou SSD 500 GB",
    snapshots: "3 Instantâneos",
    port: "800 Mbit/s",
    traffic: "32 TB de tráfego",
    durations: [
      { id: "1", label: "1 mês", eur: 50.00, setupEur: 0, discount: null },
      { id: "6", label: "6 meses", eur: 45.00, setupEur: 0, discount: "ECONOMIZE 10%", oldEur: 50.00 },
      { id: "12", label: "12 meses", eur: 40.00, setupEur: 0, discount: "ECONOMIZE 20%", oldEur: 50.00 },
    ],
    storageTypes: [
      { id: "ssd-500", name: "500 GB SSD", price: "Livre" },
      { id: "ssd-1000", name: "1 TB SSD", eur: 9.90 },
      { id: "nvme-250", name: "250 GB NVMe", price: "Livre" },
      { id: "nvme-500", name: "500 GB NVMe", eur: 7.70 },
    ],
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "135 ms", eur: 10.50 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 10.50, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "349 ms", eur: 28.50 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", eur: 10.50 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 10.50, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 13.10 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "338 ms", eur: 31.30 },
        { id: "jp", name: "Ásia (Japão)", latency: "269 ms", eur: 31.30 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 31.30 },
      ]
    },
    backupEur: 12.00
  },
  "50": {
    name: "Cloud VPS 50 (XXL) Windows",
    vcpu: "16 núcleos de vCPU",
    ram: "64 GB RAM",
    storage: "300 GB NVMe ou SSD 600 GB",
    snapshots: "3 Instantâneos",
    port: "1 Gbit/s",
    traffic: "32 TB de tráfego",
    durations: [
      { id: "1", label: "1 mês", eur: 74.00, setupEur: 0, discount: null },
      { id: "6", label: "6 meses", eur: 66.60, setupEur: 0, discount: "ECONOMIZE 10%", oldEur: 74.00 },
      { id: "12", label: "12 meses", eur: 59.20, setupEur: 0, discount: "ECONOMIZE 20%", oldEur: 74.00 },
    ],
    storageTypes: [
      { id: "ssd-600", name: "600 GB SSD", price: "Livre" },
      { id: "ssd-1200", name: "1.2 TB SSD", eur: 12.30 },
      { id: "nvme-300", name: "300 GB NVMe", price: "Livre" },
      { id: "nvme-600", name: "600 GB NVMe", eur: 9.50 },
    ],
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "135 ms", eur: 15.60 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 27.10, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "349 ms", eur: 32.00 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", eur: 15.60 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 27.10, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 19.30 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "338 ms", eur: 38.00 },
        { id: "jp", name: "Ásia (Japão)", latency: "269 ms", eur: 39.00 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 36.00 },
      ]
    },
    backupEur: 15.20
  },
  "60": {
    name: "Cloud VPS 60 (XXXL) Windows",
    vcpu: "18 núcleos de vCPU",
    ram: "96 GB RAM",
    storage: "350 GB NVMe ou SSD 700 GB",
    snapshots: "3 Instantâneos",
    port: "1 Gbit/s",
    traffic: "32 TB de tráfego",
    durations: [
      { id: "1", label: "1 mês", eur: 98.00, setupEur: 0, discount: null },
      { id: "6", label: "6 meses", eur: 88.20, setupEur: 0, discount: "ECONOMIZE 10%", oldEur: 98.00 },
      { id: "12", label: "12 meses", eur: 78.40, setupEur: 0, discount: "ECONOMIZE 20%", oldEur: 98.00 },
    ],
    storageTypes: [
      { id: "ssd-700", name: "700 GB SSD", price: "Livre" },
      { id: "ssd-1400", name: "1.4 TB SSD", eur: 13.90 },
      { id: "nvme-350", name: "350 GB NVMe", price: "Livre" },
      { id: "nvme-700", name: "700 GB NVMe", eur: 11.50 },
    ],
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "135 ms", eur: 20.60 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 30.70, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "349 ms", eur: 42.30 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", eur: 20.60 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 30.70, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 25.60 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "338 ms", eur: 51.00 },
        { id: "jp", name: "Ásia (Japão)", latency: "269 ms", eur: 51.00 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 46.70 },
      ]
    },
    backupEur: 19.00
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

// (Function removed, logic moved up)

const getImages = (planId: string) => {
  const p = getPlanImagePrices(planId);
  return {
    popular: [
      { id: "windows", name: "Servidor Windows", eur: p.windows, price: "", icon: "/windows.png" },
      { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
      { id: "cpanel", name: "cPanel", eur: p.cpanel, price: "", icon: "/cpanel.png" },
      { id: "plesk-win", name: "Plesk + Windows", eur: p.pleskWin, price: "", icon: "/plesk.png" },
      { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
      { id: "debian", name: "Debian", price: "Incluído", icon: "/debian-svgrepo-com.svg" },
    ],
    os: [
      { id: "windows", name: "Servidor Windows", eur: p.windows, price: "", icon: "/windows.png" },
      { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
      { id: "debian", name: "Debian", price: "Incluído", icon: "/debian-svgrepo-com.svg" },
      { id: "almalinux", name: "AlmaLinux", price: "Incluído", icon: "/almalinux.png" },
      { id: "rockylinux", name: "Rocky Linux", price: "Incluído", icon: "/rocky.png" },
      { id: "centos", name: "CentOS", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
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
      { id: "cpanel", name: "cPanel", eur: p.cpanel, price: "", icon: "/cpanel.png" },
      { id: "plesk-win", name: "Plesk + Windows", eur: p.pleskWin, price: "", icon: "/plesk.png" },
      { id: "plesk-linux", name: "Plesk + Linux", eur: p.pleskLinux, price: "", icon: "/plesk.png" },
    ],
    blockchain: [
      { id: "ipfs", name: "IPFS Node", price: "Incluído", icon: "/ipfs.png" },
      { id: "flux", name: "Flux Node", price: "Incluído", icon: "/fluxnode.png" },
      { id: "horizen", name: "Horizen Node", price: "Incluído", icon: "/horizen.png" },
    ]
  };
};

export default function ConfigureWindowsVps() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = params.id as string;

  const [currentRate, setCurrentRate] = useState(FALLBACK_EUR_RATE);

  const plan = plansData[planId as keyof typeof plansData] || plansData["10"];
  const durations = plan.durations;
  const storageTypes = plan.storageTypes;
  const planLocations = (plan as any).locations || {};
  const currentImagePrices = getPlanImagePrices(planId);
  const dynamicImages = getImages(planId);

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
  const [osImage, setOsImage] = useState(sp.get("image") || "windows");
  const [autoBackup, setAutoBackup] = useState(sp.get("backup") !== "false");
  const [showMoreImages, setShowMoreImages] = useState(true);
  const [showUbuntuModal, setShowUbuntuModal] = useState(false);
  const [ubuntuVersion, setUbuntuVersion] = useState(sp.get("ubuntuVersion") || "Ubuntu 24.04");
  const [showWindowsModal, setShowWindowsModal] = useState(false);
  const [windowsVersion, setWindowsVersion] = useState(sp.get("windowsVersion") || "2025");
  const [showCpanelModal, setShowCpanelModal] = useState(false);
  const [cpanelLicence, setCpanelLicence] = useState(sp.get("cpanelLicence") || "5");
  const [cpanelVersion, setCpanelVersion] = useState(sp.get("cpanelVersion") || "Ubuntu 22.04");
  const [showPleskModal, setShowPleskModal] = useState(false);
  const [pleskLicence, setPleskLicence] = useState(sp.get("pleskLicence") || "admin");
  const [pleskVersion, setPleskVersion] = useState(sp.get("pleskVersion") || "Ubuntu 22.04");
  const [showPleskWindowsModal, setShowPleskWindowsModal] = useState(false);
  const [pleskWinLicence, setPleskWinLicence] = useState(sp.get("pleskWinLicence") || "admin");
  const [pleskWinVersion, setPleskWinVersion] = useState(sp.get("pleskWinVersion") || "2016");
  const [password, setPassword] = useState(sp.get("password") ? decodeURIComponent(sp.get("password")!) : "");
  const [showPassword, setShowPassword] = useState(false);
  const [privateNetwork, setPrivateNetwork] = useState(sp.get("privateNetwork") || "none");
  const [ipv4Address, setIpv4Address] = useState(sp.get("ipv4Address") || "1ip");
  const [objectStorage, setObjectStorage] = useState(sp.get("objectStorage") || "none");
  const [serverManagement, setServerManagement] = useState(sp.get("management") || "unmanaged");
  const [monitoring, setMonitoring] = useState(sp.get("monitoring") || "none");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showSummaryDetails, setShowSummaryDetails] = useState(false);
  const [showAdditionalFeatures, setShowAdditionalFeatures] = useState(true);

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
    p.set("pleskLicence", pleskLicence);
    p.set("pleskVersion", pleskVersion);
    p.set("pleskWinLicence", pleskWinLicence);
    p.set("pleskWinVersion", pleskWinVersion);
    p.set("privateNetwork", privateNetwork);
    p.set("ipv4Address", ipv4Address);
    p.set("objectStorage", objectStorage);
    p.set("management", serverManagement);
    p.set("monitoring", monitoring);
    if (password) p.set("password", encodeURIComponent(password));
    window.history.replaceState({}, "", `/vps-windows/configure/${planId}?${p.toString()}`);
  }, [quantity, duration, regionTab, location, storageType, imageCategory, osImage, autoBackup,
      ubuntuVersion, windowsVersion, cpanelLicence, cpanelVersion, pleskLicence, pleskVersion,
      pleskWinLicence, pleskWinVersion, privateNetwork, ipv4Address, objectStorage,
      serverManagement, monitoring, password, planId]);

  const isPasswordValid = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+^~[\]{}|;:,.<>?])[A-Za-z\d!@#$%^&*()_+^~[\]{}|;:,.<>?]{8,}$/;
    return regex.test(pwd);
  };

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans pb-24">
      <Navbar variant="light" />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-12 space-y-12">

        <h1 className="text-3xl font-bold text-slate-800">Configure seu {plan.name}</h1>

        {/* Plan Summary Section */}
        <div className="flex flex-wrap items-center gap-10">
          <div className="flex-1 border-2 border-sky-400 rounded-lg p-8 grid grid-cols-5 gap-4 relative bg-white">
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
              <p className="text-[10px] font-bold text-slate-400 uppercase">SNAPSHOT</p>
              <p className="text-[11px] font-medium leading-tight">{plan.snapshots}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">PORTA</p>
              <p className="text-[11px] font-medium leading-tight">{plan.port}</p>
            </div>
            <Link href="/vps-windows" className="absolute bottom-4 right-4 text-[10px] text-sky-500 hover:underline">Mudar</Link>
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
                  d.setupEur === 0 ? "bg-emerald-500/50 text-slate-700" : "text-slate-500"
                )}>
                  {d.setupEur === 0 ? "Sem taxa de instalação" : `Taxa de configuração de ${formatBRL(d.setupEur)}`}
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
                {(plan.locations[regionTab as keyof typeof plan.locations] || []).map((loc: any) => (
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
                    <div className="flex-1 text-right">{loc.eur > 0 ? formatBRLPerMonth(loc.eur) : "Livre"}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Separator className="bg-slate-100" />

        {/* Storage Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-700">Tipo de armazenamento</h2>
            <Info size={16} className="text-slate-300" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {storageTypes.map((st: any) => (
              <div
                key={st.id}
                onClick={() => setStorageType(st.id)}
                className={cn(
                  "cursor-pointer rounded-lg border-2 p-4 flex items-center justify-between text-[11px] font-medium transition-all bg-white",
                  storageType === st.id ? "border-sky-400 shadow-sm" : "border-slate-100"
                )}
              >
                <span>{st.name}</span>
                <span className={cn(st.eur ? "text-slate-700" : "text-emerald-500")}>{st.eur ? formatBRLPerMonth(st.eur) : st.price}</span>
              </div>
            ))}
          </div>
        </section>

        <Separator className="bg-slate-100" />

        {/* Image Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-700">Imagem (Windows Server Incluso)</h2>
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
                  {(dynamicImages[imageCategory as keyof typeof dynamicImages] || []).map((img: any) => (
                    <button
                      key={img.id}
                      onClick={() => {
                        if (img.id === "windows") setShowWindowsModal(true);
                        if (img.id === "plesk-linux") setShowPleskModal(true);
                        if (img.id === "plesk-win") setShowPleskWindowsModal(true);
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

        <Separator className="bg-slate-100" />

        {/* Data Protection Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Proteção de Dados com Backup Automático</h2>
            <Info size={18} className="text-slate-300" />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12 bg-white rounded-2xl p-10 border border-slate-100 shadow-sm">
            <div className="w-1/3 flex justify-center">
              <img src="/backup-shield.png" alt="Backup Shield" className="w-48 h-auto object-contain" />
            </div>

            <div className="flex-1 space-y-6">
              <ul className="space-y-3">
                {[
                  "Backups automáticos diários.",
                  "Recuperação instantânea com 1 clique.",
                  "Mantém as últimas 10 versões de backup.",
                  "Nenhuma configuração necessária."
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">
              <div
                onClick={() => setAutoBackup(true)}
                className={cn(
                  "cursor-pointer w-full md:w-64 rounded-xl border-2 p-8 text-center transition-all relative flex flex-col justify-center gap-2",
                  autoBackup ? "border-sky-400 bg-white shadow-md" : "border-slate-100 bg-white"
                )}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-600 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Nossa Recomendação
                </div>
                <p className="text-base font-bold text-slate-800">Backup Automático</p>
                <p className="text-xl font-black text-slate-900">{formatBRLPerMonth(1.50)}</p>
                <p className="text-[10px] text-slate-500 leading-tight">Ative e esqueça.<br />Segurança de dados sem esforço.</p>
              </div>

              <div
                onClick={() => setAutoBackup(false)}
                className={cn(
                  "cursor-pointer w-full md:w-64 rounded-xl border-2 p-8 text-center transition-all flex items-center justify-center",
                  !autoBackup ? "border-sky-400 bg-white shadow-md" : "border-slate-100 bg-white"
                )}
              >
                <p className="text-base font-bold text-slate-600">Sem Proteção de Dados</p>
              </div>
            </div>
          </div>
        </section>

        <Separator className="bg-slate-100" />

        {/* Additional Features Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#0F172A]">Recursos Adicionais</h2>
              <button onClick={() => setShowAdditionalFeatures(!showAdditionalFeatures)} className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                {showAdditionalFeatures ? <>Fechar recursos adicionais <ChevronUp size={14} /></> : <>Ver mais <ChevronDown size={14} /></>}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {showAdditionalFeatures && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-12 overflow-hidden px-1 py-1">

                  {/* Networking Section */}
                  <div className="space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 border-b border-slate-100 pb-8">
                      <div className="w-48 shrink-0">
                        <h3 className="text-sm font-bold text-slate-700">Rede</h3>
                      </div>
                      <div className="flex-1 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="w-48 flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">Rede Privada</span>
                            <Info size={14} className="text-slate-300" />
                          </div>
                          <Select value={privateNetwork} onValueChange={setPrivateNetwork}>
                            <SelectTrigger className="w-full md:w-[480px] h-12">
                              <SelectValue placeholder="Selecione a rede" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sem Rede Privada</SelectItem>
                              <SelectItem value="enabled">
                                <div className="flex justify-between w-[440px]">
                                  <span>Rede Privada Ativada</span>
                                  <span className="font-bold">{formatBRLPerMonth(2.29)}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-4 border-t border-slate-50 pt-6">
                          <div className="w-48 flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">Largura de Banda</span>
                          </div>
                          <div className="md:w-[480px] h-12 border border-slate-200 rounded-md px-4 flex flex-col justify-center bg-slate-50/30">
                            <span className="text-sm font-medium text-slate-700">Tráfego Ilimitado</span>
                            <p className="text-[10px] text-slate-400 font-medium">Política de Uso Justo</p>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="w-48 flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">IPv4</span>
                            <Info size={14} className="text-slate-300" />
                          </div>
                          <Select value={ipv4Address} onValueChange={setIpv4Address}>
                            <SelectTrigger className="w-full md:w-[480px] h-12">
                              <SelectValue placeholder="Selecione o IP" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1ip">
                                <div className="flex items-center justify-between w-[440px]">
                                  <span>1 Endereço IP</span>
                                  <span className="text-emerald-500 font-bold">Grátis</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="2ip">
                                <div className="flex items-center justify-between w-[440px]">
                                  <span>1 Endereço IP + 1 IP Adicional</span>
                                  <span className="font-bold">{formatBRLPerMonth(plan.additionalIpEur || 3.50)}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      <div className="w-48 shrink-0 pt-2">
                        <h3 className="text-sm font-bold text-slate-700">Complementos</h3>
                      </div>
                      <div className="flex-1 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="w-48 flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">Armazenamento de Objetos</span>
                          </div>
                          <Select value={objectStorage} onValueChange={setObjectStorage}>
                            <SelectTrigger className="w-full md:w-[480px] h-12">
                              <SelectValue placeholder="Selecione o armazenamento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {(plan.objectStorageTiers || []).map((tier: any) => (
                                <SelectItem key={tier.id} value={tier.id}>
                                  <div className="flex justify-between w-[440px]">
                                    <span>{tier.name} na União Europeia</span>
                                    <span className="font-bold">{formatBRLPerMonth(tier.eur)}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="w-48 flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">Gerenciamento de Servidor</span>
                            <Info size={14} className="text-slate-300" />
                          </div>
                          <Select value={serverManagement} onValueChange={setServerManagement}>
                            <SelectTrigger className="w-full md:w-[480px] h-12">
                              <SelectValue placeholder="Selecione o gerenciamento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unmanaged">
                                <div className="flex justify-between w-[440px]">
                                  <span>Não Gerenciado</span>
                                  <span className="text-emerald-500 font-bold">Grátis</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="managed">
                                <div className="flex justify-between w-[440px]">
                                  <span>Gerenciado</span>
                                  <span className="font-bold">{formatBRLPerMonth(109.99)}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="w-48 flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">Monitoramento</span>
                            <Info size={14} className="text-slate-300" />
                          </div>
                          <Select value={monitoring} onValueChange={setMonitoring}>
                            <SelectTrigger className="w-full md:w-[480px] h-12">
                              <SelectValue placeholder="Selecione o monitoramento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              <SelectItem value="full">
                                <div className="flex justify-between w-[440px]">
                                  <span>Monitoramento Completo</span>
                                  <span className="font-bold">{formatBRLPerMonth(11.49)}</span>
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

        <Separator className="bg-slate-100" />

        {/* Login and Password Section */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-[#0F172A] mb-8">Login and password for your server</h2>
          <div className="max-w-3xl space-y-8">
            {/* Username */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-3">
                <span className="text-sm font-bold text-slate-600">Username</span>
              </div>
              <div className="md:col-span-9">
                <span className="text-slate-900 font-medium">Administrator / root</span>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3 pt-3">
                <span className="text-sm font-bold text-slate-600">Password</span>
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
                      for (let i = 0; i < 8; i++) pass += all[Math.floor(Math.random() * all.length)];
                      pass = pass.split('').sort(() => 0.5 - Math.random()).join('');
                      setPassword(pass);
                      setPasswordTouched(true);
                    }}
                    className="text-[#3B82F6] text-xs hover:underline"
                  >
                    Generate new password
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
                    className={cn(
                      "h-12 bg-white border-slate-200 focus:border-[#3B82F6] pr-12",
                      passwordTouched && password.length > 0 && !isPasswordValid(password) && "border-red-500"
                    )}
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
                {passwordTouched && password.length > 0 && !isPasswordValid(password) && (
                  <div className="flex items-center gap-2 text-red-500 text-xs mt-1">
                    <AlertCircle size={14} />
                    <span>Invalid password (Min. 8 chars, uppercase, number and symbol)</span>
                  </div>
                )}
                {isPasswordValid(password) && (
                  <div className="flex items-center gap-2 text-emerald-500 text-xs mt-1">
                    <Check size={14} />
                    <span>Strong and secure password</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Windows Modal */}
      <AnimatePresence>
        {
          showWindowsModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowWindowsModal(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-[600px] p-10 space-y-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-4"><img src="/windows.png" alt="Windows" className="w-10 h-10" /><h2 className="text-xl font-bold">Windows Server</h2></div>
                <div className="space-y-4">
                  <label className="text-sm font-bold">Versão (Inclusa)</label>
                  <Select value={windowsVersion} onValueChange={setWindowsVersion}>
                    <SelectTrigger className="h-14">
                      <SelectValue>
                        <div className="flex items-center justify-between w-full pr-4 text-xs">
                          <span>Windows Server {windowsVersion} Datacenter</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {formatBRLPerMonth(windowsVersion === "2016" ? currentImagePrices.win2016 : currentImagePrices.windows)}
                            </span>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-400">Sem taxa de instalação</span>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">
                        <div className="flex items-center justify-between w-[480px] text-xs">
                          <span>Windows Server 2025 Datacenter</span>
                          <span className="font-bold text-slate-800">{formatBRL(currentImagePrices.windows)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="2022">
                        <div className="flex items-center justify-between w-[480px] text-xs">
                          <span>Windows Server 2022 Datacenter</span>
                          <span className="font-bold text-slate-800">{formatBRL(currentImagePrices.windows)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="2019">
                        <div className="flex items-center justify-between w-[480px] text-xs">
                          <span>Windows Server 2019 Datacenter</span>
                          <span className="font-bold text-slate-800">{formatBRL(currentImagePrices.windows)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="2016">
                        <div className="flex items-center justify-between w-[480px] text-xs">
                          <span>Windows Server 2016 Datacenter</span>
                          <span className="font-bold text-slate-800">{formatBRL(currentImagePrices.win2016)}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-4"><Button variant="ghost" onClick={() => setShowWindowsModal(false)}>Fechar</Button><Button onClick={() => setShowWindowsModal(false)} className="bg-[#00A8E8] text-white">Selecionar</Button></div>
              </motion.div>
            </div>
          )}
      </AnimatePresence>

      {/* Plesk Modal */}
      <AnimatePresence>
        {
          showPleskModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPleskModal(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-[600px] p-10 space-y-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-4"><img src="/plesk.png" alt="Plesk" className="w-10 h-10" /><h2 className="text-xl font-bold">Plesk + Linux</h2></div>

                <div className="space-y-4">
                  <label className="text-sm font-bold">Licença</label>
                  <Select value={pleskLicence} onValueChange={setPleskLicence}>
                    <SelectTrigger className="h-14">
                      <SelectValue>
                        <div className="flex items-center justify-between w-full pr-4 text-xs">
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-[#00A8E8]">
                              {pleskLicence === "admin" ? "Plesk Obsidian Web Admin Edition" :
                                pleskLicence === "host" ? "Plesk Obsidian Web Host Edition" :
                                  "Plesk Obsidian Web Pro Edition"} 1 mês
                            </span>
                            <span className="text-emerald-500 font-bold">free</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {formatBRLPerMonth(pleskLicence === "admin" ? currentImagePrices.pleskLinux :
                                pleskLicence === "host" ? currentImagePrices.pleskHost :
                                  currentImagePrices.pleskPro)}
                            </span>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-400">R$ 0,00 Taxa de instalação</span>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-[120]">
                      <SelectItem value="admin">
                        <div className="flex items-center justify-between w-[480px] text-xs">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">Plesk Obsidian Web Admin Edition</span>
                            <span className="text-emerald-500 font-bold">1 mês grátis</span>
                          </div>
                          <span className="font-black">{formatBRL(currentImagePrices.pleskLinux)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="host">
                        <div className="flex items-center justify-between w-[480px] text-xs">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">Plesk Obsidian Web Host Edition</span>
                            <span className="text-emerald-500 font-bold">1 mês grátis</span>
                          </div>
                          <span className="font-black">{formatBRL(currentImagePrices.pleskHost)}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pro">
                        <div className="flex items-center justify-between w-[480px] text-xs">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">Plesk Obsidian Web Pro Edition</span>
                            <span className="text-emerald-500 font-bold">1 mês grátis</span>
                          </div>
                          <span className="font-black">{formatBRL(currentImagePrices.pleskPro)}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="space-y-3">
                    <label className="text-sm font-bold">Versão</label>
                    <Select value={pleskVersion} onValueChange={setPleskVersion}>
                      <SelectTrigger className="h-14">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[120]">
                        <SelectItem value="Ubuntu 22.04">Ubuntu 22.04</SelectItem>
                        <SelectItem value="AlmaLinux 9">AlmaLinux 9</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="ghost" onClick={() => setShowPleskModal(false)}>Fechar</Button>
                  <Button onClick={() => setShowPleskModal(false)} className="bg-[#00A8E8] text-white">Selecionar</Button>
                </div>
              </motion.div>
            </div>
          )}
      </AnimatePresence>
      {/* Plesk Windows Modal */}
      <AnimatePresence>
        {
          showPleskWindowsModal && (
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
                                {formatBRLPerMonth(pleskWinLicence === "admin" ? currentImagePrices.pleskWin :
                                  pleskWinLicence === "host" ? currentImagePrices.pleskHost :
                                    currentImagePrices.pleskPro)}
                              </span>
                              <span>|</span>
                              <span>Sem taxa de instalação</span>
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
                            <span className="font-black text-slate-800">{formatBRL(currentImagePrices.pleskWin)}</span>
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

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-600">Version</label>
                    <Select value={pleskWinVersion} onValueChange={setPleskWinVersion}>
                      <SelectTrigger className="h-16 border border-slate-200">
                        <SelectValue>
                          <div className="flex items-center justify-between w-full pr-4 text-[13px]">
                            <span className="font-medium text-slate-700">Windows Server {pleskWinVersion} Datacenter</span>
                            <div className="flex items-center gap-2 text-slate-500">
                              <span className="font-medium">
                                {formatBRLPerMonth(pleskWinVersion === "2016" ? currentImagePrices.win2016 : currentImagePrices.windows)}
                              </span>
                              <span>|</span>
                              <span>Sem taxa de instalação</span>
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
      </AnimatePresence>

      {/* Fixed Bottom Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F1F5F9] border-t border-slate-200 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">

        <AnimatePresence>
          {showSummaryDetails && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-slate-200 bg-white">
              <div className="max-w-6xl mx-auto px-10 py-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Detalhamento</h3>
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

                    const stype = storageTypes.find((s: any) => s.id === storageType);
                    if (stype && stype.eur) items.push({ label: `Upgrade de Disco: ${stype.name}`, price: stype.eur * durMonths * qty * currentRate });

                    if (autoBackup) items.push({ label: `Backup Automático`, price: plan.backupEur * durMonths * qty * currentRate });

                    if (privateNetwork === "enabled") {
                      const pnEur = (planId === "20" || planId === "30" || planId === "40" || planId === "50" || planId === "60") ? plan.privateNetworkEur : 0;
                      if (pnEur > 0) items.push({ label: `Rede Privada`, price: pnEur * durMonths * qty * currentRate });
                    }

                    if (ipv4Address === "2ip") items.push({ label: `IP Adicional`, price: plan.additionalIpEur * durMonths * qty * currentRate });

                    if (objectStorage !== "none") {
                      const tier = plan.objectStorageTiers.find((t: any) => t.id === objectStorage);
                      if (tier) items.push({ label: `Object Storage (${tier.name})`, price: tier.eur * durMonths * qty * currentRate });
                    }

                    if (serverManagement === "managed") items.push({ label: `Gerenciado`, price: 109.99 * durMonths * qty * currentRate });

                    if (monitoring === "full") items.push({ label: `Monitoramento`, price: 11.49 * durMonths * qty * currentRate });

                    // Image Pricing
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
              const selectedDur = durations.find((d: any) => d.id === duration) || durations[0];
              const durMonths = parseInt(duration);
              const qty = parseInt(quantity) || 1;

              // Base Price Logic
              const basePriceMonthlyEur = selectedDur.eur;

              // Setup Fee Logic
              const setupFeeEur = selectedDur.setupEur || 0;

              let additionalEur = 0;
              const loc = Object.values(planLocations).flat().find((l: any) => l.id === location) as any;

              if (loc && loc.eur) {
                additionalEur += loc.eur;
              }

              const stype = storageTypes.find((s: any) => s.id === storageType);
              if (stype && stype.eur) {
                additionalEur += stype.eur;
              }

              if (autoBackup) {
                additionalEur += plan.backupEur;
              }

              if (privateNetwork === "enabled") {
                const pnEur = (planId === "20" || planId === "30" || planId === "40" || planId === "50" || planId === "60") ? plan.privateNetworkEur : 0;
                additionalEur += pnEur;
              }

              if (ipv4Address === "2ip") {
                additionalEur += plan.additionalIpEur;
              }

              if (objectStorage !== "none") {
                const tier = plan.objectStorageTiers.find((t: any) => t.id === objectStorage);
                if (tier) additionalEur += tier.eur;
              }

              if (serverManagement === "managed") {
                additionalEur += 109.99;
              }

              if (monitoring === "full") {
                additionalEur += 11.49;
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
                const licEur = pleskWinLicence === "admin" ? currentImagePrices.pleskLinux :
                  pleskWinLicence === "host" ? currentImagePrices.pleskHost :
                    currentImagePrices.pleskPro;
                const verEur = pleskWinVersion === "2016" ? currentImagePrices.win2016 : currentImagePrices.windows;
                additionalEur += (licEur + verEur);
              }

              const totalMonthly = (basePriceMonthlyEur + additionalEur) * currentRate;
              const dueToday = (totalMonthly * durMonths * qty) + (setupFeeEur * currentRate * qty);

              return (
                <div className="flex items-center gap-12">
                  <div className="flex flex-col gap-1 min-w-[220px]">
                    <div className="flex justify-between items-center text-[11px]"><span className="text-slate-500 font-bold">Mensal</span><span className="font-black text-slate-700 whitespace-nowrap">{formatBRL(totalMonthly * qty / currentRate)}</span></div>
                    <div className="flex justify-between items-center mt-1"><span className="font-black text-slate-800 text-[13px]">Vencido Hoje</span><span className="text-xl font-black text-slate-900 whitespace-nowrap">{formatBRL(dueToday / currentRate)}</span></div>
                  </div>
                  <Button disabled={!isPasswordValid(password)} onClick={() => router.push(`/checkout/personal-data?planId=${planId}&qty=${quantity}&duration=${duration}&location=${location}&image=${osImage}&password=${encodeURIComponent(password)}&storage=${storageType}&type=vps-windows`)} className={cn("font-bold h-14 px-12 rounded-full text-lg shadow-lg", isPasswordValid(password) ? "bg-[#00A8E8] hover:bg-[#0096d1] text-white shadow-sky-100" : "bg-slate-200 text-slate-400 cursor-not-allowed")}>Próximo</Button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}


