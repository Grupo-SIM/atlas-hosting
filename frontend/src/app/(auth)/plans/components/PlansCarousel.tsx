"use client";

import { range } from "lodash";
import { useEffect, useState } from "react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Organization, Plan, User } from "@/lib/db/schema";
import { PlanCard } from "./PlanCard";

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
    <div className="relative mx-auto max-w-6xl">
      <Carousel
        className="w-full"
        opts={{
          align: "center",
          loop: true,
          slidesToScroll: 1,
        }}
        setApi={setApi}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50" />
            <h2 className="font-semibold text-2xl text-foreground">
              Nossos Planos
            </h2>
            <div className="ml-4 hidden items-center gap-1 text-muted-foreground text-sm md:flex">
              <span className="rounded-md bg-primary/10 px-2 py-1">
                {current} de {count}
              </span>
            </div>
          </div>

          {/* Custom Navigation Buttons */}
          <div className="hidden items-center gap-2 md:flex">
            <CarouselPrevious className="relative left-0 h-10 w-10 translate-y-0 border-2 border-border/50 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/50" />
            <CarouselNext className="relative right-0 h-10 w-10 translate-y-0 border-2 border-border/50 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/50" />
          </div>
        </div>

        <CarouselContent className="-ml-4 md:-ml-6">
          {plans.map((plan, index) => (
            <CarouselItem
              className={`pl-4 md:pl-6 ${
                plans.length === 4
                  ? "md:basis-1/2 lg:basis-1/3"
                  : "md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              }`}
              key={plan.id}
            >
              <div className="h-full transform transition-all duration-300 hover:scale-[1.02]">
                <PlanCard plan={plan} searchParams={searchParams} user={user} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Enhanced Mobile Navigation */}
        <div className="mt-8 flex flex-col items-center gap-4 md:hidden">
          {/* Dots */}
          <div className="flex gap-2">
            {range(count).map(i => (
              <button
                aria-label={`Go to slide ${i + 1}`}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  i === current - 1
                    ? "scale-125 bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                key={i}
                onClick={() => api?.scrollTo(i)}
                type="button"
              />
            ))}
          </div>

          {/* Mobile Counter */}
          <div className="rounded-full bg-muted/50 px-3 py-1 text-muted-foreground text-xs">
            {current} de {count} planos
          </div>
        </div>
      </Carousel>
    </div>
  );
}
