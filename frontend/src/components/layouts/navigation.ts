import {
  FileText,
  Globe,
  LayoutDashboard,
  LayoutTemplate,
  type LucideIcon,
  Package,
  Server,
  Shield,
  ShoppingCart,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";

export interface NavigationItem {
  href: string;
  icon: LucideIcon;
  name: string;
  /** Item só existe para admin (e some do cliente). */
  adminOnly?: boolean;
  /** Item só existe para usuários autorizados a usar o Criador de Sites. */
  builderOnly?: boolean;
  /** Item aparece pro admin mesmo na navegação de cliente. */
  showForAdmin?: boolean;
  disabled?: boolean;
  /** Alterna o tema cinza/preto do modo admin com a transição circular. */
  adminModeSwitch?: "enter" | "exit";
  /** Prefixo que mantém o item ativo em rotas internas (ex.: o editor), além do `href`. */
  match?: string;
  /** Área do painel do cliente que libera o item para contas com acesso de equipe (sem área, todo mundo vê). */
  area?: string;
}

/** Sidebar padrão — o que todo cliente vê. */
export const clientNavigation: NavigationItem[] = [
  { href: "/home", icon: LayoutDashboard, name: "Painel", showForAdmin: true },
  {
    area: "client_hosting",
    href: "/manage/vps",
    icon: Server,
    name: "Hospedagem",
    showForAdmin: true,
  },
  {
    area: "client_hosting",
    href: "/vps-plans",
    icon: ShoppingCart,
    name: "Contratar Servidor",
  },
  {
    area: "client_hosting",
    href: "/minhas-assinaturas",
    icon: Package,
    name: "Minhas Assinaturas",
  },
  {
    area: "client_domains",
    href: "/domains",
    icon: Globe,
    name: "Domínios",
    showForAdmin: true,
  },
  {
    area: "client_billing",
    href: "/billing",
    icon: FileText,
    name: "Faturas",
    showForAdmin: true,
  },
  {
    builderOnly: true,
    href: "/criador-de-sites",
    icon: LayoutTemplate,
    match: "/criador-de-sites",
    name: "Criador de Sites",
  },
  {
    area: "client_affiliate",
    href: "/affiliate",
    icon: Users,
    name: "Afiliados",
  },
  { area: "client_billing", href: "/carteira", icon: Wallet, name: "Carteira" },
  {
    area: "client_affiliate",
    href: "/vouchers",
    icon: Ticket,
    name: "Vouchers",
  },
];

export function getClientNavigation({
  canAccessSiteBuilder,
  clientAreas = null,
  isAdmin,
}: {
  canAccessSiteBuilder: boolean;
  /** Áreas do painel do cliente liberadas para a conta; `null` = sem restrição (cliente comum e admin). */
  clientAreas?: readonly string[] | null;
  isAdmin: boolean;
}): NavigationItem[] {
  return clientNavigation.filter(item => {
    if (item.adminOnly) return isAdmin;
    if (item.builderOnly) return canAccessSiteBuilder || isAdmin;
    if (item.area && clientAreas && !clientAreas.includes(item.area))
      return false;
    return !isAdmin || item.showForAdmin;
  });
}

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
  { href: "/admin/suppliers", icon: Globe, name: "Fornecedores" },
  { href: "/admin/vps-plans", icon: Server, name: "Planos VPS" },
  { href: "/admin/affiliates", icon: Users, name: "Afiliados Admin" },
  { href: "/admin/vouchers", icon: Ticket, name: "Vouchers Admin" },
];

/** Todas as raízes de navegação — telas que não ganham botão de voltar. */
export const navigation: NavigationItem[] = [
  ...clientNavigation,
  adminEntryItem,
];
