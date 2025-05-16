"use client";

import { ModeToggle } from "@/components/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bell,
  Database,
  FileText,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Menu,
  Server,
  Settings,
  Shield,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(true);
  const pathname = usePathname();

  const navigation = [
    { name: "Painel", href: "/dashboard", icon: LayoutDashboard },
    { name: "Hospedagem", href: "/hosting", icon: Server },
    { name: "Domínios", href: "/domains", icon: Globe },
    { name: "Bancos de Dados", href: "/databases", icon: Database },
    { name: "E-mail", href: "/email", icon: Mail },
    { name: "Faturas", href: "/billing", icon: FileText },
    { name: "Segurança", href: "/security", icon: Shield },
    { name: "Suporte", href: "/support", icon: LifeBuoy },
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full bg-background/80 backdrop-blur-sm border shadow-lg"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        onMouseEnter={() => setIsCompact(false)}
        onMouseLeave={() => setIsCompact(true)}
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-card border-r shadow-sm transition-all duration-300 ease-in-out",
          "lg:relative lg:flex lg:flex-col",
          isCompact ? "w-[60px]" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "h-16 flex items-center px-4 border-b overflow-hidden",
          isCompact ? "justify-center" : "px-6"
        )}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={cn("h-6 w-6 text-primary", !isCompact && "mr-2")}
          >
            <path d="M2 22a8 8 0 1 1 16 0H2z" />
            <path d="M16 8v.8A4 4 0 0 1 13 13h-2a4 4 0 0 1-3-4.2V8" />
            <path d="M6 2h12v4H6V2z" />
          </svg>
          <span className={cn(
            "text-lg font-semibold transition-opacity duration-300",
            isCompact ? "opacity-0 w-0" : "opacity-100"
          )}>
            Atlas Hosting
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md group transition-colors relative",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCompact && "justify-center"
              )}
              title={isCompact ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  pathname === item.href
                    ? "text-accent-foreground"
                    : "text-muted-foreground group-hover:text-accent-foreground"
                )}
              />
              <span className={cn(
                "ml-3 transition-opacity duration-300",
                isCompact ? "opacity-0 w-0" : "opacity-100"
              )}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* User account */}
        <div className="p-4 border-t">
          <div className={cn(
            "flex items-center gap-3",
            isCompact && "justify-center"
          )}>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div className={cn(
              "flex-1 min-w-0 transition-opacity duration-300",
              isCompact ? "opacity-0 w-0" : "opacity-100"
            )}>
              <p className="text-sm font-medium truncate">João Silva</p>
              <p className="text-xs text-muted-foreground truncate">
                joao@exemplo.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-6">
          <h1 className="text-lg md:text-xl font-semibold">Painel</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                variant="destructive"
              >
                3
              </Badge>
            </Button>
            <ModeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}