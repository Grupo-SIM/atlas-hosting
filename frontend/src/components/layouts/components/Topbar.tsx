import clsx from "clsx";
import { User as UserIcon } from "lucide-react";
import Link from "next/link";
import { type HTMLAttributes, type PropsWithChildren, Suspense } from "react";
import { FaUserAlt } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";
import { MobileSidebarSheet } from "./MobileSidebarSheet";
import { ThemeToggleSlot } from "./ThemeToggleSlot";

export default async function Topbar({
  children,
  className,
  isAdmin,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLHeadElement> & { isAdmin?: boolean }>) {
  const user = await getUser();

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 flex min-h-16 items-center justify-between border-border border-b bg-card px-4 md:px-6",
        className
      )}
      {...props}
    >
      <MobileSidebarSheet isAdmin={isAdmin ?? false} />
      <div className="flex flex-1 items-center justify-end gap-3">
        {children}
        <ThemeToggleSlot />
        <DropdownMenu>
          <DropdownMenuTrigger asChild={true}>
            <Button
              className="relative h-8 w-8 rounded-full bg-muted-foreground/10"
              variant="ghost"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback>
                  <FaUserAlt className="color-white -translate-1/2 absolute top-1/2 left-1/2 h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56"
            forceMount={true}
            sideOffset={20}
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
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <LogoutButton />
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
    <div className="hidden border-muted-foreground/20 border-l-1 border-solid pl-4 text-sm md:block">
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
          <p className="font-medium text-sm leading-none">{user.name}</p>
          <p className="text-muted-foreground text-xs leading-none">
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
        <Skeleton className="h-[1em] w-26 text-sm" />
        <Skeleton className="h-[1em] w-22 text-xs" />
      </div>
    </DropdownMenuLabel>
  );
}
