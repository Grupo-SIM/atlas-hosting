"use client";

import { useState, useEffect } from "react";
import { PlanCard } from "./PlanCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { Organization, Plan, User } from "@/lib/db/schema";
import { range } from "lodash";

interface PlansCarouselProps {
  plans: Plan[];
  user: User & { organization: Organization };
  searchParams?: { [key: string]: string };
}

export function PlansCarousel({
  plans,
  user,
  searchParams,
}: PlansCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="relative max-w-6xl mx-auto">
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
          slidesToScroll: 1,
        }}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
            <h2 className="text-2xl font-semibold text-foreground">
              Nossos Planos
            </h2>
            <div className="hidden md:flex items-center gap-1 ml-4 text-sm text-muted-foreground">
              <span className="bg-primary/10 px-2 py-1 rounded-md">
                {current} de {count}
              </span>
            </div>
          </div>

          {/* Custom Navigation Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <CarouselPrevious className="relative left-0 translate-y-0 h-10 w-10 border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm" />
            <CarouselNext className="relative right-0 translate-y-0 h-10 w-10 border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm" />
          </div>
        </div>

        <CarouselContent className="-ml-4 md:-ml-6">
          {plans.map((plan, index) => (
            <CarouselItem
              key={plan.id}
              className={`pl-4 md:pl-6 ${
                plans.length === 4
                  ? "md:basis-1/2 lg:basis-1/3"
                  : "md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              }`}
            >
              <div className="h-full transform transition-all duration-300 hover:scale-[1.02]">
                <PlanCard plan={plan} user={user} searchParams={searchParams} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Enhanced Mobile Navigation */}
        <div className="flex flex-col items-center gap-4 mt-8 md:hidden">
          {/* Dots */}
          <div className="flex gap-2">
            {range(count).map((i) => (
              <button
                type="button"
                key={i}
                onClick={() => api?.scrollTo(i)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === current - 1
                    ? "bg-primary scale-125"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Mobile Counter */}
          <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            {current} de {count} planos
          </div>
        </div>
      </Carousel>
    </div>
  );
}
