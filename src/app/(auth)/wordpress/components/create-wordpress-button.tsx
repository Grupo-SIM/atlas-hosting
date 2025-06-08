"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateWordPressButton() {
  const router = useRouter();

  const handleClick = () => {
    // For now, just refresh to trigger the server action
    // Later this could open a modal or navigate to a creation page
    router.refresh();
  };

  return (
    <Button onClick={handleClick}>
      <Plus className="mr-2 h-4 w-4" />
      Nova Instalação
    </Button>
  );
}
