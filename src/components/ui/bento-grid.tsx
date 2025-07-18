import { ReactNode, ElementType } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Github, Globe, BookText } from "lucide-react";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("w-full flex flex-wrap gap-4", className)}>
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
    key={name}
    className={cn(
      "group relative flex flex-wrap justify-between gap-4 overflow-hidden rounded-xl max-w-90 min-h-100",
      "bg-background border-1 border-solid border-card-foreground/20",
      className,
    )}
  >
    <div className="flex justify-between items-center p-4">
      <Icon className="h-15 w-15" />
      <span className="text-xs text-neutral-500 px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900">
        {version}
      </span>
    </div>
    <div className="p-4">
      <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
        {name}
      </h3>
      <div className="flex flex-wrap gap-2 my-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-xs text-neutral-500 px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="max-w-lg text-neutral-400">{description}</p>
    </div>
    <div className="flex justify-between items-center p-4 border-t border-neutral-200 dark:border-neutral-800">
      <div className="flex gap-4">
        <a href={links.github} target="_blank" rel="noopener noreferrer">
          <Github className="h-6 w-6 text-neutral-500" />
        </a>
        <a href={links.website} target="_blank" rel="noopener noreferrer">
          <Globe className="h-6 w-6 text-neutral-500" />
        </a>
        <a href={links.docs} target="_blank" rel="noopener noreferrer">
          <BookText className="h-6 w-6 text-neutral-500" />
        </a>
      </div>
      <Button>Create</Button>
    </div>
  </div>
);

export { BentoCard, BentoGrid };
