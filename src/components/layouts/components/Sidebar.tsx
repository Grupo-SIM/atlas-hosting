"use client";

import AtlasLogo from "@/assets/atlas.svg";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import {
  useState,
  type ForwardRefExoticComponent,
  type RefAttributes,
  useRef,
} from "react";
import type { LucideProps } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { navigation } from "../navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";

export default function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const [isCompact, setIsCompact] = useState(true);

  const filteredNavigation = navigation.filter(item => 
    !(item as any).isAdmin || isAdmin
  );

  return (
    <motion.div
      layout={true}
      onMouseEnter={() => setIsCompact(false)}
      onMouseLeave={() => setIsCompact(true)}
      animate={{
        width: isCompact ? 60 : 256,
      }}
      transition={{
        duration: 0.25,
        ease: "easeInOut",
      }}
      className={cn(
        "hidden md:flex md:flex-col bg-card whitespace-nowrap h-screen z-10 border-r border-border shrink-0",
        "relative overflow-hidden"
      )}
    >
      <motion.div
        layout
        className="h-16 flex items-center px-3.5 overflow-x-hidden max-w-inherit"
      >
        <motion.div
          className="min-h-8 min-w-8 h-8 w-8 object-contain"
          animate={{
            marginRight: isCompact ? "0" : "0.5rem",
          }}
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
              layout
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: 1,
                width: "100%",
              }}
              exit={{ opacity: 0, width: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
              className="text-lg font-semibold overflow-x-hidden box-border whitespace-nowrap max-w-full"
            >
              <motion.div layout className="w-fit min-w-fit">
                Atlas Hosting
              </motion.div>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.nav className="flex-1 px-2 py-4 w-auto space-y-1 overflow-y-auto flex flex-col box-border m-0 relative z-90 inset-shadow-border inset-shadow-[0_1px_0_0]">
        <TooltipProvider delayDuration={0}>
          {filteredNavigation.map((item) => (
            <NavItem item={item as any} key={item.name} isCompact={isCompact} />
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
      layout={true}
      initial={{ marginLeft: 0, marginRight: 0 }}
      key={item.name}
      href={item.disabled ? "#" : item.href}
      onClick={(e) => item.disabled && e.preventDefault()}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md group transition-all relative w-full box-border",
        item.disabled
          ? "opacity-50 cursor-not-allowed grayscale-[0.5]"
          : pathname === item.href
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
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
            initial={{ opacity: 0, width: 0, paddingLeft: 0 }}
            animate={{
              opacity: 1,
              width: itemWidth || "auto",
              paddingLeft: "0.5rem",
            }}
            exit={{ opacity: 0, width: 0, paddingLeft: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            ref={itemNameRef}
            className="overflow-x-hidden whitespace-nowrap flex-1 w-full box-border"
          >
            {item.name}
          </motion.span>
        )}
      </AnimatePresence>
      {item.disabled && !isCompact && (
        <span className="ml-auto text-[10px] uppercase tracking-wider font-bold text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded">
          Breve
        </span>
      )}
    </MotionLink>
  );

  if (item.disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          Em breve
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

const MotionLink = motion.create(Link);
