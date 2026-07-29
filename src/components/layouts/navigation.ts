import {
  FileText,
  Globe,
  LayoutDashboard,
  Package,
  Server,
  Shield,
  ShoppingCart,
  Ticket,
  Users,
} from "lucide-react";

export const navigation = [
  { href: "/home", icon: LayoutDashboard, name: "Painel", showForAdmin: true },
  { href: "/manage/vps", icon: Server, name: "Hospedagem", showForAdmin: true },
  { href: "/vps-plans", icon: ShoppingCart, name: "Contratar Servidor" },
  { href: "/minhas-assinaturas", icon: Package, name: "Minhas Assinaturas" },
  { href: "/domains", icon: Globe, name: "Domínios", showForAdmin: true },
  { href: "/billing", icon: FileText, name: "Faturas", showForAdmin: true },
  { href: "/affiliate", icon: Users, name: "Afiliados" },
  { href: "/vouchers", icon: Ticket, name: "Vouchers" },
  { href: "/admin/vps", icon: Shield, isAdmin: true, name: "Administração" },
  { href: "/admin/users", icon: Users, isAdmin: true, name: "Usuários Admin" },
  { href: "/admin/vps-plans", icon: Server, isAdmin: true, name: "Planos VPS" },
  {
    href: "/admin/affiliates",
    icon: Users,
    isAdmin: true,
    name: "Afiliados Admin",
  },
  {
    href: "/admin/vouchers",
    icon: Ticket,
    isAdmin: true,
    name: "Vouchers Admin",
  },
];
