import { logout } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export default function SignOutItem() {
  return (
    <DropdownMenuItem asChild className="cursor-pointer">
      <form action={logout}>
        <Button type="submit" variant="ghost" className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </Button>
      </form>
    </DropdownMenuItem>
  );
}
