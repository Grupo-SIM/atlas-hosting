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
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/lib/auth";
import clsx from "clsx";
import {
  CreditCard,
  Key,
  LogOut,
  Menu,
  Settings,
  User as UserIcon,
  Users,
} from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { Suspense, type HTMLAttributes, type PropsWithChildren } from "react";
import { CgClose } from "react-icons/cg";
import { FaUserAlt } from "react-icons/fa";

export default async function Topbar({
  children,
  className,
  params,
  ...props
}: PropsWithChildren<
  HTMLAttributes<HTMLHeadElement> & {
    params: Promise<{ tpo?: string }>;
  }
>) {
  const searchParams = await params;
  console.log(searchParams);
  const sidebarOpen = searchParams?.tpo && searchParams.tpo == "1";

  return (
    <header
      className={clsx(
        "display-none min-h-16 bg-card md:flex items-center justify-between px-6 relative z-2",
        className
      )}
      {...props}
    >
      <Form action="">
        <input type="hidden" name="tpo" value={sidebarOpen ? "0" : "1"} />
        <button className="all:unset" type="submit">
          {sidebarOpen ? (
            <CgClose
              className={clsx(
                "text-lg md:text-xl font-semibold block md:hidden"
              )}
            />
          ) : (
            <Menu
              className={clsx(
                "text-lg md:text-xl font-semibold block md:hidden"
              )}
            />
          )}
        </button>
      </Form>
      <div className="flex items-center justify-end w-full space-x-4">
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
          <DropdownMenuContent
            sideOffset={20}
            className="w-56"
            align="end"
            forceMount={true}
          >
            <Suspense fallback={<UserDataDropdownItemSkeleton />}>
              <UserDataDropdownItem />
            </Suspense>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="[&>*]:cursor-pointer">
              <DropdownMenuItem asChild>
                <Link href="/settings?tab=user">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings?tab=wallet">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Pagamentos</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
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
        <Suspense fallback={<Skeleton className="h-[1em] w-24" />}>
          <OrganizationName />
        </Suspense>
      </div>
    </header>
  );
}

async function OrganizationName() {
  const user = await getUser();

  return (
    <div className="text-sm border-l-1 border-muted-foreground/20 pl-4 border-solid hidden md:block">
      {user.organization.name}
    </div>
  );
}

async function UserDataDropdownItem() {
  const user = await getUser();

  return (
    user && (
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {user.email}
          </p>
        </div>
      </DropdownMenuLabel>
    )
  );
}

async function UserDataDropdownItemSkeleton() {
  return (
    <DropdownMenuLabel className="font-normal">
      <div className="flex flex-col space-y-1">
        <Skeleton className="text-sm h-[1em] w-26" />
        <Skeleton className="text-xs h-[1em] w-22" />
      </div>
    </DropdownMenuLabel>
  );
}
