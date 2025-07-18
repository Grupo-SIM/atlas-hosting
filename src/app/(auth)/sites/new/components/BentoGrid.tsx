"use client";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { TemplateData } from "../interface";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DeploymentForm } from "./DeploymentForm";
import { User } from "@/lib/db/schema";

const BentoGridComponent = ({
  templates,
  tags,
  user,
}: {
  templates: TemplateData[];
  tags: string[];
  user: User & { githubToken?: string | null };
}) => {
  const [search, setSearch] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState(templates);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    setFilteredTemplates(
      templates.filter((template) =>
        template.name.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search, templates]);

  useEffect(() => {
    if (value) {
      setFilteredTemplates(
        templates.filter((template) => template.tags.includes(value)),
      );
    } else {
      setFilteredTemplates(templates);
    }
  }, [value, templates]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Pesquise por um template..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {value ? tags.find((tag) => tag === value) : "Filtre por tag..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search framework..." />
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag}
                    value={tag}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <BentoGrid>
        {filteredTemplates.map((template, i) => (
          <Dialog key={i}>
            <DialogTrigger asChild>
              <BentoCard
                name={template.name}
                className=""
                background={
                  <img
                    src={`https://templates.dokploy.com/blueprints/${template.id}/${template.logo}`}
                    alt={template.name}
                    className="absolute -right-20 -top-20 opacity-10"
                  />
                }
                Icon={() => (
                  <img
                    src={`https://templates.dokploy.com/blueprints/${template.id}/${template.logo}`}
                    alt={template.name}
                    className="h-12 w-12"
                  />
                )}
                description={template.description}
                version={template.version}
                tags={template.tags}
                links={template.links}
              />
            </DialogTrigger>
            <DialogContent>
              <DeploymentForm user={user} />
            </DialogContent>
          </Dialog>
        ))}
      </BentoGrid>
    </div>
  );
};

export default BentoGridComponent;
