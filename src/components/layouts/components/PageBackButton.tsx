"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { navigation } from "@/components/layouts/navigation";
import { Button } from "@/components/ui/button";

/** Telas que já estão na sidebar não são "entrar em algum lugar" — não têm volta. */
const ROOT_ROUTES = new Set(navigation.map(item => item.href));

export function PageBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname || ROOT_ROUTES.has(pathname)) return null;

  return (
    <div className="px-4 pt-4 md:px-6 md:pt-6">
      <Button
        className="h-9 w-9 rounded-md border-border bg-muted/50 text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
        onClick={() => router.back()}
        size="icon"
        title="Voltar"
        variant="outline"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
