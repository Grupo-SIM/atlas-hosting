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
      { id: "1", label: "1 mês", eur: 4.50, setupEur: 4.50, setupFee: null, discount: null },
      { id: "6", label: "6 meses", eur: 4.05, setupEur: 2.25, setupFee: null, discount: "ECONOMIZE 10%", oldEur: 4.50 },
      { id: "12", label: "12 meses", eur: 3.60, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 4.50 },
    ],
    storageTypes: [
      { id: "ssd-150", name: "SSD de 150 GB", price: "Livre" },
      { id: "ssd-300", name: "SSD de 300 GB", eur: 1.55 },
      { id: "nvme-75", name: "NVMe de 75 GB", price: "Livre" },
      { id: "nvme-150", name: "NVMe de 150 GB", eur: 1.85 },
    ],
    rate: 11.72,
    basePrice: 52.74,
    backupEur: 1.50,
    privateNetworkEur: 2.29,
    additionalIpEur: 3.50,
    managedEur: 109.99,
    objectStoragePrices: {
      "250gb": 2.49,
      "500gb": 4.98,
      "750gb": 7.47,
      "1tb": 9.96
    },
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "146 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 1.40, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "146 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "132 ms", eur: 0.95 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "118 ms", eur: 0.95 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 1.40, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "146 ms", eur: 1.15 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "304 ms", eur: 2.30 },
        { id: "jp", name: "Ásia (Japão)", latency: "232 ms", eur: 2.35 },
        { id: "in", name: "Ásia (Índia)", latency: "286 ms", eur: 2.15 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "306 ms", eur: 1.95 },
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
      { id: "1", label: "1 mês", eur: 7.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 6.30, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldEur: 7.00 },
      { id: "12", label: "12 meses", eur: 5.60, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 7.00 },
    ],
    storageTypes: [
      { id: "ssd-200", name: "SSD de 200 GB", price: "Livre" },
      { id: "ssd-400", name: "SSD de 400 GB", eur: 1.95 },
      { id: "nvme-100", name: "NVMe de 100 GB", price: "Livre" },
      { id: "nvme-200", name: "NVMe de 200 GB", eur: 2.55 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "89 ms", eur: 2.20, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "137 ms", eur: 1.45 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "119 ms", eur: 1.45 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "89 ms", eur: 2.20, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 1.85 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "348 ms", eur: 3.55 },
        { id: "jp", name: "Ásia (Japão)", latency: "275 ms", eur: 3.65 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 3.35 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "351 ms", eur: 3.00 },
      ]
    },
    rate: 11.72,
    basePrice: 81.06,
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
    images: {
      popular: [
        { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
        { id: "custom", name: "Imagens personalizadas", price: "Incluído", icon: "/custom-images.png" },
        { id: "windows", name: "Servidor Windows", eur: 15.50, icon: "/windows.png" },
        { id: "cpanel", name: "cPanel", eur: 21.75, icon: "/cpanel.png" },
        { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
        { id: "plesk", name: "Plesk + Linux", eur: 12.00, icon: "/plesk.png" },
      ],
      os: [
        { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
        { id: "windows", name: "Servidor Windows", eur: 15.50, icon: "/windows.png" },
        { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
        { id: "debian", name: "Debian", price: "Incluído", icon: "/debian-svgrepo-com.svg" },
        { id: "almalinux", name: "AlmaLinux", price: "Incluído", icon: "/almalinux.png" },
        { id: "rockylinux", name: "Rocky Linux", price: "Incluído", icon: "/rocky.png" },
      ],
      panels: [
        { id: "cpanel", name: "cPanel", eur: 21.75, icon: "/cpanel.png" },
        { id: "plesk-win", name: "Plesk + Windows", eur: 24.60, icon: "/plesk.png" },
        { id: "plesk-linux", name: "Plesk + Linux", eur: 12.00, icon: "/plesk.png" },
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
      { id: "1", label: "1 mês", eur: 14.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 12.60, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldEur: 14.00 },
      { id: "12", label: "12 meses", eur: 11.20, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 14.00 },
    ],
    storageTypes: [
      { id: "ssd-400", name: "SSD de 400 GB", price: "Livre" },
      { id: "ssd-800", name: "SSD de 800 GB", eur: 3.85 },
      { id: "nvme-200", name: "NVMe de 200 GB", price: "Livre" },
      { id: "nvme-400", name: "NVMe de 400 GB", eur: 3.25 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "89 ms", eur: 4.40, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "137 ms", eur: 2.95 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "119 ms", eur: 2.95 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "89 ms", eur: 4.40, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 3.65 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "348 ms", eur: 7.10 },
        { id: "jp", name: "Ásia (Japão)", latency: "275 ms", eur: 7.30 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 6.70 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "351 ms", eur: 6.05 },
      ]
    },
    rate: 11.72,
    basePrice: 162.12,
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
      { id: "1", label: "1 mês", eur: 25.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 22.50, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldEur: 25.00 },
      { id: "12", label: "12 meses", eur: 20.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 25.00 },
    ],
    storageTypes: [
      { id: "ssd-500", name: "SSD de 500 GB", price: "Livre" },
      { id: "ssd-1000", name: "SSD de 1000 GB", eur: 4.95 },
      { id: "nvme-250", name: "NVMe de 250 GB", price: "Livre" },
      { id: "nvme-500", name: "NVMe de 500 GB", eur: 3.85 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 7.85, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "135 ms", eur: 5.25 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "118 ms", eur: 5.25 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", eur: 7.85, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "148 ms", eur: 6.55 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "345 ms", eur: 12.70 },
        { id: "jp", name: "Ásia (Japão)", latency: "262 ms", eur: 13.00 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 11.90 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "350 ms", eur: 10.80 },
      ]
    },
    rate: 11.72,
    basePrice: 289.42,
    backupEur: 6.00,
    privateNetworkEur: 2.29,
    additionalIpEur: 3.50,
    managedEur: 109.99,
    monitoringEur: 11.49,
    objectStoragePrices: {
      "250gb": 2.49,
      "500gb": 4.98,
      "750gb": 7.47,
      "1tb": 9.96
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
      { id: "1", label: "1 mês", eur: 37.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 33.30, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldEur: 37.00 },
      { id: "12", label: "12 meses", eur: 29.60, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 37.00 },
    ],
    storageTypes: [
      { id: "ssd-600", name: "SSD de 600 GB", price: "Livre" },
      { id: "ssd-1200", name: "SSD de 1.2 TB", eur: 6.15 },
      { id: "nvme-300", name: "NVMe de 300 GB", price: "Livre" },
      { id: "nvme-600", name: "NVMe de 600 GB", eur: 4.75 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 11.60, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "135 ms", eur: 7.80 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "118 ms", eur: 7.80 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 11.60, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 9.65 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "341 ms", eur: 18.80 },
        { id: "jp", name: "Ásia (Japão)", latency: "262 ms", eur: 19.25 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 17.65 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "350 ms", eur: 15.95 },
      ]
    },
    rate: 11.72,
    basePrice: 428.31,
    backupEur: 7.50,
    privateNetworkEur: 2.29,
    additionalIpEur: 3.50,
    managedEur: 109.99,
    monitoringEur: 11.49,
    objectStoragePrices: {
      "250gb": 2.49,
      "500gb": 4.98,
      "750gb": 7.47,
      "1tb": 9.96
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
      { id: "1", label: "1 mês", eur: 49.00, setupEur: 0, setupFee: "Sem taxa de instalação", discount: null },
      { id: "6", label: "6 meses", eur: 44.10, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 10%", oldEur: 49.00 },
      { id: "12", label: "12 meses", eur: 39.20, setupEur: 0, setupFee: "Sem taxa de instalação", discount: "ECONOMIZE 20%", oldEur: 49.00 },
    ],
    storageTypes: [
      { id: "ssd-700", name: "SSD de 700 GB", price: "Livre" },
      { id: "ssd-1400", name: "SSD de 1.4 TB", eur: 6.95 },
      { id: "nvme-350", name: "NVMe de 350 GB", price: "Livre" },
      { id: "nvme-700", name: "NVMe de 700 GB", eur: 5.75 },
    ],
    locations: {
      best: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 15.35, recommended: true },
      ],
      europe: [
        { id: "eu", name: "União Europeia", latency: "148 ms", price: "Livre" },
        { id: "uk", name: "Reino Unido", latency: "138 ms", eur: 10.30 },
      ],
      america: [
        { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", eur: 10.30 },
        { id: "us-east", name: "Estados Unidos (Leste)", latency: "88 ms", eur: 15.35, recommended: true },
        { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", eur: 12.80 },
      ],
      asia: [
        { id: "sg", name: "Ásia (Singapura)", latency: "339 ms", eur: 24.90 },
        { id: "jp", name: "Ásia (Japão)", latency: "262 ms", eur: 25.50 },
        { id: "in", name: "Ásia (Índia)", latency: "N/A", eur: 23.35 },
      ],
      australia: [
        { id: "au-sydney", name: "Austrália (Sydney)", latency: "350 ms", eur: 21.15 },
      ]
    },
    rate: 11.72,
    basePrice: 567.24,
    backupEur: 9.50,
    privateNetworkEur: 2.29,
    additionalIpEur: 3.50,
    managedEur: 109.99,
    monitoringEur: 11.49,
    objectStoragePrices: {
      "250gb": 2.49,
      "500gb": 4.98,
      "750gb": 7.47,
      "1tb": 9.96
    }
  }
};

const defaultDurations = [
  { id: "1", label: "1 mês", price: "R$ 52,74", setupFee: "Taxa de configuração de R$ 52,74", discount: null },
  { id: "6", label: "6 meses", price: "R$ 47,47", setupFee: "Taxa de configuração de R$ 26,28", discount: "ECONOMIZE 10%", oldPrice: "R$ 52,74" },
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
    { id: "uk", name: "Reino Unido", latency: "135 ms", price: "R$ 11,13" },
  ],
  best: [
    { id: "eu", name: "União Europeia", latency: "156 ms", price: "Livre" },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: "R$ 16,41", recommended: true },
  ],
  australia: [
    { id: "au-sydney", name: "Austrália (Sydney)", latency: "349 ms", price: "R$ 22,85" },
  ],
  america: [
    { id: "us-central", name: "Estados Unidos (Central)", latency: "117 ms", price: "R$ 11,13" },
    { id: "us-east", name: "Estados Unidos (Leste)", latency: "87 ms", price: "R$ 16,41", recommended: true },
    { id: "us-west", name: "Estados Unidos (Oeste)", latency: "147 ms", price: "R$ 13,48" },
  ],
  asia: [
    { id: "sg", name: "Ásia (Singapura)", latency: "338 ms", price: "R$ 26,96" },
    { id: "jp", name: "Ásia (Japão)", latency: "269 ms", price: "R$ 27,54" },
    { id: "in", name: "Ásia (Índia)", latency: "N/A", price: "R$ 25,20" },
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
    { id: "windows", name: "Servidor Windows", eur: 7.50, icon: "/windows.png" },
    { id: "cpanel", name: "cPanel", eur: 21.75, icon: "/cpanel.png" },
    { id: "rhel", name: "RHEL Variants", price: "Incluído", icon: "/centos-svgrepo-com.svg" },
    { id: "plesk", name: "Plesk + Linux", eur: 12.00, icon: "/plesk.png" },
  ],
  os: [
    { id: "ubuntu", name: "Ubuntu", price: "Incluído", icon: "/image.png" },
    { id: "windows", name: "Servidor Windows", eur: 7.50, icon: "/windows.png" },
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
    { id: "plesk-win", name: "Plesk + Windows", eur: 18.25, icon: "/plesk.png" },
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

export default function VpsConfigurePage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  
  const [currentRate, setCurrentRate] = useState(11.72);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch("/api/currency/euro");
        const data = await response.json();
        if (data.rate) {
          setCurrentRate(data.rate);
        }
      } catch (error) {
        console.error("Erro ao buscar taxa do euro:", error);
      }
    };
    fetchRate();
  }, []);

  const plan = plansData[planId as keyof typeof plansData] || plansData["10"];
  const durations = plan.durations && plan.durations.length > 0 ? plan.durations : defaultDurations;
  const storageTypes = plan.storageTypes && plan.storageTypes.length > 0 ? plan.storageTypes : defaultStorageTypes;
  const planLocations = (plan as any).locations || locations;
  const dynamicImages = images;

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
  const [autoBackup, setAutoBackup] = useState(true);
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

  // Password validation: 8+ chars, 1 upper, 1 lower, 1 number, 1 special
  const isPasswordValid = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+^~[\]{}|;:,.<>?])[A-Za-z\d!@#$%^&*()_+^~[\]{}|;:,.<>?]{8,}$/;
    return regex.test(pwd);
  };



  function getImagePrices(planId: string, defaultImagePrices: any) {
    const base = {
      ...defaultImagePrices,
      cpanel: 21.75,
      pleskLinux: 12.00,
      pleskWin: 12.00,
      pleskPro: 19.00,
      pleskHost: 36.50
    };

    if (planId === "10") {
      return {
        ...base,
        windows: 7.50,
        windows_2016: 6.25
      };
    }
    
    if (planId === "20") {
      return {
        ...base,
        windows: 18.45,
        windows_2016: 14.99
      };
    }
    
    if (planId === "30") {
      return {
        ...base,
        windows: 30.94,
        windows_2016: 27.49
      };
    }

    if (planId === "40") {
      return {
        ...base,
        windows: 58.31,
        windows_2016: 54.26
      };
    }

    if (planId === "50") {
      return {
        ...base,
        windows: 69.62,
        windows_2016: 66.28
      };
    }

    if (planId === "60") {
      return {
        ...base,
        windows: 79.90,
        windows_2016: 76.50
      };
    }
    
    return base;
  }

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
      {/* Step Header could be here, but matching image's start */}
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-12 space-y-12">

        <h1 className="text-3xl font-bold text-slate-800">Configure seu {plan.name}</h1>

        {/* Plan Summary Section */}
        <div className="flex flex-wrap items-center gap-10">
          <div className="flex-1 border-2 border-sky-400 rounded-lg p-8 grid grid-cols-5 gap-4 relative">
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
              <p className="text-[10px] font-bold text-slate-400 uppercase">TRÁFEGO</p>
              <p className="text-[11px] font-medium leading-tight">{plan.traffic}</p>
            </div>
            <button className="absolute bottom-4 right-4 text-[10px] text-sky-500 hover:underline">Mudar</button>
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
                    duration === d.id ? "border-sky-400 border-2" : "border-slate-100 bg-slate-50/30"
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
                  storageType === st.id ? "border-sky-400" : "border-slate-100"
                )}
              >
                <span>{st.name}</span>
                <span className={cn(st.price === "Livre" ? "text-emerald-500" : "text-slate-700")}>{st.eur ? formatBRLPerMonth(st.eur) : st.price}</span>
              </div>
            ))}
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
            {showMoreImages ? (
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
                        "cursor-pointer rounded-lg border-2 p-4 flex items-center gap-3 transition-all bg-white",
                        osImage === img.id ? "border-sky-400" : "border-slate-100"
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
                      "w-64 cursor-pointer rounded-lg border-2 p-4 flex items-center gap-3 transition-all bg-white",
                      osImage === img.id ? "border-sky-400" : "border-slate-100"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden">
                      {img.icon ? <img src={img.icon} alt="" className="w-5 h-5 object-contain" /> : <Server size={16} className="text-slate-300" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[11px] font-bold">{img.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{img.eur ? formatBRLPerMonth(img.eur) : img.price}</p>
                    </div>
                  </button>
                ))}
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
              <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 text-xs cursor-help">?</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Illustration and Benefits */}
              <div className="lg:col-span-6 flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-48 h-48 flex-shrink-0">
                  <Image
                    src="/backup-shield.png"
                    alt="Proteção de Backup"
                    width={192}
                    height={192}
                    className="object-contain"
                  />
                </div>
                <ul className="space-y-3">
                  {[
                    "Backups automáticos diários.",
                    "Recuperação instantânea com 1 clique.",
                    "Mantém as últimas 10 versões de backup.",
                    "Nenhuma configuração necessária."
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                      <span className="text-[15px] font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Selection Cards */}
              <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Auto Backup Card */}
                <button
                  onClick={() => setAutoBackup(true)}
                  className={cn(
                    "relative p-6 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center min-h-[160px] bg-white",
                    autoBackup
                      ? "border-[#0091FF] shadow-md bg-white"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F1F5F9] px-4 py-1 rounded-full border border-slate-200">
                    <span className="text-[10px] font-bold text-[#E9711C] uppercase tracking-wider whitespace-nowrap">Nossa Recomendação</span>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-lg font-bold text-[#0F172A] mb-1">Backup Automático</h3>
                    <div className="text-xl font-bold text-[#0F172A] mb-2">{formatBRLPerMonth(plan.backupEur)}</div>
                    <p className="text-xs text-slate-500 leading-tight">
                      Configure e esqueça.<br />Segurança de dados sem esforço.
                    </p>
                  </div>
                </button>

                {/* No Protection Card */}
                <button
                  onClick={() => setAutoBackup(false)}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all text-center flex items-center justify-center min-h-[160px] bg-white",
                    !autoBackup
                      ? "border-[#0091FF] shadow-md bg-white"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <h3 className="text-lg font-medium text-slate-600">Sem Proteção de Dados</h3>
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
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-[#0F172A]">Recursos Adicionais</h2>
                <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 text-xs cursor-help">?</div>
              </div>
              <button
                onClick={() => setShowAdditionalFeatures(!showAdditionalFeatures)}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-800"
              >
                {showAdditionalFeatures ? (
                  <>Fechar recursos adicionais <ChevronUp size={14} /></>
                ) : (
                  <>Mostrar mais recursos <ChevronDown size={14} /></>
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
                    <h3 className="text-lg font-bold text-[#0F172A]">Rede</h3>
                    <div className="space-y-6 pl-4 pr-1">
                      {/* Private Networking */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-600">Rede Privada</span>
                          <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 text-[10px] cursor-help">?</div>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={privateNetwork} onValueChange={setPrivateNetwork}>
                            <SelectTrigger className="h-12 border-slate-200 bg-white">
                              <SelectValue placeholder="Selecione a rede" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">Sem Rede Privada</span>
                                  <span className="text-slate-400 text-xs font-medium ml-4">Grátis</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="enabled">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">Rede Privada Ativada</span>
                                  <span className="text-slate-900 font-bold ml-4">{formatBRLPerMonth(2.29)}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Bandwidth */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-600">Largura de Banda</span>
                          <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 text-[10px] cursor-help">?</div>
                        </div>
                        <div className="md:col-span-9">
                          <div className="h-12 border border-slate-200 rounded-md px-4 flex flex-col justify-center bg-slate-50/30">
                            <span className="text-sm font-medium text-slate-700">Tráfego Ilimitado</span>
                            <span className="text-[10px] text-slate-400">Política de Uso Justo</span>
                          </div>
                        </div>
                      </div>

                      {/* IPv4 */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3">
                          <span className="text-sm font-bold text-slate-600">IPv4</span>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={ipv4Address} onValueChange={setIpv4Address}>
                            <SelectTrigger className="h-12 border-slate-200 bg-white">
                              <SelectValue placeholder="Selecione o IP" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1ip">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">1 Endereço IP</span>
                                  <span className="text-slate-400 text-xs font-medium ml-4">Grátis</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="2ip">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">1 Endereço IP + 1 IP Adicional</span>
                                  <span className="text-slate-900 font-bold ml-4">{formatBRLPerMonth(plan.additionalIpEur || 3.50)}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Add-Ons Sub-section */}
                  <div className="space-y-8">
                    <h3 className="text-lg font-bold text-[#0F172A]">Complementos</h3>
                    <div className="space-y-6 pl-4 pr-1">
                      {/* Object Storage */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3">
                          <span className="text-sm font-bold text-slate-600">Armazenamento de Objetos</span>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={objectStorage} onValueChange={setObjectStorage}>
                            <SelectTrigger className="h-12 border-slate-200">
                              <SelectValue placeholder={objectStorage === "none" ? "Nenhum" : objectStorage === "250gb" ? "250 GB Armazenamento" : objectStorage === "500gb" ? "500 GB Armazenamento" : objectStorage === "750gb" ? "750 GB Armazenamento" : "1 TB Armazenamento"} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">Nenhum</span>
                                  <span className="text-slate-400 text-xs font-medium ml-4">Livre</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="250gb">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left text-[13px]">250 GB Armazenamento de Objetos nos Estados Unidos</span>
                                  <span className="text-slate-900 font-bold ml-4">{formatBRLPerMonth(plan.objectStoragePrices?.["250gb"] || 2.49)}</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="500gb">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left text-[13px]">500 GB Armazenamento de Objetos nos Estados Unidos</span>
                                  <span className="text-slate-900 font-bold ml-4">{formatBRLPerMonth(plan.objectStoragePrices?.["500gb"] || 4.98)}</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="750gb">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left text-[13px]">750 GB Armazenamento de Objetos nos Estados Unidos</span>
                                  <span className="text-slate-900 font-bold ml-4">{formatBRLPerMonth(plan.objectStoragePrices?.["750gb"] || 7.47)}</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="1tb">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left text-[13px]">1 TB Armazenamento de Objetos nos Estados Unidos</span>
                                  <span className="text-slate-900 font-bold ml-4">{formatBRLPerMonth(plan.objectStoragePrices?.["1tb"] || 9.96)}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Server Management */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-600">Gerenciamento de Servidor</span>
                          <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 text-[10px] cursor-help">?</div>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={serverManagement} onValueChange={setServerManagement}>
                            <SelectTrigger className="h-12 border-slate-200 bg-white">
                              <SelectValue placeholder="Selecione o gerenciamento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unmanaged">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">Não Gerenciado</span>
                                  <span className="text-slate-400 text-xs font-medium ml-4">Grátis</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="managed">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">Gerenciado</span>
                                  <span className="text-slate-900 font-bold ml-4">{formatBRLPerMonth(plan.managedEur || 109.99)}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Monitoring */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-600">Monitoramento</span>
                          <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 text-[10px] cursor-help">?</div>
                        </div>
                        <div className="md:col-span-9">
                          <Select value={monitoring} onValueChange={setMonitoring}>
                            <SelectTrigger className="h-12 border-slate-200 bg-white">
                              <SelectValue placeholder="Selecione o monitoramento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">Nenhum</span>
                                  <span className="text-slate-400 text-xs font-medium ml-4">Livre</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="full">
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-left">Monitoramento Completo</span>
                                  <span className="text-slate-900 font-bold ml-4">{formatBRLPerMonth(plan.monitoringEur || 11.49)}</span>
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
                      
                      // Shuffle
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

        {/* Final CTA Removed as per user request - redundant with summary bar */}
      </div>

      {/* Fixed Bottom Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F1F5F9] border-t border-slate-200 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <AnimatePresence>
          {showSummaryDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-slate-200 bg-white"
            >
              <div className="max-w-6xl mx-auto px-10 py-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Detalhamento do Pedido</h3>
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
                      let eur = imgPrices.cpanel;
                      const accounts = parseInt(cpanelLicence);
                      if (accounts === 30) eur = 29.00;
                      else if (accounts === 50) eur = 38.50;
                      else if (accounts === 100) eur = 47.00;
                      else if (accounts === 150) eur = 58.50;
                      else if (accounts >= 200) eur = 78.50 + (Math.floor((accounts - 200) / 50) * 20.00);
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
                      items.push({ label: `Backup Automático${qty > 1 ? ` × ${qty}` : ""}`, price: (plan.backupEur || 1.50) * RATE * durationMonths * qty });
                    }
                    if (privateNetwork === "enabled") items.push({ label: `Rede Privada${qty > 1 ? ` × ${qty}` : ""}`, price: (plan.privateNetworkEur || 2.29) * RATE * durationMonths * qty });
                    if (ipv4Address === "2ip") items.push({ label: `IP Adicional${qty > 1 ? ` × ${qty}` : ""}`, price: (plan.additionalIpEur || 3.50) * RATE * durationMonths * qty });
                    
                    if (objectStorage !== "none") {
                      const prices = { "250gb": 2.49, "500gb": 4.98, "750gb": 7.47, "1tb": 9.96 };
                      const p = prices[objectStorage as keyof typeof prices] || 0;
                      items.push({ label: `Object Storage: ${objectStorage.toUpperCase()}${qty > 1 ? ` × ${qty}` : ""}`, price: p * RATE * durationMonths * qty });
                    }
                    
                    if (serverManagement === "managed") items.push({ label: `Gerenciamento de Servidor${qty > 1 ? ` × ${qty}` : ""}`, price: (plan.managedEur || 109.99) * RATE * durationMonths * qty });
                    if (monitoring === "full") items.push({ label: `Monitoramento Completo${qty > 1 ? ` × ${qty}` : ""}`, price: (plan.monitoringEur || 11.49) * RATE * durationMonths * qty });

                    return items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-1">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="font-bold text-slate-700">{formatBRL(item.price / RATE)}</span>
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
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
              <ShieldCheck className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-700 text-base leading-tight">Resumo do Pedido</h3>
                <button 
                  onClick={() => setShowSummaryDetails(!showSummaryDetails)}
                  className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                >
                  {showSummaryDetails ? (
                    <ChevronDown className="w-5 h-5 text-sky-500" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-sky-500" />
                  )}
                </button>
              </div>

            </div>
          </div>

          <div className="flex items-center gap-20">
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
                let eur = imgPrices.cpanel;
                const accounts = parseInt(cpanelLicence);
                if (accounts === 30) eur = 29.00;
                else if (accounts === 50) eur = 38.50;
                else if (accounts === 100) eur = 47.00;
                else if (accounts === 150) eur = 58.50;
                else if (accounts >= 200) eur = 78.50 + (Math.floor((accounts - 200) / 50) * 20.00);
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
              if (serverManagement === "managed") additionalMonthly += (plan.managedEur || 109.99) * RATE;
              if (monitoring === "full") additionalMonthly += (plan.monitoringEur || 11.49) * RATE;

              const totalBaseMonthly = (monthlyBase + additionalMonthly);
              const totalMonthly = (monthlyPrice + additionalMonthly);
              const dueToday = ((totalMonthly * durationMonths) + setupFee) * qty;
              const totalSavings = (totalBaseMonthly - totalMonthly) * durationMonths * qty;

              return (
                <>
                  <div className="flex-1 text-center min-w-[200px]">
                    {totalSavings > 0 && (
                      <p className="text-emerald-500 font-bold text-sm">
                        Você economiza {formatBRL(totalSavings / currentRate)}.
                      </p>
                    )}
                  </div>

                  {/* Right: Total & Button */}
                  <div className="flex items-center gap-12">
                    <div className="flex flex-col gap-1 min-w-[220px]">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-bold flex items-center gap-1">Mensal <Info className="w-3 h-3 opacity-40" /></span>
                        <span className="text-slate-700 font-black">{formatBRL(totalMonthly * qty / currentRate)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-bold flex items-center gap-1">Taxa Única <Info className="w-3 h-3 opacity-40" /></span>
                        <span className="text-slate-700 font-black">{formatBRL(setupFee * qty / currentRate)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-black text-slate-800">Vencido Hoje</span>
                          <span className="text-[10px] text-slate-400 font-medium -mt-1">Pré-pago {durationMonths} {durationMonths === 1 ? "Mês" : "Meses"}</span>
                        </div>
                        <span className="text-xl font-black text-slate-900">
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
                        "font-bold h-14 px-12 rounded-full text-lg shadow-lg transition-all min-w-[180px]",
                        isPasswordValid(password) 
                          ? "bg-[#00A8E8] hover:bg-[#0096d1] text-white shadow-sky-100" 
                          : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
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
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUbuntuModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl"
              >
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src="/image.png" alt="Ubuntu" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1e293b]">Ubuntu</h2>
                  </div>

                  <p className="text-slate-500 leading-relaxed text-[15px]">
                    Ubuntu é um sistema operacional livre e de código aberto baseado em Linux. Conhecido por sua facilidade de uso, estabilidade e forte apoio da comunidade. É amplamente utilizado em desktops, servidores e ambientes de nuvem.
                  </p>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-[#1e293b]">Versão</label>
                    <Select value={ubuntuVersion} onValueChange={setUbuntuVersion}>
                      <SelectTrigger className="h-14 border-slate-200 rounded-xl text-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[110]">
                        <SelectItem value="Ubuntu 24.04">
                          <div className="flex items-center justify-between w-full min-w-[300px]">
                            <span className={cn(ubuntuVersion === "Ubuntu 24.04" ? "text-sky-500 font-medium" : "")}>Ubuntu 24.04</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Ubuntu 26.04">Ubuntu 26.04</SelectItem>
                        <SelectItem value="Ubuntu 22.04">Ubuntu 22.04</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end gap-6 pt-4">
                    <button
                      onClick={() => setShowUbuntuModal(false)}
                      className="text-sky-500 font-bold hover:underline px-4 text-sm"
                    >
                      Pular
                    </button>
                    <Button
                      onClick={() => setShowUbuntuModal(false)}
                      className="bg-[#00A8E8] hover:bg-[#0096d1] text-white font-bold h-14 px-10 rounded-xl text-base shadow-lg shadow-sky-100"
                    >
                      Começar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Images Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl"
              >
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src="/custom-images.png" alt="Custom Images" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1e293b]">Imagens Personalizadas</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-[#1e293b]">Versão</label>
                    <Select value={customImageOption} onValueChange={setCustomImageOption}>
                      <SelectTrigger className="h-14 border-slate-200 rounded-xl text-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[110]">
                        <SelectItem value="existing">
                          <div className="flex items-center justify-between w-full min-w-[400px]">
                            <span>Use seu armazenamento de imagens personalizado existente</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="add">
                          <div className="flex items-center justify-between w-full min-w-[400px]">
                            <span className="flex-1">Adicionar armazenamento de imagens personalizado (25 GB)</span>
                            <span className="text-slate-900 font-bold ml-4">R$ 13,95</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end gap-6 pt-4">
                    <button
                      onClick={() => setShowCustomModal(false)}
                      className="text-sky-500 font-bold hover:underline px-4 text-sm"
                    >
                      Pular
                    </button>
                    <Button
                      onClick={() => setShowCustomModal(false)}
                      className="bg-[#00A8E8] hover:bg-[#0096d1] text-white font-bold h-14 px-10 rounded-xl text-base shadow-lg shadow-sky-100"
                    >
                      Começar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Windows Server Modal */}
      <AnimatePresence>
        {showWindowsModal && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWindowsModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl"
              >
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src="/windows.png" alt="Windows Server" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1e293b]">Windows Server</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-[#1e293b]">Versão</label>
                    <Select value={windowsVersion} onValueChange={setWindowsVersion}>
                      <SelectTrigger className="h-14 border-slate-200 rounded-xl text-slate-600">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm">Windows Server {windowsVersion} Datacenter</span>
                          <span className="text-xs text-slate-400 font-medium">
                            {(() => {
                              const RATE = currentRate;
                              const imgPrices = getImagePrices(planId, {});
                              const eur = windowsVersion === "2016" ? imgPrices.windows_2016 : imgPrices.windows;
                              return formatBRL(eur);
                            })()} / mês | R$ 0,00 Taxa de instalação
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="z-[110]">
                        <SelectItem value="2025">
                          <div className="flex items-center justify-between w-full">
                            <span className={cn("flex-1 text-left", windowsVersion === "2025" ? "text-sky-500 font-medium" : "text-slate-700")}>Windows Server 2025 Datacenter</span>
                            <span className="text-slate-900 font-bold ml-4">{formatBRL(getImagePrices(planId, {}).windows)}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="2022">
                          <div className="flex items-center justify-between w-full">
                            <span className={cn("flex-1 text-left", windowsVersion === "2022" ? "text-sky-500 font-medium" : "text-slate-700")}>Windows Server 2022 Datacenter</span>
                            <span className="text-slate-900 font-bold ml-4">{formatBRL(getImagePrices(planId, {}).windows)}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="2019">
                          <div className="flex items-center justify-between w-full">
                            <span className={cn("flex-1 text-left", windowsVersion === "2019" ? "text-sky-500 font-medium" : "text-slate-700")}>Windows Server 2019 Datacenter</span>
                            <span className="text-slate-900 font-bold ml-4">{formatBRL(getImagePrices(planId, {}).windows)}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="2016">
                          <div className="flex items-center justify-between w-full">
                            <span className={cn("flex-1 text-left", windowsVersion === "2016" ? "text-sky-500 font-medium" : "text-slate-700")}>Windows Server 2016 Datacenter</span>
                            <span className="text-slate-900 font-bold ml-4">{formatBRL(getImagePrices(planId, {}).windows_2016)}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end gap-6 pt-4">
                    <button
                      onClick={() => setShowWindowsModal(false)}
                      className="text-sky-500 font-bold hover:underline px-4 text-sm"
                    >
                      Pular
                    </button>
                    <Button
                      onClick={() => setShowWindowsModal(false)}
                      className="bg-[#00A8E8] hover:bg-[#0096d1] text-white font-bold h-14 px-10 rounded-xl text-base shadow-lg shadow-sky-100"
                    >
                      Começar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* cPanel Modal */}
      <AnimatePresence>
        {showCpanelModal && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCpanelModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl"
              >
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src="/cpanel.png" alt="cPanel" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1e293b]">cPanel</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-[#1e293b]">Licença</label>
                      <Select value={cpanelLicence} onValueChange={setCpanelLicence}>
                        <SelectTrigger className="h-16 border-slate-200 rounded-xl text-slate-600">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm text-slate-700">cPanel/WHM ({cpanelLicence} contas)</span>
                            <span className="text-xs text-slate-400 font-medium">
                              {(() => {
                                const RATE = currentRate;
                                const imgPrices = getImagePrices(planId, {});
                                let eur = imgPrices.cpanel;
                                const accounts = parseInt(cpanelLicence);
                                if (accounts === 30) eur = 29.00;
                                else if (accounts === 50) eur = 38.50;
                                else if (accounts === 100) eur = 47.00;
                                else if (accounts === 150) eur = 58.50;
                                else if (accounts >= 200) eur = 78.50 + (Math.floor((accounts - 200) / 50) * 20.00);
                                return formatBRL(eur);
                              })()} / mês | R$ 0,00 Taxa de instalação
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="z-[110] max-h-[300px]">
                          {[5, 30, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000].map(count => (
                            <SelectItem key={count} value={count.toString()}>
                              <div className="flex items-center justify-between w-full">
                                <span className={cn("flex-1", cpanelLicence === count.toString() ? "text-sky-500 font-medium" : "text-slate-700")}>cPanel/WHM ({count} contas)</span>
                                <span className="text-slate-900 font-bold ml-4">
                                  {(() => {
                                    const RATE = currentRate;
                                    const imgPrices = getImagePrices(planId, {});
                                    let eur = imgPrices.cpanel;
                                    if (count === 30) eur = 29.00;
                                    else if (count === 50) eur = 38.50;
                                    else if (count === 100) eur = 47.00;
                                    else if (count === 150) eur = 58.50;
                                    else if (count >= 200) eur = 78.50 + (Math.floor((count - 200) / 50) * 20.00);
                                    return formatBRL(eur);
                                  })()}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold text-[#1e293b]">Versão</label>
                      <Select value={cpanelVersion} onValueChange={setCpanelVersion}>
                        <SelectTrigger className="h-14 border-slate-200 rounded-xl text-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[110]">
                          <SelectItem value="Ubuntu 22.04">Ubuntu 22.04</SelectItem>
                          <SelectItem value="AlmaLinux 9">AlmaLinux 9</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-6 pt-4">
                    <button
                      onClick={() => setShowCpanelModal(false)}
                      className="text-sky-500 font-bold hover:underline px-4 text-sm"
                    >
                      Pular
                    </button>
                    <Button
                      onClick={() => setShowCpanelModal(false)}
                      className="bg-[#00A8E8] hover:bg-[#0096d1] text-white font-bold h-14 px-10 rounded-xl text-base shadow-lg shadow-sky-100"
                    >
                      Começar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* RHEL Variants Modal */}
      <AnimatePresence>
        {showRhelModal && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRhelModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl"
              >
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src="/centos-svgrepo-com.svg" alt="RHEL Variants" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1e293b]">RHEL Variants</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-[#1e293b]">Versão</label>
                    <Select value={rhelVersion} onValueChange={setRhelVersion}>
                      <SelectTrigger className="h-14 border-slate-200 rounded-xl text-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[110]">
                        <SelectItem value="AlmaLinux 9">
                          <span className={cn(rhelVersion === "AlmaLinux 9" ? "text-sky-500 font-medium" : "")}>AlmaLinux 9</span>
                        </SelectItem>
                        <SelectItem value="Rocky Linux 9">
                          <span className={cn(rhelVersion === "Rocky Linux 9" ? "text-sky-500 font-medium" : "")}>Rocky Linux 9</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end gap-6 pt-4">
                    <button
                      onClick={() => setShowRhelModal(false)}
                      className="text-sky-500 font-bold hover:underline px-4 text-sm"
                    >
                      Pular
                    </button>
                    <Button
                      onClick={() => setShowRhelModal(false)}
                      className="bg-[#00A8E8] hover:bg-[#0096d1] text-white font-bold h-14 px-10 rounded-xl text-base shadow-lg shadow-sky-100"
                    >
                      Começar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Plesk Modal */}
      <AnimatePresence>
        {showPleskModal && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPleskModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl"
              >
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src="/plesk.png" alt="Plesk" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1e293b]">Plesk + Linux</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-[#1e293b]">Licença</label>
                    <Select value={pleskLicence} onValueChange={setPleskLicence}>
                      <SelectTrigger className="h-16 border-slate-200 rounded-xl text-slate-600">
                        <div className="flex items-center justify-between w-full pr-2">
                          <div className="flex flex-col items-start">
                            <span className="text-sm text-slate-700">
                              {pleskLicence === "admin" ? "Plesk Obsidian Web Admin Edition" :
                                pleskLicence === "host" ? "Plesk Obsidian Web Host Edition" :
                                  "Plesk Obsidian Web Pro Edition"}
                            </span>
                            <span className="text-[11px] text-emerald-500 font-medium">1 mês grátis</span>
                          </div>
                          <span className="text-xs text-slate-400 font-medium ml-4">
                            R$ {pleskLicence === "admin" ? "140,64" : pleskLicence === "host" ? "427,78" : "222,68"} / mês | R$ 0,00 Taxa de instalação
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="z-[110]">
                        <SelectItem value="admin">
                          <div className="flex items-center justify-between w-full min-w-[420px] py-1">
                            <div className="flex flex-col">
                              <span className={cn("text-sm", pleskLicence === "admin" ? "text-sky-500 font-medium" : "text-slate-700")}>Plesk Obsidian Web Admin Edition</span>
                              <span className="text-[11px] text-emerald-500 font-bold">1 mês grátis</span>
                            </div>
                            <span className="text-slate-900 font-bold ml-4">R$ 140,64</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="host">
                          <div className="flex items-center justify-between w-full min-w-[420px] py-1 border-t border-slate-50">
                            <div className="flex flex-col">
                              <span className={cn("text-sm", pleskLicence === "host" ? "text-sky-500 font-medium" : "text-slate-700")}>Plesk Obsidian Web Host Edition</span>
                              <span className="text-[11px] text-emerald-500 font-bold">1 mês grátis</span>
                            </div>
                            <span className="text-slate-900 font-bold ml-4">R$ 427,78</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="pro">
                          <div className="flex items-center justify-between w-full min-w-[420px] py-1 border-t border-slate-50">
                            <div className="flex flex-col">
                              <span className={cn("text-sm", pleskLicence === "pro" ? "text-sky-500 font-medium" : "text-slate-700")}>Plesk Obsidian Web Pro Edition</span>
                              <span className="text-[11px] text-emerald-500 font-bold">1 mês grátis</span>
                            </div>
                            <span className="text-slate-900 font-bold ml-4">R$ 222,68</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end gap-6 pt-4">
                    <button
                      onClick={() => setShowPleskModal(false)}
                      className="text-sky-500 font-bold hover:underline px-4 text-sm"
                    >
                      Pular
                    </button>
                    <Button
                      onClick={() => setShowPleskModal(false)}
                      className="bg-[#00A8E8] hover:bg-[#0096d1] text-white font-bold h-14 px-10 rounded-xl text-base shadow-lg shadow-sky-100"
                    >
                      Começar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Debian Modal */}
      <AnimatePresence>
        {showDebianModal && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDebianModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl"
              >
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src="/debian-svgrepo-com.svg" alt="Debian" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1e293b]">Debian</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-[#1e293b]">Versão</label>
                    <Select value={debianVersion} onValueChange={setDebianVersion}>
                      <SelectTrigger className="h-14 border-slate-200 rounded-xl text-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[110]">
                        <SelectItem value="Debian 13">
                          <span className={cn(debianVersion === "Debian 13" ? "text-sky-500 font-medium" : "")}>Debian 13</span>
                        </SelectItem>
                        <SelectItem value="Debian 12">
                          <span className={cn(debianVersion === "Debian 12" ? "text-sky-500 font-medium" : "")}>Debian 12</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end gap-6 pt-4">
                    <button
                      onClick={() => setShowDebianModal(false)}
                      className="text-sky-500 font-bold hover:underline px-4 text-sm"
                    >
                      Pular
                    </button>
                    <Button
                      onClick={() => setShowDebianModal(false)}
                      className="bg-[#00A8E8] hover:bg-[#0096d1] text-white font-bold h-14 px-10 rounded-xl text-base shadow-lg shadow-sky-100"
                    >
                      Começar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Docker Modal */}
      <AnimatePresence>
        {showDockerModal && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDockerModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl"
              >
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src="/docker.png" alt="Docker" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1e293b]">Docker</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-[#1e293b]">Versão</label>
                    <Select value={dockerVersion} onValueChange={setDockerVersion}>
                      <SelectTrigger className="h-14 border-slate-200 rounded-xl text-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[110]">
                        <SelectItem value="Ubuntu 22.04">
                          <span className={cn(dockerVersion === "Ubuntu 22.04" ? "text-sky-500 font-medium" : "")}>Ubuntu 22.04</span>
                        </SelectItem>
                        <SelectItem value="Debian 12">
                          <span className={cn(dockerVersion === "Debian 12" ? "text-sky-500 font-medium" : "")}>Debian 12</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end gap-6 pt-4">
                    <button
                      onClick={() => setShowDockerModal(false)}
                      className="text-sky-500 font-bold hover:underline px-4 text-sm"
                    >
                      Pular
                    </button>
                    <Button
                      onClick={() => setShowDockerModal(false)}
                      className="bg-[#00A8E8] hover:bg-[#0096d1] text-white font-bold h-14 px-10 rounded-xl text-base shadow-lg shadow-sky-100"
                    >
                      Começar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* LAMP Modal */}
      <AnimatePresence>
        {showLampModal && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLampModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl"
              >
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src="/lamp.png" alt="LAMP" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1e293b]">LAMP</h2>
                  </div>

                  <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl p-6 space-y-4">
                    <h3 className="font-bold text-[#92400E] text-[15px]">Linux, Apache, MySQL e PHP</h3>
                    <div className="space-y-4 text-[13px] text-[#92400E] leading-relaxed">
                      <p>
                        Instalaremos previamente seu servidor com Apache, PHP, MySQL e phpMyAdmin. Esses serviços populares estarão prontos e funcionando para você usar imediatamente.
                      </p>
                      <p>
                        Instalados através do gerenciador de pacotes, estas serão as versões mais recentes disponíveis no repositório do sistema operacional que você escolher.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-[#1e293b]">Versão</label>
                    <Select value={lampVersion} onValueChange={setLampVersion}>
                      <SelectTrigger className="h-14 border-slate-200 rounded-xl text-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[110]">
                        <SelectItem value="Ubuntu 22.04">
                          <span className={cn(lampVersion === "Ubuntu 22.04" ? "text-sky-500 font-medium" : "")}>Ubuntu 22.04</span>
                        </SelectItem>
                        <SelectItem value="Debian 12">
                          <span className={cn(lampVersion === "Debian 12" ? "text-sky-500 font-medium" : "")}>Debian 12</span>
                        </SelectItem>
                        <SelectItem value="AlmaLinux 9">
                          <span className={cn(lampVersion === "AlmaLinux 9" ? "text-sky-500 font-medium" : "")}>AlmaLinux 9</span>
                        </SelectItem>
                        <SelectItem value="Rocky Linux 9">
                          <span className={cn(lampVersion === "Rocky Linux 9" ? "text-sky-500 font-medium" : "")}>Rocky Linux 9</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end gap-6 pt-4">
                    <button
                      onClick={() => setShowLampModal(false)}
                      className="text-sky-500 font-bold hover:underline px-4 text-sm"
                    >
                      Pular
                    </button>
                    <Button
                      onClick={() => setShowLampModal(false)}
                      className="bg-[#00A8E8] hover:bg-[#0096d1] text-white font-bold h-14 px-10 rounded-xl text-base shadow-lg shadow-sky-100"
                    >
                      Começar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Plesk + Windows Modal */}
      <AnimatePresence>
        {showPleskWindowsModal && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPleskWindowsModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl"
              >
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src="/plesk.png" alt="Plesk" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1e293b]">Plesk + Windows</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Licence Select */}
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-[#1e293b]">Licença</label>
                      <Select value={pleskWinLicence} onValueChange={setPleskWinLicence}>
                        <SelectTrigger className="h-16 border-slate-200 rounded-xl text-slate-600">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2 text-left">
                              <span className="text-sm text-slate-700">
                                {pleskWinLicence === "admin" ? "Plesk Obsidian Web Admin Edition" :
                                  pleskWinLicence === "host" ? "Plesk Obsidian Web Host Edition" :
                                    "Plesk Obsidian Web Pro Edition"}
                              </span>
                              <span className="text-[11px] text-emerald-500 font-bold whitespace-nowrap">1 mês grátis</span>
                            </div>
                            <span className="text-xs text-slate-400 font-medium ml-4">
                              {(() => {
                                const RATE = currentRate;
                                const imgPrices = getImagePrices(planId, {});
                                let eur = imgPrices.pleskWin;
                                if (pleskWinLicence === "pro") eur = imgPrices.pleskPro;
                                else if (pleskWinLicence === "host") eur = imgPrices.pleskHost;
                                return formatBRL(eur);
                              })()} / mês | R$ 0,00 Taxa de instalação
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="z-[110]">
                          <SelectItem value="admin">
                            <div className="flex items-center justify-between w-full py-1 text-left">
                              <div className="flex flex-col">
                                <span className={cn("text-sm", pleskWinLicence === "admin" ? "text-sky-500 font-medium" : "text-slate-700")}>Plesk Obsidian Web Admin Edition</span>
                                <span className="text-[11px] text-emerald-500 font-bold">1 mês grátis</span>
                              </div>
                              <span className="text-slate-900 font-bold ml-4">{formatBRL(getImagePrices(planId, {}).pleskWin)}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="pro">
                            <div className="flex items-center justify-between w-full py-1 border-t border-slate-50 text-left">
                              <div className="flex flex-col">
                                <span className={cn("text-sm", pleskWinLicence === "pro" ? "text-sky-500 font-medium" : "text-slate-700")}>Plesk Obsidian Web Pro Edition</span>
                                <span className="text-[11px] text-emerald-500 font-bold">1 mês grátis</span>
                              </div>
                              <span className="text-slate-900 font-bold ml-4">{formatBRL(getImagePrices(planId, {}).pleskPro)}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="host">
                            <div className="flex items-center justify-between w-full py-1 border-t border-slate-50 text-left">
                              <div className="flex flex-col">
                                <span className={cn("text-sm", pleskWinLicence === "host" ? "text-sky-500 font-medium" : "text-slate-700")}>Plesk Obsidian Web Host Edition</span>
                                <span className="text-[11px] text-emerald-500 font-bold">1 mês grátis</span>
                              </div>
                              <span className="text-slate-900 font-bold ml-4">{formatBRL(getImagePrices(planId, {}).pleskHost)}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Version Select */}
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-[#1e293b]">Versão</label>
                      <Select value={pleskWinVersion} onValueChange={setPleskWinVersion}>
                        <SelectTrigger className="h-16 border-slate-200 rounded-xl text-slate-600">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm text-slate-700">Windows Server {pleskWinVersion} Datacenter</span>
                            <span className="text-xs text-slate-400 font-medium">
                              {(() => {
                                const RATE = currentRate;
                                const imgPrices = getImagePrices(planId, {});
                                const eur = pleskWinVersion === "2016" ? imgPrices.windows_2016 : imgPrices.windows;
                                return formatBRL(eur);
                              })()} / mês | R$ 0,00 Taxa de instalação
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="z-[110]">
                          <SelectItem value="2025">
                            <div className="flex items-center justify-between w-full py-1 text-left">
                              <span className={cn("text-sm", pleskWinVersion === "2025" ? "text-sky-500 font-medium" : "text-slate-700")}>Windows Server 2025 Datacenter</span>
                              <span className="text-slate-900 font-bold ml-4">{formatBRL(getImagePrices(planId, {}).windows)}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="2022">
                            <div className="flex items-center justify-between w-full py-1 border-t border-slate-50 text-left">
                              <span className={cn("text-sm", pleskWinVersion === "2022" ? "text-sky-500 font-medium" : "text-slate-700")}>Windows Server 2022 Datacenter</span>
                              <span className="text-slate-900 font-bold ml-4">{formatBRL(getImagePrices(planId, {}).windows)}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="2019">
                            <div className="flex items-center justify-between w-full py-1 border-t border-slate-50 text-left">
                              <span className={cn("text-sm", pleskWinVersion === "2019" ? "text-sky-500 font-medium" : "text-slate-700")}>Windows Server 2019 Datacenter</span>
                              <span className="text-slate-900 font-bold ml-4">{formatBRL(getImagePrices(planId, {}).windows)}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="2016">
                            <div className="flex items-center justify-between w-full py-1 border-t border-slate-50 text-left">
                              <span className={cn("text-sm", pleskWinVersion === "2016" ? "text-sky-500 font-medium" : "text-slate-700")}>Windows Server 2016 Datacenter</span>
                              <span className="text-slate-900 font-bold ml-4">{formatBRL(getImagePrices(planId, {}).windows_2016)}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-6 pt-4">
                    <button
                      onClick={() => setShowPleskWindowsModal(false)}
                      className="text-sky-500 font-bold hover:underline px-4 text-sm"
                    >
                      Pular
                    </button>
                    <Button
                      onClick={() => setShowPleskWindowsModal(false)}
                      className="bg-[#00A8E8] hover:bg-[#0096d1] text-white font-bold h-14 px-10 rounded-xl text-base shadow-lg shadow-sky-100"
                    >
                      Começar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Webmin Modal */}
      <AnimatePresence>
        {showWebminModal && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWebminModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-[600px] overflow-hidden shadow-2xl"
              >
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src="/webmin.png" alt="Webmin" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1e293b]">Webmin</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-[#1e293b]">Versão</label>
                    <Select value={webminVersion} onValueChange={setWebminVersion}>
                      <SelectTrigger className="h-14 border-slate-200 rounded-xl text-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[110]">
                        <SelectItem value="Ubuntu 22.04">
                          <span className={cn(webminVersion === "Ubuntu 22.04" ? "text-sky-500 font-medium" : "")}>Ubuntu 22.04</span>
                        </SelectItem>
                        <SelectItem value="AlmaLinux 9">
                          <span className={cn(webminVersion === "AlmaLinux 9" ? "text-sky-500 font-medium" : "")}>AlmaLinux 9</span>
                        </SelectItem>
                        <SelectItem value="Rocky Linux 9">
                          <span className={cn(webminVersion === "Rocky Linux 9" ? "text-sky-500 font-medium" : "")}>Rocky Linux 9</span>
                        </SelectItem>
                        <SelectItem value="Rocky Linux 8">
                          <span className={cn(webminVersion === "Rocky Linux 8" ? "text-sky-500 font-medium" : "")}>Rocky Linux 8</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end gap-6 pt-4">
                    <button
                      onClick={() => setShowWebminModal(false)}
                      className="text-sky-500 font-bold hover:underline px-4 text-sm"
                    >
                      Pular
                    </button>
                    <Button
                      onClick={() => setShowWebminModal(false)}
                      className="bg-[#00A8E8] hover:bg-[#0096d1] text-white font-bold h-14 px-10 rounded-xl text-base shadow-lg shadow-sky-100"
                    >
                      Começar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
