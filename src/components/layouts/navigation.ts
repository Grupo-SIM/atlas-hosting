import {
  FileText,
  Globe,
  LayoutDashboard,
  type LucideIcon,
  Package,
  Server,
  Shield,
  ShoppingCart,
  Ticket,
  Users,
} from "lucide-react";

export interface NavigationItem {
  href: string;
  icon: LucideIcon;
  name: string;
  /** Item aparece pro admin mesmo na navegação de cliente. */
  showForAdmin?: boolean;
  disabled?: boolean;
  /** Alterna o tema cinza/preto do modo admin com a transição circular. */
  adminModeSwitch?: "enter" | "exit";
}

/** Sidebar padrão — o que todo cliente vê. */
export const clientNavigation: NavigationItem[] = [
  { href: "/home", icon: LayoutDashboard, name: "Painel", showForAdmin: true },
  { href: "/manage/vps", icon: Server, name: "Hospedagem", showForAdmin: true },
  { href: "/vps-plans", icon: ShoppingCart, name: "Contratar Servidor" },
  { href: "/minhas-assinaturas", icon: Package, name: "Minhas Assinaturas" },
  { href: "/domains", icon: Globe, name: "Domínios", showForAdmin: true },
  { href: "/billing", icon: FileText, name: "Faturas", showForAdmin: true },
  { href: "/affiliate", icon: Users, name: "Afiliados" },
  { href: "/vouchers", icon: Ticket, name: "Vouchers" },
];

/** Porta de entrada do modo admin — substitui os antigos itens soltos de admin. */
export const adminEntryItem: NavigationItem = {
  adminModeSwitch: "enter",
  href: "/admin",
  icon: Shield,
  name: "Administração",
};

/**
 * Itens que antes ficavam soltos na sidebar. Agora eles são os cards do painel
 * de administração — a sidebar em si não muda ao entrar no modo admin.
 */
export const adminNavigation: NavigationItem[] = [
  { href: "/admin/vps", icon: Shield, name: "Administração" },
  { href: "/admin/users", icon: Users, name: "Usuários Admin" },
  { href: "/admin/vps-plans", icon: Server, name: "Planos VPS" },
  { href: "/admin/affiliates", icon: Users, name: "Afiliados Admin" },
  { href: "/admin/vouchers", icon: Ticket, name: "Vouchers Admin" },
];

/** Todas as raízes de navegação — telas que não ganham botão de voltar. */
export const navigation: NavigationItem[] = [
  ...clientNavigation,
  adminEntryItem,
];
