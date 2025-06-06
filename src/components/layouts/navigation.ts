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
  { name: "Painel", href: "/", icon: LayoutDashboard },
  { name: "Hospedagem", href: "/hosting", icon: Server },
  { name: "Domínios", href: "/domains", icon: Globe },
  { name: "Bancos de Dados", href: "/databases", icon: Database },
  { name: "E-mail", href: "/email", icon: Mail },
  { name: "Faturas", href: "/billing", icon: FileText },
  { name: "Afiliado", href: "/affiliate", icon: Users },
  { name: "Suporte", href: "/support", icon: LifeBuoy },
  { name: "Configurações", href: "/settings", icon: Settings },
];
