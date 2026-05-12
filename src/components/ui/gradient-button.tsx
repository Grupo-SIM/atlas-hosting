"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { CheckCircle } from "lucide-react";
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
          "relative group overflow-hidden rounded-2xl transition-all duration-300",
          "border border-white/10",
          "w-full md:w-auto shadow-2xl shadow-sky-500/20",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Button content */}
        <div className="relative flex items-center justify-center gap-3 px-8 py-5 text-base font-black text-white uppercase tracking-widest">
          {icon || <CheckCircle className="w-5 h-5 stroke-[3px]" />}
          <span>{children}</span>

          {/* Shine effect on hover */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        </div>

        {/* Bottom highlight */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Comp>
    );
  }
);

GradientButton.displayName = "GradientButton";

export { GradientButton };
