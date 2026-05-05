"use client";

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

// Multiplier: 1 Euro = 5.77 * 2 = 11.54 (Example used for XXL)
const MULTIPLIER = 11.72;

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
      { id: "1", label: "1 mês", price: "R$ 51,93", setupFee: "Taxa de configuração de R$ 51,93", discount: null },
      { id: "6", label: "6 meses", price: "R$ 46,74", setupFee: "Taxa de configuração de R$ 25,97", discount: "ECONOMIZE 10%", oldPrice: "R$ 51,93" },
      { id: "12", label: "12 meses", price: "R$ 41,54", setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldPrice: "R$ 51,93" },
    ],
    storageTypes: [
      { id: "ssd-150", name: "150 GB SSD", price: "Livre" },
      { id: "ssd-300", name: "300 GB SSD", price: "R$ 17,89" },
      { id: "nvme-75", name: "75 GB NVMe", price: "Livre" },
      { id: "nvme-150", name: "150 GB NVMe", price: "R$ 21,35" },
    ],
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: 0 },
        { id: "uk", name: "Reino Unido", latency: "135 ms", price: 10.96 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: 0 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: 16.16, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "349 ms", price: 22.50 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", price: 10.96 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: 16.16, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", price: 13.27 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "338 ms", price: 26.54 },
        { id: "jp", name: "Ásia (Japão)", latency: "269 ms", price: 27.12 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", price: 24.81 },
      ]
    },
    rate: MULTIPLIER,
    basePrice: 138.48,
    backupPrice: 17.31
  },
  "20": {
    name: "Cloud VPS 20 (M) Windows",
    vcpu: "6 núcleos de vCPU",
    ram: "12 GB RAM",
    storage: "100 GB NVMe ou SSD 200 GB",
    snapshots: "2 Instantâneos",
    port: "300 Mbit/s",
    traffic: "32 TB de tráfego",
    durations: [
      { id: "1", label: "1 mês", price: "R$ 80,78", setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", price: "R$ 72,70", setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldPrice: "R$ 80,78" },
      { id: "12", label: "12 meses", price: "R$ 64,62", setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldPrice: "R$ 80,78" },
    ],
    storageTypes: [
      { id: "ssd-200", name: "200 GB SSD", price: "Livre" },
      { id: "ssd-400", name: "400 GB SSD", price: "R$ 22,50" },
      { id: "nvme-100", name: "100 GB NVMe", price: "Livre" },
      { id: "nvme-200", name: "200 GB NVMe", price: "R$ 29,43" },
    ],
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: 0 },
        { id: "uk", name: "Reino Unido", latency: "135 ms", price: 18.46 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: 0 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: 27.70, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "349 ms", price: 39.24 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", price: 18.46 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: 27.70, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", price: 21.35 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "338 ms", price: 46.16 },
        { id: "jp", name: "Ásia (Japão)", latency: "269 ms", price: 47.31 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", price: 44.43 },
      ]
    },
    rate: MULTIPLIER,
    basePrice: 259.65,
    backupPrice: 23.08
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
      { id: "1", label: "1 mês", price: "R$ 161,56", setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", price: "R$ 145,40", setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldPrice: "R$ 161,56" },
      { id: "12", label: "12 meses", price: "R$ 129,25", setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldPrice: "R$ 161,56" },
    ],
    storageTypes: [
      { id: "ssd-400", name: "400 GB SSD", price: "Livre" },
      { id: "ssd-800", name: "800 GB SSD", price: "R$ 44,43" },
      { id: "nvme-200", name: "200 GB NVMe", price: "Livre" },
      { id: "nvme-400", name: "400 GB NVMe", price: "R$ 37,51" },
    ],
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: 0 },
        { id: "uk", name: "Reino Unido", latency: "135 ms", price: 36.93 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: 0 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: 55.39, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "349 ms", price: 78.47 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", price: 36.93 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: 55.39, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", price: 42.69 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "338 ms", price: 92.32 },
        { id: "jp", name: "Ásia (Japão)", latency: "269 ms", price: 94.63 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", price: 87.70 },
      ]
    },
    rate: MULTIPLIER,
    basePrice: 426.98,
    backupPrice: 40.39
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
      { id: "1", label: "1 mês", price: "R$ 288,50", setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", price: "R$ 259,65", setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldPrice: "R$ 288,50" },
      { id: "12", label: "12 meses", price: "R$ 230,80", setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldPrice: "R$ 288,50" },
    ],
    storageTypes: [
      { id: "ssd-500", name: "500 GB SSD", price: "Livre" },
      { id: "ssd-1000", name: "1 TB SSD", price: "R$ 57,12" },
      { id: "nvme-250", name: "250 GB NVMe", price: "Livre" },
      { id: "nvme-500", name: "500 GB NVMe", price: "R$ 44,43" },
    ],
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: 0 },
        { id: "uk", name: "Reino Unido", latency: "135 ms", price: 63.47 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: 0 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: 94.63, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "349 ms", price: 132.71 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", price: 63.47 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: 94.63, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", price: 72.70 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "338 ms", price: 155.79 },
        { id: "jp", name: "Ásia (Japão)", latency: "269 ms", price: 159.25 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", price: 147.14 },
      ]
    },
    rate: MULTIPLIER,
    basePrice: 853.96,
    backupPrice: 69.24
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
      { id: "1", label: "1 mês", price: "R$ 426,76", setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", price: "R$ 384,08", setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldPrice: "R$ 426,76" },
      { id: "12", label: "12 meses", price: "R$ 341,41", setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldPrice: "R$ 426,76" },
    ],
    storageTypes: [
      { id: "ssd-600", name: "600 GB SSD", price: "Livre" },
      { id: "ssd-1200", name: "1.2 TB SSD", price: "R$ 70,97" },
      { id: "nvme-300", name: "300 GB NVMe", price: "Livre" },
      { id: "nvme-600", name: "600 GB NVMe", price: "R$ 54,82" },
    ],
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: 0 },
        { id: "uk", name: "Reino Unido", latency: "135 ms", price: 89.96 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: 0 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: 132.71, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "349 ms", price: 184.64 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", price: 89.96 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: 132.71, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", price: 111.30 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "338 ms", price: 219.26 },
        { id: "jp", name: "Ásia (Japão)", latency: "269 ms", price: 225.03 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", price: 207.72 },
      ]
    },
    rate: 11.72,
    basePrice: 426.76,
    backupPrice: 87.90
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
      { id: "1", label: "1 mês", price: "R$ 565,46", setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", price: "R$ 508,91", setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldPrice: "R$ 565,46" },
      { id: "12", label: "12 meses", price: "R$ 452,37", setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldPrice: "R$ 565,46" },
    ],
    storageTypes: [
      { id: "ssd-700", name: "700 GB SSD", price: "Livre" },
      { id: "ssd-1400", name: "1.4 TB SSD", price: "R$ 80,20/mês" },
      { id: "nvme-350", name: "350 GB NVMe", price: "Livre" },
      { id: "nvme-700", name: "700 GB NVMe", price: "R$ 66,36/mês" },
    ],
    locations: {
      europe: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: 0 },
        { id: "uk", name: "Reino Unido", latency: "135 ms", price: 118.86 },
      ],
      best: [
        { id: "eu", name: "União Europeia", latency: "156 ms", price: 0 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: 177.14, recommended: true },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "349 ms", price: 244.07 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", price: 118.86 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: 177.14, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", price: 147.71 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "338 ms", price: 294.27 },
        { id: "jp", name: "Ásia (Japão)", latency: "269 ms", price: 294.27 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", price: 269.46 },
      ]
    },
    rate: 11.72,
    basePrice: 565.46,
    backupPrice: 109.63
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

// Standard image prices for base plans (10-40)
const defaultImagePrices = {
  windows: "R$ 87,90 /mês",
  cpanel: "R$ 254,91 /mês",
  pleskLinux: "R$ 140,64 /mês",
  pleskWin: "R$ 213,89 /mês",
  pleskHost: "R$ 421,21 /mês",
  pleskPro: "R$ 219,26 /mês"
};

// Plan-specific image prices
const getPlanImagePrices = (planId: string) => {
  if (planId === "10") {
    return {
      windows: "R$ 54,82 /mês",
      win2016: "R$ 46,16 /mês",
      cpanel: "R$ 250,99 /mês",
      pleskLinux: "R$ 138,48 /mês",
      pleskHost: "R$ 421,21 /mês",
      pleskPro: "R$ 219,26 /mês",
      pleskWin: "R$ 184,64 /mês"
    };
  }
  if (planId === "30") {
    return {
      windows: "R$ 300,04 /mês",
      win2016: "R$ 279,04 /mês",
      cpanel: "R$ 250,99 /mês",
      pleskLinux: "R$ 138,48 /mês",
      pleskHost: "R$ 421,21 /mês",
      pleskPro: "R$ 219,26 /mês",
      pleskWin: "R$ 426,98 /mês"
    };
  }
  if (planId === "40") {
    return {
      windows: "R$ 565,46 /mês",
      win2016: "R$ 526,22 /mês",
      cpanel: "R$ 250,99 /mês",
      pleskLinux: "R$ 138,48 /mês",
      pleskHost: "R$ 421,21 /mês",
      pleskPro: "R$ 219,26 /mês",
      pleskWin: "R$ 675,09 /mês"
    };
  }
  if (planId === "50") {
    return {
      windows: "R$ 675,09 /mês",
      win2016: "R$ 642,78 /mês",
      cpanel: "R$ 254,91 /mês",
      pleskLinux: "R$ 140,64 /mês",
      pleskHost: "R$ 427,78 /mês",
      pleskPro: "R$ 222,68 /mês",
      pleskWin: "R$ 781,26 /mês"
    };
  }
  if (planId === "60") {
    return {
      windows: "R$ 807,80 /mês",
      win2016: "R$ 751,72 /mês",
      cpanel: "R$ 250,99 /mês",
      pleskLinux: "R$ 138,48 /mês",
      pleskHost: "R$ 421,21 /mês",
      pleskPro: "R$ 219,26 /mês",
      pleskWin: "R$ 807,80 /mês"
    };
  }
  return { ...defaultImagePrices, win2016: "R$ 81,80 /mês" };
};

const getImages = (planId: string) => {
  const p = getPlanImagePrices(planId);
  return {
    popular: [
      { id: "windows", name: "Servidor Windows", price: p.windows, icon: "/windows.png" },
      { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
      { id: "cpanel", name: "cPanel", price: p.cpanel, icon: "/cpanel.png" },
      { id: "plesk-win", name: "Plesk + Windows", price: p.pleskWin, icon: "/plesk.png" },
      { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
      { id: "debian", name: "Debian", price: "Incluído", icon: "/debian-svgrepo-com.svg" },
    ],
    os: [
      { id: "windows", name: "Servidor Windows", price: p.windows, icon: "/windows.png" },
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
      { id: "cpanel", name: "cPanel", price: p.cpanel, icon: "/cpanel.png" },
      { id: "plesk-win", name: "Plesk + Windows", price: p.pleskWin, icon: "/plesk.png" },
      { id: "plesk-linux", name: "Plesk + Linux", price: p.pleskLinux, icon: "/plesk.png" },
      { id: "webmin", name: "Webmin", price: "Incluído", icon: "/webmin.png" },
      { id: "webmin-lamp", name: "Webmin + LAMP", price: "Incluído", icon: "/lamp.png" },
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
  const planId = params.id as string;
  const plan = plansData[planId as keyof typeof plansData] || plansData["10"];
  const durations = plan.durations;
  const storageTypes = plan.storageTypes;
  const planLocations = (plan as any).locations || {};
  const images = getImages(planId);
  const currentImagePrices = getPlanImagePrices(planId);

  const [quantity, setQuantity] = useState("1");
  const [duration, setDuration] = useState("1");
  const [regionTab, setRegionTab] = useState("best");
  const [location, setLocation] = useState("eu");
  const [storageType, setStorageType] = useState(storageTypes[0].id);
  const [imageCategory, setImageCategory] = useState("popular");
  const [osImage, setOsImage] = useState("windows");
  const [autoBackup, setAutoBackup] = useState(false);
  const [showMoreImages, setShowMoreImages] = useState(true);
  const [showAdditionalFeatures, setShowAdditionalFeatures] = useState(true);
  const [showWindowsModal, setShowWindowsModal] = useState(false);
  const [windowsVersion, setWindowsVersion] = useState("2025");
  const [showPleskModal, setShowPleskModal] = useState(false);
  const [showPleskWindowsModal, setShowPleskWindowsModal] = useState(false);
  const [pleskLicence, setPleskLicence] = useState("admin");
  const [pleskWinLicence, setPleskWinLicence] = useState("admin");
  const [pleskVersion, setPleskVersion] = useState("Ubuntu 22.04");
  const [pleskWinVersion, setPleskWinVersion] = useState("2016");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [privateNetwork, setPrivateNetwork] = useState("enabled");
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
                    {d.oldPrice && <p className="text-[10px] text-rose-500 line-through font-medium">{d.oldPrice}/mês</p>}
                    <p className="text-lg font-bold text-slate-800">{d.price} <span className="text-xs font-normal text-slate-400">/ mês</span></p>
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
                    <div className="flex-1 text-right">{loc.price > 0 ? `R$ ${loc.price.toFixed(2).replace(".", ",")}/mês` : "Livre"}</div>
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
                <span className={cn(st.price === "Livre" ? "text-emerald-500" : "text-slate-700")}>{st.price}</span>
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
                  {(images[imageCategory as keyof typeof images] || []).map((img: any) => (
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
                        <p className="text-[10px] text-slate-400 font-medium">{img.price}</p>
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
                  <div className="text-xl font-bold text-[#0F172A] mb-2">R$ {plan.backupPrice.toFixed(2).replace(".", ",")} / mês</div>
                </button>
                <button onClick={() => setAutoBackup(false)} className={cn("p-6 rounded-xl border-2 transition-all text-center flex items-center justify-center min-h-[160px] bg-white", !autoBackup ? "border-[#0091FF] shadow-md" : "border-slate-200 hover:border-slate-300")}>
                    <h3 className="text-lg font-medium text-slate-600">Sem Proteção</h3>
                </button>
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
                            <SelectContent><SelectItem value="none">Sem Rede Privada</SelectItem><SelectItem value="enabled"><div className="flex items-center justify-between w-[300px]"><span>Ativada</span><span className="font-bold">R$ 26,84 / mês</span></div></SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3"><span className="text-sm font-bold text-slate-600">IPv4</span></div>
                        <div className="md:col-span-9">
                          <Select value={ipv4Address} onValueChange={setIpv4Address}>
                            <SelectTrigger className="h-12 border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="1ip"><div className="flex items-center justify-between w-[300px]"><span>1 Endereço IP</span><span className="text-emerald-500">Grátis</span></div></SelectItem><SelectItem value="2ip"><div className="flex items-center justify-between w-[300px]"><span>+1 IP Adicional</span><span className="font-bold">R$ 41,02 / mês</span></div></SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-slate-100" />
                  <div className="space-y-8">
                    <h3 className="text-lg font-bold text-[#0F172A]">Complementos</h3>
                    <div className="space-y-6 pl-4 pr-1">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3"><span className="text-sm font-bold text-slate-600">Object Storage</span></div>
                        <div className="md:col-span-9">
                          <Select value={objectStorage} onValueChange={setObjectStorage}>
                            <SelectTrigger className="h-12 border-slate-200 text-left"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              <SelectItem value="250gb"><div className="flex justify-between w-[400px]"><span>250 GB nos EUA</span><span className="font-bold">R$ 29,18 / mês</span></div></SelectItem>
                              <SelectItem value="500gb"><div className="flex justify-between w-[400px]"><span>500 GB nos EUA</span><span className="font-bold">R$ 58,37 / mês</span></div></SelectItem>
                              <SelectItem value="2tb"><div className="flex justify-between w-[400px]"><span>2 TB nos EUA</span><span className="font-bold">R$ 214,71 / mês</span></div></SelectItem>
                              <SelectItem value="5tb"><div className="flex justify-between w-[400px]"><span>5 TB nos EUA</span><span className="font-bold">R$ 536,77 / mês</span></div></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3"><span className="text-sm font-bold text-slate-600">Gerenciamento</span></div>
                        <div className="md:col-span-9">
                          <Select value={serverManagement} onValueChange={setServerManagement}>
                            <SelectTrigger className="h-12 border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="unmanaged">Não Gerenciado (Grátis)</SelectItem><SelectItem value="managed"><div className="flex justify-between w-[350px]"><span>Gerenciado</span><span className="font-bold">R$ 1.289,08 / mês</span></div></SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3"><span className="text-sm font-bold text-slate-600">Monitoramento</span></div>
                        <div className="md:col-span-9">
                          <Select value={monitoring} onValueChange={setMonitoring}>
                            <SelectTrigger className="h-12 border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="none">Nenhum</SelectItem><SelectItem value="full"><div className="flex justify-between w-[350px]"><span>Completo</span><span className="font-bold">R$ 134,66 / mês</span></div></SelectItem></SelectContent>
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
          <h2 className="text-xl font-bold text-[#0F172A] mb-8">Login e senha para o seu servidor</h2>
          <div className="max-w-3xl space-y-8">
            {/* Username */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-3">
                <span className="text-sm font-bold text-slate-600">Usuário</span>
              </div>
              <div className="md:col-span-9">
                <span className="text-slate-900 font-medium">Administrator / root</span>
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
                      for (let i = 0; i < 8; i++) pass += all[Math.floor(Math.random() * all.length)];
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
                    <span>Senha inválida (Min. 8 caracteres, maiúscula, número e símbolo)</span>
                  </div>
                )}
                {isPasswordValid(password) && (
                  <div className="flex items-center gap-2 text-emerald-500 text-xs mt-1">
                    <Check size={14} />
                    <span>Senha forte e segura</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Bottom Summary Bar */}
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
                    const basePriceMonthly = parseFloat(selectedDur.price.replace("R$ ", "").replace(".", "").replace(",", "."));
                    items.push({ label: `${plan.name} (${durMonths}m)`, price: basePriceMonthly * durMonths * qty });
                    
                    if (selectedDur.setupFee !== "Sem taxa de instalação") {
                      const setup = parseFloat(selectedDur.setupFee.replace("Taxa de configuração de R$ ", "").replace(",", "."));
                      items.push({ label: `Taxa de Configuração`, price: setup * qty });
                    }
                    
                    const st = storageTypes.find((s: any) => s.id === storageType);
                    if (st && st.price !== "Livre") items.push({ label: `Upgrade de Disco: ${st.name}`, price: parseFloat(st.price.replace("R$ ", "").replace(",", ".")) * durMonths * qty });
                    
                    const loc = Object.values(plan.locations).flat().find((l: any) => l.id === location) as any;
                    if (loc && loc.price > 0) items.push({ label: `Localização: ${loc.name}`, price: loc.price * durMonths * qty });
                    
                    if (autoBackup) items.push({ label: `Backup Automático`, price: plan.backupPrice * durMonths * qty });
                    if (objectStorage !== "none") {
                        const prices: any = { "250gb": 29.18, "500gb": 58.37, "2tb": 214.71, "5tb": 536.77 };
                        items.push({ label: `Object Storage: ${objectStorage.toUpperCase()}`, price: prices[objectStorage] * durMonths * qty });
                    }
                    if (serverManagement === "managed") items.push({ label: `Gerenciado`, price: 1289.08 * durMonths * qty });
                    if (monitoring === "full") items.push({ label: `Monitoramento Completo`, price: 134.66 * durMonths * qty });

                    // Image/OS Pricing
                    const pPrices = getPlanImagePrices(planId);
                    const parsePrice = (p: string) => parseFloat(p.replace("R$ ", "").replace(",", "."));
                    if (osImage === "windows") {
                      const price = windowsVersion === "2016" ? parsePrice(pPrices.win2016) : parsePrice(pPrices.windows);
                      items.push({ label: `Windows Server ${windowsVersion}`, price: price * durMonths * qty });
                    } else if (osImage === "cpanel") {
                      items.push({ label: `cPanel License`, price: parsePrice(pPrices.cpanel) * durMonths * qty });
                    } else if (osImage === "plesk-win") {
                      const licPrice = pleskWinLicence === "admin" ? parsePrice(pPrices.pleskLinux) : 
                                       pleskWinLicence === "host" ? parsePrice(pPrices.pleskHost) : 
                                       parsePrice(pPrices.pleskPro);
                      const verPrice = pleskWinVersion === "2016" ? parsePrice(pPrices.win2016) : parsePrice(pPrices.windows);
                      items.push({ label: `Plesk + Windows (${pleskWinLicence})`, price: (licPrice + verPrice) * durMonths * qty });
                    } else if (osImage) {
                      const imgLabel = osImage.charAt(0).toUpperCase() + osImage.slice(1);
                      items.push({ label: `SO: ${imgLabel}`, price: 0 });
                    }

                    return items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-1">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="font-bold text-slate-700">R$ {item.price.toFixed(2).replace(".", ",")}</span>
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
              const basePriceMonthly = parseFloat(selectedDur.price.replace("R$ ", "").replace(".", "").replace(",", "."));
              const setupFee = selectedDur.setupFee === "Sem taxa de instalação" ? 0 : parseFloat(selectedDur.setupFee.replace("Taxa de configuração de R$ ", "").replace(",", "."));
              
              let additional = 0;
              const st = storageTypes.find((s: any) => s.id === storageType);
              if (st && st.price !== "Livre") additional += parseFloat(st.price.replace("R$ ", "").replace(",", "."));
              
              const loc = Object.values(plan.locations).flat().find((l: any) => l.id === location) as any;
              if (loc && loc.price > 0) additional += loc.price;
              
              if (autoBackup) additional += plan.backupPrice;
              if (objectStorage !== "none") {
                  const prices: any = { "250gb": 29.18, "500gb": 58.37, "2tb": 214.71, "5tb": 536.77 };
                  additional += prices[objectStorage];
              }
              if (serverManagement === "managed") additional += 1289.08;
              if (monitoring === "full") additional += 134.66;
              
              // Image Price Addition
              const pPrices = getPlanImagePrices(planId);
              const parsePrice = (p: string) => parseFloat(p.replace("R$ ", "").replace(",", "."));
              if (osImage === "windows") {
                additional += windowsVersion === "2016" ? parsePrice(pPrices.win2016) : parsePrice(pPrices.windows);
              } else if (osImage === "cpanel") {
                additional += parsePrice(pPrices.cpanel);
              } else if (osImage === "plesk-win") {
                const licPrice = pleskWinLicence === "admin" ? parsePrice(pPrices.pleskLinux) : 
                                 pleskWinLicence === "host" ? parsePrice(pPrices.pleskHost) : 
                                 parsePrice(pPrices.pleskPro);
                const verPrice = pleskWinVersion === "2016" ? parsePrice(pPrices.win2016) : parsePrice(pPrices.windows);
                additional += (licPrice + verPrice);
              }

              const totalMonthly = basePriceMonthly + additional;
              const dueToday = (totalMonthly * durMonths * qty) + (setupFee * qty);

              return (
                <div className="flex items-center gap-12">
                  <div className="flex flex-col gap-1 min-w-[220px]">
                    <div className="flex justify-between items-center text-[11px]"><span className="text-slate-500 font-bold">Mensal</span><span className="font-black">R$ {(totalMonthly * qty).toFixed(2).replace(".", ",")}</span></div>
                    <div className="flex justify-between items-center mt-1"><span className="font-black text-slate-800 text-[13px]">Vencido Hoje</span><span className="text-xl font-black text-slate-900">R$ {dueToday.toFixed(2).replace(".", ",")}</span></div>
                  </div>
                  <Button disabled={!isPasswordValid(password)} onClick={() => router.push(`/checkout/personal-data?planId=${planId}&qty=${quantity}&duration=${duration}&location=${location}&image=${osImage}&password=${encodeURIComponent(password)}&storage=${storageType}&type=vps-windows`)} className={cn("font-bold h-14 px-12 rounded-full text-lg", isPasswordValid(password) ? "bg-[#00A8E8] hover:bg-[#0096d1] text-white shadow-sky-100" : "bg-slate-200 text-slate-400 cursor-not-allowed")}>Próximo</Button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Windows Modal */}
      <AnimatePresence>
        {showWindowsModal && (
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
                            {windowsVersion === "2016" ? currentImagePrices.win2016 : currentImagePrices.windows}
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
                        <span className="font-bold text-slate-800">{currentImagePrices.windows.replace(" /mês", "")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="2022">
                      <div className="flex items-center justify-between w-[480px] text-xs">
                        <span>Windows Server 2022 Datacenter</span>
                        <span className="font-bold text-slate-800">{currentImagePrices.windows.replace(" /mês", "")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="2019">
                      <div className="flex items-center justify-between w-[480px] text-xs">
                        <span>Windows Server 2019 Datacenter</span>
                        <span className="font-bold text-slate-800">{currentImagePrices.windows.replace(" /mês", "")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="2016">
                      <div className="flex items-center justify-between w-[480px] text-xs">
                        <span>Windows Server 2016 Datacenter</span>
                        <span className="font-bold text-slate-800">{currentImagePrices.win2016.replace(" /mês", "")}</span>
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
        {showPleskModal && (
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
                            {pleskLicence === "admin" ? currentImagePrices.pleskLinux : 
                             pleskLicence === "host" ? currentImagePrices.pleskHost : 
                             currentImagePrices.pleskPro}
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
                        <span className="font-black">{currentImagePrices.pleskLinux.replace(" /mês", "")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="host">
                      <div className="flex items-center justify-between w-[480px] text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">Plesk Obsidian Web Host Edition</span>
                          <span className="text-emerald-500 font-bold">1 mês grátis</span>
                        </div>
                        <span className="font-black">{currentImagePrices.pleskHost.replace(" /mês", "")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="pro">
                      <div className="flex items-center justify-between w-[480px] text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">Plesk Obsidian Web Pro Edition</span>
                          <span className="text-emerald-500 font-bold">1 mês grátis</span>
                        </div>
                        <span className="font-black">{currentImagePrices.pleskPro.replace(" /mês", "")}</span>
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
                          <span className="font-black text-slate-800">{currentImagePrices.win2016.replace(" /mês", "")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="2019">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <span className="font-bold text-slate-700">Windows Server 2019 Datacenter</span>
                          <span className="font-black text-slate-800">{currentImagePrices.windows.replace(" /mês", "")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="2022">
                        <div className="flex items-center justify-between w-[480px] py-1">
                          <span className="font-bold text-slate-700">Windows Server 2022 Datacenter</span>
                          <span className="font-black text-slate-800">{currentImagePrices.windows.replace(" /mês", "")}</span>
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
    </div>
  );
}
