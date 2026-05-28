"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { navigation } from "../navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AtlasLogo from "@/assets/atlas.svg";

export function MobileSidebarSheet({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(
    (item) => !(item as any).isAdmin || isAdmin
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu de navegação"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="h-16 flex items-center gap-2 px-4 border-b border-border">
            <AtlasLogo className="h-8 w-8 flex-shrink-0" />
            <SheetTitle className="text-lg font-semibold">
              Atlas Hosting
            </SheetTitle>
          </div>
          <nav className="flex flex-col p-3 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={(item as any).disabled ? "#" : item.href}
                onClick={() => {
                  if (!(item as any).disabled) setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  (item as any).disabled
                    ? "opacity-50 cursor-not-allowed text-muted-foreground"
                    : pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                {(item as any).disabled && (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded">
                    Breve
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
