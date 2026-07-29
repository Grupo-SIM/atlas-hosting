"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      className="mb-4 h-9 w-9 rounded-md border-border bg-muted/50 text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
      onClick={() => router.back()}
      size="icon"
      variant="outline"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}
