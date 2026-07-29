"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AtlasLogo from "@/assets/atlas.svg";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { navigation } from "../navigation";

export function MobileSidebarSheet({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(item =>
    isAdmin
      ? (item as any).isAdmin || (item as any).showForAdmin
      : !(item as any).isAdmin
  );

  return (
    <>
      <Button
        aria-label="Abrir menu de navegação"
        className="md:hidden"
        onClick={() => setOpen(true)}
        size="icon"
        variant="ghost"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet onOpenChange={setOpen} open={open}>
        <SheetContent className="w-64 p-0" side="left">
          <div className="flex h-16 items-center gap-2 border-border border-b px-4">
            <AtlasLogo className="h-8 w-8 flex-shrink-0" />
            <SheetTitle className="font-semibold text-lg">
              Atlas Hosting
            </SheetTitle>
          </div>
          <nav className="flex flex-col space-y-1 overflow-y-auto p-3">
            {filteredNavigation.map(item => (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 font-medium text-sm transition-colors",
                  (item as any).disabled
                    ? "cursor-not-allowed text-muted-foreground opacity-50"
                    : pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                href={(item as any).disabled ? "#" : item.href}
                key={item.name}
                onClick={() => {
                  if (!(item as any).disabled) setOpen(false);
                }}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                {(item as any).disabled && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-bold text-[10px] text-primary/70 uppercase tracking-wider">
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
