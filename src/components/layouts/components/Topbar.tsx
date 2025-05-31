import { logout } from "@/app/actions";
import { ModeToggle } from "@/components/ModeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Organization, User } from "@/lib/db/schema";
import {
  CreditCard,
  Key,
  LogOut,
  Settings,
  User as UserIcon,
  Users,
} from "lucide-react";
import type { PropsWithChildren } from "react";
import { FaUserAlt } from "react-icons/fa";

export default function Topbar({
  children,
  user,
}: PropsWithChildren<{
  user: Pick<User, "name" | "email"> & { organization: Organization };
}>) {
  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-6">
      <h1 className="text-lg md:text-xl font-semibold">Painel</h1>
      <div className="flex items-center space-x-4">
        {children}
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild={true}>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full bg-muted-foreground/10"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <FaUserAlt className="h-4 w-4 color-white absolute top-1/2 left-1/2 -translate-1/2" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount={true}>
            {user && (
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="[&>*]:cursor-pointer">
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Pagamentos</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Key className="mr-2 h-4 w-4" />
                <span>Alterar Senha</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="[&>*]:cursor-pointer">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Acesso</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>
                    <span>Adicionar Administrador</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Adicionar Desenvolvedor</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Gerenciar Acessos</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <form action={logout}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="text-sm border-l-1 border-muted-foreground/20 pl-4 border-solid">
          {user.organization.name}
        </div>
      </div>
    </header>
  );
}
