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

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(true);

  return (
    <motion.div
      layout={true}
      onMouseEnter={() => setIsCompact(false)}
      onMouseLeave={() => setIsCompact(true)}
      animate={{
        width: isCompact ? "min-content" : "auto",
        transition: {
          duration: 0.3,
          ease: sidebarOpen ? "easeIn" : "easeOut",
        },
      }}
      transition={{
        duration: 0.3,
        ease: isCompact ? "easeIn" : "easeOut",
      }}
      className={cn(
        "fixed inset-y-0 left-0 bg-card whitespace-nowrap max-h-screen",
        "lg:relative lg:flex lg:flex-col",
        isCompact ? "w-[60px]" : "w-64"
      )}
    >
      <motion.div
        layout
        className="h-16 flex items-center px-3.5 overflow-x-hidden max-w-inherit"
      >
        <MotionLogo
          className="min-h-8 min-w-8 h-8 w-8 object-contain"
          animate={{
            marginRight: isCompact ? "0" : "0.5rem",
          }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        />
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
        {navigation.map((item) => (
          <NavItem item={item} key={item.name} isCompact={isCompact} />
        ))}
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
  };
}) {
  const pathname = usePathname();

  const itemNameRef = useRef<HTMLSpanElement>(null);
  const itemWidth = itemNameRef.current?.scrollWidth;

  return (
    <MotionLink
      layout={true}
      initial={{ marginLeft: 0, marginRight: 0 }}
      key={item.name}
      href={item.href}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md group transition-colors relative w-full box-border",
        pathname === item.href
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
      title={item.name}
    >
      <item.icon
        className={cn(
          "h-5 w-5 flex-shrink-0",
          pathname === item.href
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
    </MotionLink>
  );
}

const MotionLink = motion.create(Link);
const MotionLogo = motion.create(AtlasLogo);
