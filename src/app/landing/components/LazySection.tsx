"use client";

import React, { useState, useEffect, useRef } from "react";

interface LazySectionProps {
  children: React.ReactNode;
  offset?: string;
  className?: string;
}

export function LazySection({ children, offset = "200px", className = "" }: LazySectionProps) {
  const [isIntersecting, setIntersecting] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: offset,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [offset]);

  return (
    <div ref={sectionRef} className={className}>
      {isIntersecting ? children : <div className="min-h-[200px] w-full" />}
    </div>
  );
}
