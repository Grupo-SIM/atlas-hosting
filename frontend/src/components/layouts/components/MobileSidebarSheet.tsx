"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import AtlasLogo from "@/assets/atlas.svg";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { isAdminPath, playAdminThemeTransition } from "../admin-mode";
import {
  adminEntryItem,
  getClientNavigation,
  type NavigationItem,
} from "../navigation";

export function MobileSidebarSheet({
  canAccessSiteBuilder = false,
  isAdmin,
}: {
  canAccessSiteBuilder?: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const inAdminMode = isAdminPath(pathname);

  const filteredNavigation: NavigationItem[] = [
    ...getClientNavigation({ canAccessSiteBuilder, isAdmin }),
    ...(isAdmin ? [adminEntryItem] : []),
  ];

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
                  item.disabled
                    ? "cursor-not-allowed text-muted-foreground opacity-50"
                    : (
                          item.adminModeSwitch === "enter"
                            ? inAdminMode
                            : pathname === item.href
                        )
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                href={item.disabled ? "#" : item.href}
                key={item.name}
                onClick={e => {
                  if (item.disabled) return;
                  setOpen(false);
                  const goesToAdmin = item.adminModeSwitch === "enter";
                  if (goesToAdmin === inAdminMode) return;
                  e.preventDefault();
                  const rect = e.currentTarget.getBoundingClientRect();
                  playAdminThemeTransition({
                    enable: goesToAdmin,
                    origin: {
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height / 2,
                    },
                  });
                  router.push(item.href);
                }}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.disabled && (
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
