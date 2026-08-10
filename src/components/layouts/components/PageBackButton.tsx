"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PageBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!pathname || pathname === "/home") return null;

  const returnTo =
    pathname === "/domain" && searchParams.get("returnTo") === "/domains"
      ? "/domains"
      : "/home";

  return (
    <div className="px-4 pt-4 md:px-6 md:pt-6">
      <Button
        className="h-9 w-9 rounded-md border-border bg-muted/50 text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
        onClick={() => router.push(returnTo)}
        size="icon"
        title="Voltar"
        variant="outline"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
