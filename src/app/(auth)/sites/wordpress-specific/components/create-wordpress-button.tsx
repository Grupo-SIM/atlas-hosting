import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function CreateWordPressButton() {
  return (
    <Link href="/sites/new" className="flex items-center">
      <Button variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Nova Instalação
      </Button>
    </Link>
  );
}
