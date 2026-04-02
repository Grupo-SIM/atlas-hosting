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
  Users,
} from "lucide-react";

export const navigation = [
  { name: "Painel", href: "/home", icon: LayoutDashboard },
  { name: "Hospedagem", href: "/sites/new", icon: Server, disabled: true },
  { name: "Domínios", href: "/domains", icon: Globe },
  { name: "Bancos de Dados", href: "/databases", icon: Database, disabled: true },
  { name: "E-mail", href: "/email", icon: Mail, disabled: true },
  { name: "Faturas", href: "/billing", icon: FileText },
  { name: "Afiliado", href: "/affiliate", icon: Users, disabled: true },
  { name: "Suporte", href: "/support", icon: LifeBuoy },
];
