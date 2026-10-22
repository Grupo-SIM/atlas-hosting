import { BookText, Github, Globe } from "lucide-react";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-wrap gap-4", className)}>
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  version,
  tags,
  links,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: ElementType;
  description: string;
  version: string;
  tags: string[];
  links: {
    github: string;
    website: string;
    docs: string;
  };
}) => (
  <div
    className={cn(
      "group relative flex min-h-100 max-w-90 flex-wrap justify-between gap-4 overflow-hidden rounded-xl",
      "border-1 border-card-foreground/20 border-solid bg-background",
      className
    )}
    key={name}
  >
    <div className="flex items-center justify-between p-4">
      <Icon className="h-15 w-15" />
      <span className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-500 text-xs dark:bg-neutral-900">
        {version}
      </span>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-neutral-700 text-xl dark:text-neutral-300">
        {name}
      </h3>
      <div className="my-2 flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-500 text-xs dark:bg-neutral-900"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="max-w-lg text-neutral-400">{description}</p>
    </div>
    <div className="flex items-center justify-between border-neutral-200 border-t p-4 dark:border-neutral-800">
      <div className="flex gap-4">
        <a href={links.github} rel="noopener noreferrer" target="_blank">
          <Github className="h-6 w-6 text-neutral-500" />
        </a>
        <a href={links.website} rel="noopener noreferrer" target="_blank">
          <Globe className="h-6 w-6 text-neutral-500" />
        </a>
        <a href={links.docs} rel="noopener noreferrer" target="_blank">
          <BookText className="h-6 w-6 text-neutral-500" />
        </a>
      </div>
      <Button>Create</Button>
    </div>
  </div>
);

export { BentoCard, BentoGrid };
