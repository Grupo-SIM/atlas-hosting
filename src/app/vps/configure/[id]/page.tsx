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
import { Roboto } from "next/font/google";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

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
import {
  getCloudVpsMonthlyEuro,
  getCloudVpsOldMonthlyEuro,
  getCloudVpsPlan,
} from "@/lib/vps-catalog";
import { convertVpsPriceFromEuro } from "@/lib/vps-price-display";
import { Navbar } from "../../../landing/components/Navbar";

// Mock data for plans
const plansData: Record<string, any> = {
  "10": {
    additionalIpEur: 7.0,
    backupEur: 3.0,
    basePrice: 42.19,
    durations: [
      {
        discount: null,
        eur: 9.0,
        id: "1",
        label: "1 mês",
        setupEur: 9.0,
        setupFee: "Taxa de instalação de € 9,00",
      },
      {
        discount: "ECONOMIZE 10%",
        eur: 8.1,
        id: "6",
        label: "6 meses",
        oldEur: 9.0,
        setupEur: 4.5,
        setupFee: "Taxa de instalação de € 4,50",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 7.2,
        id: "12",
        label: "12 meses",
        oldEur: 9.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    locations: {
      america: [
        {
          eur: 1.9,
          id: "us-central",
          latency: "118 ms",
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
          latency: "146 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 4.3, id: "sg", latency: "304 ms", name: "Ásia (Singapura)" },
        { eur: 4.7, id: "jp", latency: "232 ms", name: "Ásia (Japão)" },
        { eur: 4.3, id: "in", latency: "286 ms", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 3.9,
          id: "au-sydney",
          latency: "306 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "146 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 2.8,
          id: "us-east",
          latency: "87 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "146 ms", name: "União Europeia", price: "Livre" },
        { eur: 1.9, id: "uk", latency: "132 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 219.98,
    name: "Cloud VPS 10",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    privateNetworkEur: 4.58,
    ram: "8 GB de RAM",
    rate: 5.86,
    snapshots: "1 Instantâneo",
    storage: "75 GB NVMe ou SSD de 150 GB",
    storageTypes: [
      { id: "ssd-150", name: "SSD de 150 GB", price: "Livre" },
      { eur: 3.1, id: "ssd-300", name: "SSD de 300 GB" },
      { id: "nvme-75", name: "NVMe de 75 GB", price: "Livre" },
      { eur: 3.7, id: "nvme-150", name: "NVMe de 150 GB" },
    ],
    traffic: "Porta de 200 Mbit/s",
    vcpu: "4 núcleos de vCPU",
  },
  "20": {
    additionalIpEur: 7.0,
    backupEur: 4.0,
    basePrice: 65.63,
    durations: [
      {
        discount: null,
        eur: 14.0,
        id: "1",
        label: "1 mês",
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 10%",
        eur: 12.6,
        id: "6",
        label: "6 meses",
        oldEur: 14.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 11.2,
        id: "12",
        label: "12 meses",
        oldEur: 14.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    images: {
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
        {
          icon: "/docker.png",
          id: "docker",
          name: "Docker",
          price: "Incluído",
        },
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
        { icon: "/image.png", id: "ubuntu", name: "Ubuntu", price: "Incluído" },
        {
          eur: 31.0,
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
        { eur: 43.5, icon: "/cpanel.png", id: "cpanel", name: "cPanel" },
        {
          eur: 32.0,
          icon: "/plesk.png",
          id: "plesk-win",
          name: "Plesk + Windows",
        },
        {
          eur: 24.0,
          icon: "/plesk.png",
          id: "plesk-linux",
          name: "Plesk + Linux",
        },
        {
          icon: "/webmin.png",
          id: "webmin",
          name: "Webmin",
          price: "Incluído",
        },
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
          eur: 31.0,
          icon: "/windows.png",
          id: "windows",
          name: "Servidor Windows",
        },
        { eur: 43.5, icon: "/cpanel.png", id: "cpanel", name: "cPanel" },
        {
          icon: "/centos-svgrepo-com.svg",
          id: "rhel",
          name: "RHEL Variants",
          price: "Incluído",
        },
        { eur: 24.0, icon: "/plesk.png", id: "plesk", name: "Plesk + Linux" },
      ],
    },
    locations: {
      america: [
        {
          eur: 2.9,
          id: "us-central",
          latency: "119 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 2.9,
          id: "us-east",
          latency: "89 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 3.7,
          id: "us-west",
          latency: "147 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 8.9, id: "sg", latency: "348 ms", name: "Ásia (Singapura)" },
        { eur: 8.9, id: "jp", latency: "275 ms", name: "Ásia (Japão)" },
        { eur: 8.9, id: "in", latency: "N/A", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 8.1,
          id: "au-sydney",
          latency: "351 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "148 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 2.9,
          id: "us-east",
          latency: "89 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "148 ms", name: "União Europeia", price: "Livre" },
        { eur: 2.9, id: "uk", latency: "137 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 219.98,
    monitoringEur: 22.98,
    name: "Cloud VPS 20",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    privateNetworkEur: 4.58,
    ram: "12 GB de RAM",
    rate: 5.86,
    snapshots: "2 Instantâneos",
    storage: "100 GB NVMe ou SSD de 200 GB",
    storageTypes: [
      { id: "ssd-200", name: "SSD de 200 GB", price: "Livre" },
      { eur: 3.9, id: "ssd-400", name: "SSD de 400 GB" },
      { id: "nvme-100", name: "NVMe de 100 GB", price: "Livre" },
      { eur: 5.1, id: "nvme-200", name: "NVMe de 200 GB" },
    ],
    traffic: "Porta de 300 Mbit/s",
    vcpu: "6 núcleos de vCPU",
  },
  "30": {
    additionalIpEur: 7.0,
    backupEur: 7.0,
    basePrice: 131.26,
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
        discount: "ECONOMIZE 10%",
        eur: 25.2,
        id: "6",
        label: "6 meses",
        oldEur: 28.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 22.4,
        id: "12",
        label: "12 meses",
        oldEur: 28.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    images: {
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
        {
          icon: "/docker.png",
          id: "docker",
          name: "Docker",
          price: "Incluído",
        },
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
        { icon: "/image.png", id: "ubuntu", name: "Ubuntu", price: "Incluído" },
        {
          eur: 52.0,
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
        { eur: 43.5, icon: "/cpanel.png", id: "cpanel", name: "cPanel" },
        {
          eur: 32.0,
          icon: "/plesk.png",
          id: "plesk-win",
          name: "Plesk + Windows",
        },
        {
          eur: 24.0,
          icon: "/plesk.png",
          id: "plesk-linux",
          name: "Plesk + Linux",
        },
        {
          icon: "/webmin.png",
          id: "webmin",
          name: "Webmin",
          price: "Incluído",
        },
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
          eur: 52.0,
          icon: "/windows.png",
          id: "windows",
          name: "Servidor Windows",
        },
        { eur: 43.5, icon: "/cpanel.png", id: "cpanel", name: "cPanel" },
        {
          icon: "/centos-svgrepo-com.svg",
          id: "rhel",
          name: "RHEL Variants",
          price: "Incluído",
        },
        { eur: 24.0, icon: "/plesk.png", id: "plesk", name: "Plesk + Linux" },
      ],
    },
    locations: {
      america: [
        {
          eur: 5.9,
          id: "us-central",
          latency: "119 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 5.9,
          id: "us-east",
          latency: "89 ms",
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
        { eur: 17.8, id: "sg", latency: "348 ms", name: "Ásia (Singapura)" },
        { eur: 17.8, id: "jp", latency: "275 ms", name: "Ásia (Japão)" },
        { eur: 17.8, id: "in", latency: "N/A", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 16.2,
          id: "au-sydney",
          latency: "351 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "148 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 5.9,
          id: "us-east",
          latency: "89 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "148 ms", name: "União Europeia", price: "Livre" },
        { eur: 5.9, id: "uk", latency: "137 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 219.98,
    monitoringEur: 22.98,
    name: "Cloud VPS 30",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    privateNetworkEur: 4.58,
    ram: "24 GB de RAM",
    rate: 5.86,
    snapshots: "3 Instantâneos",
    storage: "200 GB NVMe ou SSD de 400 GB",
    storageTypes: [
      { id: "ssd-400", name: "SSD de 400 GB", price: "Livre" },
      { eur: 7.7, id: "ssd-800", name: "SSD de 800 GB" },
      { id: "nvme-200", name: "NVMe de 200 GB", price: "Livre" },
      { eur: 6.5, id: "nvme-400", name: "NVMe de 400 GB" },
    ],
    traffic: "Porta de 600 Mbit/s",
    vcpu: "8 núcleos de vCPU",
  },
  "40": {
    additionalIpEur: 7.0,
    backupEur: 12.0,
    basePrice: 234.4,
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
        discount: "ECONOMIZE 10%",
        eur: 45.0,
        id: "6",
        label: "6 meses",
        oldEur: 50.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 40.0,
        id: "12",
        label: "12 meses",
        oldEur: 50.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    images: {
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
        {
          icon: "/docker.png",
          id: "docker",
          name: "Docker",
          price: "Incluído",
        },
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
        { icon: "/image.png", id: "ubuntu", name: "Ubuntu", price: "Incluído" },
        {
          eur: 98.0,
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
        { eur: 43.5, icon: "/cpanel.png", id: "cpanel", name: "cPanel" },
        {
          eur: 32.0,
          icon: "/plesk.png",
          id: "plesk-win",
          name: "Plesk + Windows",
        },
        {
          eur: 24.0,
          icon: "/plesk.png",
          id: "plesk-linux",
          name: "Plesk + Linux",
        },
        {
          icon: "/webmin.png",
          id: "webmin",
          name: "Webmin",
          price: "Incluído",
        },
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
          eur: 98.0,
          icon: "/windows.png",
          id: "windows",
          name: "Servidor Windows",
        },
        { eur: 43.5, icon: "/cpanel.png", id: "cpanel", name: "cPanel" },
        {
          icon: "/centos-svgrepo-com.svg",
          id: "rhel",
          name: "RHEL Variants",
          price: "Incluído",
        },
        { eur: 24.0, icon: "/plesk.png", id: "plesk", name: "Plesk + Linux" },
      ],
    },
    locations: {
      america: [
        {
          eur: 10.5,
          id: "us-central",
          latency: "118 ms",
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
          latency: "148 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 31.3, id: "sg", latency: "345 ms", name: "Ásia (Singapura)" },
        { eur: 31.3, id: "jp", latency: "262 ms", name: "Ásia (Japão)" },
        { eur: 31.3, id: "in", latency: "N/A", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 28.5,
          id: "au-sydney",
          latency: "350 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "148 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 10.5,
          id: "us-east",
          latency: "87 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "148 ms", name: "União Europeia", price: "Livre" },
        { eur: 10.5, id: "uk", latency: "135 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 219.98,
    monitoringEur: 22.98,
    name: "Cloud VPS 40",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    privateNetworkEur: 4.58,
    ram: "48 GB de RAM",
    rate: 5.86,
    snapshots: "3 Instantâneos",
    storage: "250 GB NVMe ou SSD de 500 GB",
    storageTypes: [
      { id: "ssd-500", name: "SSD de 500 GB", price: "Livre" },
      { eur: 9.9, id: "ssd-1000", name: "SSD de 1000 GB" },
      { id: "nvme-250", name: "NVMe de 250 GB", price: "Livre" },
      { eur: 7.7, id: "nvme-500", name: "NVMe de 500 GB" },
    ],
    traffic: "Porta de 800 Mbit/s",
    vcpu: "12 núcleos de vCPU",
  },
  "50": {
    additionalIpEur: 7.0,
    backupEur: 15.0,
    basePrice: 346.91,
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
        discount: "ECONOMIZE 10%",
        eur: 66.6,
        id: "6",
        label: "6 meses",
        oldEur: 74.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 59.2,
        id: "12",
        label: "12 meses",
        oldEur: 74.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    images: {
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
        {
          icon: "/docker.png",
          id: "docker",
          name: "Docker",
          price: "Incluído",
        },
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
        { icon: "/image.png", id: "ubuntu", name: "Ubuntu", price: "Incluído" },
        {
          eur: 117.0,
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
        { eur: 43.5, icon: "/cpanel.png", id: "cpanel", name: "cPanel" },
        {
          eur: 32.0,
          icon: "/plesk.png",
          id: "plesk-win",
          name: "Plesk + Windows",
        },
        {
          eur: 24.0,
          icon: "/plesk.png",
          id: "plesk-linux",
          name: "Plesk + Linux",
        },
        {
          icon: "/webmin.png",
          id: "webmin",
          name: "Webmin",
          price: "Incluído",
        },
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
          eur: 117.0,
          icon: "/windows.png",
          id: "windows",
          name: "Servidor Windows",
        },
        { eur: 43.5, icon: "/cpanel.png", id: "cpanel", name: "cPanel" },
        {
          icon: "/centos-svgrepo-com.svg",
          id: "rhel",
          name: "RHEL Variants",
          price: "Incluído",
        },
        { eur: 24.0, icon: "/plesk.png", id: "plesk", name: "Plesk + Linux" },
      ],
    },
    locations: {
      america: [
        {
          eur: 15.6,
          id: "us-central",
          latency: "118 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 27.1,
          id: "us-east",
          latency: "88 ms",
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
        { eur: 41.6, id: "sg", latency: "341 ms", name: "Ásia (Singapura)" },
        { eur: 41.6, id: "jp", latency: "262 ms", name: "Ásia (Japão)" },
        { eur: 41.6, id: "in", latency: "N/A", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 37.9,
          id: "au-sydney",
          latency: "350 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "148 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 27.1,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "148 ms", name: "União Europeia", price: "Livre" },
        { eur: 15.6, id: "uk", latency: "135 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 219.98,
    monitoringEur: 22.98,
    name: "Cloud VPS 50",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    privateNetworkEur: 4.58,
    ram: "64 GB de RAM",
    rate: 5.86,
    snapshots: "3 Instantâneos",
    storage: "300 GB NVMe ou SSD de 600 GB",
    storageTypes: [
      { id: "ssd-600", name: "SSD de 600 GB", price: "Livre" },
      { eur: 12.3, id: "ssd-1200", name: "SSD de 1.2 TB" },
      { id: "nvme-300", name: "NVMe de 300 GB", price: "Livre" },
      { eur: 9.5, id: "nvme-600", name: "NVMe de 600 GB" },
    ],
    traffic: "Porta de 1 Gbit/s",
    vcpu: "16 núcleos de vCPU",
  },
  "60": {
    additionalIpEur: 7.0,
    backupEur: 19.0,
    basePrice: 459.42,
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
        discount: "ECONOMIZE 10%",
        eur: 88.2,
        id: "6",
        label: "6 meses",
        oldEur: 98.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: 78.4,
        id: "12",
        label: "12 meses",
        oldEur: 98.0,
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    images: {
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
        {
          icon: "/docker.png",
          id: "docker",
          name: "Docker",
          price: "Incluído",
        },
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
        { icon: "/image.png", id: "ubuntu", name: "Ubuntu", price: "Incluído" },
        {
          eur: 140.0,
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
        { eur: 43.5, icon: "/cpanel.png", id: "cpanel", name: "cPanel" },
        {
          eur: 32.0,
          icon: "/plesk.png",
          id: "plesk-win",
          name: "Plesk + Windows",
        },
        {
          eur: 24.0,
          icon: "/plesk.png",
          id: "plesk-linux",
          name: "Plesk + Linux",
        },
        {
          icon: "/webmin.png",
          id: "webmin",
          name: "Webmin",
          price: "Incluído",
        },
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
          eur: 140.0,
          icon: "/windows.png",
          id: "windows",
          name: "Servidor Windows",
        },
        { eur: 43.5, icon: "/cpanel.png", id: "cpanel", name: "cPanel" },
        {
          icon: "/centos-svgrepo-com.svg",
          id: "rhel",
          name: "RHEL Variants",
          price: "Incluído",
        },
        { eur: 24.0, icon: "/plesk.png", id: "plesk", name: "Plesk + Linux" },
      ],
    },
    locations: {
      america: [
        {
          eur: 20.6,
          id: "us-central",
          latency: "118 ms",
          name: "Estados Unidos (Central)",
        },
        {
          eur: 30.7,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
        {
          eur: 20.6,
          id: "us-west",
          latency: "147 ms",
          name: "Estados Unidos (Oeste)",
        },
      ],
      asia: [
        { eur: 47.1, id: "sg", latency: "341 ms", name: "Ásia (Singapura)" },
        { eur: 47.1, id: "jp", latency: "262 ms", name: "Ásia (Japão)" },
        { eur: 47.1, id: "in", latency: "N/A", name: "Ásia (Índia)" },
      ],
      australia: [
        {
          eur: 42.9,
          id: "au-sydney",
          latency: "350 ms",
          name: "Austrália (Sydney)",
        },
      ],
      best: [
        { id: "eu", latency: "148 ms", name: "União Europeia", price: "Livre" },
        {
          eur: 30.7,
          id: "us-east",
          latency: "88 ms",
          name: "Estados Unidos (Leste)",
          recommended: true,
        },
      ],
      europe: [
        { id: "eu", latency: "148 ms", name: "União Europeia", price: "Livre" },
        { eur: 20.6, id: "uk", latency: "135 ms", name: "Reino Unido" },
      ],
    },
    managedEur: 219.98,
    monitoringEur: 22.98,
    name: "Cloud VPS 60",
    objectStoragePrices: {
      "1tb": 19.92,
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
    },
    privateNetworkEur: 4.58,
    ram: "96 GB de RAM",
    rate: 5.86,
    snapshots: "3 Instantâneos",
    storage: "350 GB NVMe ou SSD de 700 GB",
    storageTypes: [
      { id: "ssd-700", name: "SSD de 700 GB", price: "Livre" },
      { eur: 13.9, id: "ssd-1400", name: "SSD de 1.4 TB" },
      { id: "nvme-350", name: "NVMe de 350 GB", price: "Livre" },
      { eur: 11.5, id: "nvme-700", name: "NVMe de 700 GB" },
    ],
    traffic: "Porta de 1 Gbit/s",
    vcpu: "18 núcleos de vCPU",
  },
};

const defaultDurations = [
  {
    discount: null,
    id: "1",
    label: "1 mês",
    price: "R$ 52,74",
    setupFee: "Taxa de configuração de R$ 52,74",
  },
  {
    discount: "ECONOMIZE 10%",
    id: "6",
    label: "6 meses",
    oldPrice: "R$ 52,74",
    price: "R$ 47,47",
    setupFee: "Taxa de configuração de R$ 26,37",
  },
  {
    discount: "ECONOMIZE 20%",
    id: "12",
    label: "12 meses",
    oldPrice: "R$ 52,74",
    price: "R$ 42,19",
    setupFee: "Sem taxa de instalação",
  },
];

const defaultStorageTypes = [
  { id: "ssd-150", name: "SSD de 150 GB", price: "Livre" },
  { id: "ssd-300", name: "SSD de 300 GB", price: "R$ 18,17/mês" },
  { id: "nvme-75", name: "75 GB NVMe", price: "Livre" },
  { id: "nvme-150", name: "NVMe de 150 GB", price: "R$ 21,68/mês" },
];

const regions = [
  { id: "best", label: "Melhor" },
  { id: "europe", label: "Europa" },
  { id: "america", label: "América" },
  { id: "asia", label: "Ásia" },
  { id: "australia", label: "Austrália" },
];

interface Location {
  id: string;
  name: string;
  latency: string;
  price: string;
  recommended?: boolean;
}

const locations: Record<string, Location[]> = {
  america: [
    {
      id: "us-central",
      latency: "117 ms",
      name: "Estados Unidos (Central)",
      price: "R$ 22,27",
    },
    {
      id: "us-east",
      latency: "87 ms",
      name: "Estados Unidos (Leste)",
      price: "R$ 16,41",
      recommended: true,
    },
    {
      id: "us-west",
      latency: "147 ms",
      name: "Estados Unidos (Oeste)",
      price: "R$ 26,96",
    },
  ],
  asia: [
    {
      id: "sg",
      latency: "338 ms",
      name: "Ásia (Singapura)",
      price: "R$ 50,40",
    },
    { id: "jp", latency: "269 ms", name: "Ásia (Japão)", price: "R$ 55,08" },
    { id: "in", latency: "N/A", name: "Ásia (Índia)", price: "R$ 50,40" },
  ],
  australia: [
    {
      id: "au-sydney",
      latency: "349 ms",
      name: "Austrália (Sydney)",
      price: "R$ 45,71",
    },
  ],
  best: [
    { id: "eu", latency: "156 ms", name: "União Europeia", price: "Livre" },
    {
      id: "us-east",
      latency: "87 ms",
      name: "Estados Unidos (Leste)",
      price: "R$ 16,41",
      recommended: true,
    },
  ],
  europe: [
    { id: "eu", latency: "156 ms", name: "União Europeia", price: "Livre" },
    { id: "uk", latency: "135 ms", name: "Reino Unido", price: "R$ 22,27" },
  ],
};

// storageTypes and durations will be derived from planId

const imageCategories = [
  { id: "popular", label: "Popular" },
  { id: "os", label: "SO" },
  { id: "apps", label: "Novidade: Aplicativos" },
  { id: "panels", label: "Painéis" },
  { id: "blockchain", label: "Blockchain" },
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
      eur: 15.0,
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
    { eur: 43.5, icon: "/cpanel.png", id: "cpanel", name: "cPanel" },
    { eur: 32.0, icon: "/plesk.png", id: "plesk-win", name: "Plesk + Windows" },
    { eur: 24.0, icon: "/plesk.png", id: "plesk-linux", name: "Plesk + Linux" },
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
      eur: 15.0,
      icon: "/windows.png",
      id: "windows",
      name: "Servidor Windows",
    },
    { eur: 43.5, icon: "/cpanel.png", id: "cpanel", name: "cPanel" },
    {
      icon: "/centos-svgrepo-com.svg",
      id: "rhel",
      name: "RHEL Variants",
      price: "Incluído",
    },
    { eur: 24.0, icon: "/plesk.png", id: "plesk", name: "Plesk + Linux" },
  ],
};

// Contabo Cloud VPS Core catalog: Windows Server price (Contabo's listed price x2;
// Contabo charges the same price for every Windows Server version).
const catalogWindowsEur: Record<string, number> = {
  "4": 16.0,
  "6": 34.0,
  "8": 56.0,
  "12": 106.0,
  "16": 126.0,
  "18": 154.0,
};

// Contabo Cloud VPS Core catalog storage-upgrade tier (Contabo's listed price x2).
const catalogStorageUpgrade: Record<string, { label: string; eur: number }> = {
  "4": { eur: 3.0, label: "200 GB SSD" },
  "6": { eur: 6.0, label: "400 GB SSD" },
  "8": { eur: 9.0, label: "600 GB SSD" },
  "12": { eur: 12.0, label: "800 GB SSD" },
  "16": { eur: 15.0, label: "1 TB SSD" },
  "18": { eur: 18.0, label: "1.2 TB SSD" },
};

// Contabo Cloud VPS Core catalog datacenter/region surcharge (Contabo's listed price x2).
// Scales per plan tier (confirmed: surcharges differ across all six plans) — one entry per plan id.
// All six tiers (4/6/8/12/16/18) confirmed from real Contabo data.
const catalogLocations4 = {
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
      latency: "93 ms",
      name: "Estados Unidos (Leste)",
      recommended: true,
    },
    {
      eur: 2.6,
      id: "us-west",
      latency: "162 ms",
      name: "Estados Unidos (Oeste)",
    },
  ],
  asia: [
    { eur: 5.0, id: "sg", latency: "309 ms", name: "Ásia (Singapura)" },
    { eur: 5.1, id: "jp", latency: "248 ms", name: "Ásia (Japão)" },
    { eur: 4.8, id: "in", latency: "283 ms", name: "Ásia (Índia)" },
  ],
  australia: [
    {
      eur: 4.3,
      id: "au-sydney",
      latency: "313 ms",
      name: "Austrália (Sydney)",
    },
  ],
  best: [
    { id: "eu", latency: "252 ms", name: "União Europeia", price: "Livre" },
    {
      eur: 3.1,
      id: "us-east",
      latency: "93 ms",
      name: "Estados Unidos (Leste)",
      recommended: true,
    },
  ],
  europe: [
    { id: "eu", latency: "252 ms", name: "União Europeia", price: "Livre" },
    { eur: 2.1, id: "uk", latency: "164 ms", name: "Reino Unido" },
  ],
};

const catalogLocations6 = {
  america: [
    {
      eur: 3.2,
      id: "us-central",
      latency: "120 ms",
      name: "Estados Unidos (Central)",
    },
    {
      eur: 4.8,
      id: "us-east",
      latency: "90 ms",
      name: "Estados Unidos (Leste)",
      recommended: true,
    },
    {
      eur: 4.0,
      id: "us-west",
      latency: "147 ms",
      name: "Estados Unidos (Oeste)",
    },
  ],
  asia: [
    { eur: 7.9, id: "sg", latency: "320 ms", name: "Ásia (Singapura)" },
    { eur: 8.0, id: "jp", latency: "224 ms", name: "Ásia (Japão)" },
    { eur: 7.4, id: "in", latency: "282 ms", name: "Ásia (Índia)" },
  ],
  australia: [
    {
      eur: 6.6,
      id: "au-sydney",
      latency: "313 ms",
      name: "Austrália (Sydney)",
    },
  ],
  best: [
    { id: "eu", latency: "188 ms", name: "União Europeia", price: "Livre" },
    {
      eur: 4.8,
      id: "us-east",
      latency: "90 ms",
      name: "Estados Unidos (Leste)",
      recommended: true,
    },
  ],
  europe: [
    { id: "eu", latency: "188 ms", name: "União Europeia", price: "Livre" },
    { eur: 3.2, id: "uk", latency: "163 ms", name: "Reino Unido" },
  ],
};

const catalogLocations8 = {
  america: [
    {
      eur: 6.5,
      id: "us-central",
      latency: "119 ms",
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
      latency: "147 ms",
      name: "Estados Unidos (Oeste)",
    },
  ],
  asia: [
    { eur: 15.7, id: "sg", latency: "319 ms", name: "Ásia (Singapura)" },
    { eur: 16.0, id: "jp", latency: "224 ms", name: "Ásia (Japão)" },
    { eur: 14.8, id: "in", latency: "281 ms", name: "Ásia (Índia)" },
  ],
  australia: [
    {
      eur: 13.2,
      id: "au-sydney",
      latency: "311 ms",
      name: "Austrália (Sydney)",
    },
  ],
  best: [
    { id: "eu", latency: "187 ms", name: "União Europeia", price: "Livre" },
    {
      eur: 9.5,
      id: "us-east",
      latency: "88 ms",
      name: "Estados Unidos (Leste)",
      recommended: true,
    },
  ],
  europe: [
    { id: "eu", latency: "187 ms", name: "União Europeia", price: "Livre" },
    { eur: 6.5, id: "uk", latency: "161 ms", name: "Reino Unido" },
  ],
};

const catalogLocations12 = {
  america: [
    {
      eur: 11.6,
      id: "us-central",
      latency: "117 ms",
      name: "Estados Unidos (Central)",
    },
    {
      eur: 17.1,
      id: "us-east",
      latency: "88 ms",
      name: "Estados Unidos (Leste)",
      recommended: true,
    },
    {
      eur: 14.3,
      id: "us-west",
      latency: "147 ms",
      name: "Estados Unidos (Oeste)",
    },
  ],
  asia: [
    { eur: 28.1, id: "sg", latency: "319 ms", name: "Ásia (Singapura)" },
    { eur: 28.6, id: "jp", latency: "223 ms", name: "Ásia (Japão)" },
    { eur: 26.4, id: "in", latency: "281 ms", name: "Ásia (Índia)" },
  ],
  australia: [
    {
      eur: 23.7,
      id: "au-sydney",
      latency: "311 ms",
      name: "Austrália (Sydney)",
    },
  ],
  best: [
    { id: "eu", latency: "187 ms", name: "União Europeia", price: "Livre" },
    {
      eur: 17.1,
      id: "us-east",
      latency: "88 ms",
      name: "Estados Unidos (Leste)",
      recommended: true,
    },
  ],
  europe: [
    { id: "eu", latency: "187 ms", name: "União Europeia", price: "Livre" },
    { eur: 11.6, id: "uk", latency: "159 ms", name: "Reino Unido" },
  ],
};

const catalogLocations16 = {
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
    { eur: 41.5, id: "sg", latency: "319 ms", name: "Ásia (Singapura)" },
    { eur: 42.3, id: "jp", latency: "223 ms", name: "Ásia (Japão)" },
    { eur: 39.1, id: "in", latency: "282 ms", name: "Ásia (Índia)" },
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
    { id: "eu", latency: "186 ms", name: "União Europeia", price: "Livre" },
    {
      eur: 25.2,
      id: "us-east",
      latency: "88 ms",
      name: "Estados Unidos (Leste)",
      recommended: true,
    },
  ],
  europe: [
    { id: "eu", latency: "186 ms", name: "União Europeia", price: "Livre" },
    { eur: 17.1, id: "uk", latency: "159 ms", name: "Reino Unido" },
  ],
};

const catalogLocations18 = {
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
      latency: "90 ms",
      name: "Estados Unidos (Leste)",
      recommended: true,
    },
    {
      eur: 28.0,
      id: "us-west",
      latency: "146 ms",
      name: "Estados Unidos (Oeste)",
    },
  ],
  asia: [
    { eur: 55.0, id: "sg", latency: "316 ms", name: "Ásia (Singapura)" },
    { eur: 56.1, id: "jp", latency: "223 ms", name: "Ásia (Japão)" },
    { eur: 51.7, id: "in", latency: "281 ms", name: "Ásia (Índia)" },
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
      latency: "90 ms",
      name: "Estados Unidos (Leste)",
      recommended: true,
    },
  ],
  europe: [
    { id: "eu", latency: "186 ms", name: "União Europeia", price: "Livre" },
    { eur: 22.6, id: "uk", latency: "158 ms", name: "Reino Unido" },
  ],
};

const catalogLocationsByPlan: Record<string, typeof catalogLocations4> = {
  "4": catalogLocations4,
  "6": catalogLocations6,
  "8": catalogLocations8,
  "12": catalogLocations12,
  "16": catalogLocations16,
  "18": catalogLocations18,
};

function getContaboCloudPlanImages(planId: string) {
  const windowsEur = catalogWindowsEur[planId];
  if (windowsEur === undefined) return undefined;
  const overrideWindows = (list: any[]) =>
    list.map(img => (img.id === "windows" ? { ...img, eur: windowsEur } : img));
  return {
    ...images,
    os: overrideWindows(images.os),
    popular: overrideWindows(images.popular),
  };
}

function getContaboCloudPlanConfig(planId: string) {
  const cloudPlan = getCloudVpsPlan(planId);
  if (!cloudPlan) return null;

  const monthlyEuro = getCloudVpsMonthlyEuro(planId, false, 24)!;
  const storageUpgrade = catalogStorageUpgrade[planId];
  return {
    additionalIpEur: 7,
    backupEur: getCloudVpsMonthlyEuro(planId, true, 24)! - monthlyEuro,
    basePrice: monthlyEuro,
    durations: [
      {
        discount: null,
        eur: getCloudVpsMonthlyEuro(planId, false, 1)!,
        id: "1",
        label: "1 mês",
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 15%",
        eur: getCloudVpsMonthlyEuro(planId, false, 12)!,
        id: "12",
        label: "12 meses",
        oldEur: getCloudVpsOldMonthlyEuro(planId, false),
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
      {
        discount: "ECONOMIZE 20%",
        eur: monthlyEuro,
        id: "24",
        label: "24 meses",
        oldEur: getCloudVpsOldMonthlyEuro(planId, false),
        setupEur: 0,
        setupFee: "Sem taxa de instalação",
      },
    ],
    images: getContaboCloudPlanImages(planId),
    locations: catalogLocationsByPlan[planId],
    managedEur: 219.98,
    monitoringEur: 22.98,
    name: cloudPlan.name,
    privateNetworkEur: 4.58,
    ram: cloudPlan.ram,
    snapshots: cloudPlan.snapshots,
    storage: cloudPlan.storage,
    storageTypes: storageUpgrade
      ? [
          {
            id: `${planId}-storage-base`,
            name: cloudPlan.storage,
            price: "Livre",
          },
          {
            eur: storageUpgrade.eur,
            id: `${planId}-storage-upgrade`,
            name: storageUpgrade.label,
          },
        ]
      : undefined,
    traffic: `${cloudPlan.port} · ${cloudPlan.traffic}`,
    vcpu: cloudPlan.vcpu,
  };
}
export default function VpsConfigurePage({
  embedded = false,
}: {
  embedded?: boolean;
} = {}) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = params.id as string;

  const [currentRate, setCurrentRate] = useState(5.86);
  const [usdRate, setUsdRate] = useState(1.08);
  const [displayCurrency, setDisplayCurrency] =
    useState<DisplayCurrency>("BRL");

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch("/api/currency/euro");
        const data = await response.json();
        if (data.rate) {
          setCurrentRate(data.rate);
        }
        if (data.usdRate) {
          setUsdRate(data.usdRate);
        }
      } catch (error) {
        console.error("Erro ao buscar taxa do euro:", error);
      }
    };
    fetchRate();
  }, []);

  useEffect(() => {
    const syncCurrency = () => setDisplayCurrency(readDisplayCurrency());
    syncCurrency();
    window.addEventListener(DISPLAY_CURRENCY_CHANGE_EVENT, syncCurrency);
    return () =>
      window.removeEventListener(DISPLAY_CURRENCY_CHANGE_EVENT, syncCurrency);
  }, []);

  const contaboPlan = getContaboCloudPlanConfig(planId);
  const plan =
    contaboPlan ||
    plansData[planId as keyof typeof plansData] ||
    plansData["10"];
  const durations =
    plan.durations && plan.durations.length > 0
      ? plan.durations
      : defaultDurations;
  const storageTypes =
    plan.storageTypes && plan.storageTypes.length > 0
      ? plan.storageTypes
      : defaultStorageTypes;
  const planLocations = (plan as any).locations || locations;
  const dynamicImages = plan.images || images;

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
  const [duration, setDuration] = useState(
    sp.get("duration") || (contaboPlan ? "24" : "1")
  );
  const [regionTab, setRegionTab] = useState(sp.get("regionTab") || "best");
  const [location, setLocation] = useState(sp.get("location") || "eu");
  const [storageType, setStorageType] = useState(
    sp.get("storage") || storageTypes[0].id
  );
  const [imageCategory, setImageCategory] = useState(
    sp.get("imageCategory") || "popular"
  );
  const [osImage, setOsImage] = useState(sp.get("image") || "ubuntu");
  const [autoBackup, setAutoBackup] = useState(
    sp.has("backup") ? sp.get("backup") === "true" : !contaboPlan
  );
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
      `/vps/configure/${planId}?${p.toString()}`
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

  // Password validation: 8+ chars, 1 upper, 1 lower, 1 number
  const isPasswordValid = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(pwd);
  };

  function getImagePrices(planId: string, defaultImagePrices: any) {
    const base = {
      ...defaultImagePrices,
      cpanel: 43.5,
      pleskHost: 73.0,
      pleskLinux: 24.0,
      pleskPro: 38.0,
      pleskWin: 32.0,
    };

    if (planId === "10") {
      return {
        ...base,
        windows: 15.0,
        windows_2016: 12.5,
      };
    }

    if (planId === "20") {
      return {
        ...base,
        windows: 31.0,
        windows_2016: 25.2,
      };
    }

    if (planId === "30") {
      return {
        ...base,
        windows: 52.0,
        windows_2016: 42.1,
      };
    }

    if (planId === "40") {
      return {
        ...base,
        windows: 98.0,
        windows_2016: 85.0,
      };
    }

    if (planId === "50") {
      return {
        ...base,
        windows: 117.0,
        windows_2016: 105.0,
      };
    }

    if (planId === "60") {
      return {
        ...base,
        windows: 140.0,
        windows_2016: 125.0,
      };
    }

    // Contabo Cloud VPS Core catalog (ids "4"/"6"/"8"/"12"/"16"/"18"): Contabo now
    // charges the same price for every Windows Server version, so windows_2016
    // mirrors windows. Values are Contabo's listed price x2.
    if (catalogWindowsEur[planId] !== undefined) {
      return {
        ...base,
        windows: catalogWindowsEur[planId],
        windows_2016: catalogWindowsEur[planId],
      };
    }

    return base;
  }

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
      {/* Step Header could be here, but matching image's start */}
      <div
        className={`${roboto.className} mx-auto max-w-6xl px-4 md:px-6 ${embedded ? "pt-6 md:pt-10" : "pt-24 md:pt-32"} space-y-8 pb-12 md:space-y-12`}
      >
        <Link
          className="group mb-6 flex items-center gap-2 font-bold text-lg text-sky-400 transition-all hover:text-sky-300"
          href={embedded ? "/vps-plans" : "/#planos"}
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Voltar para os planos
        </Link>
        <h1
          className={`font-black text-2xl md:text-3xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight drop-shadow-sm`}
        >
          Configure seu {plan.name}
        </h1>

        {/* Plan Summary Section */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-10">
          <div
            className={`relative flex-1 rounded-xl border-2 border-sky-500/50 p-4 md:p-8 ${embedded ? "bg-muted/40" : "bg-white/5"} shadow-2xl backdrop-blur-md`}
          >
            {/* Mobile: compact label→value list */}
            <div className="space-y-2 pb-6 xl:hidden">
              {[
                { label: "CPU", value: plan.vcpu },
                { label: "RAM", value: plan.ram },
                { label: "Disco", value: plan.storage },
                { label: "Snapshot", value: plan.snapshots },
                { label: "Tráfego", value: plan.traffic },
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
            {/* Desktop: 5-col grid */}
            <div className="hidden gap-4 xl:grid xl:grid-cols-5">
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
                  SNAPSHOT
                </p>
                <p className="font-medium text-[15px] leading-tight">
                  {plan.snapshots}
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
            </div>
            <button
              className="absolute right-4 bottom-4 font-bold text-[14px] text-sky-400 uppercase tracking-wider hover:underline"
              onClick={() => router.push(embedded ? "/vps-plans" : "/#planos")}
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
                className={`h-10 w-16 border ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} max-w-[calc(100vw-2rem)]`}
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
                      className={`absolute -top-3 left-6 ${embedded ? "bg-card" : "bg-[#000B12]"} rounded border border-sky-500/30 px-2 py-0.5 font-black text-[13px] text-sky-400 shadow-lg shadow-sky-500/10`}
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
                    d.setupEur === 0
                      ? "bg-emerald-500/20 text-emerald-400"
                      : `${embedded ? "text-muted-foreground" : "text-slate-400"}`
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

          <div className="flex flex-col items-start gap-8 md:flex-row">
            <div className="hidden w-1/3 md:block">
              <img
                alt="Map"
                className="h-auto w-full opacity-80"
                src="/1098128_7510-removebg-preview.png"
              />
            </div>

            <div className="w-full flex-1 space-y-4">
              <div
                className={`scrollbar-thin flex overflow-x-auto border-b ${embedded ? "border-border" : "border-white/10"}`}
              >
                {regions.map(r => (
                  <button
                    className={cn(
                      "relative whitespace-nowrap px-4 py-3 font-bold text-[15px] uppercase tracking-wider transition-colors md:px-8",
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
                  planLocations[regionTab as keyof typeof planLocations] || []
                ).map((loc: any) => (
                  <button
                    className={cn(
                      `flex w-full items-center justify-between border p-4 font-bold text-lg ${embedded ? "bg-muted/40" : "bg-white/5"} relative rounded-lg backdrop-blur-md transition-all`,
                      location === loc.id
                        ? `border-sky-500 ${embedded ? "bg-accent" : "bg-white/10"}`
                        : `${embedded ? "border-border" : "border-white/10"}`,
                      loc.recommended && "mt-6"
                    )}
                    key={loc.id}
                    onClick={() => setLocation(loc.id)}
                  >
                    {loc.recommended && (
                      <div
                        className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 ${embedded ? "text-foreground" : "text-white"} z-10 whitespace-nowrap rounded-md px-2 py-0.5 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sky-500/20 md:px-4 md:py-1 md:text-[15px]`}
                      >
                        Recomendado - Melhor latência para sua região
                      </div>
                    )}
                    <div
                      className={`flex-1 text-left ${embedded ? "text-foreground" : "text-white"} text-base md:text-lg`}
                    >
                      {loc.name}
                    </div>
                    <div
                      className={`hidden flex-1 text-center md:block ${embedded ? "text-muted-foreground" : "text-slate-400"} font-medium`}
                    >
                      – Latência de {loc.latency}
                    </div>
                    <div
                      className={`flex-shrink-0 text-right ${embedded ? "text-foreground" : "text-white"} font-black text-base md:text-lg`}
                    >
                      {loc.eur > 0 ? formatBRLPerMonth(loc.eur) : "Livre"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Separator className={`${embedded ? "bg-muted" : "bg-white/10"}`} />

        {/* Storage Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2
              className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
            >
              Tipo de armazenamento
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {storageTypes.map((st: any) => (
              <div
                className={cn(
                  `flex cursor-pointer items-center justify-between rounded-lg border p-4 font-bold text-[15px] transition-all ${embedded ? "bg-muted/40" : "bg-white/5"} backdrop-blur-md`,
                  storageType === st.id
                    ? `border-sky-500 ${embedded ? "bg-accent" : "bg-white/10"}`
                    : `${embedded ? "border-border" : "border-white/10"}`
                )}
                key={st.id}
                onClick={() => setStorageType(st.id)}
              >
                <span
                  className={`${embedded ? "text-foreground" : "text-white"}`}
                >
                  {st.name}
                </span>
                <span
                  className={cn(
                    st.eur === undefined && st.price === "Livre"
                      ? "text-emerald-400"
                      : `${embedded ? "text-foreground" : "text-white"} font-black`
                  )}
                >
                  {st.eur ? formatBRLPerMonth(st.eur) : st.price}
                </span>
              </div>
            ))}
          </div>
        </section>

        <Separator className={`${embedded ? "bg-muted" : "bg-white/10"}`} />

        {/* Image Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2
              className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
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
            {showMoreImages ? (
              <motion.div
                animate={{ height: "auto", opacity: 1 }}
                className="space-y-8 overflow-hidden"
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
                key="expanded"
              >
                <div
                  className={`scrollbar-thin flex justify-start overflow-x-auto border-b md:justify-center ${embedded ? "border-border" : "border-white/10"}`}
                >
                  {imageCategories.map(cat => (
                    <button
                      className={cn(
                        "relative whitespace-nowrap px-4 py-3 font-black text-[15px] uppercase tracking-wider transition-colors md:px-8",
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                          : `${embedded ? "border-border" : "border-white/10"}`
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
                        `flex w-64 cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${embedded ? "bg-muted/40" : "bg-white/5"} backdrop-blur-md`,
                        osImage === img.id
                          ? `border-sky-500 ${embedded ? "bg-accent" : "bg-white/10"}`
                          : `${embedded ? "border-border" : "border-white/10"}`
                      )}
                      key={img.id}
                      onClick={() => setOsImage(img.id)}
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
                        <p className="font-bold text-[15px]">{img.name}</p>
                        <p
                          className={`text-[14px] ${embedded ? "text-muted-foreground" : "text-slate-400"} font-medium`}
                        >
                          {img.eur ? formatBRLPerMonth(img.eur) : img.price}
                        </p>
                      </div>
                    </button>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <Separator className={`${embedded ? "bg-muted" : "bg-white/10"}`} />

        {/* Data Protection Section */}
        <section className="mb-8">
          <div className="mb-6 flex items-center gap-2">
            <h2
              className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
            >
              Proteção de Dados
            </h2>
          </div>

          <div
            className={`grid grid-cols-1 items-center gap-6 lg:grid-cols-12 ${embedded ? "bg-muted/40" : "bg-white/5"} rounded-2xl border p-6 md:p-10 ${embedded ? "border-border" : "border-white/10"} shadow-2xl backdrop-blur-md`}
          >
            <div className="flex flex-col items-center gap-4 md:flex-row lg:col-span-5">
              <div className="relative h-28 w-28 flex-shrink-0 md:h-40 md:w-40">
                <img
                  alt="Backup Shield"
                  className="h-auto w-full object-contain"
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
                      className={`flex items-center gap-3 font-bold text-base ${embedded ? "text-muted-foreground" : "text-slate-200"} uppercase leading-snug tracking-tight`}
                      key={i}
                    >
                      <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(0,163,255,0.5)]" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Selection Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-7">
              {/* Auto Backup Card */}
              <button
                className={cn(
                  "relative flex min-h-[130px] flex-col items-center justify-center rounded-xl border p-4 text-center transition-all",
                  autoBackup
                    ? `border-sky-500 ${embedded ? "bg-accent" : "bg-white/10"} shadow-lg shadow-sky-500/10`
                    : `${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} hover:border-white/20`
                )}
                onClick={() => setAutoBackup(true)}
              >
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 ${embedded ? "bg-card" : "bg-[#000B12]"} rounded-full border border-sky-500/30 px-2 py-0.5 shadow-lg md:px-4 md:py-1`}
                >
                  <span className="whitespace-nowrap font-black text-[10px] text-sky-400 uppercase tracking-widest md:text-[14px]">
                    Nossa Recomendação
                  </span>
                </div>
                <div className="mt-2">
                  <h3
                    className={`font-black text-xl md:text-2xl ${embedded ? "text-foreground" : "text-white"} mb-1 uppercase tracking-tight`}
                  >
                    Backup Automático
                  </h3>
                  <div
                    className={`font-black text-xl md:text-2xl ${embedded ? "text-foreground" : "text-white"} mb-2`}
                  >
                    {formatBRLPerMonth(plan.backupEur)}
                  </div>
                  <p
                    className={`text-sm ${embedded ? "text-muted-foreground" : "text-slate-400"} font-medium leading-tight`}
                  >
                    Configure e esqueça.
                    <br />
                    Segurança de dados sem esforço.
                  </p>
                </div>
              </button>

              {/* No Protection Card */}
              <button
                className={cn(
                  "flex min-h-[130px] items-center justify-center rounded-xl border p-4 text-center transition-all",
                  !autoBackup
                    ? `border-sky-500 ${embedded ? "bg-accent" : "bg-white/10"} shadow-lg`
                    : `${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} hover:border-white/20`
                )}
                onClick={() => setAutoBackup(false)}
              >
                <h3
                  className={`font-black text-xl ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-tight`}
                >
                  Sem Proteção
                </h3>
              </button>
            </div>
          </div>
        </section>

        <Separator className={`${embedded ? "bg-muted" : "bg-white/10"}`} />

        {/* Additional Features Section */}
        <section
          className={`${embedded ? "bg-muted/40" : "bg-white/5"} rounded-2xl border shadow-2xl ${embedded ? "border-border" : "border-white/10"} mb-8 overflow-hidden backdrop-blur-md`}
        >
          <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
              <h2
                className={`font-black text-base md:text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
              >
                Recursos Adicionais
              </h2>
              <button
                className={`flex items-center gap-1 font-black text-[13px] ${embedded ? "text-foreground" : "text-white"} uppercase tracking-wider`}
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
                  {/* Networking Sub-section */}
                  <div className="space-y-8">
                    <h3
                      className={`font-black text-lg md:text-2xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                    >
                      Rede
                    </h3>
                    <div className="space-y-6 pr-1 pl-4">
                      {/* Private Networking */}
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="md:col-span-3">
                          <span
                            className={`font-bold text-lg ${embedded ? "text-muted-foreground" : "text-slate-300"}`}
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
                              className={`h-12 ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              <SelectValue placeholder="Selecione a rede" />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} max-w-[calc(100vw-2rem)]`}
                            >
                              <SelectItem
                                className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                value="none"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span className="text-left">
                                    Sem Rede Privada
                                  </span>
                                  <span
                                    className={`text-lg ${embedded ? "text-muted-foreground" : "text-slate-400"} ml-4 font-medium`}
                                  >
                                    Grátis
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                value="enabled"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span className="text-left">
                                    Rede Privada Ativada
                                  </span>
                                  <span
                                    className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-bold`}
                                  >
                                    {formatBRLPerMonth(2.29)}
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Bandwidth */}
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="md:col-span-3">
                          <span
                            className={`font-bold text-lg ${embedded ? "text-muted-foreground" : "text-slate-300"}`}
                          >
                            Largura de Banda
                          </span>
                        </div>
                        <div className="md:col-span-9">
                          <div
                            className={`h-12 border ${embedded ? "border-border" : "border-white/10"} flex flex-col justify-center rounded-md px-4 ${embedded ? "bg-muted/40" : "bg-white/5"}`}
                          >
                            <span
                              className={`font-bold text-lg ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              Tráfego Ilimitado
                            </span>
                            <span
                              className={`text-[14px] ${embedded ? "text-muted-foreground" : "text-slate-500"} font-medium uppercase tracking-wider`}
                            >
                              Política de Uso Justo
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* IPv4 */}
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="md:col-span-3">
                          <span
                            className={`font-bold text-lg ${embedded ? "text-muted-foreground" : "text-slate-300"}`}
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
                              className={`h-12 ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              <SelectValue placeholder="Selecione o IP" />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} max-w-[calc(100vw-2rem)]`}
                            >
                              <SelectItem
                                className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                value="1ip"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span className="text-left">
                                    1 Endereço IP
                                  </span>
                                  <span
                                    className={`text-lg ${embedded ? "text-muted-foreground" : "text-slate-400"} ml-4 font-medium`}
                                  >
                                    Grátis
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                value="2ip"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span className="text-left">
                                    1 Endereço IP + 1 IP Adicional
                                  </span>
                                  <span
                                    className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-bold`}
                                  >
                                    {formatBRLPerMonth(
                                      plan.additionalIpEur || 7.0
                                    )}
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
                    className={`${embedded ? "bg-muted" : "bg-white/10"}`}
                  />

                  {/* Add-Ons Sub-section */}
                  <div className="space-y-8">
                    <h3
                      className={`font-black text-lg md:text-2xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                    >
                      Complementos
                    </h3>
                    <div className="space-y-6 pr-1 pl-4">
                      {/* Object Storage */}
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="md:col-span-3">
                          <span
                            className={`font-bold text-lg ${embedded ? "text-muted-foreground" : "text-slate-300"}`}
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
                              className={`h-12 ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              <SelectValue
                                placeholder={
                                  objectStorage === "none"
                                    ? "Nenhum"
                                    : objectStorage === "250gb"
                                      ? "250 GB Armazenamento"
                                      : objectStorage === "500gb"
                                        ? "500 GB Armazenamento"
                                        : objectStorage === "750gb"
                                          ? "750 GB Armazenamento"
                                          : "1 TB Armazenamento"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} max-w-[calc(100vw-2rem)]`}
                            >
                              <SelectItem
                                className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                value="none"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span className="text-left">Nenhum</span>
                                  <span
                                    className={`text-lg ${embedded ? "text-muted-foreground" : "text-slate-400"} ml-4 font-medium`}
                                  >
                                    Livre
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                value="250gb"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span className="text-left text-lg">
                                    250 GB Armazenamento de Objetos nos Estados
                                    Unidos
                                  </span>
                                  <span
                                    className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-bold`}
                                  >
                                    {formatBRLPerMonth(
                                      plan.objectStoragePrices?.["250gb"] ||
                                        4.98
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                value="500gb"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span className="text-left text-lg">
                                    500 GB Armazenamento de Objetos nos Estados
                                    Unidos
                                  </span>
                                  <span
                                    className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-bold`}
                                  >
                                    {formatBRLPerMonth(
                                      plan.objectStoragePrices?.["500gb"] ||
                                        9.96
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                value="750gb"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span className="text-left text-lg">
                                    750 GB Armazenamento de Objetos nos Estados
                                    Unidos
                                  </span>
                                  <span
                                    className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-bold`}
                                  >
                                    {formatBRLPerMonth(
                                      plan.objectStoragePrices?.["750gb"] ||
                                        14.94
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                value="1tb"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span className="text-left text-lg">
                                    1 TB Armazenamento de Objetos nos Estados
                                    Unidos
                                  </span>
                                  <span
                                    className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-bold`}
                                  >
                                    {formatBRLPerMonth(
                                      plan.objectStoragePrices?.["1tb"] || 19.92
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Server Management — Contabo discontinued this add-on, commented out (not deleted) per request */}
                      {/* <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3">
                          <span className={`text-lg font-bold ${embedded ? "text-muted-foreground" : "text-slate-300"}`}>Gerenciamento de Servidor</span>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={serverManagement} onValueChange={setServerManagement}>
                            <SelectTrigger className={`h-12 ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}>
                              <SelectValue placeholder="Selecione o gerenciamento" />
                            </SelectTrigger>
                            <SelectContent className={`${embedded ? "bg-card border-border text-foreground" : "bg-[#000B12] border-white/10 text-white"} max-w-[calc(100vw-2rem)]`}>
                              <SelectItem value="unmanaged" className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}>
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">Não Gerenciado</span>
                                  <span className={`text-lg ${embedded ? "text-muted-foreground" : "text-slate-400"} font-medium ml-4`}>Grátis</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="managed" className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}>
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-lg">Gerenciado</span>
                                  <span className={`${embedded ? "text-foreground" : "text-white"} font-bold ml-4`}>{formatBRLPerMonth(plan.managedEur || 219.98)}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div> */}

                      {/* Monitoring */}
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        <div className="md:col-span-3">
                          <span
                            className={`font-bold text-lg ${embedded ? "text-muted-foreground" : "text-slate-300"}`}
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
                              className={`h-12 ${embedded ? "border-border" : "border-white/10"} ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-foreground" : "text-white"}`}
                            >
                              <SelectValue placeholder="Selecione o monitoramento" />
                            </SelectTrigger>
                            <SelectContent
                              className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} max-w-[calc(100vw-2rem)]`}
                            >
                              <SelectItem
                                className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                value="none"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span className="text-left">Nenhum</span>
                                  <span
                                    className={`text-lg ${embedded ? "text-muted-foreground" : "text-slate-400"} ml-4 font-medium`}
                                  >
                                    Livre
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                                value="full"
                              >
                                <div className="flex w-full items-center justify-between">
                                  <span className="text-lg">
                                    Monitoramento Completo
                                  </span>
                                  <span
                                    className={`${embedded ? "text-foreground" : "text-white"} ml-4 font-bold`}
                                  >
                                    {formatBRLPerMonth(
                                      plan.monitoringEur || 22.98
                                    )}
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
        <section
          className={`${embedded ? "bg-muted/40" : "bg-white/5"} rounded-2xl border p-8 ${embedded ? "border-border" : "border-white/10"} shadow-2xl backdrop-blur-md`}
        >
          <h2
            className={`font-black text-base md:text-xl ${embedded ? "text-foreground" : "text-white"} mb-8 uppercase tracking-tight`}
          >
            Login e senha para o seu servidor
          </h2>

          <div className="max-w-3xl space-y-8">
            {/* Username */}
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
              <div className="md:col-span-3">
                <span
                  className={`font-bold text-lg ${embedded ? "text-muted-foreground" : "text-slate-300"}`}
                >
                  Usuário
                </span>
              </div>
              <div className="md:col-span-9">
                <span
                  className={`${embedded ? "text-foreground" : "text-white"} font-medium text-lg`}
                >
                  root
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="pt-3 md:col-span-3">
                <span
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-widest`}
                >
                  Senha
                </span>
              </div>
              <div className="space-y-2 md:col-span-9">
                <div className="flex justify-start">
                  <button
                    className="font-bold text-lg text-sky-400 uppercase tracking-wider hover:underline"
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

                      // Shuffle
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
                      `h-12 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} focus:border-sky-500 ${embedded ? "text-foreground" : "text-white"} pr-12`,
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
                    className={`absolute top-1/2 right-4 -translate-y-1/2 ${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"}`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordTouched &&
                  password.length > 0 &&
                  !isPasswordValid(password) && (
                    <div className="mt-1 flex items-center gap-2 font-bold text-lg text-rose-500">
                      <AlertCircle size={14} />
                      <span>
                        Por favor, insira uma senha válida (Mín. 8 caracteres,
                        maiúscula, número e símbolo)
                      </span>
                    </div>
                  )}
                {isPasswordValid(password) && (
                  <div className="mt-1 flex items-center gap-2 font-bold text-emerald-400 text-lg">
                    <Check size={14} />
                    <span>Senha válida e segura</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info List */}
            <div className="pt-4 md:ml-[25%]">
              <ul
                className={`list-disc space-y-2 ${embedded ? "text-muted-foreground" : "text-slate-400"} ml-4 font-medium text-[15px] uppercase tracking-wider`}
              >
                <li>
                  Você pode adicionar chaves SSH mais tarde no Painel de
                  Controle.
                </li>
                <li>Sua senha não será enviada por e-mail.</li>
                <li>
                  Mantenha-a segura para acesso ao Windows. Se perdê-la, será
                  necessária uma reinstalação.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Final CTA Removed as per user request - redundant with summary bar */}
      </div>

      {/* Fixed Bottom Summary Bar */}
      <div
        className={`${embedded ? "sticky" : "fixed right-0 left-0"} bottom-0 ${embedded ? "bg-card/90" : "bg-[#000B12]/90"} border-t ${embedded ? "border-border" : "border-white/10"} z-[100] pr-16 shadow-[0_-4px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl md:pr-0`}
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
                  className={`font-black text-lg ${embedded ? "text-foreground" : "text-white"} mb-4 uppercase tracking-widest`}
                >
                  Detalhamento do Pedido
                </h3>
                <div className="grid grid-cols-1 gap-x-12 gap-y-2 md:grid-cols-2">
                  {(() => {
                    const selectedDuration =
                      durations.find((d: any) => d.id === duration) ||
                      durations[0];
                    const durationMonths = Number.parseInt(duration, 10);
                    const qty = Number.parseInt(quantity, 10) || 1;
                    const items = [];
                    const RATE = currentRate;

                    // Base Plan
                    items.push({
                      label: `${plan.name} (${durationMonths} ${durationMonths === 1 ? "mês" : "meses"})${qty > 1 ? ` × ${qty}` : ""}`,
                      price: selectedDuration.eur * RATE * durationMonths * qty,
                    });

                    // Setup Fee
                    if (selectedDuration.setupEur > 0) {
                      items.push({
                        label: `Taxa de Configuração${qty > 1 ? ` × ${qty}` : ""}`,
                        price: selectedDuration.setupEur * RATE * qty,
                      });
                    }

                    // Location
                    const loc = Object.values(planLocations)
                      .flat()
                      .find((l: any) => l.id === location) as any;
                    if (loc?.eur) {
                      items.push({
                        label: `Localização: ${loc.name}${qty > 1 ? ` × ${qty}` : ""}`,
                        price: loc.eur * RATE * durationMonths * qty,
                      });
                    }

                    // Storage
                    const st = storageTypes.find(
                      (s: any) => s.id === storageType
                    );
                    if (st?.eur) {
                      items.push({
                        label: `Upgrade de Disco: ${st.name}${qty > 1 ? ` × ${qty}` : ""}`,
                        price: st.eur * RATE * durationMonths * qty,
                      });
                    }

                    // OS / Panel Pricing
                    const imgPrices = getImagePrices(planId, {});
                    if (osImage === "windows") {
                      const eur =
                        windowsVersion === "2016"
                          ? imgPrices.windows_2016
                          : imgPrices.windows;
                      items.push({
                        label: `Windows Server ${windowsVersion}`,
                        price: eur * RATE * durationMonths * qty,
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
                        "500": 397.0,
                        "1000": 797.0,
                      };
                      const accounts = cpanelLicence;
                      const eur = cpanelPricesMap[accounts] || 43.5;
                      items.push({
                        label: `cPanel (${cpanelLicence} contas)`,
                        price: eur * RATE * durationMonths * qty,
                      });
                    } else if (
                      osImage === "plesk" ||
                      osImage === "plesk-linux"
                    ) {
                      let eur = imgPrices.pleskLinux;
                      if (pleskLicence === "pro") eur = imgPrices.pleskPro;
                      else if (pleskLicence === "host")
                        eur = imgPrices.pleskHost;
                      items.push({
                        label: `Plesk Linux (${pleskLicence})`,
                        price: eur * RATE * durationMonths * qty,
                      });
                    } else if (osImage === "plesk-win") {
                      const licEur =
                        pleskWinLicence === "admin"
                          ? imgPrices.pleskWin
                          : pleskWinLicence === "host"
                            ? imgPrices.pleskHost
                            : imgPrices.pleskPro;
                      const winEur =
                        pleskWinVersion === "2016"
                          ? imgPrices.windows_2016
                          : imgPrices.windows;
                      items.push({
                        label: `Plesk Windows (${pleskWinLicence})`,
                        price: (licEur + winEur) * RATE * durationMonths * qty,
                      });
                    } else if (osImage) {
                      const img = Object.values(dynamicImages)
                        .flat()
                        .find((i: any) => i.id === osImage) as any;
                      if (img?.eur) {
                        items.push({
                          label: `SO/Painel: ${img.name}`,
                          price: img.eur * RATE * durationMonths * qty,
                        });
                      } else if (img) {
                        items.push({ label: `SO: ${img.name}`, price: 0 });
                      }
                    }

                    // Add-ons
                    if (autoBackup) {
                      items.push({
                        label: `Backup Automático${qty > 1 ? ` × ${qty}` : ""}`,
                        price:
                          (plan.backupEur || 3.0) * RATE * durationMonths * qty,
                      });
                    }
                    if (privateNetwork === "enabled")
                      items.push({
                        label: `Rede Privada${qty > 1 ? ` × ${qty}` : ""}`,
                        price:
                          (plan.privateNetworkEur || 4.58) *
                          RATE *
                          durationMonths *
                          qty,
                      });
                    if (ipv4Address === "2ip")
                      items.push({
                        label: `IP Adicional${qty > 1 ? ` × ${qty}` : ""}`,
                        price:
                          (plan.additionalIpEur || 7.0) *
                          RATE *
                          durationMonths *
                          qty,
                      });

                    if (objectStorage !== "none") {
                      const prices = {
                        "1tb": 19.92,
                        "250gb": 4.98,
                        "500gb": 9.96,
                        "750gb": 14.94,
                      };
                      const p =
                        prices[objectStorage as keyof typeof prices] || 0;
                      items.push({
                        label: `Object Storage: ${objectStorage.toUpperCase()}${qty > 1 ? ` × ${qty}` : ""}`,
                        price: p * RATE * durationMonths * qty,
                      });
                    }

                    // Server Management discontinued by Contabo — commented out (not deleted) per request
                    // if (serverManagement === "managed") items.push({ label: `Gerenciamento de Servidor${qty > 1 ? ` × ${qty}` : ""}`, price: (plan.managedEur || 219.98) * RATE * durationMonths * qty });
                    if (monitoring === "full")
                      items.push({
                        label: `Monitoramento Completo${qty > 1 ? ` × ${qty}` : ""}`,
                        price:
                          (plan.monitoringEur || 22.98) *
                          RATE *
                          durationMonths *
                          qty,
                      });

                    return items.map((item, idx) => (
                      <div
                        className="flex items-center justify-between border-white/5 border-b pb-1 text-xl"
                        key={idx}
                      >
                        <span
                          className={`${embedded ? "text-muted-foreground" : "text-slate-400"}`}
                        >
                          {item.label}
                        </span>
                        <span
                          className={`font-bold ${embedded ? "text-foreground" : "text-white"}`}
                        >
                          {formatBRL(item.price / RATE)}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto flex h-auto max-w-7xl items-center justify-between gap-2 px-2 py-2 md:h-24 md:gap-4 md:px-10 md:py-0">
          <div className="flex items-center gap-2 md:gap-6">
            <div
              className={`hidden h-14 w-14 md:flex ${embedded ? "bg-muted/40" : "bg-white/5"} items-center justify-center rounded-full border shadow-lg ${embedded ? "border-border" : "border-white/10"}`}
            >
              <ShieldCheck className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`font-black ${embedded ? "text-foreground" : "text-white"} text-sm uppercase leading-tight tracking-widest md:text-2xl`}
                >
                  Resumo
                </h3>
                <button
                  className={`p-1 hover:${embedded ? "bg-accent" : "bg-white/10"} rounded-full transition-colors`}
                  onClick={() => setShowSummaryDetails(!showSummaryDetails)}
                >
                  {showSummaryDetails ? (
                    <ChevronDown className="h-4 w-4 text-sky-400 md:h-5 md:w-5" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-sky-400 md:h-5 md:w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 lg:gap-8">
            {/* Middle: Savings */}
            {(() => {
              const selectedDuration =
                durations.find((d: any) => d.id === duration) || durations[0];
              const durationMonths = Number.parseInt(duration, 10);
              const qty = Number.parseInt(quantity, 10) || 1;
              const RATE = currentRate;
              const monthlyPrice = selectedDuration.eur * RATE;
              const monthlyBase =
                (selectedDuration.oldEur || selectedDuration.eur) * RATE;
              const setupFee = selectedDuration.setupEur * RATE;

              let additionalMonthly = 0;
              const loc = Object.values(planLocations)
                .flat()
                .find((l: any) => l.id === location) as any;
              if (loc?.eur) {
                additionalMonthly += loc.eur * RATE;
              }

              const st = storageTypes.find((s: any) => s.id === storageType);
              if (st?.eur) {
                additionalMonthly += st.eur * RATE;
              }

              const imgPrices = getImagePrices(planId, {});
              if (osImage === "windows") {
                const eur =
                  windowsVersion === "2016"
                    ? imgPrices.windows_2016
                    : imgPrices.windows;
                additionalMonthly += eur * RATE;
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
                  "500": 397.0,
                  "1000": 797.0,
                };
                const accounts = cpanelLicence;
                const eur = cpanelPricesMap[accounts] || 43.5;
                additionalMonthly += eur * RATE;
              } else if (osImage === "plesk" || osImage === "plesk-linux") {
                let eur = imgPrices.pleskLinux;
                if (pleskLicence === "pro") eur = imgPrices.pleskPro;
                else if (pleskLicence === "host") eur = imgPrices.pleskHost;
                additionalMonthly += eur * RATE;
              } else if (osImage === "plesk-win") {
                const licEur =
                  pleskWinLicence === "admin"
                    ? imgPrices.pleskWin
                    : pleskWinLicence === "host"
                      ? imgPrices.pleskHost
                      : imgPrices.pleskPro;
                const winEur =
                  pleskWinVersion === "2016"
                    ? imgPrices.windows_2016
                    : imgPrices.windows;
                additionalMonthly += (licEur + winEur) * RATE;
              } else if (osImage) {
                const img = Object.values(dynamicImages)
                  .flat()
                  .find((i: any) => i.id === osImage) as any;
                if (img?.eur) {
                  additionalMonthly += img.eur * RATE;
                }
              }

              if (autoBackup) {
                additionalMonthly += (plan.backupEur || 1.5) * RATE;
              }
              if (privateNetwork === "enabled")
                additionalMonthly += (plan.privateNetworkEur || 2.29) * RATE;
              if (ipv4Address === "2ip")
                additionalMonthly += (plan.additionalIpEur || 3.5) * RATE;

              if (objectStorage !== "none") {
                const prices: any = plan.objectStoragePrices || {
                  "1tb": 9.96,
                  "250gb": 2.49,
                  "500gb": 4.98,
                  "750gb": 7.47,
                };
                additionalMonthly += (prices[objectStorage] || 0) * RATE;
              }
              // Server Management discontinued by Contabo — commented out (not deleted) per request
              // if (serverManagement === "managed") additionalMonthly += (plan.managedEur || 109.99) * RATE;
              if (monitoring === "full")
                additionalMonthly += (plan.monitoringEur || 11.49) * RATE;

              const totalBaseMonthly = monthlyBase + additionalMonthly;
              const totalMonthly = monthlyPrice + additionalMonthly;
              const dueToday = (totalMonthly * durationMonths + setupFee) * qty;
              const totalSavings =
                (totalBaseMonthly - totalMonthly) * durationMonths * qty;

              return (
                <>
                  <div className="hidden min-w-[120px] flex-1 text-center md:block">
                    {totalSavings > 0 && (
                      <p className="font-bold text-emerald-500 text-sm">
                        Você economiza {formatBRL(totalSavings / currentRate)}.
                      </p>
                    )}
                  </div>

                  {/* Right: Total & Button */}
                  <div className="flex items-center gap-3 md:gap-5">
                    <div className="flex min-w-0 flex-col gap-0.5 md:min-w-[180px]">
                      <div className="hidden items-center justify-between gap-3 text-[13px] md:flex">
                        <span
                          className={`${embedded ? "text-muted-foreground" : "text-slate-400"} font-bold uppercase tracking-widest`}
                        >
                          Mensal
                        </span>
                        <span
                          className={`${embedded ? "text-foreground" : "text-white"} whitespace-nowrap font-black`}
                        >
                          {formatBRL((totalMonthly * qty) / currentRate)}
                        </span>
                      </div>
                      <div className="hidden items-center justify-between gap-3 text-[12px] md:flex">
                        <span
                          className={`${embedded ? "text-muted-foreground" : "text-slate-400"} font-bold uppercase tracking-widest`}
                        >
                          Taxa Única
                        </span>
                        <span
                          className={`${embedded ? "text-foreground" : "text-white"} whitespace-nowrap font-black`}
                        >
                          {formatBRL((setupFee * qty) / currentRate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span
                            className={`font-black text-[10px] md:text-[13px] ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                          >
                            Vencido Hoje
                          </span>
                          <span
                            className={`hidden text-[11px] md:block ${embedded ? "text-muted-foreground" : "text-slate-400"} -mt-0.5 font-medium`}
                          >
                            Pré-pago {durationMonths}{" "}
                            {durationMonths === 1 ? "Mês" : "Meses"}
                          </span>
                        </div>
                        <span
                          className={`font-black text-sm md:text-lg ${embedded ? "text-foreground" : "text-white"} whitespace-nowrap`}
                        >
                          {formatBRL(dueToday / currentRate)}
                        </span>
                      </div>
                    </div>

                    <Button
                      className={cn(
                        "h-9 min-w-0 rounded-xl px-3 font-black text-sm uppercase tracking-widest shadow-lg transition-all md:h-14 md:min-w-[180px] md:px-12 md:text-2xl",
                        isPasswordValid(password)
                          ? `bg-sky-500 hover:bg-sky-400 ${embedded ? "text-foreground" : "text-white"} shadow-sky-500/20`
                          : `${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "text-muted-foreground" : "text-slate-500"} cursor-not-allowed shadow-none`
                      )}
                      disabled={!isPasswordValid(password)}
                      onClick={() => {
                        if (isPasswordValid(password)) {
                          router.push(
                            `/checkout/personal-data?planId=${planId}&qty=${quantity}&duration=${duration}&location=${location}&storage=${storageType}&image=${osImage}&backup=${autoBackup}&management=${serverManagement}&monitoring=${monitoring}&privateNetwork=${privateNetwork}&ipv4Address=${ipv4Address}&objectStorage=${objectStorage}&password=${encodeURIComponent(password)}&ubuntuVersion=${ubuntuVersion}&windowsVersion=${windowsVersion}&rhelVersion=${rhelVersion}&debianVersion=${debianVersion}&pleskLicence=${pleskLicence}&cpanelLicence=${cpanelLicence}&cpanelVersion=${cpanelVersion}&pleskWinLicence=${pleskWinLicence}&pleskWinVersion=${pleskWinVersion}&webminVersion=${webminVersion}&lampVersion=${lampVersion}&dockerVersion=${dockerVersion}&customImageOption=${customImageOption}`
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

      {/* Ubuntu Modal */}
      <AnimatePresence>
        {showUbuntuModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowUbuntuModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-6 rounded-2xl border p-5 shadow-2xl md:space-y-8 md:p-10 ${embedded ? "border-border" : "border-white/10"}`}
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
              <p
                className={`${embedded ? "text-muted-foreground" : "text-slate-400"} text-[15px] leading-relaxed`}
              >
                Ubuntu é um sistema operacional livre e de código aberto baseado
                em Linux. Conhecido por sua facilidade de uso, estabilidade e
                forte apoio da comunidade.
              </p>
              <div className="space-y-4">
                <label
                  className={`font-black text-sm ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-widest`}
                >
                  Versão
                </label>
                <Select onValueChange={setUbuntuVersion} value={ubuntuVersion}>
                  <SelectTrigger
                    className={`h-14 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} max-w-[calc(100vw-2rem)]`}
                  >
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="Ubuntu 24.04"
                    >
                      Ubuntu 24.04 LTS
                    </SelectItem>
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="Ubuntu 22.04"
                    >
                      Ubuntu 22.04 LTS
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} hover:${embedded ? "bg-accent" : "bg-white/10"} uppercase tracking-widest`}
                  onClick={() => setShowUbuntuModal(false)}
                  variant="ghost"
                >
                  Pular
                </Button>
                <Button
                  className={`bg-sky-500 hover:bg-sky-400 ${embedded ? "text-foreground" : "text-white"} px-8 font-black uppercase tracking-widest`}
                  onClick={() => setShowUbuntuModal(false)}
                >
                  Começar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Images Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowCustomModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-6 rounded-2xl border p-5 shadow-2xl md:space-y-8 md:p-10 ${embedded ? "border-border" : "border-white/10"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img
                  alt="Custom"
                  className="h-10 w-10"
                  src="/custom-images.png"
                />
                <h2
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Imagens Personalizadas
                </h2>
              </div>
              <div className="space-y-4">
                <label
                  className={`font-black text-sm ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-widest`}
                >
                  Opção
                </label>
                <Select
                  onValueChange={setCustomImageOption}
                  value={customImageOption}
                >
                  <SelectTrigger
                    className={`h-14 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} max-w-[calc(100vw-2rem)]`}
                  >
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="existing"
                    >
                      Usar armazenamento existente
                    </SelectItem>
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="add"
                    >
                      Adicionar armazenamento (25 GB) -{" "}
                      <span className="font-black text-sky-400">R$ 13,95</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} hover:${embedded ? "bg-accent" : "bg-white/10"} uppercase tracking-widest`}
                  onClick={() => setShowCustomModal(false)}
                  variant="ghost"
                >
                  Pular
                </Button>
                <Button
                  className={`bg-sky-500 hover:bg-sky-400 ${embedded ? "text-foreground" : "text-white"} px-8 font-black uppercase tracking-widest`}
                  onClick={() => setShowCustomModal(false)}
                >
                  Confirmar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Windows Server Modal */}
      <AnimatePresence>
        {showWindowsModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowWindowsModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-6 rounded-2xl border p-5 shadow-2xl md:space-y-8 md:p-10 ${embedded ? "border-border" : "border-white/10"}`}
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
                    className={`h-16 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                  >
                    <div className="flex w-full items-center justify-between pr-2">
                      <span
                        className={`text-sm ${embedded ? "text-foreground" : "text-white"}`}
                      >
                        Server {windowsVersion} Datacenter
                      </span>
                      <span className="font-black text-sky-400 text-xs">
                        {(() => {
                          const imgPrices = getImagePrices(planId, {});
                          const eur =
                            windowsVersion === "2016"
                              ? imgPrices.windows_2016
                              : imgPrices.windows;
                          return formatBRL(eur);
                        })()} / mês
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[130] max-w-[calc(100vw-2rem)]`}
                  >
                    {["2025", "2022", "2019", "2016"].map(v => (
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        key={v}
                        value={v}
                      >
                        <div className="flex w-full flex-1 items-center justify-between gap-4 py-1 md:w-[480px]">
                          <span
                            className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                          >
                            Server {v} Datacenter
                          </span>
                          <span className="ml-auto font-black text-sky-400">
                            {formatBRL(
                              v === "2016"
                                ? getImagePrices(planId, {}).windows_2016
                                : getImagePrices(planId, {}).windows
                            )}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} hover:${embedded ? "bg-accent" : "bg-white/10"} uppercase tracking-widest`}
                  onClick={() => setShowWindowsModal(false)}
                  variant="ghost"
                >
                  Pular
                </Button>
                <Button
                  className={`bg-sky-500 hover:bg-sky-400 ${embedded ? "text-foreground" : "text-white"} px-8 font-black uppercase tracking-widest`}
                  onClick={() => setShowWindowsModal(false)}
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
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowCpanelModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-6 rounded-2xl border p-5 shadow-2xl md:space-y-8 md:p-10 ${embedded ? "border-border" : "border-white/10"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img alt="cPanel" className="h-10 w-10" src="/cpanel.png" />
                <h2
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  cPanel/WHM
                </h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <label
                    className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                  >
                    Licença
                  </label>
                  <Select
                    onValueChange={setCpanelLicence}
                    value={cpanelLicence}
                  >
                    <SelectTrigger
                      className={`h-16 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                    >
                      <div className="flex w-full items-center justify-between pr-2">
                        <span
                          className={`text-sm ${embedded ? "text-foreground" : "text-white"}`}
                        >
                          {cpanelLicence} contas
                        </span>
                        <span className="font-black text-sky-400 text-xs">
                          {(() => {
                            const imgPrices = getImagePrices(planId, {});
                            let eur = imgPrices.cpanel;
                            const accounts = Number.parseInt(cpanelLicence, 10);
                            if (accounts === 30) eur = 29.0;
                            else if (accounts === 50) eur = 38.5;
                            else if (accounts === 100) eur = 47.0;
                            else if (accounts === 150) eur = 58.5;
                            else if (accounts >= 200)
                              eur =
                                78.5 + Math.floor((accounts - 200) / 50) * 20.0;
                            return formatBRL(eur);
                          })()} / mês
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[130] max-h-[300px] max-w-[calc(100vw-2rem)]`}
                    >
                      {[5, 30, 50, 100, 150, 200, 250, 300, 500, 1000].map(
                        count => (
                          <SelectItem
                            className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                            key={count}
                            value={count.toString()}
                          >
                            <div className="flex w-full flex-1 items-center justify-between gap-4 py-1 md:w-[480px]">
                              <span
                                className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                              >
                                {count} contas
                              </span>
                              <span className="ml-auto font-black text-sky-400">
                                {(() => {
                                  const cpanelPricesMap: Record<
                                    string,
                                    number
                                  > = {
                                    "5": 43.5,
                                    "30": 58.0,
                                    "50": 77.0,
                                    "100": 94.0,
                                    "150": 117.0,
                                    "200": 157.0,
                                    "250": 197.0,
                                    "300": 237.0,
                                    "500": 397.0,
                                    "1000": 797.0,
                                  };
                                  return formatBRL(
                                    cpanelPricesMap[count.toString()] || 43.5
                                  );
                                })()}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <label
                    className={`font-black text-sm ${embedded ? "text-muted-foreground" : "text-slate-400"} uppercase tracking-widest`}
                  >
                    Sistema Operacional
                  </label>
                  <Select
                    onValueChange={setCpanelVersion}
                    value={cpanelVersion}
                  >
                    <SelectTrigger
                      className={`h-14 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} max-w-[calc(100vw-2rem)]`}
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
                  Pular
                </Button>
                <Button
                  className={`bg-sky-500 hover:bg-sky-400 ${embedded ? "text-foreground" : "text-white"} px-8 font-black uppercase tracking-widest`}
                  onClick={() => setShowCpanelModal(false)}
                >
                  Configurar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RHEL Variants Modal */}
      <AnimatePresence>
        {showRhelModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowRhelModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-6 rounded-2xl border p-5 shadow-2xl md:space-y-8 md:p-10 ${embedded ? "border-border" : "border-white/10"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img
                  alt="RHEL"
                  className="h-10 w-10"
                  src="/centos-svgrepo-com.svg"
                />
                <h2
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  RHEL Variants
                </h2>
              </div>
              <div className="space-y-4">
                <label
                  className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                >
                  Distribuição
                </label>
                <Select onValueChange={setRhelVersion} value={rhelVersion}>
                  <SelectTrigger
                    className={`h-14 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} max-w-[calc(100vw-2rem)]`}
                  >
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="AlmaLinux 9"
                    >
                      AlmaLinux 9
                    </SelectItem>
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="Rocky Linux 9"
                    >
                      Rocky Linux 9
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} hover:${embedded ? "bg-accent" : "bg-white/10"} uppercase tracking-widest`}
                  onClick={() => setShowRhelModal(false)}
                  variant="ghost"
                >
                  Pular
                </Button>
                <Button
                  className={`bg-sky-500 hover:bg-sky-400 ${embedded ? "text-foreground" : "text-white"} px-8 font-black uppercase tracking-widest`}
                  onClick={() => setShowRhelModal(false)}
                >
                  Confirmar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Plesk Modal */}
      <AnimatePresence>
        {showPleskModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowPleskModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-6 rounded-2xl border p-5 shadow-2xl md:space-y-8 md:p-10 ${embedded ? "border-border" : "border-white/10"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img alt="Plesk" className="h-10 w-10" src="/plesk.png" />
                <h2
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Plesk + Linux
                </h2>
              </div>
              <div className="space-y-4">
                <label
                  className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                >
                  Licença
                </label>
                <Select onValueChange={setPleskLicence} value={pleskLicence}>
                  <SelectTrigger
                    className={`h-16 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                  >
                    <div className="flex w-full items-center justify-between pr-2">
                      <div className="flex flex-col items-start">
                        <span
                          className={`text-sm ${embedded ? "text-foreground" : "text-white"} font-bold`}
                        >
                          {pleskLicence === "admin"
                            ? "Web Admin Edition"
                            : pleskLicence === "host"
                              ? "Web Host Edition"
                              : "Web Pro Edition"}
                        </span>
                        <span className="font-black text-[10px] text-emerald-400 uppercase tracking-widest">
                          1 mês grátis
                        </span>
                      </div>
                      <span className="font-black text-sky-400 text-xs">
                        {pleskLicence === "admin"
                          ? "R$ 140,64"
                          : pleskLicence === "host"
                            ? "R$ 427,78"
                            : "R$ 222,68"}{" "}
                        / mês
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[130] max-w-[calc(100vw-2rem)]`}
                  >
                    {["admin", "pro", "host"].map(l => (
                      <SelectItem
                        className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                        key={l}
                        value={l}
                      >
                        <div className="flex w-full flex-1 items-center justify-between gap-4 py-1 md:w-[480px]">
                          <div className="flex flex-col">
                            <span
                              className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                            >
                              Web {l.charAt(0).toUpperCase() + l.slice(1)}{" "}
                              Edition
                            </span>
                            <span className="font-black text-emerald-400 text-xs uppercase">
                              1 mês grátis
                            </span>
                          </div>
                          <span className="ml-auto font-black text-sky-400">
                            {l === "admin"
                              ? "R$ 140,64"
                              : l === "host"
                                ? "R$ 427,78"
                                : "R$ 222,68"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} hover:${embedded ? "bg-accent" : "bg-white/10"} uppercase tracking-widest`}
                  onClick={() => setShowPleskModal(false)}
                  variant="ghost"
                >
                  Pular
                </Button>
                <Button
                  className={`bg-sky-500 hover:bg-sky-400 ${embedded ? "text-foreground" : "text-white"} px-8 font-black uppercase tracking-widest`}
                  onClick={() => setShowPleskModal(false)}
                >
                  Selecionar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Debian Modal */}
      <AnimatePresence>
        {showDebianModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowDebianModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-6 rounded-2xl border p-5 shadow-2xl md:space-y-8 md:p-10 ${embedded ? "border-border" : "border-white/10"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img
                  alt="Debian"
                  className="h-10 w-10"
                  src="/debian-svgrepo-com.svg"
                />
                <h2
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Debian
                </h2>
              </div>
              <div className="space-y-4">
                <label
                  className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                >
                  Versão
                </label>
                <Select onValueChange={setDebianVersion} value={debianVersion}>
                  <SelectTrigger
                    className={`h-14 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} max-w-[calc(100vw-2rem)]`}
                  >
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="Debian 13"
                    >
                      Debian 13
                    </SelectItem>
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="Debian 12"
                    >
                      Debian 12
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} hover:${embedded ? "bg-accent" : "bg-white/10"} uppercase tracking-widest`}
                  onClick={() => setShowDebianModal(false)}
                  variant="ghost"
                >
                  Pular
                </Button>
                <Button
                  className={`bg-sky-500 hover:bg-sky-400 ${embedded ? "text-foreground" : "text-white"} px-8 font-black uppercase tracking-widest`}
                  onClick={() => setShowDebianModal(false)}
                >
                  Confirmar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Docker Modal */}
      <AnimatePresence>
        {showDockerModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowDockerModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-6 rounded-2xl border p-5 shadow-2xl md:space-y-8 md:p-10 ${embedded ? "border-border" : "border-white/10"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img alt="Docker" className="h-10 w-10" src="/docker.png" />
                <h2
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Docker
                </h2>
              </div>
              <div className="space-y-4">
                <label
                  className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                >
                  Versão
                </label>
                <Select onValueChange={setDockerVersion} value={dockerVersion}>
                  <SelectTrigger
                    className={`h-14 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} max-w-[calc(100vw-2rem)]`}
                  >
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="Ubuntu 22.04"
                    >
                      Ubuntu 22.04
                    </SelectItem>
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="Debian 12"
                    >
                      Debian 12
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} hover:${embedded ? "bg-accent" : "bg-white/10"} uppercase tracking-widest`}
                  onClick={() => setShowDockerModal(false)}
                  variant="ghost"
                >
                  Pular
                </Button>
                <Button
                  className={`bg-sky-500 hover:bg-sky-400 ${embedded ? "text-foreground" : "text-white"} px-8 font-black uppercase tracking-widest`}
                  onClick={() => setShowDockerModal(false)}
                >
                  Confirmar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LAMP Modal */}
      <AnimatePresence>
        {showLampModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowLampModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-6 rounded-2xl border p-5 shadow-2xl md:space-y-8 md:p-10 ${embedded ? "border-border" : "border-white/10"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img alt="LAMP" className="h-10 w-10" src="/lamp.png" />
                <h2
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  LAMP Stack
                </h2>
              </div>
              <div
                className={`${embedded ? "bg-muted/40" : "bg-white/5"} border ${embedded ? "border-border" : "border-white/10"} space-y-4 rounded-xl p-6`}
              >
                <h3 className="font-bold text-[15px] text-sky-400 uppercase tracking-wider">
                  Linux, Apache, MySQL e PHP
                </h3>
                <p
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} text-[13px] leading-relaxed`}
                >
                  Instalaremos previamente seu servidor com Apache, PHP, MySQL e
                  phpMyAdmin. Esses serviços populares estarão prontos para uso
                  imediato.
                </p>
              </div>
              <div className="space-y-4">
                <label
                  className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                >
                  Versão
                </label>
                <Select onValueChange={setLampVersion} value={lampVersion}>
                  <SelectTrigger
                    className={`h-14 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} max-w-[calc(100vw-2rem)]`}
                  >
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="Ubuntu 22.04"
                    >
                      Ubuntu 22.04
                    </SelectItem>
                    <SelectItem
                      className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                      value="Debian 12"
                    >
                      Debian 12
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
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} hover:${embedded ? "bg-accent" : "bg-white/10"} uppercase tracking-widest`}
                  onClick={() => setShowLampModal(false)}
                  variant="ghost"
                >
                  Pular
                </Button>
                <Button
                  className={`bg-sky-500 hover:bg-sky-400 ${embedded ? "text-foreground" : "text-white"} px-8 font-black uppercase tracking-widest`}
                  onClick={() => setShowLampModal(false)}
                >
                  Confirmar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Plesk + Windows Modal */}
      <AnimatePresence>
        {showPleskWindowsModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowPleskWindowsModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-6 rounded-2xl border p-5 shadow-2xl md:space-y-8 md:p-10 ${embedded ? "border-border" : "border-white/10"}`}
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
                    Licença
                  </label>
                  <Select
                    onValueChange={setPleskWinLicence}
                    value={pleskWinLicence}
                  >
                    <SelectTrigger
                      className={`h-16 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                    >
                      <div className="flex w-full items-center justify-between pr-2">
                        <div className="flex flex-col items-start">
                          <span
                            className={`text-sm ${embedded ? "text-foreground" : "text-white"} font-bold`}
                          >
                            {pleskWinLicence === "admin"
                              ? "Web Admin Edition"
                              : pleskWinLicence === "host"
                                ? "Web Host Edition"
                                : "Web Pro Edition"}
                          </span>
                          <span className="font-black text-[10px] text-emerald-400 uppercase tracking-widest">
                            1 mês grátis
                          </span>
                        </div>
                        <span className="font-black text-sky-400 text-xs">
                          {formatBRL(
                            pleskWinLicence === "admin"
                              ? getImagePrices(planId, {}).pleskWin
                              : pleskWinLicence === "pro"
                                ? getImagePrices(planId, {}).pleskPro
                                : getImagePrices(planId, {}).pleskHost
                          )}{" "}
                          / mês
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[130] max-w-[calc(100vw-2rem)]`}
                    >
                      {["admin", "pro", "host"].map(l => (
                        <SelectItem
                          className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                          key={l}
                          value={l}
                        >
                          <div className="flex w-full flex-1 items-center justify-between gap-4 py-1 md:w-[480px]">
                            <div className="flex flex-col">
                              <span
                                className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                              >
                                Web {l.charAt(0).toUpperCase() + l.slice(1)}{" "}
                                Edition
                              </span>
                              <span className="font-black text-emerald-400 text-xs uppercase">
                                1 mês grátis
                              </span>
                            </div>
                            <span className="ml-auto font-black text-sky-400">
                              {formatBRL(
                                l === "admin"
                                  ? getImagePrices(planId, {}).pleskWin
                                  : l === "pro"
                                    ? getImagePrices(planId, {}).pleskPro
                                    : getImagePrices(planId, {}).pleskHost
                              )}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <label
                    className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                  >
                    Versão Windows
                  </label>
                  <Select
                    onValueChange={setPleskWinVersion}
                    value={pleskWinVersion}
                  >
                    <SelectTrigger
                      className={`h-16 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                    >
                      <div className="flex w-full items-center justify-between pr-2">
                        <span className="text-sm">
                          Server {pleskWinVersion} Datacenter
                        </span>
                        <span className="font-black text-sky-400 text-xs">
                          {formatBRL(
                            pleskWinVersion === "2016"
                              ? getImagePrices(planId, {}).windows_2016
                              : getImagePrices(planId, {}).windows
                          )}{" "}
                          / mês
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent
                      className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} z-[130] max-w-[calc(100vw-2rem)]`}
                    >
                      {["2025", "2022", "2019", "2016"].map(v => (
                        <SelectItem
                          className={`focus:${embedded ? "bg-accent" : "bg-white/10"} focus:${embedded ? "text-foreground" : "text-white"}`}
                          key={v}
                          value={v}
                        >
                          <div className="flex w-full flex-1 items-center justify-between gap-4 py-1 md:w-[480px]">
                            <span
                              className={`font-black ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tighter`}
                            >
                              Server {v} Datacenter
                            </span>
                            <span className="ml-auto font-black text-sky-400">
                              {formatBRL(
                                v === "2016"
                                  ? getImagePrices(planId, {}).windows_2016
                                  : getImagePrices(planId, {}).windows
                              )}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} hover:${embedded ? "bg-accent" : "bg-white/10"} uppercase tracking-widest`}
                  onClick={() => setShowPleskWindowsModal(false)}
                  variant="ghost"
                >
                  Pular
                </Button>
                <Button
                  className={`bg-sky-500 hover:bg-sky-400 ${embedded ? "text-foreground" : "text-white"} px-8 font-black uppercase tracking-widest`}
                  onClick={() => setShowPleskWindowsModal(false)}
                >
                  Selecionar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Webmin Modal */}
      <AnimatePresence>
        {showWebminModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowWebminModal(false)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`${embedded ? "bg-card" : "bg-[#000B12]"} w-full max-w-[600px] space-y-6 rounded-2xl border p-5 shadow-2xl md:space-y-8 md:p-10 ${embedded ? "border-border" : "border-white/10"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <img alt="Webmin" className="h-10 w-10" src="/webmin.png" />
                <h2
                  className={`font-black text-xl ${embedded ? "text-foreground" : "text-white"} uppercase tracking-tight`}
                >
                  Webmin
                </h2>
              </div>
              <div className="space-y-4">
                <label
                  className={`font-bold text-sm ${embedded ? "text-muted-foreground" : "text-slate-300"} uppercase tracking-widest`}
                >
                  Versão
                </label>
                <Select onValueChange={setWebminVersion} value={webminVersion}>
                  <SelectTrigger
                    className={`h-14 ${embedded ? "bg-muted/40" : "bg-white/5"} ${embedded ? "border-border" : "border-white/10"} ${embedded ? "text-foreground" : "text-white"}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`${embedded ? "border-border bg-card text-foreground" : "border-white/10 bg-[#000B12] text-white"} max-w-[calc(100vw-2rem)]`}
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
              <div className="flex justify-end gap-4">
                <Button
                  className={`${embedded ? "text-muted-foreground" : "text-slate-400"} hover:${embedded ? "text-foreground" : "text-white"} hover:${embedded ? "bg-accent" : "bg-white/10"} uppercase tracking-widest`}
                  onClick={() => setShowWebminModal(false)}
                  variant="ghost"
                >
                  Pular
                </Button>
                <Button
                  className={`bg-sky-500 hover:bg-sky-400 ${embedded ? "text-foreground" : "text-white"} px-8 font-black uppercase tracking-widest`}
                  onClick={() => setShowWebminModal(false)}
                >
                  Confirmar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
