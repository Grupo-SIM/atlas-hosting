import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CreateWordPressButton() {
  return (
    <Link className="flex items-center" href="/sites/new">
      <Button className="w-full" variant="outline">
        <Plus className="mr-2 h-4 w-4" />
        Nova Instalação
      </Button>
    </Link>
  );
}
