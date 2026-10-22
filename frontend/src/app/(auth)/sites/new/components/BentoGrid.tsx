"use client";

import { ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { User } from "@/lib/db/schema";
import type { TemplateData } from "../interface";
import { DeploymentForm } from "./DeploymentForm";

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
      templates.filter(template =>
        template.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, templates]);

  useEffect(() => {
    if (value) {
      setFilteredTemplates(
        templates.filter(template => template.tags.includes(value))
      );
    } else {
      setFilteredTemplates(templates);
    }
  }, [value, templates]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input
          className="w-full"
          onChange={e => setSearch(e.target.value)}
          placeholder="Pesquise por um template..."
          value={search}
        />
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={open}
              className="w-full justify-between sm:w-[200px]"
              role="combobox"
              variant="outline"
            >
              {value ? tags.find(tag => tag === value) : "Filtre por tag..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search framework..." />
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {tags.map(tag => (
                  <CommandItem
                    key={tag}
                    onSelect={currentValue => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                    value={tag}
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
                background={
                  <img
                    alt={template.name}
                    className="absolute -top-20 -right-20 opacity-10"
                    src={`https://templates.dokploy.com/blueprints/${template.id}/${template.logo}`}
                  />
                }
                className=""
                description={template.description}
                Icon={() => (
                  <img
                    alt={template.name}
                    className="h-12 w-12"
                    src={`https://templates.dokploy.com/blueprints/${template.id}/${template.logo}`}
                  />
                )}
                links={template.links}
                name={template.name}
                tags={template.tags}
                version={template.version}
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
