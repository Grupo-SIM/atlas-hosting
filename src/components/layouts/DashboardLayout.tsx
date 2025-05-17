"use client";

import AtlasLogo from "@/assets/atlas.svg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
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
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ModeToggle } from "../ModeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(true);
  const pathname = usePathname();

  const navigation = [
    { name: "Painel", href: "/", icon: LayoutDashboard },
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

      <motion.div
        layout
        onMouseEnter={() => setIsCompact(false)}
        onMouseLeave={() => setIsCompact(true)}
        animate={{
          width: isCompact ? "min-content" : "auto",
          transition: { duration: 0.3, ease: sidebarOpen ? "easeIn": "easeOut" }
        }}
        transition={{
          duration: 0.3,
          ease: isCompact ? "easeIn" : "easeOut"
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-card border-r shadow-sm whitespace-nowrap",
          "lg:relative lg:flex lg:flex-col",
          isCompact ? "w-[60px]" : "w-64",
        )}
      >
        <motion.div
          layout
          initial={{ paddingLeft: 0, paddingRight: 0 }}
          animate={{
            paddingLeft: isCompact ? "1rem": "1.5rem",
            paddingRight: isCompact ? "1rem": "1.5rem",
            transition: { duration: 0.3, ease: isCompact ? "easeIn" : "easeOut" }
          }}
          exit={{ paddingLeft: 0, paddingRight: 0 }}
          className="h-16 w-full flex items-center justify-center border-b overflow-hidden">
          <AtlasLogo className="min-h-8 min-w-8 h-8 w-8 object-contain" />
          <motion.span
            layout
            initial={{ width: 0, paddingLeft: 0 }}
            animate={{
              width: isCompact ? 0 : "auto",
              paddingLeft: isCompact ? 0 : "0.75rem",
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            className="text-lg font-semibold overflow-x-hidden"
          >
            Atlas Hosting
          </motion.span>
        </motion.div>

        <motion.nav
          layout
          initial={{
            width: "3.75rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}
          animate={{
            width: isCompact ? "3.75rem" : "auto",
            marginLeft: isCompact ? "auto" : 0,
            marginRight: isCompact ? "auto" : 0,
            transition: { duration: 0.3, ease: isCompact ? "easeIn" : "easeOut" }
          }}
          className="flex-1 px-2 py-4 space-y-1 overflow-y-auto flex flex-col box-border">
          {navigation.map((item) => (
            <MotionLink
              layout
              initial={{ marginLeft: 0, marginRight: 0 }}
              // animate={{ marginLeft: isCompact ? "auto": "0", marginRight: isCompact ? "auto": "0", transition: { duration: 0.3, ease: "easeOut" } }}
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md group transition-colors relative w-full box-border",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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
              <motion.span
                layout
                initial={{  marginLeft: 0, minWidth: 0, maxWidth: 0, width: 0 }}
                animate={{
                  marginLeft: isCompact ? 0: "0.75rem",
                  minWidth: isCompact ? 0: "max-content",
                  maxWidth: isCompact ? 0: "max-content",
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                exit={{ width: 0, marginLeft: 0 }}
                className="overflow-x-hidden whitespace-nowrap flex-1 w-full">
                {item.name}
              </motion.span>
            </MotionLink>
          ))}
        </motion.nav>

        <div className="p-4 border-t">
          <div className={cn(
            "flex items-center gap-3",
            isCompact && "justify-center"
          )}>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <motion.div
              layout
              initial={{ width: 0 }}
              animate={{
                width: isCompact ? 0 : "auto",
                transition: { duration: 0.3, ease: isCompact ? "easeIn" : "easeOut" }
              }}
              className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">João Silva</p>
              <p className="text-xs text-muted-foreground truncate">
                joao@exemplo.com
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b flex items-center justify-between px-6">
          <h1 className="text-lg md:text-xl font-semibold">Painel</h1>
          {<div className="flex items-center space-x-4">
            {/* <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                variant="destructive"
              >
                3
              </Badge>
            </Button> */}
            <ModeToggle />
          </div>}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

const MotionLink = motion(Link);