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
import { isCloudVpsPlanId } from "@/lib/vps-catalog";
import { convertVpsPriceFromEuro } from "@/lib/vps-price-display";
import { Navbar } from "../../../landing/components/Navbar";

// Base rate for fallback if API fails
const FALLBACK_EUR_RATE = 5.86;

// Euro source values for software licensing
const WINDOWS_LICENSE_EUR = {
  "10": {
    cpanel: 43.5,
    pleskHost: 71.9,
    pleskLinux: 24.0,
    pleskPro: 37.4,
    pleskWin: 36.5,
    win2016: 15.0,
    windows: 15.0,
  },
  "20": {
    cpanel: 43.5,
    pleskHost: 71.9,
    pleskLinux: 24.0,
    pleskPro: 37.4,
    pleskWin: 36.5,
    win2016: 31.0,
    windows: 31.0,
  },
  "30": {
    cpanel: 43.5,
    pleskHost: 73.0,
    pleskLinux: 24.0,
    pleskPro: 38.0,
    pleskWin: 73.0,
    win2016: 52.0,
    windows: 52.0,
  },
  "40": {
    cpanel: 43.5,
    pleskHost: 71.9,
    pleskLinux: 24.0,
    pleskPro: 37.4,
    pleskWin: 112.8,
    win2016: 98.0,
    windows: 98.0,
  },
  "50": {
    cpanel: 43.5,
    pleskHost: 73.0,
    pleskLinux: 24.0,
    pleskPro: 38.0,
    pleskWin: 145.6,
    win2016: 117.0,
    windows: 117.0,
  },
  "60": {
    cpanel: 43.5,
    pleskHost: 73.0,
    pleskLinux: 24.0,
    pleskPro: 38.0,
    pleskWin: 170.2,
    win2016: 140.0,
    windows: 140.0,
  },
};

const getPlanImagePrices = (planId: string, defaultPrices: any = {}) => {
  const prices =
    WINDOWS_LICENSE_EUR[planId as keyof typeof WINDOWS_LICENSE_EUR] ||
    WINDOWS_LICENSE_EUR["10"];
  return { ...prices };
};

const plansData: Record<string, any> = {
  "10": {
    backupEur: 3.0,
    durations: [
      { discount: null, eur: 9.0, id: "1", label: "1 mês", setupEur: 9.0 },
      {
        discount: "ECONOMIZE 10%",
        eur: 8.1,
        id: "6",
        label: "6 meses",
        oldEur: 9.0,
        setupEur: 4.5,
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 7.2,
        id: "12",
        label: "12 meses",
        oldEur: 9.0,
        setupEur: 0,
      },
    ],
    locations: {
      america: [
        {
          eur: 1.9,
          id: "us-central",
          latency: "117 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 2.8,
          id: "us-east",
          latency: "87 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 2.3,
          id: "us-west",
          latency: "147 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 4.3, id: "sg", latency: "347 ms", name: "Ásia (Singapura)" },
        { eur: 4.7, id: "jp", latency: "262 ms", name: "Ásia (Japão)" },
        { eur: 4.3, id: "in", latency: "N/A", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 3.9,
          id: "au-sydney",
          latency: "349 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "173 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 2.8,
          id: "us-east",
          latency: "87 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "173 ms", name: "União Europeia", price: "Livre" },
        { eur: 1.9, id: "uk", latency: "135 ms", name: "Reino Unido" },
      ],
    },
    name: "Cloud VPS 10 (S) Windows",
    objectStorageTiers: [
      { eur: 2.49, id: "250gb", name: "250 GB" },
      { eur: 4.98, id: "500gb", name: "500 GB" },
      { eur: 7.47, id: "750gb", name: "750 GB" },
      { eur: 9.96, id: "1tb", name: "1 TB" },
    ],
    port: "200 Mbit/s",
    ram: "8 GB RAM",
    snapshots: "1 Instantâneo",
    storage: "75 GB NVMe ou SSD 150 GB",
    storageTypes: [
      { id: "ssd-150", name: "150 GB SSD", price: "Livre" },
      { eur: 3.1, id: "ssd-300", name: "300 GB SSD" },
      { id: "nvme-75", name: "75 GB NVMe", price: "Livre" },
      { eur: 3.7, id: "nvme-150", name: "150 GB NVMe" },
    ],
    traffic: "32 TB de tráfego",
    vcpu: "4 núcleos de vCPU",
  },
  "20": {
    additionalIpEur: 7.0,
    backupEur: 4.0,
    durations: [
      { discount: null, eur: 14.0, id: "1", label: "1 mês", setupEur: 0 },
      {
        discount: "ECONOMIZE 10%",
        eur: 12.6,
        id: "6",
        label: "6 meses",
        oldEur: 14.0,
        setupEur: 0,
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 11.2,
        id: "12",
        label: "12 meses",
        oldEur: 14.0,
        setupEur: 0,
      },
    ],
    locations: {
      america: [
        {
          eur: 2.9,
          id: "us-central",
          latency: "118 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 2.9,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 3.7,
          id: "us-west",
          latency: "148 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 8.9, id: "sg", latency: "346 ms", name: "Ásia (Singapura)" },
        { eur: 8.9, id: "jp", latency: "262 ms", name: "Ásia (Japão)" },
        { eur: 8.9, id: "in", latency: "N/A", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 8.1,
          id: "au-sydney",
          latency: "350 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "170 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 2.9,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "170 ms", name: "União Europeia", price: "Livre" },
        { eur: 2.9, id: "uk", latency: "140 ms", name: "Reino Unido" },
      ],
    },
    name: "Cloud VPS 20 (M) Windows",
    objectStorageTiers: [
      { eur: 4.98, id: "250gb", name: "250 GB" },
      { eur: 9.96, id: "500gb", name: "500 GB" },
      { eur: 14.94, id: "750gb", name: "750 GB" },
      { eur: 19.92, id: "1tb", name: "1 TB" },
    ],
    port: "300 Mbit/s",
    privateNetworkEur: 4.58,
    ram: "12 GB RAM",
    snapshots: "2 Instantâneos",
    storage: "100 GB NVMe ou SSD 200 GB",
    storageTypes: [
      { id: "ssd-200", name: "200 GB SSD", price: "Livre" },
      { eur: 3.9, id: "ssd-400", name: "400 GB SSD" },
      { id: "nvme-100", name: "100 GB NVMe", price: "Livre" },
      { eur: 5.1, id: "nvme-200", name: "200 GB NVMe" },
    ],
    vcpu: "6 núcleos de vCPU",
  },
  "30": {
    backupEur: 7.0,
    durations: [
      { discount: null, eur: 28.0, id: "1", label: "1 mês", setupEur: 28.0 },
      {
        discount: "ECONOMIZE 10%",
        eur: 25.2,
        id: "6",
        label: "6 meses",
        oldEur: 28.0,
        setupEur: 14.0,
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 22.4,
        id: "12",
        label: "12 meses",
        oldEur: 28.0,
        setupEur: 0,
      },
    ],
    locations: {
      america: [
        {
          eur: 5.9,
          id: "us-central",
          latency: "117 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 5.9,
          id: "us-east",
          latency: "87 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 7.3,
          id: "us-west",
          latency: "147 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 17.8, id: "sg", latency: "338 ms", name: "Ásia (Singapura)" },
        { eur: 17.8, id: "jp", latency: "269 ms", name: "Ásia (Japão)" },
        { eur: 17.8, id: "in", latency: "N/A", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 16.2,
          id: "au-sydney",
          latency: "349 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "156 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 5.9,
          id: "us-east",
          latency: "87 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "156 ms", name: "União Europeia", price: "Livre" },
        { eur: 5.9, id: "uk", latency: "135 ms", name: "Reino Unido" },
      ],
    },
    name: "Cloud VPS 30 (L) Windows",
    objectStorageTiers: [
      { eur: 4.98, id: "250gb", name: "250 GB" },
      { eur: 9.96, id: "500gb", name: "500 GB" },
      { eur: 36.5, id: "2tb", name: "2 TB" },
      { eur: 91.2, id: "5tb", name: "5 TB" },
    ],
    port: "600 Mbit/s",
    ram: "24 GB RAM",
    snapshots: "3 Instantâneos",
    storage: "200 GB NVMe ou SSD 400 GB",
    storageTypes: [
      { id: "ssd-400", name: "400 GB SSD", price: "Livre" },
      { eur: 7.7, id: "ssd-800", name: "800 GB SSD" },
      { id: "nvme-200", name: "200 GB NVMe", price: "Livre" },
      { eur: 6.5, id: "nvme-400", name: "400 GB NVMe" },
    ],
    traffic: "32 TB de tráfego",
    vcpu: "8 núcleos de vCPU",
  },
  "40": {
    backupEur: 12.0,
    durations: [
      { discount: null, eur: 50.0, id: "1", label: "1 mês", setupEur: 0 },
      {
        discount: "ECONOMIZE 10%",
        eur: 45.0,
        id: "6",
        label: "6 meses",
        oldEur: 50.0,
        setupEur: 0,
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 40.0,
        id: "12",
        label: "12 meses",
        oldEur: 50.0,
        setupEur: 0,
      },
    ],
    locations: {
      america: [
        {
          eur: 10.5,
          id: "us-central",
          latency: "117 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 10.5,
          id: "us-east",
          latency: "87 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 13.1,
          id: "us-west",
          latency: "147 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 31.3, id: "sg", latency: "338 ms", name: "Ásia (Singapura)" },
        { eur: 31.3, id: "jp", latency: "269 ms", name: "Ásia (Japão)" },
        { eur: 31.3, id: "in", latency: "N/A", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 28.5,
          id: "au-sydney",
          latency: "349 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "156 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 10.5,
          id: "us-east",
          latency: "87 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "156 ms", name: "União Europeia", price: "Livre" },
        { eur: 10.5, id: "uk", latency: "135 ms", name: "Reino Unido" },
      ],
    },
    name: "Cloud VPS 40 (XL) Windows",
    port: "800 Mbit/s",
    ram: "48 GB RAM",
    snapshots: "3 Instantâneos",
    storage: "250 GB NVMe ou SSD 500 GB",
    storageTypes: [
      { id: "ssd-500", name: "500 GB SSD", price: "Livre" },
      { eur: 9.9, id: "ssd-1000", name: "1 TB SSD" },
      { id: "nvme-250", name: "250 GB NVMe", price: "Livre" },
      { eur: 7.7, id: "nvme-500", name: "500 GB NVMe" },
    ],
    traffic: "32 TB de tráfego",
    vcpu: "12 núcleos de vCPU",
  },
  "50": {
    backupEur: 15.2,
    durations: [
      { discount: null, eur: 74.0, id: "1", label: "1 mês", setupEur: 0 },
      {
        discount: "ECONOMIZE 10%",
        eur: 66.6,
        id: "6",
        label: "6 meses",
        oldEur: 74.0,
        setupEur: 0,
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 59.2,
        id: "12",
        label: "12 meses",
        oldEur: 74.0,
        setupEur: 0,
      },
    ],
    locations: {
      america: [
        {
          eur: 15.6,
          id: "us-central",
          latency: "117 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 27.1,
          id: "us-east",
          latency: "87 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 19.3,
          id: "us-west",
          latency: "147 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 38.0, id: "sg", latency: "338 ms", name: "Ásia (Singapura)" },
        { eur: 39.0, id: "jp", latency: "269 ms", name: "Ásia (Japão)" },
        { eur: 36.0, id: "in", latency: "N/A", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 32.0,
          id: "au-sydney",
          latency: "349 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "156 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 27.1,
          id: "us-east",
          latency: "87 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "156 ms", name: "União Europeia", price: "Livre" },
        { eur: 15.6, id: "uk", latency: "135 ms", name: "Reino Unido" },
      ],
    },
    name: "Cloud VPS 50 (XXL) Windows",
    port: "1 Gbit/s",
    ram: "64 GB RAM",
    snapshots: "3 Instantâneos",
    storage: "300 GB NVMe ou SSD 600 GB",
    storageTypes: [
      { id: "ssd-600", name: "600 GB SSD", price: "Livre" },
      { eur: 12.3, id: "ssd-1200", name: "1.2 TB SSD" },
      { id: "nvme-300", name: "300 GB NVMe", price: "Livre" },
      { eur: 9.5, id: "nvme-600", name: "600 GB NVMe" },
    ],
    traffic: "32 TB de tráfego",
    vcpu: "16 núcleos de vCPU",
  },
  "60": {
    backupEur: 19.0,
    durations: [
      { discount: null, eur: 98.0, id: "1", label: "1 mês", setupEur: 0 },
      {
        discount: "ECONOMIZE 10%",
        eur: 88.2,
        id: "6",
        label: "6 meses",
        oldEur: 98.0,
        setupEur: 0,
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 78.4,
        id: "12",
        label: "12 meses",
        oldEur: 98.0,
        setupEur: 0,
      },
    ],
    locations: {
      america: [
        {
          eur: 20.6,
          id: "us-central",
          latency: "117 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 30.7,
          id: "us-east",
          latency: "87 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 25.6,
          id: "us-west",
          latency: "147 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 51.0, id: "sg", latency: "338 ms", name: "Ásia (Singapura)" },
        { eur: 51.0, id: "jp", latency: "269 ms", name: "Ásia (Japão)" },
        { eur: 46.7, id: "in", latency: "N/A", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 42.3,
          id: "au-sydney",
          latency: "349 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "156 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 30.7,
          id: "us-east",
          latency: "87 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "156 ms", name: "União Europeia", price: "Livre" },
        { eur: 20.6, id: "uk", latency: "135 ms", name: "Reino Unido" },
      ],
    },
    name: "Cloud VPS 60 (XXXL) Windows",
    port: "1 Gbit/s",
    ram: "96 GB RAM",
    snapshots: "3 Instantâneos",
    storage: "350 GB NVMe ou SSD 700 GB",
    storageTypes: [
      { id: "ssd-700", name: "700 GB SSD", price: "Livre" },
      { eur: 13.9, id: "ssd-1400", name: "1.4 TB SSD" },
      { id: "nvme-350", name: "350 GB NVMe", price: "Livre" },
      { eur: 11.5, id: "nvme-700", name: "700 GB NVMe" },
    ],
    traffic: "32 TB de tráfego",
    vcpu: "18 núcleos de vCPU",
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
  { id: "apps", label: "Novidade: Aplicativos" },
  { id: "panels", label: "Painéis" },
  { id: "blockchain", label: "Blockchain" },
];

// (Function removed, logic moved up)

const getImages = (planId: string) => {
  const p = getPlanImagePrices(planId);
  return {
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
      {
        icon: "/fluxnode.png",
        id: "flux",
        name: "Flux Node",
        price: "Incluído",
      },
      {
        icon: "/horizen.png",
        id: "horizen",
        name: "Horizen Node",
        price: "Incluído",
      },
    ],
    os: [
      {
        eur: p.windows,
        icon: "/windows.png",
        id: "windows",
        name: "Servidor Windows",
        price: "",
      },
      { icon: "/image.png", id: "ubuntu", name: "Ubuntu", price: "Incluído" },
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
      {
        icon: "/centos-svgrepo-com.svg",
        id: "centos",
        name: "CentOS",
        price: "Incluído",
      },
    ],
    panels: [
      {
        eur: p.cpanel,
        icon: "/cpanel.png",
        id: "cpanel",
        name: "cPanel",
        price: "",
      },
      {
        eur: p.pleskWin,
        icon: "/plesk.png",
        id: "plesk-win",
        name: "Plesk + Windows",
        price: "",
      },
      {
        eur: p.pleskLinux,
        icon: "/plesk.png",
        id: "plesk-linux",
        name: "Plesk + Linux",
        price: "",
      },
    ],
    popular: [
      {
        eur: p.windows,
        icon: "/windows.png",
        id: "windows",
        name: "Servidor Windows",
        price: "",
      },
      { icon: "/image.png", id: "ubuntu", name: "Ubuntu", price: "Incluído" },
      {
        eur: p.cpanel,
        icon: "/cpanel.png",
        id: "cpanel",
        name: "cPanel",
        price: "",
      },
      {
        eur: p.pleskWin,
        icon: "/plesk.png",
        id: "plesk-win",
        name: "Plesk + Windows",
        price: "",
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
    ],
  };
};

export default function ConfigureWindowsVps({
  embedded = false,
}: {
  embedded?: boolean;
} = {}) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = params.id as string;

  // Contabo doesn't have a separate "Windows VPS" configurator — Windows Server is just an
  // OS choice inside the regular Cloud VPS configurator. For the current catalog ids
  // (4/6/8/12/16/18), reuse that configurator with Windows pre-selected instead of
  // duplicating its region/storage/pricing data here. Legacy ids (10/20/30/40) keep the
  // standalone page below.
  useEffect(() => {
    if (isCloudVpsPlanId(planId)) {
      const qs = new URLSearchParams(searchParams.toString());
      qs.set("image", "windows");
      if (!qs.get("duration")) qs.set("duration", "24");
      router.replace(`/vps/configure/${planId}?${qs.toString()}`);
    }
  }, [planId, router, searchParams]);

  const [currentRate, setCurrentRate] = useState(FALLBACK_EUR_RATE);
  const [usdRate, setUsdRate] = useState(1.08);
  const [displayCurrency, setDisplayCurrency] =
    useState<DisplayCurrency>("BRL");

  const plan = plansData[planId as keyof typeof plansData] || plansData["10"];
  const durations = plan.durations;
  const storageTypes = plan.storageTypes;
  const planLocations = (plan as any).locations || {};
  const currentImagePrices = getPlanImagePrices(planId);
  const dynamicImages = getImages(planId);

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
  const [osImage, setOsImage] = useState(sp.get("image") || "windows");
  const [autoBackup, setAutoBackup] = useState(sp.get("backup") !== "false");
  const [showMoreImages, setShowMoreImages] = useState(true);
  const [showUbuntuModal, setShowUbuntuModal] = useState(false);
  const [ubuntuVersion, setUbuntuVersion] = useState(
    sp.get("ubuntuVersion") || "Ubuntu 24.04"
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
  const [showPleskModal, setShowPleskModal] = useState(false);
  const [pleskLicence, setPleskLicence] = useState(
    sp.get("pleskLicence") || "admin"
  );
  const [pleskVersion, setPleskVersion] = useState(
    sp.get("pleskVersion") || "Ubuntu 22.04"
  );
  const [showPleskWindowsModal, setShowPleskWindowsModal] = useState(false);
  const [pleskWinLicence, setPleskWinLicence] = useState(
    sp.get("pleskWinLicence") || "admin"
  );
  const [pleskWinVersion, setPleskWinVersion] = useState(
    sp.get("pleskWinVersion") || "2016"
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
  const [showAdditionalFeatures, setShowAdditionalFeatures] = useState(true);

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
    window.history.replaceState(
      {},
      "",
      `/vps-windows/configure/${planId}?${p.toString()}`
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
    pleskLicence,
    pleskVersion,
    pleskWinLicence,
    pleskWinVersion,
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

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isCloudVpsPlanId(planId)) {
    return null;
  }

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
          className="group mb-6 flex items-center gap-2 font-bold text-base text-sky-400 transition-all hover:text-sky-300"
          href={embedded ? "/vps-plans" : "/vps-windows#plans"}
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Voltar para VPS Windows
        </Link>
        <h1
          className={`font-black text-4xl md:text-5xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight drop-shadow-sm`}
        >
          Configure seu {plan.name}
        </h1>

        {/* Plan Summary Section */}
        <div className="flex flex-wrap items-center gap-10">
          <div
            className={`relative grid flex-1 grid-cols-5 gap-4 rounded-xl border-2 border-sky-500/50 p-8 ${embedded ? "bg-muted/40" : "bg-white/5"} shadow-2xl backdrop-blur-md`}
          >
            <div className="space-y-1">
              <p
                className={`font-bold text-[12px] ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase`}
              >
                CPU
              </p>
              <p className="font-medium text-[13px] leading-tight">
                {plan.vcpu}
              </p>
            </div>
            <div className="space-y-1">
              <p
                className={`font-bold text-[12px] ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase`}
              >
                RAM
              </p>
              <p className="font-medium text-[13px] leading-tight">
                {plan.ram}
              </p>
            </div>
            <div className="space-y-1">
              <p
                className={`font-bold text-[12px] ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase`}
              >
                ARMAZENAMENTO
              </p>
              <p className="font-medium text-[13px] leading-tight">
                {plan.storage}
              </p>
            </div>
            <div className="space-y-1">
              <p
                className={`font-bold text-[12px] ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase`}
              >
                SNAPSHOT
              </p>
              <p className="font-medium text-[13px] leading-tight">
                {plan.snapshots}
              </p>
            </div>
            <div className="space-y-1">
              <p
                className={`font-bold text-[12px] ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase`}
              >
                PORTA
              </p>
              <p className="font-medium text-[13px] leading-tight">
                {plan.port}
              </p>
            </div>
            <Link
              className="absolute right-4 bottom-4 font-bold text-[12px] text-sky-400 uppercase tracking-wider hover:underline"
              href="/vps-windows#plans"
            >
              Mudar
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`font-bold text-[13px] ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-wide`}
            >
              Quantidade de servidores
            </span>
            <Select onValueChange={setQuantity} value={quantity}>
              <SelectTrigger
                className={`h-10 w-16 border ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={`${embedded ? "bg-card" : "bg-[#000B12]"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
              >
                {Array.from({ length: 25 }, (_, i) => i + 1).map(n => (
                  <SelectItem
                    className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
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

        <Separator className={embedded ? "bg-border" : "bg-white/10"} />

        {/* Duration Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2
              className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
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
                      : `${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"}`
                  )}
                  onClick={() => setDuration(d.id)}
                >
                  {d.discount && (
                    <div
                      className={`absolute -top-3 left-6 ${embedded ? "bg-accent" : "bg-white/10"} border px-3 py-1 font-black text-[11px] text-emerald-400 ${embedded ? "border-border" : "border-white/10"} rounded-full uppercase tracking-widest`}
                    >
                      {d.discount}
                    </div>
                  )}
                  <span className="font-medium text-base">{d.label}</span>
                  <div className="text-right">
                    {d.oldEur && (
                      <p className="font-medium text-[12px] text-rose-500 line-through opacity-70">
                        {formatBRLPerMonth(d.oldEur)}
                      </p>
                    )}
                    <p
                      className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"}`}
                    >
                      {formatBRL(d.eur)}{" "}
                      <span
                        className={`font-normal text-sm ${embedded ? "text-muted-foreground" : "text-slate-400"}`}
                      >
                        / mês
                      </span>
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "rounded-b-md py-1.5 text-center font-bold text-[13px] uppercase tracking-wider transition-colors",
                    d.setupEur === 0
                      ? "bg-emerald-500/20 text-emerald-400"
                      : embedded
                        ? "text-muted-foreground"
                        : "text-slate-400"
                  )}
                >
                  {d.setupEur === 0
                    ? "Sem taxa de instalação"
                    : `Taxa de configuração de ${formatBRL(d.setupEur)}`}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator className={embedded ? "bg-border" : "bg-white/10"} />

        {/* Region Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2
              className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
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
                      "relative px-8 py-3 font-bold text-[13px] uppercase tracking-wider transition-colors",
                      regionTab === r.id
                        ? "text-sky-400"
                        : `${embedded ? "text-muted-foreground" : "text-slate-500"} hover:${embedded ? "text-foreground" : "text-white"}`
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
                      `flex w-full items-center justify-between border p-4 font-bold text-sm ${embedded ? "bg-muted/40" : "bg-white/5"} relative rounded-lg backdrop-blur-md transition-all`,
                      location === loc.id
                        ? `border-sky-500 ${embedded ? "bg-accent" : "bg-white/10"}`
                        : embedded
                          ? "border-border"
                          : "border-white/10",
                      loc.recommended && "mt-6"
                    )}
                    key={loc.id}
                    onClick={() => setLocation(loc.id)}
                  >
                    {loc.recommended && (
                      <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-sky-500 px-2 py-0.5 font-black text-[10px] text-white uppercase tracking-widest shadow-lg shadow-sky-500/20 md:px-4 md:py-1 md:text-[11px]">
                        Recomendado - Melhor latência para sua região
                      </div>
                    )}
                    <div
                      className={`flex-1 text-left ${embedded ? "text-foreground" : "text-white"}`}
                    >
                      {loc.name}
                    </div>
                    <div
                      className={`flex-1 text-center ${embedded ? "text-muted-foreground" : "text-slate-400"} font-medium`}
                    >
                      – Latência de {loc.latency}
                    </div>
                    <div
                      className={`flex-1 text-right ${embedded ? "text-foreground" : "text-white"} font-black`}
                    >
                      {loc.eur > 0 ? formatBRLPerMonth(loc.eur) : "Livre"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Separator className={embedded ? "bg-border" : "bg-white/10"} />

        {/* Storage Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2
              className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
            >
              Tipo de armazenamento
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {storageTypes.map((st: any) => (
              <div
                className={cn(
                  `flex cursor-pointer items-center justify-between rounded-lg border p-4 font-bold text-[13px] transition-all ${embedded ? "bg-muted/40" : "bg-white/5"} backdrop-blur-md`,
                  storageType === st.id
                    ? `border-sky-500 ${embedded ? "bg-accent" : "bg-white/10"}`
                    : embedded
                      ? "border-border"
                      : "border-white/10"
                )}
                key={st.id}
                onClick={() => setStorageType(st.id)}
              >
                <span className={embedded ? "text-foreground" : "text-white"}>
                  {st.name}
                </span>
                <span
                  className={cn(
                    st.eur
                      ? `${embedded ? "text-foreground" : "text-white"} font-black`
                      : "text-emerald-400"
                  )}
                >
                  {st.eur ? formatBRLPerMonth(st.eur) : st.price}
                </span>
              </div>
            ))}
          </div>
        </section>

        <Separator className={embedded ? "bg-border" : "bg-white/10"} />

        {/* Image Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2
              className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
            >
              Imagem (Windows Server Incluso)
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
                <div
                  className={`flex justify-center border-b ${embedded ? "border-border" : "border-white/10"}`}
                >
                  {imageCategories.map(cat => (
                    <button
                      className={cn(
                        "relative px-8 py-3 font-bold text-[13px] transition-colors",
                        imageCategory === cat.id
                          ? "text-sky-400"
                          : `${embedded ? "text-muted-foreground" : "text-slate-500"} hover:${embedded ? "text-foreground" : "text-white"}`
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
                    dynamicImages[
                      imageCategory as keyof typeof dynamicImages
                    ] || []
                  ).map((img: any) => (
                    <button
                      className={cn(
                        `flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${embedded ? "bg-muted/40" : "bg-white/5"} backdrop-blur-md`,
                        osImage === img.id
                          ? `border-sky-500 ${embedded ? "bg-accent" : "bg-white/10"}`
                          : embedded
                            ? "border-border"
                            : "border-white/10"
                      )}
                      key={img.id}
                      onClick={() => {
                        if (img.id === "windows") setShowWindowsModal(true);
                        if (img.id === "plesk-linux") setShowPleskModal(true);
                        if (img.id === "plesk-win")
                          setShowPleskWindowsModal(true);
                        if (img.id === "cpanel") setShowCpanelModal(true);
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
                            className={
                              embedded
                                ? "text-muted-foreground"
                                : "text-slate-500"
                            }
                            size={16}
                          />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p
                          className={`font-bold text-[13px] ${embedded ? "text-foreground" : "text-white"}`}
                        >
                          {img.name}
                        </p>
                        <p
                          className={`text-[12px] ${embedded ? "text-muted-foreground" : "text-slate-400"} font-medium uppercase tracking-wide`}
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

        <Separator className={embedded ? "bg-border" : "bg-white/10"} />

        {/* Data Protection Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2
              className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
            >
              Proteção de Dados com Backup Automático
            </h2>
          </div>

          <div
            className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-12 ${embedded ? "bg-muted/40" : "bg-white/5"} rounded-2xl border p-10 ${embedded ? "border-border" : "border-white/10"} shadow-2xl backdrop-blur-md`}
          >
            <div className="flex flex-col items-center gap-4 md:flex-row lg:col-span-5">
              <div className="relative h-64 w-64 flex-shrink-0">
                <img
                  alt="Backup Shield"
                  className="h-auto w-64 object-contain"
                  src="/4870961_54433-nobg.svg"
                />
              </div>

              <div className="flex-1">
                <ul className="space-y-4">
                  {[
                    "Backups automáticos diários.",
                    "Recuperação instantânea com 1 clique.",
                    "Mantém as últimas 10 versões de backup.",
                    "Nenhuma configuração necessária.",
                  ].map((text, i) => (
                    <li
                      className={`flex items-center gap-3 font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-200"} uppercase leading-snug tracking-tight`}
                      key={i}
                    >
                      <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(0,163,255,0.5)]" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-7">
              <div
                className={cn(
                  `relative flex w-full cursor-pointer flex-col justify-center gap-2 rounded-xl border p-8 text-center transition-all md:w-64 ${embedded ? "bg-muted/40" : "bg-white/5"} backdrop-blur-md`,
                  autoBackup
                    ? `border-sky-500 ${embedded ? "bg-accent" : "bg-white/10"} shadow-lg shadow-sky-500/20`
                    : embedded
                      ? "border-border"
                      : "border-white/10"
                )}
                onClick={() => setAutoBackup(true)}
              >
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 ${embedded ? "bg-card" : "bg-[#000B12]"} whitespace-nowrap rounded-full border border-sky-500/30 px-2 py-0.5 font-black text-[10px] text-sky-400 uppercase tracking-widest md:px-4 md:py-1 md:text-[12px]`}
                >
                  Nossa Recomendação
                </div>
                <p
                  className={`font-black text-lg ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Backup Automático
                </p>
                <p
                  className={`font-black text-2xl ${embedded ? "text-foreground" : "text-white"}`}
                >
                  {formatBRLPerMonth(1.5)}
                </p>
                <p
                  className={`text-[13px] ${embedded ? "text-muted-foreground" : "text-slate-400"} font-medium uppercase leading-tight tracking-wider`}
                >
                  Ative e esqueça.
                  <br />
                  Segurança de dados sem esforço.
                </p>
              </div>

              <div
                className={cn(
                  `flex w-full cursor-pointer items-center justify-center rounded-xl border p-8 text-center transition-all md:w-64 ${embedded ? "bg-muted/40" : "bg-white/5"} backdrop-blur-md`,
                  !autoBackup
                    ? `border-sky-500 ${embedded ? "bg-accent" : "bg-white/10"}`
                    : embedded
                      ? "border-border"
                      : "border-white/10"
                )}
                onClick={() => setAutoBackup(false)}
              >
                <p
                  className={`font-black text-lg ${embedded ? "text-muted-foreground" : "text-slate-500"} uppercase tracking-tight`}
                >
                  Sem Proteção de Dados
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator className={embedded ? "bg-border" : "bg-white/10"} />

        {/* Additional Features Section */}
        <section
          className={`${embedded ? "bg-muted/40" : "bg-white/5"} rounded-2xl border p-8 backdrop-blur-md ${embedded ? "border-border" : "border-white/10"} shadow-2xl`}
        >
          <div className="">
            <div className="mb-8 flex items-center justify-between">
              <h2
                className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
              >
                Recursos Adicionais
              </h2>
              <button
                className={`flex items-center gap-1 font-black text-[14px] ${embedded ? "text-foreground" : "text-white"} uppercase tracking-wider`}
                onClick={() =>
                  setShowAdditionalFeatures(!showAdditionalFeatures)
                }
              >
                {showAdditionalFeatures ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
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
                  <div className="space-y-10">
                    <div
                      className={`flex flex-col gap-6 border-b md:flex-row md:items-center ${embedded ? "border-border" : "border-white/10"} pb-8`}
                    >
                      <div className="w-48 shrink-0">
                        <h3
                          className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
                        >
                          Rede
                        </h3>
                      </div>
                      <div className="flex-1 space-y-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                          <div className="flex w-48 items-center gap-2">
                            <span
                              className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
                            >
                              Rede Privada
                            </span>
                          </div>
                          <Select
                            onValueChange={setPrivateNetwork}
                            value={privateNetwork}
                          >
                            <SelectTrigger
                              className={`h-12 w-full md:w-[480px] ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              <SelectValue placeholder="Selecione a rede" />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "bg-card" : "bg-[#000B12]"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              <SelectItem value="none">
                                Sem Rede Privada
                              </SelectItem>
                              <SelectItem value="enabled">
                                <div className="flex w-[440px] justify-between">
                                  <span>Rede Privada Ativada</span>
                                  <span
                                    className={
                                      embedded
                                        ? "font-bold text-foreground"
                                        : "font-bold text-white"
                                    }
                                  >
                                    {formatBRLPerMonth(2.29)}
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div
                          className={`flex flex-col gap-4 border-t md:flex-row md:items-center ${embedded ? "border-border" : "border-white/10"} pt-6`}
                        >
                          <div className="flex w-48 items-center gap-2">
                            <span
                              className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
                            >
                              Largura de Banda
                            </span>
                          </div>
                          <div
                            className={`h-12 border md:w-[480px] ${embedded ? "border-border" : "border-white/10"} flex flex-col justify-center rounded-md px-4 ${embedded ? "bg-muted/40" : "bg-white/5"}`}
                          >
                            <span
                              className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                            >
                              Tráfego Ilimitado
                            </span>
                            <p
                              className={`text-[13px] ${embedded ? "text-muted-foreground" : "text-slate-400"} font-medium uppercase tracking-widest`}
                            >
                              Política de Uso Justo
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                          <div className="flex w-48 items-center gap-2">
                            <span
                              className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
                            >
                              IPv4
                            </span>
                          </div>
                          <Select
                            onValueChange={setIpv4Address}
                            value={ipv4Address}
                          >
                            <SelectTrigger
                              className={`h-12 w-full md:w-[480px] ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              <SelectValue placeholder="Selecione o IP" />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "bg-card" : "bg-[#000B12]"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              <SelectItem value="1ip">
                                <div className="flex w-[440px] items-center justify-between">
                                  <span>1 Endereço IP</span>
                                  <span className="font-bold text-emerald-500">
                                    Grátis
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value="2ip">
                                <div className="flex w-[440px] items-center justify-between">
                                  <span>1 Endereço IP + 1 IP Adicional</span>
                                  <span className="font-bold">
                                    {formatBRLPerMonth(
                                      plan.additionalIpEur || 3.5
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                      <div className="w-48 shrink-0 pt-2">
                        <h3
                          className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
                        >
                          Complementos
                        </h3>
                      </div>
                      <div className="flex-1 space-y-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                          <div className="flex w-48 items-center gap-2">
                            <span
                              className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
                            >
                              Armazenamento de Objetos
                            </span>
                          </div>
                          <Select
                            onValueChange={setObjectStorage}
                            value={objectStorage}
                          >
                            <SelectTrigger
                              className={`h-12 w-full md:w-[480px] ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              <SelectValue placeholder="Selecione o armazenamento" />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "bg-card" : "bg-[#000B12]"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              <SelectItem
                                className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                value="none"
                              >
                                Nenhum
                              </SelectItem>
                              {(plan.objectStorageTiers || []).map(
                                (tier: any) => (
                                  <SelectItem
                                    className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                    key={tier.id}
                                    value={tier.id}
                                  >
                                    <div className="flex w-[440px] justify-between">
                                      <span>{tier.name} na União Europeia</span>
                                      <span
                                        className={
                                          embedded
                                            ? "font-bold text-foreground"
                                            : "font-bold text-white"
                                        }
                                      >
                                        {formatBRLPerMonth(tier.eur)}
                                      </span>
                                    </div>
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                          <div className="flex w-48 items-center gap-2">
                            <span
                              className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
                            >
                              Gerenciamento
                            </span>
                          </div>
                          <Select
                            onValueChange={setServerManagement}
                            value={serverManagement}
                          >
                            <SelectTrigger
                              className={`h-12 w-full md:w-[480px] ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              <SelectValue placeholder="Selecione o gerenciamento" />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "bg-card" : "bg-[#000B12]"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              <SelectItem value="unmanaged">
                                <div className="flex w-[440px] justify-between">
                                  <span>Não Gerenciado</span>
                                  <span className="font-bold text-emerald-500">
                                    Grátis
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value="managed">
                                <div className="flex w-[440px] justify-between">
                                  <span>Gerenciado</span>
                                  <span className="font-bold">
                                    {formatBRLPerMonth(109.99)}
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                          <div className="flex w-48 items-center gap-2">
                            <span
                              className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
                            >
                              Monitoramento
                            </span>
                          </div>
                          <Select
                            onValueChange={setMonitoring}
                            value={monitoring}
                          >
                            <SelectTrigger
                              className={`h-12 w-full md:w-[480px] ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              <SelectValue placeholder="Selecione o monitoramento" />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "bg-card" : "bg-[#000B12]"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              <SelectItem
                                className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                value="none"
                              >
                                Nenhum
                              </SelectItem>
                              <SelectItem
                                className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                value="full"
                              >
                                <div className="flex w-[440px] justify-between">
                                  <span>Monitoramento Completo</span>
                                  <span
                                    className={
                                      embedded
                                        ? "font-bold text-foreground"
                                        : "font-bold text-white"
                                    }
                                  >
                                    {formatBRLPerMonth(11.49)}
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

        <Separator className={embedded ? "bg-border" : "bg-white/10"} />

        {/* Login and Password Section */}
        <section
          className={`${embedded ? "bg-muted/40" : "bg-white/5"} rounded-2xl border p-8 backdrop-blur-md ${embedded ? "border-border" : "border-white/10"} shadow-2xl`}
        >
          <h2
            className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} mb-8 uppercase tracking-widest`}
          >
            Login e senha para seu servidor
          </h2>
          <div className="max-w-3xl space-y-8">
            {/* Username */}
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
              <div className="md:col-span-3">
                <span
                  className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-widest`}
                >
                  Usuário
                </span>
              </div>
              <div className="md:col-span-9">
                <span
                  className={`${embedded ? "text-foreground" : "text-white"} font-black text-lg uppercase tracking-widest`}
                >
                  Administrador / root
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="pt-3 md:col-span-3">
                <span
                  className={`font-bold text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-widest`}
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
                      `h-12 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"} pr-12 focus:border-sky-500`,
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
                    className={`absolute top-1/2 right-4 -translate-y-1/2 ${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} transition-colors`}
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
                        Senha inválida (Mín. 8 caracteres, maiúscula, número e
                        símbolo)
                      </span>
                    </div>
                  )}
                {isPasswordValid(password) && (
                  <div className="mt-1 flex items-center gap-2 font-bold text-emerald-500 text-sm">
                    <Check size={14} />
                    <span>Senha forte e segura</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Windows Modal */}
      <AnimatePresence>
        {showWindowsModal && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
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
                  className={`font-black text-2xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Windows Server
                </h2>
              </div>
              <div className="space-y-4">
                <label
                  className={`font-bold text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-widest`}
                >
                  Versão (Inclusa)
                </label>
                <Select
                  onValueChange={setWindowsVersion}
                  value={windowsVersion}
                >
                  <SelectTrigger
                    className={`h-14 ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                  >
                    <SelectValue>
                      <div className="flex w-full items-center justify-between pr-4 text-sm">
                        <span>Windows Server {windowsVersion} Datacenter</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              embedded
                                ? "font-black text-foreground"
                                : "font-black text-white"
                            }
                          >
                            {formatBRLPerMonth(
                              windowsVersion === "2016"
                                ? currentImagePrices.win2016
                                : currentImagePrices.windows
                            )}
                          </span>
                          <span
                            className={
                              embedded
                                ? "text-muted-foreground"
                                : "text-slate-500"
                            }
                          >
                            |
                          </span>
                          <span
                            className={
                              embedded
                                ? "text-muted-foreground"
                                : "text-slate-500"
                            }
                          >
                            Sem taxa de instalação
                          </span>
                        </div>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "bg-card" : "bg-[#000B12]"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                  >
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="2025"
                    >
                      <div className="flex w-full flex-1 items-center justify-between gap-4 text-sm md:w-[480px]">
                        <span>Windows Server 2025 Datacenter</span>
                        <span className="ml-auto font-black text-sky-400">
                          {formatBRL(currentImagePrices.windows)}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="2022"
                    >
                      <div className="flex w-full items-center justify-between text-sm md:w-[480px]">
                        <span>Windows Server 2022 Datacenter</span>
                        <span
                          className={
                            embedded
                              ? "font-black text-foreground"
                              : "font-black text-white"
                          }
                        >
                          {formatBRL(currentImagePrices.windows)}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="2019"
                    >
                      <div className="flex w-full items-center justify-between text-sm md:w-[480px]">
                        <span>Windows Server 2019 Datacenter</span>
                        <span
                          className={
                            embedded
                              ? "font-black text-foreground"
                              : "font-black text-white"
                          }
                        >
                          {formatBRL(currentImagePrices.windows)}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="2016"
                    >
                      <div className="flex w-full items-center justify-between text-sm md:w-[480px]">
                        <span>Windows Server 2016 Datacenter</span>
                        <span
                          className={
                            embedded
                              ? "font-black text-foreground"
                              : "font-black text-white"
                          }
                        >
                          {formatBRL(currentImagePrices.win2016)}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
                  onClick={() => setShowWindowsModal(false)}
                  variant="ghost"
                >
                  Fechar
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

      <AnimatePresence>
        {showPleskModal && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowPleskModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-8 rounded-2xl border p-10 shadow-2xl ${embedded ? "border-border" : "border-white/10"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img alt="Plesk" className="h-10 w-10" src="/plesk.png" />
                <h2
                  className={`font-black text-2xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Plesk + Linux
                </h2>
              </div>

              <div className="space-y-4">
                <label
                  className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-widest`}
                >
                  Licença
                </label>
                <Select onValueChange={setPleskLicence} value={pleskLicence}>
                  <SelectTrigger
                    className={`h-16 ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                  >
                    <SelectValue>
                      <div className="flex w-full items-center justify-between pr-4 text-sm">
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-sky-400">
                            {pleskLicence === "admin"
                              ? "Plesk Obsidian Web Admin Edition"
                              : pleskLicence === "host"
                                ? "Plesk Obsidian Web Host Edition"
                                : "Plesk Obsidian Web Pro Edition"}{" "}
                            1 mês
                          </span>
                          <span className="font-bold text-emerald-500 uppercase tracking-widest">
                            free
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              embedded
                                ? "font-black text-foreground"
                                : "font-black text-white"
                            }
                          >
                            {formatBRLPerMonth(
                              pleskLicence === "admin"
                                ? currentImagePrices.pleskLinux
                                : pleskLicence === "host"
                                  ? currentImagePrices.pleskHost
                                  : currentImagePrices.pleskPro
                            )}
                          </span>
                        </div>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "bg-card" : "bg-[#000B12]"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"} z-[120]`}
                  >
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="admin"
                    >
                      <div className="flex w-full flex-1 items-center justify-between gap-4 py-1 md:w-[480px]">
                        <div className="flex flex-col">
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                          >
                            Plesk Obsidian Web Admin Edition
                          </span>
                          <span className="font-black text-emerald-500 text-sm uppercase">
                            1 mês grátis
                          </span>
                        </div>
                        <span className="ml-auto font-black text-sky-400">
                          {formatBRL(currentImagePrices.pleskLinux)}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="host"
                    >
                      <div className="flex w-full items-center justify-between py-1 md:w-[480px]">
                        <div className="flex flex-col">
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                          >
                            Plesk Obsidian Web Host Edition
                          </span>
                          <span className="font-black text-emerald-500 text-sm uppercase">
                            1 mês grátis
                          </span>
                        </div>
                        <span
                          className={
                            embedded
                              ? "font-black text-foreground"
                              : "font-black text-white"
                          }
                        >
                          {formatBRL(currentImagePrices.pleskHost)}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="pro"
                    >
                      <div className="flex w-full items-center justify-between py-1 md:w-[480px]">
                        <div className="flex flex-col">
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                          >
                            Plesk Obsidian Web Pro Edition
                          </span>
                          <span className="font-black text-emerald-500 text-sm uppercase">
                            1 mês grátis
                          </span>
                        </div>
                        <span
                          className={
                            embedded
                              ? "font-black text-foreground"
                              : "font-black text-white"
                          }
                        >
                          {formatBRL(currentImagePrices.pleskPro)}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="space-y-3">
                  <label
                    className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-widest`}
                  >
                    Versão
                  </label>
                  <Select onValueChange={setPleskVersion} value={pleskVersion}>
                    <SelectTrigger
                      className={`h-14 ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "bg-card" : "bg-[#000B12]"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"} z-[120]`}
                    >
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        value="Ubuntu 22.04"
                      >
                        Ubuntu 22.04
                      </SelectItem>
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        value="AlmaLinux 9"
                      >
                        AlmaLinux 9
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} hover:${embedded ? "bg-accent" : "bg-white/10"} uppercase tracking-widest`}
                  onClick={() => setShowPleskModal(false)}
                  variant="ghost"
                >
                  Fechar
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
      </AnimatePresence>
      {/* Plesk Windows Modal */}
      <AnimatePresence>
        {showPleskWindowsModal && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
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
                  className={`font-black text-2xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Plesk + Windows
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label
                    className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-widest`}
                  >
                    Licença
                  </label>
                  <Select
                    onValueChange={setPleskWinLicence}
                    value={pleskWinLicence}
                  >
                    <SelectTrigger
                      className={`h-16 ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                    >
                      <SelectValue>
                        <div className="flex w-full items-center justify-between pr-4 text-base leading-tight">
                          <div className="flex flex-col text-left">
                            <span
                              className={
                                embedded
                                  ? "font-bold text-foreground"
                                  : "font-bold text-white"
                              }
                            >
                              {pleskWinLicence === "admin"
                                ? "Plesk Obsidian Web Admin Edition"
                                : pleskWinLicence === "host"
                                  ? "Plesk Obsidian Web Host Edition"
                                  : "Plesk Obsidian Web Pro Edition"}
                            </span>
                            <span className="font-bold text-[13px] text-emerald-400 uppercase tracking-wider">
                              1 mês grátis
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-2 ${embedded ? "text-muted-foreground" : "text-slate-400"} font-bold text-sm`}
                          >
                            <span>
                              {formatBRLPerMonth(
                                pleskWinLicence === "admin"
                                  ? currentImagePrices.pleskWin
                                  : pleskWinLicence === "host"
                                    ? currentImagePrices.pleskHost
                                    : currentImagePrices.pleskPro
                              )}
                            </span>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "bg-card" : "bg-[#000B12]"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"} z-[120]`}
                    >
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        value="admin"
                      >
                        <div className="flex w-full flex-1 items-center justify-between gap-4 py-1 md:w-[480px]">
                          <div className="flex flex-col">
                            <span className="font-bold text-sky-400">
                              Plesk Obsidian Web Admin Edition
                            </span>
                            <span className="font-bold text-[13px] text-emerald-400 uppercase">
                              1 mês grátis
                            </span>
                          </div>
                          <span className="ml-auto font-black text-sky-400">
                            {formatBRL(currentImagePrices.pleskWin)}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        value="host"
                      >
                        <div className="flex w-full items-center justify-between py-1 md:w-[480px]">
                          <div className="flex flex-col">
                            <span
                              className={
                                embedded
                                  ? "font-bold text-foreground"
                                  : "font-bold text-white"
                              }
                            >
                              Plesk Obsidian Web Host Edition
                            </span>
                            <span className="font-bold text-[13px] text-emerald-400 uppercase">
                              1 mês grátis
                            </span>
                          </div>
                          <span
                            className={
                              embedded
                                ? "font-black text-foreground"
                                : "font-black text-white"
                            }
                          >
                            {formatBRL(currentImagePrices.pleskHost)}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        value="pro"
                      >
                        <div className="flex w-full items-center justify-between py-1 md:w-[480px]">
                          <div className="flex flex-col">
                            <span
                              className={
                                embedded
                                  ? "font-bold text-foreground"
                                  : "font-bold text-white"
                              }
                            >
                              Plesk Obsidian Web Pro Edition
                            </span>
                            <span className="font-bold text-[13px] text-emerald-400 uppercase">
                              1 mês grátis
                            </span>
                          </div>
                          <span
                            className={
                              embedded
                                ? "font-black text-foreground"
                                : "font-black text-white"
                            }
                          >
                            {formatBRL(currentImagePrices.pleskPro)}
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label
                    className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-widest`}
                  >
                    Versão Windows
                  </label>
                  <Select
                    onValueChange={setPleskWinVersion}
                    value={pleskWinVersion}
                  >
                    <SelectTrigger
                      className={`h-16 ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                    >
                      <SelectValue>
                        <div className="flex w-full items-center justify-between pr-4 text-base">
                          <span
                            className={
                              embedded
                                ? "font-bold text-foreground"
                                : "font-bold text-white"
                            }
                          >
                            Windows Server {pleskWinVersion} Datacenter
                          </span>
                          <div className="flex items-center gap-2 font-black text-sky-400 text-sm">
                            <span>
                              {formatBRLPerMonth(
                                pleskWinVersion === "2016"
                                  ? currentImagePrices.win2016
                                  : currentImagePrices.windows
                              )}
                            </span>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-[120]">
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        value="2016"
                      >
                        <div className="flex w-full flex-1 items-center justify-between gap-4 py-1 md:w-[480px]">
                          <span
                            className={
                              embedded
                                ? "font-bold text-foreground"
                                : "font-bold text-white"
                            }
                          >
                            Windows Server 2016 Datacenter
                          </span>
                          <span className="ml-auto font-black text-sky-400">
                            {formatBRL(currentImagePrices.win2016)}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        value="2019"
                      >
                        <div className="flex w-full items-center justify-between py-1 md:w-[480px]">
                          <span
                            className={
                              embedded
                                ? "font-bold text-foreground"
                                : "font-bold text-white"
                            }
                          >
                            Windows Server 2019 Datacenter
                          </span>
                          <span
                            className={
                              embedded
                                ? "font-black text-foreground"
                                : "font-black text-white"
                            }
                          >
                            {formatBRL(currentImagePrices.windows)}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        value="2022"
                      >
                        <div className="flex w-full items-center justify-between py-1 md:w-[480px]">
                          <span
                            className={
                              embedded
                                ? "font-bold text-foreground"
                                : "font-bold text-white"
                            }
                          >
                            Windows Server 2022 Datacenter
                          </span>
                          <span
                            className={
                              embedded
                                ? "font-black text-foreground"
                                : "font-black text-white"
                            }
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
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} hover:${embedded ? "bg-accent" : "bg-white/10"} uppercase tracking-widest`}
                  onClick={() => setShowPleskWindowsModal(false)}
                  variant="ghost"
                >
                  Fechar
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
      </AnimatePresence>

      {/* cPanel Modal */}
      <AnimatePresence>
        {showCpanelModal && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
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
                  className={`font-black text-2xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  cPanel & WHM
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label
                    className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-widest`}
                  >
                    Licença
                  </label>
                  <Select
                    onValueChange={setCpanelLicence}
                    value={cpanelLicence}
                  >
                    <SelectTrigger
                      className={`h-16 ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                    >
                      <SelectValue>
                        <div
                          className={`flex w-full items-center justify-between pr-4 font-bold text-sm ${embedded ? "text-foreground" : "text-white"}`}
                        >
                          <span>{cpanelLicence} contas</span>
                          <span>
                            {formatBRLPerMonth(currentImagePrices.cpanel)}
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "bg-card" : "bg-[#000B12]"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"} z-[120]`}
                    >
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        value="5"
                      >
                        5 contas
                      </SelectItem>
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        value="30"
                      >
                        30 contas
                      </SelectItem>
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        value="50"
                      >
                        50 contas
                      </SelectItem>
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        value="100"
                      >
                        100 contas
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label
                    className={`font-black text-base ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-widest`}
                  >
                    Versão
                  </label>
                  <Select
                    onValueChange={setCpanelVersion}
                    value={cpanelVersion}
                  >
                    <SelectTrigger
                      className={`h-14 ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "bg-card" : "bg-[#000B12]"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"} z-[120]`}
                    >
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        value="Ubuntu 22.04"
                      >
                        Ubuntu 22.04
                      </SelectItem>
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        value="AlmaLinux 9"
                      >
                        AlmaLinux 9
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} hover:${embedded ? "bg-accent" : "bg-white/10"} uppercase tracking-widest`}
                  onClick={() => setShowCpanelModal(false)}
                  variant="ghost"
                >
                  Fechar
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
      </AnimatePresence>

      {/* Fixed Bottom Summary Bar */}
      <div
        className={`${embedded ? "sticky" : "fixed right-0 left-0"} bottom-0 ${embedded ? "bg-background/90" : "bg-[#000B12]/90"} border-t ${embedded ? "border-border" : "border-white/10"} z-[100] pr-16 shadow-[0_-4px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl md:pr-0`}
      >
        <AnimatePresence>
          {showSummaryDetails && (
            <motion.div
              animate={{ height: "auto", opacity: 1 }}
              className={`overflow-hidden border-b ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} backdrop-blur-md`}
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
            >
              <div className="mx-auto max-w-6xl px-10 py-6">
                <h3
                  className={`font-black text-base ${embedded ? "text-foreground" : "text-white"} mb-4 uppercase tracking-widest`}
                >
                  Detalhamento do Pedido
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

                    const stype = storageTypes.find(
                      (s: any) => s.id === storageType
                    );
                    if (stype?.eur)
                      items.push({
                        label: `Upgrade de Disco: ${stype.name}`,
                        price: stype.eur * durMonths * qty * currentRate,
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
                        planId === "50" ||
                        planId === "60"
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
                      const tier = plan.objectStorageTiers.find(
                        (t: any) => t.id === objectStorage
                      );
                      if (tier)
                        items.push({
                          label: `Object Storage (${tier.name})`,
                          price: tier.eur * durMonths * qty * currentRate,
                        });
                    }

                    if (serverManagement === "managed")
                      items.push({
                        label: "Gerenciado",
                        price: 109.99 * durMonths * qty * currentRate,
                      });

                    if (monitoring === "full")
                      items.push({
                        label: "Monitoramento",
                        price: 11.49 * durMonths * qty * currentRate,
                      });

                    // Image Pricing
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
                      items.push({
                        label: "cPanel License",
                        price:
                          currentImagePrices.cpanel *
                          durMonths *
                          qty *
                          currentRate,
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
                        label: `Plesk License (${pleskLicence})`,
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
                          className={
                            embedded
                              ? "font-medium text-muted-foreground"
                              : "font-medium text-slate-400"
                          }
                        >
                          {item.label}
                        </span>
                        <span
                          className={
                            embedded
                              ? "font-black text-foreground"
                              : "font-black text-white"
                          }
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
                  className={`font-black ${embedded ? "text-foreground" : "text-white"} text-sm uppercase leading-tight tracking-widest md:text-lg`}
                >
                  Resumo
                </h3>
                <button
                  className={`p-1 hover:${embedded ? "bg-accent" : "bg-white/10"} rounded-full transition-colors`}
                  onClick={() => setShowSummaryDetails(!showSummaryDetails)}
                >
                  {showSummaryDetails ? (
                    <ChevronDown className="h-5 w-5 text-sky-400" />
                  ) : (
                    <ChevronUp className="h-5 w-5 text-sky-400" />
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

              // Base Price Logic
              const basePriceMonthlyEur = selectedDur.eur;

              // Setup Fee Logic
              const setupFeeEur = selectedDur.setupEur || 0;

              let additionalEur = 0;
              const loc = Object.values(planLocations)
                .flat()
                .find((l: any) => l.id === location) as any;

              if (loc?.eur) {
                additionalEur += loc.eur;
              }

              const stype = storageTypes.find((s: any) => s.id === storageType);
              if (stype?.eur) {
                additionalEur += stype.eur;
              }

              if (autoBackup) {
                additionalEur += plan.backupEur;
              }

              if (privateNetwork === "enabled") {
                const pnEur =
                  planId === "20" ||
                  planId === "30" ||
                  planId === "40" ||
                  planId === "50" ||
                  planId === "60"
                    ? plan.privateNetworkEur
                    : 0;
                additionalEur += pnEur;
              }

              if (ipv4Address === "2ip") {
                additionalEur += plan.additionalIpEur;
              }

              if (objectStorage !== "none") {
                const tier = plan.objectStorageTiers.find(
                  (t: any) => t.id === objectStorage
                );
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
                additionalEur +=
                  windowsVersion === "2016"
                    ? currentImagePrices.win2016
                    : currentImagePrices.windows;
              } else if (osImage === "cpanel") {
                additionalEur += currentImagePrices.cpanel;
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
                    ? currentImagePrices.pleskLinux
                    : pleskWinLicence === "host"
                      ? currentImagePrices.pleskHost
                      : currentImagePrices.pleskPro;
                const verEur =
                  pleskWinVersion === "2016"
                    ? currentImagePrices.win2016
                    : currentImagePrices.windows;
                additionalEur += licEur + verEur;
              }

              const totalMonthly =
                (basePriceMonthlyEur + additionalEur) * currentRate;
              const dueToday =
                totalMonthly * durMonths * qty +
                setupFeeEur * currentRate * qty;

              return (
                <div className="flex items-center gap-4 md:gap-6 lg:gap-10">
                  <div className="flex min-w-0 flex-col gap-0.5 md:min-w-[200px] md:gap-1">
                    <div className="hidden items-center justify-between text-[13px] uppercase tracking-widest md:flex">
                      <span
                        className={
                          embedded
                            ? "font-bold text-muted-foreground"
                            : "font-bold text-slate-400"
                        }
                      >
                        Mensal
                      </span>
                      <span
                        className={`font-black ${embedded ? "text-foreground" : "text-white"} whitespace-nowrap`}
                      >
                        {formatBRL((totalMonthly * qty) / currentRate)}
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
                        {formatBRL(dueToday / currentRate)}
                      </span>
                    </div>
                  </div>
                  <Button
                    className={cn(
                      "h-9 rounded-lg px-3 font-black text-sm uppercase tracking-widest shadow-xl transition-all md:h-14 md:px-12 md:text-xl",
                      isPasswordValid(password)
                        ? "bg-sky-500 text-white shadow-sky-500/20 hover:bg-sky-400"
                        : `${embedded ? "bg-muted" : "bg-white/10"} ${embedded ? "text-muted-foreground" : "text-slate-500"} cursor-not-allowed`
                    )}
                    disabled={!isPasswordValid(password)}
                    onClick={() =>
                      router.push(
                        `/checkout/personal-data?planId=${planId}&qty=${quantity}&duration=${duration}&location=${location}&image=${osImage}&password=${encodeURIComponent(password)}&storage=${storageType}&type=vps-windows`
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
    </div>
  );
}
