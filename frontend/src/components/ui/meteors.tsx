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
  const [meteors, setMeteors] = useState<
    Array<{
      id: number;
      left: string;
      delay: number;
      duration: number;
    }>
  >([]);

  useEffect(() => {
    const meteorArray = Array.from({ length: number }, (_, i) => ({
      delay: Math.random() * (maxDelay - minDelay) + minDelay,
      duration: Math.random() * (maxDuration - minDuration) + minDuration,
      id: i,
      left: `${Math.floor(Math.random() * 100)}%`,
    }));
    setMeteors(meteorArray);
  }, [number, minDelay, maxDelay, minDuration, maxDuration]);

  return (
    <>
      {meteors.map(meteor => (
        <span
          className={cn(
            "absolute top-1/2 left-1/2 h-0.5 w-0.5 animate-meteor-effect rounded-[9999px] bg-green-400 shadow-[0_0_0_1px_#22c55e10]",
            "before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-[50%] before:transform before:bg-gradient-to-r before:from-[#22c55e] before:to-transparent before:content-['']",
            className
          )}
          key={meteor.id}
          style={
            {
              "--angle": `${angle}deg`,
              animationDelay: `${meteor.delay}s`,
              animationDuration: `${meteor.duration}s`,
              left: meteor.left,
              top: 0,
              transform: `rotate(${angle}deg)`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
};
