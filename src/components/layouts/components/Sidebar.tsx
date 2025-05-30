"use client";

import AtlasLogo from "@/assets/atlas.svg";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
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
        "fixed inset-y-0 left-0 z-40 bg-card border-r shadow-sm whitespace-nowrap max-h-screen",
        "lg:relative lg:flex lg:flex-col",
        isCompact ? "w-[60px]" : "w-64"
      )}
    >
      <motion.div
        layout={true}
        initial={{ paddingLeft: 0, paddingRight: 0 }}
        animate={{
          paddingLeft: isCompact ? "1rem" : "1.5rem",
          paddingRight: isCompact ? "1rem" : "1.5rem",
          transition: {
            duration: 0.3,
            ease: isCompact ? "easeIn" : "easeOut",
          },
        }}
        exit={{ paddingLeft: 0, paddingRight: 0 }}
        className="h-16 w-full flex items-center justify-center border-b overflow-hidden"
      >
        <AtlasLogo className="min-h-8 min-w-8 h-8 w-8 object-contain" />
        <motion.span
          layout={true}
          initial={{ width: 0, paddingLeft: 0 }}
          animate={{
            width: isCompact ? 0 : "auto",
            paddingLeft: isCompact ? 0 : "0.75rem",
            transition: { duration: 0.3, ease: "easeOut" },
          }}
          className="text-lg font-semibold overflow-x-hidden"
        >
          Atlas Hosting
        </motion.span>
      </motion.div>

      <motion.nav
        layout={true}
        initial={{
          width: "3.75rem",
          marginLeft: "auto",
          marginRight: "auto",
        }}
        animate={{
          width: isCompact ? "3.75rem" : "auto",
          marginLeft: isCompact ? "auto" : 0,
          marginRight: isCompact ? "auto" : 0,
          transition: {
            duration: 0.3,
            ease: isCompact ? "easeIn" : "easeOut",
          },
        }}
        className="flex-1 px-2 py-4 space-y-1 overflow-y-auto flex flex-col box-border"
      >
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
      title={isCompact ? item.name : undefined}
    >
      <item.icon
        className={cn(
          "h-5 w-5 flex-shrink-0",
          pathname === item.href
            ? "text-accent-foreground"
            : "text-muted-foreground group-hover:text-accent-foreground"
        )}
      />
      <motion.span
        ref={itemNameRef}
        layout={true}
        initial={{
          marginLeft: 0,
          minWidth: 0,
          maxWidth: 0,
          width: 0,
        }}
        animate={{
          marginLeft: isCompact ? 0 : "0.75rem",
          minWidth: isCompact ? 0 : itemWidth,
          maxWidth: isCompact ? 0 : itemWidth,
          transition: { duration: 0.3, ease: "easeOut" },
        }}
        exit={{ width: 0, marginLeft: 0 }}
        className="overflow-x-hidden whitespace-nowrap flex-1 w-full"
      >
        {item.name}
      </motion.span>
    </MotionLink>
  );
}

const MotionLink = motion.create(Link);
