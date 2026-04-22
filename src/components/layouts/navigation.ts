import {
  Database,
  FileText,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Server,
  Settings,
  Shield,
  Ticket,
  Users,
} from "lucide-react";

export const navigation = [
  { name: "Painel", href: "/home", icon: LayoutDashboard },
  { name: "Hospedagem", href: "/manage/vps", icon: Server },
  { name: "Domínios", href: "/domains", icon: Globe },
  { name: "Faturas", href: "/billing", icon: FileText },
  { name: "Afiliados", href: "/affiliate", icon: Users },
  { name: "Vouchers", href: "/vouchers", icon: Ticket },
  { name: "Administração", href: "/admin/vps", icon: Shield, isAdmin: true },
  { name: "Afiliados Admin", href: "/admin/affiliates", icon: Users, isAdmin: true },
  { name: "Vouchers Admin", href: "/admin/vouchers", icon: Ticket, isAdmin: true },
];
