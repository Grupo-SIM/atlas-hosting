import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogoutButton } from "./LogoutButton";

export default function SignOutItem() {
  return (
    <DropdownMenuItem asChild className="cursor-pointer">
      <LogoutButton />
    </DropdownMenuItem>
  );
}
