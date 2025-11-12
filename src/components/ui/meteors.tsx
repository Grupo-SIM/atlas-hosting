"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
  minDelay?: number;
  maxDelay?: number;
  minDuration?: number;
  maxDuration?: number;
  angle?: number;
  className?: string;
}

export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}: MeteorsProps) => {
  const [meteors, setMeteors] = useState<Array<{
    id: number;
    left: string;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    const meteorArray = Array.from({ length: number }, (_, i) => ({
      id: i,
      left: `${Math.floor(Math.random() * 100)}%`,
      delay: Math.random() * (maxDelay - minDelay) + minDelay,
      duration: Math.random() * (maxDuration - minDuration) + minDuration,
    }));
    setMeteors(meteorArray);
  }, [number, minDelay, maxDelay, minDuration, maxDuration]);

  return (
    <>
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className={cn(
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-green-400 shadow-[0_0_0_1px_#22c55e10]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#22c55e] before:to-transparent",
            className
          )}
          style={{
            top: 0,
            left: meteor.left,
            animationDelay: `${meteor.delay}s`,
            animationDuration: `${meteor.duration}s`,
            transform: `rotate(${angle}deg)`,
            "--angle": `${angle}deg`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
};

