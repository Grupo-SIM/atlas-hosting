"use client";

import type { LucideProps } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ForwardRefExoticComponent,
  type RefAttributes,
  useRef,
  useState,
} from "react";
import AtlasLogo from "@/assets/atlas.svg";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { navigation } from "../navigation";

export default function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const [isCompact, setIsCompact] = useState(true);

  const filteredNavigation = navigation.filter(item =>
    isAdmin
      ? (item as any).isAdmin || (item as any).showForAdmin
      : !(item as any).isAdmin
  );

  return (
    <motion.div
      animate={{
        width: isCompact ? 60 : 256,
      }}
      className={cn(
        "z-10 hidden h-screen shrink-0 whitespace-nowrap border-border border-r bg-card md:flex md:flex-col",
        "relative overflow-hidden"
      )}
      layout={true}
      onMouseEnter={() => setIsCompact(false)}
      onMouseLeave={() => setIsCompact(true)}
      transition={{
        duration: 0.25,
        ease: "easeInOut",
      }}
    >
      <motion.div
        className="flex h-16 max-w-inherit items-center overflow-x-hidden px-3.5"
        layout
      >
        <motion.div
          animate={{
            marginRight: isCompact ? "0" : "0.5rem",
          }}
          className="h-8 min-h-8 w-8 min-w-8 object-contain"
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        >
          <AtlasLogo className="h-full w-full object-contain" />
        </motion.div>
        <AnimatePresence mode="popLayout" propagate>
          {!isCompact && (
            <motion.span
              animate={{
                opacity: 1,
                width: "100%",
              }}
              className="box-border max-w-full overflow-x-hidden whitespace-nowrap font-semibold text-lg"
              exit={{ opacity: 0, width: 0 }}
              initial={{ opacity: 0, width: 0 }}
              layout
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              <motion.div className="w-fit min-w-fit" layout>
                Atlas Hosting
              </motion.div>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.nav className="relative inset-shadow-[0_1px_0_0] inset-shadow-border z-90 m-0 box-border flex w-auto flex-1 flex-col space-y-1 overflow-y-auto px-2 py-4">
        <TooltipProvider delayDuration={0}>
          {filteredNavigation.map(item => (
            <NavItem isCompact={isCompact} item={item as any} key={item.name} />
          ))}
        </TooltipProvider>
      </motion.nav>
    </motion.div>
  );
}

function NavItem({
  item,
  isCompact,
}: {
  isCompact: boolean;
  item: {
    name: string;
    href: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    disabled?: boolean;
  };
}) {
  const pathname = usePathname();

  const itemNameRef = useRef<HTMLSpanElement>(null);
  const itemWidth = itemNameRef.current?.scrollWidth;

  const content = (
    <MotionLink
      className={cn(
        "group relative box-border flex w-full items-center rounded-md px-3 py-2 font-medium text-sm transition-all",
        item.disabled
          ? "cursor-not-allowed opacity-50 grayscale-[0.5]"
          : pathname === item.href
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
      href={item.disabled ? "#" : item.href}
      initial={{ marginLeft: 0, marginRight: 0 }}
      key={item.name}
      layout={true}
      onClick={e => item.disabled && e.preventDefault()}
      title={isCompact ? undefined : item.name}
    >
      <item.icon
        className={cn(
          "h-5 w-5 flex-shrink-0",
          item.disabled
            ? "text-muted-foreground"
            : pathname === item.href
              ? "text-accent-foreground"
              : "text-muted-foreground group-hover:text-accent-foreground"
        )}
      />
      <AnimatePresence mode="sync">
        {!isCompact && (
          <motion.span
            animate={{
              opacity: 1,
              paddingLeft: "0.5rem",
              width: itemWidth || "auto",
            }}
            className="box-border w-full flex-1 overflow-x-hidden whitespace-nowrap"
            exit={{ opacity: 0, paddingLeft: 0, width: 0 }}
            initial={{ opacity: 0, paddingLeft: 0, width: 0 }}
            ref={itemNameRef}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            {item.name}
          </motion.span>
        )}
      </AnimatePresence>
      {item.disabled && !isCompact && (
        <span className="ml-auto rounded bg-primary/10 px-1.5 py-0.5 font-bold text-[10px] text-primary/70 uppercase tracking-wider">
          Breve
        </span>
      )}
    </MotionLink>
  );

  if (item.disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent className="font-medium" side="right">
          Em breve
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

const MotionLink = motion.create(Link);
