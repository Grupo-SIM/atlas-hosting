"use client";

export const dynamic = "force-dynamic";

import { useState, useLayoutEffect, useEffect, useRef } from "react";
import { Roboto } from "next/font/google";
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

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});
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
import {
  getCloudVpsMonthlyEuro,
  getCloudVpsOldMonthlyEuro,
  getCloudVpsPlan,
} from "@/lib/vps-catalog";
import { DISPLAY_CURRENCY_CHANGE_EVENT, readDisplayCurrency, type DisplayCurrency } from "@/lib/display-currency";
import { convertVpsPriceFromEuro } from "@/lib/vps-price-display";

// Mock data for plans
const plansData: Record<string, any> = {
  "10": {
    name: "Cloud VPS 10",
    vcpu: "4 núcleos de vCPU",
    ram: "8 GB de RAM",
    storage: "75 GB NVMe ou SSD de 150 GB",
    snapshots: "1 Instantâneo",
    traffic: "Porta de 200 Mbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 9.00, setupEur: 9.00, setupFee: "Taxa de instalação de € 9,00", discount: null },
      { id: "6", label: "6 meses", eur: 8.10, setupEur: 4.50, setupFee: "Taxa de instalação de € 4,50", discount: "ECONOMIZE 10%", oldEur: 9.00 },
      { id: "12", label: "12 meses", eur: 7.20, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 9.00 },
    ],
    storageTypes: [
      { id: "ssd-150", name: "SSD de 150 GB", price: "Livre" },
      { id: "ssd-300", name: "SSD de 300 GB", eur: 3.10 },
      { id: "nvme-75", name: "NVMe de 75 GB", price: "Livre" },
      { id: "nvme-150", name: "NVMe de 150 GB", eur: 3.70 },
    ],
    rate: 5.86,
    basePrice: 42.19,
    backupEur: 3.00,
    privateNetworkEur: 4.58,
    additionalIpEur: 7.00,
    managedEur: 219.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    },
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "146 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 2.80, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "146 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "132 ms", eur: 1.90 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "118 ms", eur: 1.90 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 2.80, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "146 ms", eur: 2.30 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "304 ms", eur: 4.30 },
        { id: "jp", name: "Ásia (Japão)", latency: "232 ms", eur: 4.70 },
        { id: "in", name: "Ásia (Índia)", latency: "286 ms", eur: 4.30 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "306 ms", eur: 3.90 },
      ]
    }
  },
  "20": {
    name: "Cloud VPS 20",
    vcpu: "6 núcleos de vCPU",
    ram: "12 GB de RAM",
    storage: "100 GB NVMe ou SSD de 200 GB",
    snapshots: "2 Instantâneos",
    traffic: "Porta de 300 Mbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 14.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 12.60, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldEur: 14.00 },
      { id: "12", label: "12 meses", eur: 11.20, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 14.00 },
    ],
    storageTypes: [
      { id: "ssd-200", name: "SSD de 200 GB", price: "Livre" },
      { id: "ssd-400", name: "SSD de 400 GB", eur: 3.90 },
      { id: "nvme-100", name: "NVMe de 100 GB", price: "Livre" },
      { id: "nvme-200", name: "NVMe de 200 GB", eur: 5.10 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "89 ms", eur: 2.90, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "137 ms", eur: 2.90 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "119 ms", eur: 2.90 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "89 ms", eur: 2.90, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 3.70 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "348 ms", eur: 8.90 },
        { id: "jp", name: "Ásia (Japão)", latency: "275 ms", eur: 8.90 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 8.90 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "351 ms", eur: 8.10 },
      ]
    },
    rate: 5.86,
    basePrice: 65.63,
    backupEur: 4.00,
    privateNetworkEur: 4.58,
    additionalIpEur: 7.00,
    managedEur: 219.98,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    },
    images: {
      popular: [
        { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
        { id: "custom", name: "Imagens personalizadas", price: "Incluído", icon: "/custom-images.png" },
        { id: "windows", name: "Servidor Windows", eur: 31.00, icon: "/windows.png" },
        { id: "cpanel", name: "cPanel", eur: 43.50, icon: "/cpanel.png" },
        { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
        { id: "plesk", name: "Plesk + Linux", eur: 24.00, icon: "/plesk.png" },
      ],
      os: [
        { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
        { id: "windows", name: "Servidor Windows", eur: 31.00, icon: "/windows.png" },
        { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
        { id: "debian", name: "Debian", price: "Incluído", icon: "/debian-svgrepo-com.svg" },
        { id: "almalinux", name: "AlmaLinux", price: "Incluído", icon: "/almalinux.png" },
        { id: "rockylinux", name: "Rocky Linux", price: "Incluído", icon: "/rocky.png" },
      ],
      panels: [
        { id: "cpanel", name: "cPanel", eur: 43.50, icon: "/cpanel.png" },
        { id: "plesk-win", name: "Plesk + Windows", eur: 32.00, icon: "/plesk.png" },
        { id: "plesk-linux", name: "Plesk + Linux", eur: 24.00, icon: "/plesk.png" },
        { id: "webmin", name: "Webmin", price: "Incluído", icon: "/webmin.png" },
        { id: "webmin-lamp", name: "Webmin + LAMP", price: "Incluído", icon: "/lamp.png" },
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
      blockchain: [
        { id: "ipfs", name: "IPFS Node", price: "Incluído", icon: "/ipfs.png" },
        { id: "flux", name: "Flux Node", price: "Incluído", icon: "/fluxnode.png" },
        { id: "horizen", name: "Horizen Node", price: "Incluído", icon: "/horizen.png" },
      ]
    }
  },
  "30": {
    name: "Cloud VPS 30",
    vcpu: "8 núcleos de vCPU",
    ram: "24 GB de RAM",
    storage: "200 GB NVMe ou SSD de 400 GB",
    snapshots: "3 Instantâneos",
    traffic: "Porta de 600 Mbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 28.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 25.20, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldEur: 28.00 },
      { id: "12", label: "12 meses", eur: 22.40, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 28.00 },
    ],
    storageTypes: [
      { id: "ssd-400", name: "SSD de 400 GB", price: "Livre" },
      { id: "ssd-800", name: "SSD de 800 GB", eur: 7.70 },
      { id: "nvme-200", name: "NVMe de 200 GB", price: "Livre" },
      { id: "nvme-400", name: "NVMe de 400 GB", eur: 6.50 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "89 ms", eur: 5.90, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "137 ms", eur: 5.90 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "119 ms", eur: 5.90 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "89 ms", eur: 5.90, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 7.30 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "348 ms", eur: 17.80 },
        { id: "jp", name: "Ásia (Japão)", latency: "275 ms", eur: 17.80 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 17.80 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "351 ms", eur: 16.20 },
      ]
    },
    rate: 5.86,
    basePrice: 131.26,
    backupEur: 7.00,
    privateNetworkEur: 4.58,
    additionalIpEur: 7.00,
    managedEur: 219.98,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    },
    images: {
      popular: [
        { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
        { id: "custom", name: "Imagens personalizadas", price: "Incluído", icon: "/custom-images.png" },
        { id: "windows", name: "Servidor Windows", eur: 52.00, icon: "/windows.png" },
        { id: "cpanel", name: "cPanel", eur: 43.50, icon: "/cpanel.png" },
        { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
        { id: "plesk", name: "Plesk + Linux", eur: 24.00, icon: "/plesk.png" },
      ],
      os: [
        { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
        { id: "windows", name: "Servidor Windows", eur: 52.00, icon: "/windows.png" },
        { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
        { id: "debian", name: "Debian", price: "Incluído", icon: "/debian-svgrepo-com.svg" },
        { id: "almalinux", name: "AlmaLinux", price: "Incluído", icon: "/almalinux.png" },
        { id: "rockylinux", name: "Rocky Linux", price: "Incluído", icon: "/rocky.png" },
      ],
      panels: [
        { id: "cpanel", name: "cPanel", eur: 43.50, icon: "/cpanel.png" },
        { id: "plesk-win", name: "Plesk + Windows", eur: 32.00, icon: "/plesk.png" },
        { id: "plesk-linux", name: "Plesk + Linux", eur: 24.00, icon: "/plesk.png" },
        { id: "webmin", name: "Webmin", price: "Incluído", icon: "/webmin.png" },
        { id: "webmin-lamp", name: "Webmin + LAMP", price: "Incluído", icon: "/lamp.png" },
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
      blockchain: [
        { id: "ipfs", name: "IPFS Node", price: "Incluído", icon: "/ipfs.png" },
        { id: "flux", name: "Flux Node", price: "Incluído", icon: "/fluxnode.png" },
        { id: "horizen", name: "Horizen Node", price: "Incluído", icon: "/horizen.png" },
      ]
    }
  },
  "40": {
    name: "Cloud VPS 40",
    vcpu: "12 núcleos de vCPU",
    ram: "48 GB de RAM",
    storage: "250 GB NVMe ou SSD de 500 GB",
    snapshots: "3 Instantâneos",
    traffic: "Porta de 800 Mbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 50.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 45.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldEur: 50.00 },
      { id: "12", label: "12 meses", eur: 40.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 50.00 },
    ],
    storageTypes: [
      { id: "ssd-500", name: "SSD de 500 GB", price: "Livre" },
      { id: "ssd-1000", name: "SSD de 1000 GB", eur: 9.90 },
      { id: "nvme-250", name: "NVMe de 250 GB", price: "Livre" },
      { id: "nvme-500", name: "NVMe de 500 GB", eur: 7.70 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 10.50, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "135 ms", eur: 10.50 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "118 ms", eur: 10.50 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 10.50, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "148 ms", eur: 13.10 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "345 ms", eur: 31.30 },
        { id: "jp", name: "Ásia (Japão)", latency: "262 ms", eur: 31.30 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 31.30 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "350 ms", eur: 28.50 },
      ]
    },
    rate: 5.86,
    basePrice: 234.40,
    backupEur: 12.00,
    privateNetworkEur: 4.58,
    additionalIpEur: 7.00,
    managedEur: 219.98,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    },
    images: {
      popular: [
        { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
        { id: "custom", name: "Imagens personalizadas", price: "Incluído", icon: "/custom-images.png" },
        { id: "windows", name: "Servidor Windows", eur: 98.00, icon: "/windows.png" },
        { id: "cpanel", name: "cPanel", eur: 43.50, icon: "/cpanel.png" },
        { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
        { id: "plesk", name: "Plesk + Linux", eur: 24.00, icon: "/plesk.png" },
      ],
      os: [
        { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
        { id: "windows", name: "Servidor Windows", eur: 98.00, icon: "/windows.png" },
        { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
        { id: "debian", name: "Debian", price: "Incluído", icon: "/debian-svgrepo-com.svg" },
        { id: "almalinux", name: "AlmaLinux", price: "Incluído", icon: "/almalinux.png" },
        { id: "rockylinux", name: "Rocky Linux", price: "Incluído", icon: "/rocky.png" },
      ],
      panels: [
        { id: "cpanel", name: "cPanel", eur: 43.50, icon: "/cpanel.png" },
        { id: "plesk-win", name: "Plesk + Windows", eur: 32.00, icon: "/plesk.png" },
        { id: "plesk-linux", name: "Plesk + Linux", eur: 24.00, icon: "/plesk.png" },
        { id: "webmin", name: "Webmin", price: "Incluído", icon: "/webmin.png" },
        { id: "webmin-lamp", name: "Webmin + LAMP", price: "Incluído", icon: "/lamp.png" },
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
      blockchain: [
        { id: "ipfs", name: "IPFS Node", price: "Incluído", icon: "/ipfs.png" },
        { id: "flux", name: "Flux Node", price: "Incluído", icon: "/fluxnode.png" },
        { id: "horizen", name: "Horizen Node", price: "Incluído", icon: "/horizen.png" },
      ]
    }
  },
  "50": {
    name: "Cloud VPS 50",
    vcpu: "16 núcleos de vCPU",
    ram: "64 GB de RAM",
    storage: "300 GB NVMe ou SSD de 600 GB",
    snapshots: "3 Instantâneos",
    traffic: "Porta de 1 Gbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 74.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 66.60, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldEur: 74.00 },
      { id: "12", label: "12 meses", eur: 59.20, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 74.00 },
    ],
    storageTypes: [
      { id: "ssd-600", name: "SSD de 600 GB", price: "Livre" },
      { id: "ssd-1200", name: "SSD de 1.2 TB", eur: 12.30 },
      { id: "nvme-300", name: "NVMe de 300 GB", price: "Livre" },
      { id: "nvme-600", name: "NVMe de 600 GB", eur: 9.50 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 27.10, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "135 ms", eur: 15.60 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "118 ms", eur: 15.60 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 27.10, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 19.30 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "341 ms", eur: 41.60 },
        { id: "jp", name: "Ásia (Japão)", latency: "262 ms", eur: 41.60 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 41.60 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "350 ms", eur: 37.90 },
      ]
    },
    rate: 5.86,
    basePrice: 346.91,
    backupEur: 15.00,
    privateNetworkEur: 4.58,
    additionalIpEur: 7.00,
    managedEur: 219.98,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    },
    images: {
      popular: [
        { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
        { id: "custom", name: "Imagens personalizadas", price: "Incluído", icon: "/custom-images.png" },
        { id: "windows", name: "Servidor Windows", eur: 117.00, icon: "/windows.png" },
        { id: "cpanel", name: "cPanel", eur: 43.50, icon: "/cpanel.png" },
        { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
        { id: "plesk", name: "Plesk + Linux", eur: 24.00, icon: "/plesk.png" },
      ],
      os: [
        { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
        { id: "windows", name: "Servidor Windows", eur: 117.00, icon: "/windows.png" },
        { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
        { id: "debian", name: "Debian", price: "Incluído", icon: "/debian-svgrepo-com.svg" },
        { id: "almalinux", name: "AlmaLinux", price: "Incluído", icon: "/almalinux.png" },
        { id: "rockylinux", name: "Rocky Linux", price: "Incluído", icon: "/rocky.png" },
      ],
      panels: [
        { id: "cpanel", name: "cPanel", eur: 43.50, icon: "/cpanel.png" },
        { id: "plesk-win", name: "Plesk + Windows", eur: 32.00, icon: "/plesk.png" },
        { id: "plesk-linux", name: "Plesk + Linux", eur: 24.00, icon: "/plesk.png" },
        { id: "webmin", name: "Webmin", price: "Incluído", icon: "/webmin.png" },
        { id: "webmin-lamp", name: "Webmin + LAMP", price: "Incluído", icon: "/lamp.png" },
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
      blockchain: [
        { id: "ipfs", name: "IPFS Node", price: "Incluído", icon: "/ipfs.png" },
        { id: "flux", name: "Flux Node", price: "Incluído", icon: "/fluxnode.png" },
        { id: "horizen", name: "Horizen Node", price: "Incluído", icon: "/horizen.png" },
      ]
    }
  },
  "60": {
    name: "Cloud VPS 60",
    vcpu: "18 núcleos de vCPU",
    ram: "96 GB de RAM",
    storage: "350 GB NVMe ou SSD de 700 GB",
    snapshots: "3 Instantâneos",
    traffic: "Porta de 1 Gbit/s",
    durations: [
      { id: "1", label: "1 mês", eur: 98.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 88.20, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldEur: 98.00 },
      { id: "12", label: "12 meses", eur: 78.40, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 98.00 },
    ],
    storageTypes: [
      { id: "ssd-700", name: "SSD de 700 GB", price: "Livre" },
      { id: "ssd-1400", name: "SSD de 1.4 TB", eur: 13.90 },
      { id: "nvme-350", name: "NVMe de 350 GB", price: "Livre" },
      { id: "nvme-700", name: "NVMe de 700 GB", eur: 11.50 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 30.70, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "135 ms", eur: 20.60 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "118 ms", eur: 20.60 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 30.70, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 20.60 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "341 ms", eur: 47.10 },
        { id: "jp", name: "Ásia (Japão)", latency: "262 ms", eur: 47.10 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 47.10 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "350 ms", eur: 42.90 },
      ]
    },
    rate: 5.86,
    basePrice: 459.42,
    backupEur: 19.00,
    privateNetworkEur: 4.58,
    additionalIpEur: 7.00,
    managedEur: 219.98,
    monitoringEur: 22.98,
    objectStoragePrices: {
      "250gb": 4.98,
      "500gb": 9.96,
      "750gb": 14.94,
      "1tb": 19.92
    },
    images: {
      popular: [
        { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
        { id: "custom", name: "Imagens personalizadas", price: "Incluído", icon: "/custom-images.png" },
        { id: "windows", name: "Servidor Windows", eur: 140.00, icon: "/windows.png" },
        { id: "cpanel", name: "cPanel", eur: 43.50, icon: "/cpanel.png" },
        { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
        { id: "plesk", name: "Plesk + Linux", eur: 24.00, icon: "/plesk.png" },
      ],
      os: [
        { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
        { id: "windows", name: "Servidor Windows", eur: 140.00, icon: "/windows.png" },
        { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
        { id: "debian", name: "Debian", price: "Incluído", icon: "/debian-svgrepo-com.svg" },
        { id: "almalinux", name: "AlmaLinux", price: "Incluído", icon: "/almalinux.png" },
        { id: "rockylinux", name: "Rocky Linux", price: "Incluído", icon: "/rocky.png" },
      ],
      panels: [
        { id: "cpanel", name: "cPanel", eur: 43.50, icon: "/cpanel.png" },
        { id: "plesk-win", name: "Plesk + Windows", eur: 32.00, icon: "/plesk.png" },
        { id: "plesk-linux", name: "Plesk + Linux", eur: 24.00, icon: "/plesk.png" },
        { id: "webmin", name: "Webmin", price: "Incluído", icon: "/webmin.png" },
        { id: "webmin-lamp", name: "Webmin + LAMP", price: "Incluído", icon: "/lamp.png" },
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
      blockchain: [
        { id: "ipfs", name: "IPFS Node", price: "Incluído", icon: "/ipfs.png" },
        { id: "flux", name: "Flux Node", price: "Incluído", icon: "/fluxnode.png" },
        { id: "horizen", name: "Horizen Node", price: "Incluído", icon: "/horizen.png" },
      ]
    }
  }
};

const defaultDurations = [
  { id: "1", label: "1 mês", price: "R$ 52,74", setupFee: "Taxa de configuração de R$ 52,74", discount: null },
  { id: "6", label: "6 meses", price: "R$ 47,47", setupFee: "Taxa de configuração de R$ 26,37", discount: "ECONOMIZE 10%", oldPrice: "R$ 52,74" },
  { id: "12", label: "12 meses", price: "R$ 42,19", setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldPrice: "R$ 52,74" },
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
  europe: [
    { id: "eu", name: "União Europeia", latency: "156 ms", price: "Livre" },
    { id: "uk", name: "Reino Unido", latency: "135 ms", price: "R$ 22,27" },
  ],
  best: [
    { id: "eu", name: "União Europeia", latency: "156 ms", price: "Livre" },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: "R$ 16,41", recommended: true },
  ],
  australia: [
    { id: "au-sydney", name: "Austrália (Sydney)", latency: "349 ms", price: "R$ 45,71" },
  ],
  america: [
    { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", price: "R$ 22,27" },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: "R$ 16,41", recommended: true },
    { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", price: "R$ 26,96" },
  ],
  asia: [
    { id: "sg", name: "Ásia (Singapura)", latency: "338 ms", price: "R$ 50,40" },
    { id: "jp", name: "Ásia (Japão)", latency: "269 ms", price: "R$ 55,08" },
    { id: "in", name: "Ásia (Índia)", latency: "N/A", price: "R$ 50,40" },
  ]
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
  popular: [
    { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
    { id: "custom", name: "Imagens personalizadas", price: "Incluído", icon: "/custom-images.png" },
    { id: "windows", name: "Servidor Windows", eur: 15.00, icon: "/windows.png" },
    { id: "cpanel", name: "cPanel", eur: 43.50, icon: "/cpanel.png" },
    { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
    { id: "plesk", name: "Plesk + Linux", eur: 24.00, icon: "/plesk.png" },
  ],
  os: [
    { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
    { id: "windows", name: "Servidor Windows", eur: 15.00, icon: "/windows.png" },
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
    { id: "cpanel", name: "cPanel", eur: 43.50, icon: "/cpanel.png" },
    { id: "plesk-win", name: "Plesk + Windows", eur: 32.00, icon: "/plesk.png" },
    { id: "plesk-linux", name: "Plesk + Linux", eur: 24.00, icon: "/plesk.png" },
    { id: "webmin", name: "Webmin", price: "Incluído", icon: "/webmin.png" },
    { id: "webmin-lamp", name: "Webmin + LAMP", price: "Incluído", icon: "/lamp.png" },
  ],
  blockchain: [
    { id: "ipfs", name: "IPFS Node", price: "Incluído", icon: "/ipfs.png" },
    { id: "flux", name: "Flux Node", price: "Incluído", icon: "/fluxnode.png" },
    { id: "horizen", name: "Horizen Node", price: "Incluído", icon: "/horizen.png" },
  ]
};

// Contabo Cloud VPS Core catalog: Windows Server price (Contabo's listed price x2;
// Contabo charges the same price for every Windows Server version).
const catalogWindowsEur: Record<string, number> = {
  "4": 16.00,
  "6": 34.00,
  "8": 56.00,
  "12": 106.00,
  "16": 126.00,
  "18": 154.00,
};

// Contabo Cloud VPS Core catalog storage-upgrade tier (Contabo's listed price x2).
const catalogStorageUpgrade: Record<string, { label: string; eur: number }> = {
  "4": { label: "200 GB SSD", eur: 3.00 },
  "6": { label: "400 GB SSD", eur: 6.00 },
  "8": { label: "600 GB SSD", eur: 9.00 },
  "12": { label: "800 GB SSD", eur: 12.00 },
  "16": { label: "1 TB SSD", eur: 15.00 },
  "18": { label: "1.2 TB SSD", eur: 18.00 },
};

// Contabo Cloud VPS Core catalog datacenter/region surcharge (Contabo's listed price x2).
// Scales per plan tier (confirmed: surcharges differ across all six plans) — one entry per plan id.
// All six tiers (4/6/8/12/16/18) confirmed from real Contabo data.
const catalogLocations4 = {
  best: [
    { id: "eu", name: "União Europeia", latency: "252 ms", price: "Livre" },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "93 ms", eur: 3.10, recommended: true },
  ],
  europe: [
    { id: "eu", name: "União Europeia", latency: "252 ms", price: "Livre" },
    { id: "uk", name: "Reino Unido", latency: "164 ms", eur: 2.10 },
  ],
  america: [
    { id: "us-central", name: "Estados Unidos (Central)", latency: "119 ms", eur: 2.10 },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "93 ms", eur: 3.10, recommended: true },
    { id: "us-west", name: "Estados Unidos (Oeste)", latency: "162 ms", eur: 2.60 },
  ],
  asia: [
    { id: "sg", name: "Ásia (Singapura)", latency: "309 ms", eur: 5.00 },
    { id: "jp", name: "Ásia (Japão)", latency: "248 ms", eur: 5.10 },
    { id: "in", name: "Ásia (Índia)", latency: "283 ms", eur: 4.80 },
  ],
  australia: [
    { id: "au-sydney", name: "Austrália (Sydney)", latency: "313 ms", eur: 4.30 },
  ],
};

const catalogLocations6 = {
  best: [
    { id: "eu", name: "União Europeia", latency: "188 ms", price: "Livre" },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "90 ms", eur: 4.80, recommended: true },
  ],
  europe: [
    { id: "eu", name: "União Europeia", latency: "188 ms", price: "Livre" },
    { id: "uk", name: "Reino Unido", latency: "163 ms", eur: 3.20 },
  ],
  america: [
    { id: "us-central", name: "Estados Unidos (Central)", latency: "120 ms", eur: 3.20 },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "90 ms", eur: 4.80, recommended: true },
    { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 4.00 },
  ],
  asia: [
    { id: "sg", name: "Ásia (Singapura)", latency: "320 ms", eur: 7.90 },
    { id: "jp", name: "Ásia (Japão)", latency: "224 ms", eur: 8.00 },
    { id: "in", name: "Ásia (Índia)", latency: "282 ms", eur: 7.40 },
  ],
  australia: [
    { id: "au-sydney", name: "Austrália (Sydney)", latency: "313 ms", eur: 6.60 },
  ],
};

const catalogLocations8 = {
  best: [
    { id: "eu", name: "União Europeia", latency: "187 ms", price: "Livre" },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 9.50, recommended: true },
  ],
  europe: [
    { id: "eu", name: "União Europeia", latency: "187 ms", price: "Livre" },
    { id: "uk", name: "Reino Unido", latency: "161 ms", eur: 6.50 },
  ],
  america: [
    { id: "us-central", name: "Estados Unidos (Central)", latency: "119 ms", eur: 6.50 },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 9.50, recommended: true },
    { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 8.00 },
  ],
  asia: [
    { id: "sg", name: "Ásia (Singapura)", latency: "319 ms", eur: 15.70 },
    { id: "jp", name: "Ásia (Japão)", latency: "224 ms", eur: 16.00 },
    { id: "in", name: "Ásia (Índia)", latency: "281 ms", eur: 14.80 },
  ],
  australia: [
    { id: "au-sydney", name: "Austrália (Sydney)", latency: "311 ms", eur: 13.20 },
  ],
};

const catalogLocations12 = {
  best: [
    { id: "eu", name: "União Europeia", latency: "187 ms", price: "Livre" },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 17.10, recommended: true },
  ],
  europe: [
    { id: "eu", name: "União Europeia", latency: "187 ms", price: "Livre" },
    { id: "uk", name: "Reino Unido", latency: "159 ms", eur: 11.60 },
  ],
  america: [
    { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", eur: 11.60 },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 17.10, recommended: true },
    { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 14.30 },
  ],
  asia: [
    { id: "sg", name: "Ásia (Singapura)", latency: "319 ms", eur: 28.10 },
    { id: "jp", name: "Ásia (Japão)", latency: "223 ms", eur: 28.60 },
    { id: "in", name: "Ásia (Índia)", latency: "281 ms", eur: 26.40 },
  ],
  australia: [
    { id: "au-sydney", name: "Austrália (Sydney)", latency: "311 ms", eur: 23.70 },
  ],
};

const catalogLocations16 = {
  best: [
    { id: "eu", name: "União Europeia", latency: "186 ms", price: "Livre" },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 25.20, recommended: true },
  ],
  europe: [
    { id: "eu", name: "União Europeia", latency: "186 ms", price: "Livre" },
    { id: "uk", name: "Reino Unido", latency: "159 ms", eur: 17.10 },
  ],
  america: [
    { id: "us-central", name: "Estados Unidos (Central)", latency: "118 ms", eur: 17.10 },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 25.20, recommended: true },
    { id: "us-west", name: "Estados Unidos (Oeste)", latency: "146 ms", eur: 21.20 },
  ],
  asia: [
    { id: "sg", name: "Ásia (Singapura)", latency: "319 ms", eur: 41.50 },
    { id: "jp", name: "Ásia (Japão)", latency: "223 ms", eur: 42.30 },
    { id: "in", name: "Ásia (Índia)", latency: "282 ms", eur: 39.10 },
  ],
  australia: [
    { id: "au-sydney", name: "Austrália (Sydney)", latency: "310 ms", eur: 35.00 },
  ],
};

const catalogLocations18 = {
  best: [
    { id: "eu", name: "União Europeia", latency: "186 ms", price: "Livre" },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "90 ms", eur: 33.40, recommended: true },
  ],
  europe: [
    { id: "eu", name: "União Europeia", latency: "186 ms", price: "Livre" },
    { id: "uk", name: "Reino Unido", latency: "158 ms", eur: 22.60 },
  ],
  america: [
    { id: "us-central", name: "Estados Unidos (Central)", latency: "119 ms", eur: 22.60 },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "90 ms", eur: 33.40, recommended: true },
    { id: "us-west", name: "Estados Unidos (Oeste)", latency: "146 ms", eur: 28.00 },
  ],
  asia: [
    { id: "sg", name: "Ásia (Singapura)", latency: "316 ms", eur: 55.00 },
    { id: "jp", name: "Ásia (Japão)", latency: "223 ms", eur: 56.10 },
    { id: "in", name: "Ásia (Índia)", latency: "281 ms", eur: 51.70 },
  ],
  australia: [
    { id: "au-sydney", name: "Austrália (Sydney)", latency: "310 ms", eur: 46.40 },
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
    list.map((img) => (img.id === "windows" ? { ...img, eur: windowsEur } : img));
  return {
    ...images,
    popular: overrideWindows(images.popular),
    os: overrideWindows(images.os),
  };
}

function getContaboCloudPlanConfig(planId: string) {
  const cloudPlan = getCloudVpsPlan(planId);
  if (!cloudPlan) return null;

  const monthlyEuro = getCloudVpsMonthlyEuro(planId, false, 24)!;
  const storageUpgrade = catalogStorageUpgrade[planId];
  return {
    name: cloudPlan.name,
    vcpu: cloudPlan.vcpu,
    ram: cloudPlan.ram,
    storage: cloudPlan.storage,
    snapshots: cloudPlan.snapshots,
    traffic: `${cloudPlan.port} · ${cloudPlan.traffic}`,
    durations: [
      { id: "1", label: "1 mês", eur: getCloudVpsMonthlyEuro(planId, false, 1)!, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "12", label: "12 meses", eur: getCloudVpsMonthlyEuro(planId, false, 12)!, oldEur: getCloudVpsOldMonthlyEuro(planId, false), setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 15%" },
      { id: "24", label: "24 meses", eur: monthlyEuro, oldEur: getCloudVpsOldMonthlyEuro(planId, false), setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%" },
    ],
    storageTypes: storageUpgrade ? [
      { id: `${planId}-storage-base`, name: cloudPlan.storage, price: "Livre" },
      { id: `${planId}-storage-upgrade`, name: storageUpgrade.label, eur: storageUpgrade.eur },
    ] : undefined,
    locations: catalogLocationsByPlan[planId],
    images: getContaboCloudPlanImages(planId),
    basePrice: monthlyEuro,
    backupEur: getCloudVpsMonthlyEuro(planId, true, 24)! - monthlyEuro,
    privateNetworkEur: 4.58,
    additionalIpEur: 7,
    managedEur: 219.98,
    monitoringEur: 22.98,
  };
}
export default function VpsConfigurePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = params.id as string;
  
  const [currentRate, setCurrentRate] = useState(5.86);
  const [usdRate, setUsdRate] = useState(1.08);
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>("BRL");

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
    return () => window.removeEventListener(DISPLAY_CURRENCY_CHANGE_EVENT, syncCurrency);
  }, []);

  const contaboPlan = getContaboCloudPlanConfig(planId);
  const plan = contaboPlan || plansData[planId as keyof typeof plansData] || plansData["10"];
  const durations = plan.durations && plan.durations.length > 0 ? plan.durations : defaultDurations;
  const storageTypes = plan.storageTypes && plan.storageTypes.length > 0 ? plan.storageTypes : defaultStorageTypes;
  const planLocations = (plan as any).locations || locations;
  const dynamicImages = plan.images || images;

  const formatBRL = (eur: number) => {
    const amount = convertVpsPriceFromEuro(eur, displayCurrency, {
      eurToBrl: currentRate,
      eurToUsd: usdRate,
    });
    return new Intl.NumberFormat(displayCurrency === "BRL" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: displayCurrency,
    }).format(amount);
  };

  const formatBRLPerMonth = (eur: number) => {
    return `${formatBRL(eur)} / mês`;
  };

  const sp = searchParams;
  const [quantity, setQuantity] = useState(sp.get("qty") || "1");
  const [duration, setDuration] = useState(sp.get("duration") || (contaboPlan ? "24" : "1"));
  const [regionTab, setRegionTab] = useState(sp.get("regionTab") || "best");
  const [location, setLocation] = useState(sp.get("location") || "eu");
  const [storageType, setStorageType] = useState(sp.get("storage") || storageTypes[0].id);
  const [imageCategory, setImageCategory] = useState(sp.get("imageCategory") || "popular");
  const [osImage, setOsImage] = useState(sp.get("image") || "ubuntu");
  const [autoBackup, setAutoBackup] = useState(sp.has("backup") ? sp.get("backup") === "true" : !contaboPlan);
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
    window.history.replaceState({}, "", `/vps/configure/${planId}?${p.toString()}`);
  }, [quantity, duration, regionTab, location, storageType, imageCategory, osImage, autoBackup,
      ubuntuVersion, windowsVersion, cpanelLicence, cpanelVersion, rhelVersion, pleskLicence,
      debianVersion, dockerVersion, lampVersion, pleskWinLicence, pleskWinVersion, webminVersion,
      customImageOption, privateNetwork, ipv4Address, objectStorage, serverManagement, monitoring,
      password, planId]);

  // Password validation: 8+ chars, 1 upper, 1 lower, 1 number
  const isPasswordValid = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(pwd);
  };



  function getImagePrices(planId: string, defaultImagePrices: any) {
    const base = {
      ...defaultImagePrices,
      cpanel: 43.50,
      pleskLinux: 24.00,
      pleskWin: 32.00,
      pleskPro: 38.00,
      pleskHost: 73.00
    };

    if (planId === "10") {
      return {
        ...base,
        windows: 15.00,
        windows_2016: 12.50
      };
    }
    
    if (planId === "20") {
      return {
        ...base,
        windows: 31.00,
        windows_2016: 25.20
      };
    }
    
    if (planId === "30") {
      return {
        ...base,
        windows: 52.00,
        windows_2016: 42.10
      };
    }

    if (planId === "40") {
      return {
        ...base,
        windows: 98.00,
        windows_2016: 85.00
      };
    }

    if (planId === "50") {
      return {
        ...base,
        windows: 117.00,
        windows_2016: 105.00
      };
    }

    if (planId === "60") {
      return {
        ...base,
        windows: 140.00,
        windows_2016: 125.00
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
    <div className="min-h-screen bg-[#000B12] text-white font-sans pb-24 relative overflow-hidden">
      <div className="fixed inset-0 bg-landing-gradient opacity-40 pointer-events-none" />
      <Navbar variant="dark" />
      {/* Step Header could be here, but matching image's start */}
      <div className={`${roboto.className} max-w-6xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-12 space-y-8 md:space-y-12`}>

        <Link href="/#planos" className="group mb-6 flex items-center gap-2 text-lg font-bold text-sky-400 transition-all hover:text-sky-300">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Voltar para os planos
        </Link>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase drop-shadow-sm">Configure seu {plan.name}</h1>

        {/* Plan Summary Section */}
        <div className="flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-10">
          <div className="flex-1 border-2 border-sky-500/50 rounded-xl p-4 md:p-8 relative bg-white/5 backdrop-blur-md shadow-2xl">
            {/* Mobile: compact label→value list */}
            <div className="xl:hidden space-y-2 pb-6">
              {[
                { label: "CPU", value: plan.vcpu },
                { label: "RAM", value: plan.ram },
                { label: "Disco", value: plan.storage },
                { label: "Snapshot", value: plan.snapshots },
                { label: "Tráfego", value: plan.traffic },
              ].map((spec) => (
                <div key={spec.label} className="flex items-start justify-between gap-3">
                  <span className="text-[14px] font-bold text-slate-400 uppercase tracking-wide flex-shrink-0">{spec.label}</span>
                  <span className="text-[15px] font-medium text-white text-right leading-tight">{spec.value}</span>
                </div>
              ))}
            </div>
            {/* Desktop: 5-col grid */}
            <div className="hidden xl:grid xl:grid-cols-5 gap-4">
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
                <p className="text-[14px] font-bold text-slate-400 uppercase">SNAPSHOT</p>
                <p className="text-[15px] font-medium leading-tight">{plan.snapshots}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-bold text-slate-400 uppercase">TRÁFEGO</p>
                <p className="text-[15px] font-medium leading-tight">{plan.traffic}</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/#planos')}
              className="absolute bottom-4 right-4 text-[14px] text-sky-400 hover:underline font-bold uppercase tracking-wider"
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
              <SelectContent className="bg-[#000B12] border-white/10 text-white max-w-[calc(100vw-2rem)]">
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
                    <div className="absolute -top-3 left-6 bg-[#000B12] text-sky-400 text-[13px] font-black px-2 py-0.5 border border-sky-500/30 rounded shadow-lg shadow-sky-500/10">
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
                  d.setupEur === 0 ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400"
                )}>
                  {d.setupEur === 0 ? "Sem taxa de instalação" : `Taxa de configuração de ${formatBRL(d.setupEur)}`}
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

          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="hidden md:block w-1/3">
              <img src="/1098128_7510-removebg-preview.png" alt="Map" className="w-full h-auto opacity-80" />
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="flex overflow-x-auto scrollbar-thin border-b border-white/10">
                {regions.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRegionTab(r.id)}
                    className={cn(
                      "px-4 md:px-8 py-3 text-[15px] font-bold uppercase tracking-wider relative transition-colors whitespace-nowrap",
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
                      "w-full border p-4 flex items-center justify-between text-lg font-bold bg-white/5 backdrop-blur-md relative transition-all rounded-lg",
                      location === loc.id ? "border-sky-500 bg-white/10" : "border-white/10",
                      loc.recommended && "mt-6"
                    )}
                  >
                    {loc.recommended && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[10px] md:text-[15px] font-black px-2 md:px-4 py-0.5 md:py-1 rounded-md shadow-lg shadow-sky-500/20 z-10 whitespace-nowrap uppercase tracking-widest">
                        Recomendado - Melhor latência para sua região
                      </div>
                    )}
                    <div className="flex-1 text-left text-white text-base md:text-lg">{loc.name}</div>
                    <div className="hidden md:block flex-1 text-center text-slate-400 font-medium">– Latência de {loc.latency}</div>
                    <div className="flex-shrink-0 text-right text-white font-black text-base md:text-lg">{loc.eur > 0 ? formatBRLPerMonth(loc.eur) : "Livre"}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Separator className="bg-white/10" />

        {/* Storage Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Tipo de armazenamento</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {storageTypes.map((st: any) => (
              <div
                key={st.id}
                onClick={() => setStorageType(st.id)}
                className={cn(
                  "cursor-pointer rounded-lg border p-4 flex items-center justify-between text-[15px] font-bold transition-all bg-white/5 backdrop-blur-md",
                  storageType === st.id ? "border-sky-500 bg-white/10" : "border-white/10"
                )}
              >
                <span className="text-white">{st.name}</span>
                <span className={cn(st.eur === undefined && st.price === "Livre" ? "text-emerald-400" : "text-white font-black")}>{st.eur ? formatBRLPerMonth(st.eur) : st.price}</span>
              </div>
            ))}
          </div>
        </section>

        <Separator className="bg-white/10" />

        {/* Image Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Imagem</h2>
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
            {showMoreImages ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-8 overflow-hidden"
              >
                <div className="flex overflow-x-auto scrollbar-thin justify-start md:justify-center border-b border-white/10">
                  {imageCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setImageCategory(cat.id)}
                      className={cn(
                        "px-4 md:px-8 py-3 text-[15px] font-black uppercase tracking-wider relative transition-colors whitespace-nowrap",
                        imageCategory === cat.id ? "text-sky-400" : "text-slate-500 hover:text-white"
                      )}
                    >
                      {cat.label}
                      {imageCategory === cat.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500" />}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
                      "w-64 cursor-pointer rounded-lg border-2 p-4 flex items-center gap-3 transition-all bg-white/5 backdrop-blur-md",
                      osImage === img.id ? "border-sky-500 bg-white/10" : "border-white/10"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                      {img.icon ? <img src={img.icon} alt="" className="w-5 h-5 object-contain" /> : <Server size={16} className="text-slate-500" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[15px] font-bold">{img.name}</p>
                      <p className="text-[14px] text-slate-400 font-medium">{img.eur ? formatBRLPerMonth(img.eur) : img.price}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <Separator className="bg-white/10" />

        {/* Data Protection Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Proteção de Dados</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white/5 rounded-2xl p-6 md:p-10 border border-white/10 shadow-2xl backdrop-blur-md">
            <div className="lg:col-span-5 flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-28 h-28 md:w-40 md:h-40 flex-shrink-0">
                <img src="/4870961_54433-nobg.svg" alt="Backup Shield" className="w-full h-auto object-contain" />
              </div>

              <div className="flex-1">
                <ul className="space-y-4">
                  {[
                    "Backups automáticos diários.",
                    "Recuperação instantânea com 1 clique.",
                    "Mantém as últimas 10 versões de backup.",
                    "Nenhuma configuração necessária."
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-base font-bold text-slate-200 uppercase tracking-tight leading-snug">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(0,163,255,0.5)] flex-shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Selection Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Auto Backup Card */}
                <button
                  onClick={() => setAutoBackup(true)}
                  className={cn(
                    "relative p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-center min-h-[130px]",
                    autoBackup
                      ? "border-sky-500 bg-white/10 shadow-lg shadow-sky-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  )}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#000B12] px-2 md:px-4 py-0.5 md:py-1 rounded-full border border-sky-500/30 shadow-lg">
                    <span className="text-[10px] md:text-[14px] font-black text-sky-400 uppercase tracking-widest whitespace-nowrap">Nossa Recomendação</span>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-xl md:text-2xl font-black text-white mb-1 uppercase tracking-tight">Backup Automático</h3>
                    <div className="text-xl md:text-2xl font-black text-white mb-2">{formatBRLPerMonth(plan.backupEur)}</div>
                    <p className="text-sm text-slate-400 leading-tight font-medium">
                      Configure e esqueça.<br />Segurança de dados sem esforço.
                    </p>
                  </div>
                </button>

                {/* No Protection Card */}
                <button
                  onClick={() => setAutoBackup(false)}
                  className={cn(
                    "p-4 rounded-xl border transition-all text-center flex items-center justify-center min-h-[130px]",
                    !autoBackup
                      ? "border-sky-500 bg-white/10 shadow-lg"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  )}
                >
                  <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">Sem Proteção</h3>
                </button>
              </div>
            </div>
          </section>

        <Separator className="bg-white/10" />

        {/* Additional Features Section */}
        <section className="bg-white/5 rounded-2xl shadow-2xl border border-white/10 overflow-hidden mb-8 backdrop-blur-md">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-base md:text-xl font-black text-white uppercase tracking-tight">Recursos Adicionais</h2>
              <button
                onClick={() => setShowAdditionalFeatures(!showAdditionalFeatures)}
                className="flex items-center gap-1 text-[13px] font-black text-white uppercase tracking-wider"
              >
                {showAdditionalFeatures ? (
                  <><ChevronUp size={14} /></>
                ) : (
                  <><ChevronDown size={14} /></>
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {showAdditionalFeatures && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-12 overflow-hidden px-1 py-1"
                >
                  {/* Networking Sub-section */}
                  <div className="space-y-8">
                    <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight">Rede</h3>
                    <div className="space-y-6 pl-4 pr-1">
                      {/* Private Networking */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3">
                          <span className="text-lg font-bold text-slate-300">Rede Privada</span>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={privateNetwork} onValueChange={setPrivateNetwork}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white">
                              <SelectValue placeholder="Selecione a rede" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#000B12] border-white/10 text-white max-w-[calc(100vw-2rem)]">
                              <SelectItem value="none" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">Sem Rede Privada</span>
                                  <span className="text-lg text-slate-400 font-medium ml-4">Grátis</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="enabled" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">Rede Privada Ativada</span>
                                  <span className="text-white font-bold ml-4">{formatBRLPerMonth(2.29)}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Bandwidth */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3">
                          <span className="text-lg font-bold text-slate-300">Largura de Banda</span>
                        </div>
                        <div className="md:col-span-9">
                          <div className="h-12 border border-white/10 rounded-md px-4 flex flex-col justify-center bg-white/5">
                            <span className="text-lg font-bold text-white">Tráfego Ilimitado</span>
                            <span className="text-[14px] text-slate-500 uppercase tracking-wider font-medium">Política de Uso Justo</span>
                          </div>
                        </div>
                      </div>

                      {/* IPv4 */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3">
                          <span className="text-lg font-bold text-slate-300">IPv4</span>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={ipv4Address} onValueChange={setIpv4Address}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white">
                              <SelectValue placeholder="Selecione o IP" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#000B12] border-white/10 text-white max-w-[calc(100vw-2rem)]">
                              <SelectItem value="1ip" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">1 Endereço IP</span>
                                  <span className="text-lg text-slate-400 font-medium ml-4">Grátis</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="2ip" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">1 Endereço IP + 1 IP Adicional</span>
                                  <span className="text-white font-bold ml-4">{formatBRLPerMonth(plan.additionalIpEur || 7.00)}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Add-Ons Sub-section */}
                  <div className="space-y-8">
                    <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight">Complementos</h3>
                    <div className="space-y-6 pl-4 pr-1">
                      {/* Object Storage */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3">
                          <span className="text-lg font-bold text-slate-300">Armazenamento de Objetos</span>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={objectStorage} onValueChange={setObjectStorage}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white">
                              <SelectValue placeholder={objectStorage === "none" ? "Nenhum" : objectStorage === "250gb" ? "250 GB Armazenamento" : objectStorage === "500gb" ? "500 GB Armazenamento" : objectStorage === "750gb" ? "750 GB Armazenamento" : "1 TB Armazenamento"} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#000B12] border-white/10 text-white max-w-[calc(100vw-2rem)]">
                              <SelectItem value="none" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">Nenhum</span>
                                  <span className="text-lg text-slate-400 font-medium ml-4">Livre</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="250gb" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left text-lg">250 GB Armazenamento de Objetos nos Estados Unidos</span>
                                  <span className="text-white font-bold ml-4">{formatBRLPerMonth(plan.objectStoragePrices?.["250gb"] || 4.98)}</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="500gb" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left text-lg">500 GB Armazenamento de Objetos nos Estados Unidos</span>
                                  <span className="text-white font-bold ml-4">{formatBRLPerMonth(plan.objectStoragePrices?.["500gb"] || 9.96)}</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="750gb" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left text-lg">750 GB Armazenamento de Objetos nos Estados Unidos</span>
                                  <span className="text-white font-bold ml-4">{formatBRLPerMonth(plan.objectStoragePrices?.["750gb"] || 14.94)}</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="1tb" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left text-lg">1 TB Armazenamento de Objetos nos Estados Unidos</span>
                                  <span className="text-white font-bold ml-4">{formatBRLPerMonth(plan.objectStoragePrices?.["1tb"] || 19.92)}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Server Management — Contabo discontinued this add-on, commented out (not deleted) per request */}
                      {/* <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3">
                          <span className="text-lg font-bold text-slate-300">Gerenciamento de Servidor</span>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={serverManagement} onValueChange={setServerManagement}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white">
                              <SelectValue placeholder="Selecione o gerenciamento" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#000B12] border-white/10 text-white max-w-[calc(100vw-2rem)]">
                              <SelectItem value="unmanaged" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">Não Gerenciado</span>
                                  <span className="text-lg text-slate-400 font-medium ml-4">Grátis</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="managed" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-lg">Gerenciado</span>
                                  <span className="text-white font-bold ml-4">{formatBRLPerMonth(plan.managedEur || 219.98)}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div> */}

                      {/* Monitoring */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3">
                          <span className="text-lg font-bold text-slate-300">Monitoramento</span>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={monitoring} onValueChange={setMonitoring}>
                            <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white">
                              <SelectValue placeholder="Selecione o monitoramento" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#000B12] border-white/10 text-white max-w-[calc(100vw-2rem)]">
                              <SelectItem value="none" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">Nenhum</span>
                                  <span className="text-lg text-slate-400 font-medium ml-4">Livre</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="full" className="focus:bg-white/10 focus:text-white">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-lg">Monitoramento Completo</span>
                                  <span className="text-white font-bold ml-4">{formatBRLPerMonth(plan.monitoringEur || 22.98)}</span>
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
        <section className="bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl backdrop-blur-md">
          <h2 className="text-base md:text-xl font-black text-white uppercase tracking-tight mb-8">Login e senha para o seu servidor</h2>

          <div className="max-w-3xl space-y-8">
            {/* Username */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-3">
                <span className="text-lg font-bold text-slate-300">Usuário</span>
              </div>
              <div className="md:col-span-9">
                <span className="text-white font-medium text-lg">root</span>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3 pt-3">
                <span className="text-xl font-black text-white uppercase tracking-widest">Senha</span>
              </div>
              <div className="md:col-span-9 space-y-2">
                <div className="flex justify-start">
                  <button
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
                      pass = pass.split('').sort(() => 0.5 - Math.random()).join('');
                      
                      setPassword(pass);
                      setPasswordTouched(true);
                    }}
                    className="text-sky-400 text-lg hover:underline font-bold uppercase tracking-wider"
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
                        "h-12 bg-white/5 border-white/10 focus:border-sky-500 text-white pr-12",
                        passwordTouched && password.length > 0 && !isPasswordValid(password) && "border-rose-500 focus:border-rose-500"
                      )}
                    />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordTouched && password.length > 0 && !isPasswordValid(password) && (
                  <div className="flex items-center gap-2 text-lg font-bold text-rose-500 mt-1">
                    <AlertCircle size={14} />
                    <span>Por favor, insira uma senha válida (Mín. 8 caracteres, maiúscula, número e símbolo)</span>
                  </div>
                )}
                {isPasswordValid(password) && (
                  <div className="flex items-center gap-2 text-lg font-bold text-emerald-400 mt-1">
                    <Check size={14} />
                    <span>Senha válida e segura</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info List */}
            <div className="md:ml-[25%] pt-4">
              <ul className="list-disc space-y-2 text-slate-400 text-[15px] ml-4 font-medium uppercase tracking-wider">
                <li>Você pode adicionar chaves SSH mais tarde no Painel de Controle.</li>
                <li>Sua senha não será enviada por e-mail.</li>
                <li>Mantenha-a segura para acesso ao Windows. Se perdê-la, será necessária uma reinstalação.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Final CTA Removed as per user request - redundant with summary bar */}
      </div>

      {/* Fixed Bottom Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#000B12]/90 border-t border-white/10 z-[100] shadow-[0_-4px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl pr-16 md:pr-0">
        <AnimatePresence>
          {showSummaryDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-white/10 bg-white/5 backdrop-blur-md"
            >
              <div className="max-w-6xl mx-auto px-10 py-6">
                <h3 className="text-lg font-black text-white mb-4 uppercase tracking-widest">Detalhamento do Pedido</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  {(() => {
                    const selectedDuration = durations.find((d: any) => d.id === duration) || durations[0];
                    const durationMonths = parseInt(duration);
                    const qty = parseInt(quantity) || 1;
                    const items = [];
                    const RATE = currentRate;

                    // Base Plan
                    items.push({ label: `${plan.name} (${durationMonths} ${durationMonths === 1 ? "mês" : "meses"})${qty > 1 ? ` × ${qty}` : ""}`, price: selectedDuration.eur * RATE * durationMonths * qty });
                    
                    // Setup Fee
                    if (selectedDuration.setupEur > 0) {
                      items.push({ label: `Taxa de Configuração${qty > 1 ? ` × ${qty}` : ""}`, price: selectedDuration.setupEur * RATE * qty });
                    }
                    
                    // Location
                    const loc = Object.values(planLocations).flat().find((l: any) => l.id === location) as any;
                    if (loc && loc.eur) {
                      items.push({ label: `Localização: ${loc.name}${qty > 1 ? ` × ${qty}` : ""}`, price: loc.eur * RATE * durationMonths * qty });
                    }
                    
                    // Storage
                    const st = storageTypes.find((s: any) => s.id === storageType);
                    if (st && st.eur) {
                      items.push({ label: `Upgrade de Disco: ${st.name}${qty > 1 ? ` × ${qty}` : ""}`, price: st.eur * RATE * durationMonths * qty });
                    }
                    
                    // OS / Panel Pricing
                    const imgPrices = getImagePrices(planId, {});
                    if (osImage === "windows") {
                      const eur = windowsVersion === "2016" ? imgPrices.windows_2016 : imgPrices.windows;
                      items.push({ label: `Windows Server ${windowsVersion}`, price: eur * RATE * durationMonths * qty });
                    } else if (osImage === "cpanel") {
                      const cpanelPricesMap: Record<string, number> = {
                        "5": 43.50, "30": 58.00, "50": 77.00, "100": 94.00, "150": 117.00,
                        "200": 157.00, "250": 197.00, "300": 237.00, "500": 397.00, "1000": 797.00
                      };
                      const accounts = cpanelLicence;
                      const eur = cpanelPricesMap[accounts] || 43.50;
                      items.push({ label: `cPanel (${cpanelLicence} contas)`, price: eur * RATE * durationMonths * qty });
                    } else if (osImage === "plesk" || osImage === "plesk-linux") {
                      let eur = imgPrices.pleskLinux;
                      if (pleskLicence === "pro") eur = imgPrices.pleskPro;
                      else if (pleskLicence === "host") eur = imgPrices.pleskHost;
                      items.push({ label: `Plesk Linux (${pleskLicence})`, price: eur * RATE * durationMonths * qty });
                    } else if (osImage === "plesk-win") {
                      let licEur = pleskWinLicence === "admin" ? imgPrices.pleskWin : pleskWinLicence === "host" ? imgPrices.pleskHost : imgPrices.pleskPro;
                      const winEur = pleskWinVersion === "2016" ? imgPrices.windows_2016 : imgPrices.windows;
                      items.push({ label: `Plesk Windows (${pleskWinLicence})`, price: (licEur + winEur) * RATE * durationMonths * qty });
                    } else if (osImage) {
                      const img = Object.values(dynamicImages).flat().find((i: any) => i.id === osImage) as any;
                      if (img && img.eur) {
                        items.push({ label: `SO/Painel: ${img.name}`, price: img.eur * RATE * durationMonths * qty });
                      } else if (img) {
                        items.push({ label: `SO: ${img.name}`, price: 0 });
                      }
                    }
                    
                    // Add-ons
                    if (autoBackup) {
                      items.push({ label: `Backup Automático${qty > 1 ? ` × ${qty}` : ""}`, price: (plan.backupEur || 3.00) * RATE * durationMonths * qty });
                    }
                    if (privateNetwork === "enabled") items.push({ label: `Rede Privada${qty > 1 ? ` × ${qty}` : ""}`, price: (plan.privateNetworkEur || 4.58) * RATE * durationMonths * qty });
                    if (ipv4Address === "2ip") items.push({ label: `IP Adicional${qty > 1 ? ` × ${qty}` : ""}`, price: (plan.additionalIpEur || 7.00) * RATE * durationMonths * qty });
                    
                    if (objectStorage !== "none") {
                      const prices = { "250gb": 4.98, "500gb": 9.96, "750gb": 14.94, "1tb": 19.92 };
                      const p = prices[objectStorage as keyof typeof prices] || 0;
                      items.push({ label: `Object Storage: ${objectStorage.toUpperCase()}${qty > 1 ? ` × ${qty}` : ""}`, price: p * RATE * durationMonths * qty });
                    }
                    
                    // Server Management discontinued by Contabo — commented out (not deleted) per request
                    // if (serverManagement === "managed") items.push({ label: `Gerenciamento de Servidor${qty > 1 ? ` × ${qty}` : ""}`, price: (plan.managedEur || 219.98) * RATE * durationMonths * qty });
                    if (monitoring === "full") items.push({ label: `Monitoramento Completo${qty > 1 ? ` × ${qty}` : ""}`, price: (plan.monitoringEur || 22.98) * RATE * durationMonths * qty });

                    return items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xl border-b border-white/5 pb-1">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="font-bold text-white">{formatBRL(item.price / RATE)}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-2 md:px-10 h-auto md:h-24 flex items-center justify-between py-2 md:py-0 gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden md:flex w-14 h-14 bg-white/5 rounded-full items-center justify-center shadow-lg border border-white/10">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-sm md:text-2xl leading-tight uppercase tracking-widest">Resumo</h3>
                <button
                  onClick={() => setShowSummaryDetails(!showSummaryDetails)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  {showSummaryDetails ? (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-sky-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-sky-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 lg:gap-8">
            {/* Middle: Savings */}
            {(() => {
              const selectedDuration = durations.find((d: any) => d.id === duration) || durations[0];
              const durationMonths = parseInt(duration);
              const qty = parseInt(quantity) || 1;
              const RATE = currentRate;
              const monthlyPrice = selectedDuration.eur * RATE;
              const monthlyBase = (selectedDuration.oldEur || selectedDuration.eur) * RATE;
              const setupFee = selectedDuration.setupEur * RATE;
              
              let additionalMonthly = 0;
              const loc = Object.values(planLocations).flat().find((l: any) => l.id === location) as any;
              if (loc && loc.eur) {
                additionalMonthly += loc.eur * RATE;
              }
              
              const st = storageTypes.find((s: any) => s.id === storageType);
              if (st && st.eur) {
                additionalMonthly += st.eur * RATE;
              }
              
              const imgPrices = getImagePrices(planId, {});
              if (osImage === "windows") {
                const eur = windowsVersion === "2016" ? imgPrices.windows_2016 : imgPrices.windows;
                additionalMonthly += eur * RATE;
              } else if (osImage === "cpanel") {
                const cpanelPricesMap: Record<string, number> = {
                  "5": 43.50, "30": 58.00, "50": 77.00, "100": 94.00, "150": 117.00,
                  "200": 157.00, "250": 197.00, "300": 237.00, "500": 397.00, "1000": 797.00
                };
                const accounts = cpanelLicence;
                const eur = cpanelPricesMap[accounts] || 43.50;
                additionalMonthly += eur * RATE;
              } else if (osImage === "plesk" || osImage === "plesk-linux") {
                let eur = imgPrices.pleskLinux;
                if (pleskLicence === "pro") eur = imgPrices.pleskPro;
                else if (pleskLicence === "host") eur = imgPrices.pleskHost;
                additionalMonthly += eur * RATE;
              } else if (osImage === "plesk-win") {
                let licEur = pleskWinLicence === "admin" ? imgPrices.pleskWin : pleskWinLicence === "host" ? imgPrices.pleskHost : imgPrices.pleskPro;
                const winEur = pleskWinVersion === "2016" ? imgPrices.windows_2016 : imgPrices.windows;
                additionalMonthly += (licEur + winEur) * RATE;
              } else if (osImage) {
                const img = Object.values(dynamicImages).flat().find((i: any) => i.id === osImage) as any;
                if (img && img.eur) {
                  additionalMonthly += img.eur * RATE;
                }
              }

              if (autoBackup) {
                additionalMonthly += (plan.backupEur || 1.50) * RATE;
              }
              if (privateNetwork === "enabled") additionalMonthly += (plan.privateNetworkEur || 2.29) * RATE;
              if (ipv4Address === "2ip") additionalMonthly += (plan.additionalIpEur || 3.50) * RATE;
              
              if (objectStorage !== "none") {
                  const prices: any = plan.objectStoragePrices || { "250gb": 2.49, "500gb": 4.98, "750gb": 7.47, "1tb": 9.96 };
                  additionalMonthly += (prices[objectStorage] || 0) * RATE;
              }
              // Server Management discontinued by Contabo — commented out (not deleted) per request
              // if (serverManagement === "managed") additionalMonthly += (plan.managedEur || 109.99) * RATE;
              if (monitoring === "full") additionalMonthly += (plan.monitoringEur || 11.49) * RATE;

              const totalBaseMonthly = (monthlyBase + additionalMonthly);
              const totalMonthly = (monthlyPrice + additionalMonthly);
              const dueToday = ((totalMonthly * durationMonths) + setupFee) * qty;
              const totalSavings = (totalBaseMonthly - totalMonthly) * durationMonths * qty;

              return (
                <>
                  <div className="hidden md:block flex-1 text-center min-w-[120px]">
                    {totalSavings > 0 && (
                      <p className="text-emerald-500 font-bold text-sm">
                        Você economiza {formatBRL(totalSavings / currentRate)}.
                      </p>
                    )}
                  </div>

                  {/* Right: Total & Button */}
                  <div className="flex items-center gap-3 md:gap-5">
                    <div className="flex flex-col gap-0.5 min-w-0 md:min-w-[180px]">
                      <div className="hidden md:flex justify-between items-center text-[13px] gap-3">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">Mensal</span>
                        <span className="text-white font-black whitespace-nowrap">{formatBRL(totalMonthly * qty / currentRate)}</span>
                      </div>
                      <div className="hidden md:flex justify-between items-center text-[12px] gap-3">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">Taxa Única</span>
                        <span className="text-white font-black whitespace-nowrap">{formatBRL(setupFee * qty / currentRate)}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] md:text-[13px] font-black text-white uppercase tracking-tight">Vencido Hoje</span>
                          <span className="hidden md:block text-[11px] text-slate-400 font-medium -mt-0.5">Pré-pago {durationMonths} {durationMonths === 1 ? "Mês" : "Meses"}</span>
                        </div>
                        <span className="text-sm md:text-lg font-black text-white whitespace-nowrap">
                          {formatBRL(dueToday / currentRate)}
                        </span>
                      </div>
                    </div>

                    <Button
                      disabled={!isPasswordValid(password)}
                      onClick={() => {
                        if (isPasswordValid(password)) {
                          router.push(`/checkout/personal-data?planId=${planId}&qty=${quantity}&duration=${duration}&location=${location}&storage=${storageType}&image=${osImage}&backup=${autoBackup}&management=${serverManagement}&monitoring=${monitoring}&privateNetwork=${privateNetwork}&ipv4Address=${ipv4Address}&objectStorage=${objectStorage}&password=${encodeURIComponent(password)}&ubuntuVersion=${ubuntuVersion}&windowsVersion=${windowsVersion}&rhelVersion=${rhelVersion}&debianVersion=${debianVersion}&pleskLicence=${pleskLicence}&cpanelLicence=${cpanelLicence}&cpanelVersion=${cpanelVersion}&pleskWinLicence=${pleskWinLicence}&pleskWinVersion=${pleskWinVersion}&webminVersion=${webminVersion}&lampVersion=${lampVersion}&dockerVersion=${dockerVersion}&customImageOption=${customImageOption}`);
                        }
                      }}
                      className={cn(
                        "font-black h-9 md:h-14 px-3 md:px-12 rounded-xl text-sm md:text-2xl shadow-lg transition-all min-w-0 md:min-w-[180px] uppercase tracking-widest",
                        isPasswordValid(password)
                          ? "bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20"
                          : "bg-white/5 text-slate-500 cursor-not-allowed shadow-none"
                      )}
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
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowUbuntuModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-5 md:p-10 space-y-6 md:space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/image.png" alt="Ubuntu" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">Ubuntu</h2></div>
              <p className="text-slate-400 leading-relaxed text-[15px]">Ubuntu é um sistema operacional livre e de código aberto baseado em Linux. Conhecido por sua facilidade de uso, estabilidade e forte apoio da comunidade.</p>
              <div className="space-y-4">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Versão</label>
                <Select value={ubuntuVersion} onValueChange={setUbuntuVersion}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white max-w-[calc(100vw-2rem)]">
                    <SelectItem value="Ubuntu 24.04" className="focus:bg-white/10 focus:text-white">Ubuntu 24.04 LTS</SelectItem>
                    <SelectItem value="Ubuntu 22.04" className="focus:bg-white/10 focus:text-white">Ubuntu 22.04 LTS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setShowUbuntuModal(false)} className="text-slate-400 hover:text-white hover:bg-white/10 uppercase tracking-widest">Pular</Button>
                <Button onClick={() => setShowUbuntuModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Começar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Images Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCustomModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-5 md:p-10 space-y-6 md:space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/custom-images.png" alt="Custom" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">Imagens Personalizadas</h2></div>
              <div className="space-y-4">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Opção</label>
                <Select value={customImageOption} onValueChange={setCustomImageOption}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white max-w-[calc(100vw-2rem)]">
                    <SelectItem value="existing" className="focus:bg-white/10 focus:text-white">Usar armazenamento existente</SelectItem>
                    <SelectItem value="add" className="focus:bg-white/10 focus:text-white">Adicionar armazenamento (25 GB) - <span className="text-sky-400 font-black">R$ 13,95</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setShowCustomModal(false)} className="text-slate-400 hover:text-white hover:bg-white/10 uppercase tracking-widest">Pular</Button>
                <Button onClick={() => setShowCustomModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Confirmar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Windows Server Modal */}
      <AnimatePresence>
        {showWindowsModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowWindowsModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-5 md:p-10 space-y-6 md:space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/windows.png" alt="Windows" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">Windows Server</h2></div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Versão</label>
                <Select value={windowsVersion} onValueChange={setWindowsVersion}>
                  <SelectTrigger className="h-16 bg-white/5 border-white/10 text-white">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="text-sm text-white">Server {windowsVersion} Datacenter</span>
                      <span className="text-xs text-sky-400 font-black">
                        {(() => {
                          const imgPrices = getImagePrices(planId, {});
                          const eur = windowsVersion === "2016" ? imgPrices.windows_2016 : imgPrices.windows;
                          return formatBRL(eur);
                        })()} / mês
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white z-[130] max-w-[calc(100vw-2rem)]">
                    {["2025", "2022", "2019", "2016"].map(v => (
                      <SelectItem key={v} value={v} className="focus:bg-white/10 focus:text-white">
                        <div className="flex items-center justify-between w-full md:w-[480px] py-1 flex-1 gap-4">
                          <span className="font-black text-white uppercase tracking-tighter">Server {v} Datacenter</span>
                          <span className="font-black text-sky-400 ml-auto">{formatBRL(v === "2016" ? getImagePrices(planId, {}).windows_2016 : getImagePrices(planId, {}).windows)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setShowWindowsModal(false)} className="text-slate-400 hover:text-white hover:bg-white/10 uppercase tracking-widest">Pular</Button>
                <Button onClick={() => setShowWindowsModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Selecionar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* cPanel Modal */}
      <AnimatePresence>
        {showCpanelModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCpanelModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-5 md:p-10 space-y-6 md:space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/cpanel.png" alt="cPanel" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">cPanel/WHM</h2></div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Licença</label>
                  <Select value={cpanelLicence} onValueChange={setCpanelLicence}>
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 text-white">
                      <div className="flex items-center justify-between w-full pr-2">
                        <span className="text-sm text-white">{cpanelLicence} contas</span>
                        <span className="text-xs text-sky-400 font-black">
                          {(() => {
                            const imgPrices = getImagePrices(planId, {});
                            let eur = imgPrices.cpanel;
                            const accounts = parseInt(cpanelLicence);
                            if (accounts === 30) eur = 29.00;
                            else if (accounts === 50) eur = 38.50;
                            else if (accounts === 100) eur = 47.00;
                            else if (accounts === 150) eur = 58.50;
                            else if (accounts >= 200) eur = 78.50 + (Math.floor((accounts - 200) / 50) * 20.00);
                            return formatBRL(eur);
                          })()} / mês
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#000B12] border-white/10 text-white z-[130] max-h-[300px] max-w-[calc(100vw-2rem)]">
                      {[5, 30, 50, 100, 150, 200, 250, 300, 500, 1000].map(count => (
                        <SelectItem key={count} value={count.toString()} className="focus:bg-white/10 focus:text-white">
                          <div className="flex items-center justify-between w-full md:w-[480px] py-1 flex-1 gap-4">
                            <span className="font-black text-white uppercase tracking-tighter">{count} contas</span>
                            <span className="font-black text-sky-400 ml-auto">
                              {(() => {
                                const cpanelPricesMap: Record<string, number> = { "5": 43.50, "30": 58.00, "50": 77.00, "100": 94.00, "150": 117.00, "200": 157.00, "250": 197.00, "300": 237.00, "500": 397.00, "1000": 797.00 };
                                return formatBRL(cpanelPricesMap[count.toString()] || 43.50);
                              })()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Sistema Operacional</label>
                  <Select value={cpanelVersion} onValueChange={setCpanelVersion}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#000B12] border-white/10 text-white max-w-[calc(100vw-2rem)]">
                      <SelectItem value="Ubuntu 22.04" className="focus:bg-white/10 focus:text-white">Ubuntu 22.04</SelectItem>
                      <SelectItem value="AlmaLinux 9" className="focus:bg-white/10 focus:text-white">AlmaLinux 9</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setShowCpanelModal(false)} className="text-slate-400 hover:text-white hover:bg-white/10 uppercase tracking-widest">Pular</Button>
                <Button onClick={() => setShowCpanelModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Configurar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RHEL Variants Modal */}
      <AnimatePresence>
        {showRhelModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowRhelModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-5 md:p-10 space-y-6 md:space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/centos-svgrepo-com.svg" alt="RHEL" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">RHEL Variants</h2></div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Distribuição</label>
                <Select value={rhelVersion} onValueChange={setRhelVersion}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white max-w-[calc(100vw-2rem)]">
                    <SelectItem value="AlmaLinux 9" className="focus:bg-white/10 focus:text-white">AlmaLinux 9</SelectItem>
                    <SelectItem value="Rocky Linux 9" className="focus:bg-white/10 focus:text-white">Rocky Linux 9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setShowRhelModal(false)} className="text-slate-400 hover:text-white hover:bg-white/10 uppercase tracking-widest">Pular</Button>
                <Button onClick={() => setShowRhelModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Confirmar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Plesk Modal */}
      <AnimatePresence>
        {showPleskModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPleskModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-5 md:p-10 space-y-6 md:space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/plesk.png" alt="Plesk" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">Plesk + Linux</h2></div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Licença</label>
                <Select value={pleskLicence} onValueChange={setPleskLicence}>
                  <SelectTrigger className="h-16 bg-white/5 border-white/10 text-white">
                    <div className="flex items-center justify-between w-full pr-2">
                      <div className="flex flex-col items-start">
                        <span className="text-sm text-white font-bold">{pleskLicence === "admin" ? "Web Admin Edition" : pleskLicence === "host" ? "Web Host Edition" : "Web Pro Edition"}</span>
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">1 mês grátis</span>
                      </div>
                      <span className="text-xs text-sky-400 font-black">
                        {pleskLicence === "admin" ? "R$ 140,64" : pleskLicence === "host" ? "R$ 427,78" : "R$ 222,68"} / mês
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white z-[130] max-w-[calc(100vw-2rem)]">
                    {["admin", "pro", "host"].map(l => (
                      <SelectItem key={l} value={l} className="focus:bg-white/10 focus:text-white">
                        <div className="flex items-center justify-between w-full md:w-[480px] py-1 flex-1 gap-4">
                          <div className="flex flex-col"><span className="font-black text-white uppercase tracking-tighter">Web {l.charAt(0).toUpperCase() + l.slice(1)} Edition</span><span className="text-emerald-400 font-black text-xs uppercase">1 mês grátis</span></div>
                          <span className="font-black text-sky-400 ml-auto">{l === "admin" ? "R$ 140,64" : l === "host" ? "R$ 427,78" : "R$ 222,68"}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setShowPleskModal(false)} className="text-slate-400 hover:text-white hover:bg-white/10 uppercase tracking-widest">Pular</Button>
                <Button onClick={() => setShowPleskModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Selecionar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Debian Modal */}
      <AnimatePresence>
        {showDebianModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDebianModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-5 md:p-10 space-y-6 md:space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/debian-svgrepo-com.svg" alt="Debian" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">Debian</h2></div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Versão</label>
                <Select value={debianVersion} onValueChange={setDebianVersion}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white max-w-[calc(100vw-2rem)]">
                    <SelectItem value="Debian 13" className="focus:bg-white/10 focus:text-white">Debian 13</SelectItem>
                    <SelectItem value="Debian 12" className="focus:bg-white/10 focus:text-white">Debian 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setShowDebianModal(false)} className="text-slate-400 hover:text-white hover:bg-white/10 uppercase tracking-widest">Pular</Button>
                <Button onClick={() => setShowDebianModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Confirmar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Docker Modal */}
      <AnimatePresence>
        {showDockerModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDockerModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-5 md:p-10 space-y-6 md:space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/docker.png" alt="Docker" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">Docker</h2></div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Versão</label>
                <Select value={dockerVersion} onValueChange={setDockerVersion}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white max-w-[calc(100vw-2rem)]">
                    <SelectItem value="Ubuntu 22.04" className="focus:bg-white/10 focus:text-white">Ubuntu 22.04</SelectItem>
                    <SelectItem value="Debian 12" className="focus:bg-white/10 focus:text-white">Debian 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setShowDockerModal(false)} className="text-slate-400 hover:text-white hover:bg-white/10 uppercase tracking-widest">Pular</Button>
                <Button onClick={() => setShowDockerModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Confirmar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LAMP Modal */}
      <AnimatePresence>
        {showLampModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowLampModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-5 md:p-10 space-y-6 md:space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/lamp.png" alt="LAMP" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">LAMP Stack</h2></div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-sky-400 text-[15px] uppercase tracking-wider">Linux, Apache, MySQL e PHP</h3>
                <p className="text-slate-400 text-[13px] leading-relaxed">Instalaremos previamente seu servidor com Apache, PHP, MySQL e phpMyAdmin. Esses serviços populares estarão prontos para uso imediato.</p>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Versão</label>
                <Select value={lampVersion} onValueChange={setLampVersion}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white max-w-[calc(100vw-2rem)]">
                    <SelectItem value="Ubuntu 22.04" className="focus:bg-white/10 focus:text-white">Ubuntu 22.04</SelectItem>
                    <SelectItem value="Debian 12" className="focus:bg-white/10 focus:text-white">Debian 12</SelectItem>
                    <SelectItem value="AlmaLinux 9" className="focus:bg-white/10 focus:text-white">AlmaLinux 9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setShowLampModal(false)} className="text-slate-400 hover:text-white hover:bg-white/10 uppercase tracking-widest">Pular</Button>
                <Button onClick={() => setShowLampModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Confirmar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Plesk + Windows Modal */}
      <AnimatePresence>
        {showPleskWindowsModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPleskWindowsModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-5 md:p-10 space-y-6 md:space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/plesk.png" alt="Plesk" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">Plesk + Windows</h2></div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Licença</label>
                  <Select value={pleskWinLicence} onValueChange={setPleskWinLicence}>
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 text-white">
                      <div className="flex items-center justify-between w-full pr-2">
                        <div className="flex flex-col items-start"><span className="text-sm text-white font-bold">{pleskWinLicence === "admin" ? "Web Admin Edition" : pleskWinLicence === "host" ? "Web Host Edition" : "Web Pro Edition"}</span><span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">1 mês grátis</span></div>
                        <span className="text-xs text-sky-400 font-black">{formatBRL(pleskWinLicence === "admin" ? getImagePrices(planId, {}).pleskWin : (pleskWinLicence === "pro" ? getImagePrices(planId, {}).pleskPro : getImagePrices(planId, {}).pleskHost))} / mês</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#000B12] border-white/10 text-white z-[130] max-w-[calc(100vw-2rem)]">
                      {["admin", "pro", "host"].map(l => (
                        <SelectItem key={l} value={l} className="focus:bg-white/10 focus:text-white">
                         <div className="flex items-center justify-between w-full md:w-[480px] py-1 flex-1 gap-4">
                            <div className="flex flex-col"><span className="font-black text-white uppercase tracking-tighter">Web {l.charAt(0).toUpperCase() + l.slice(1)} Edition</span><span className="text-emerald-400 font-black text-xs uppercase">1 mês grátis</span></div>
                            <span className="font-black text-sky-400 ml-auto">{formatBRL(l === "admin" ? getImagePrices(planId, {}).pleskWin : (l === "pro" ? getImagePrices(planId, {}).pleskPro : getImagePrices(planId, {}).pleskHost))}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Versão Windows</label>
                  <Select value={pleskWinVersion} onValueChange={setPleskWinVersion}>
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 text-white"><div className="flex items-center justify-between w-full pr-2"><span className="text-sm">Server {pleskWinVersion} Datacenter</span><span className="text-xs text-sky-400 font-black">{formatBRL(pleskWinVersion === "2016" ? getImagePrices(planId, {}).windows_2016 : getImagePrices(planId, {}).windows)} / mês</span></div></SelectTrigger>
                    <SelectContent className="bg-[#000B12] border-white/10 text-white z-[130] max-w-[calc(100vw-2rem)]">
                      {["2025", "2022", "2019", "2016"].map(v => (
                        <SelectItem key={v} value={v} className="focus:bg-white/10 focus:text-white">
                          <div className="flex items-center justify-between w-full md:w-[480px] py-1 flex-1 gap-4">
                            <span className="font-black text-white uppercase tracking-tighter">Server {v} Datacenter</span>
                            <span className="font-black text-sky-400 ml-auto">{formatBRL(v === "2016" ? getImagePrices(planId, {}).windows_2016 : getImagePrices(planId, {}).windows)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setShowPleskWindowsModal(false)} className="text-slate-400 hover:text-white hover:bg-white/10 uppercase tracking-widest">Pular</Button>
                <Button onClick={() => setShowPleskWindowsModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Selecionar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Webmin Modal */}
      <AnimatePresence>
        {showWebminModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowWebminModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#000B12] rounded-2xl w-full max-w-[600px] p-5 md:p-10 space-y-6 md:space-y-8 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4"><img src="/webmin.png" alt="Webmin" className="w-10 h-10" /><h2 className="text-xl font-black text-white uppercase tracking-tight">Webmin</h2></div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Versão</label>
                <Select value={webminVersion} onValueChange={setWebminVersion}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#000B12] border-white/10 text-white max-w-[calc(100vw-2rem)]">
                    <SelectItem value="Ubuntu 22.04" className="focus:bg-white/10 focus:text-white">Ubuntu 22.04</SelectItem>
                    <SelectItem value="AlmaLinux 9" className="focus:bg-white/10 focus:text-white">AlmaLinux 9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setShowWebminModal(false)} className="text-slate-400 hover:text-white hover:bg-white/10 uppercase tracking-widest">Pular</Button>
                <Button onClick={() => setShowWebminModal(false)} className="bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-widest px-8">Confirmar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}