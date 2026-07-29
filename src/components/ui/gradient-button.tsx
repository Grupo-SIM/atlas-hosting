"use client";

import { Slot } from "@radix-ui/react-slot";
import { CheckCircle } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  icon?: React.ReactNode;
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    {
      className,
      children = "Finalizar Transação",
      asChild = false,
      icon,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          "group relative overflow-hidden rounded-2xl transition-all duration-300",
          "border border-white/10",
          "w-full shadow-2xl shadow-sky-500/20 md:w-auto",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Button content */}
        <div className="relative flex items-center justify-center gap-3 px-8 py-5 font-black text-base text-white uppercase tracking-widest">
          {icon || <CheckCircle className="h-5 w-5 stroke-[3px]" />}
          <span>{children}</span>

          {/* Shine effect on hover */}
          <div className="absolute inset-0 h-full w-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
        </div>

        {/* Bottom highlight */}
        <div className="absolute right-0 bottom-0 left-0 h-[2px] bg-white/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Comp>
    );
  }
);

GradientButton.displayName = "GradientButton";

export { GradientButton };
