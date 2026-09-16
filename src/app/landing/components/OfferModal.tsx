"use client";

import { Globe2, Server } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OfferModalProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function OfferModal({ onOpenChange, open }: OfferModalProps) {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [isDomainSelected, setIsDomainSelected] = useState(false);

  const handleDomainSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = domain.trim();

    if (query) router.push(`/domains/search?q=${encodeURIComponent(query)}`);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setIsDomainSelected(false);
    onOpenChange(nextOpen);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ganhe agora</DialogTitle>
          <DialogDescription>
            Escolha o que você deseja contratar.
          </DialogDescription>
        </DialogHeader>

        {isDomainSelected ? (
          <form className="space-y-3" onSubmit={handleDomainSearch}>
            <Label htmlFor="offer-domain">Seu domínio</Label>
            <Input
              autoComplete="url"
              id="offer-domain"
              name="domain"
              onChange={event => setDomain(event.currentTarget.value)}
              placeholder="Ex: meusite.com.br"
              required
              type="text"
              value={domain}
            />
            <Button className="w-full" type="submit">
              Buscar domínio
            </Button>
            <Button
              className="w-full"
              onClick={() => setIsDomainSelected(false)}
              type="button"
              variant="outline"
            >
              Voltar
            </Button>
          </form>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              className="h-auto min-h-32 items-start justify-start whitespace-normal p-4 text-left"
              onClick={() => setIsDomainSelected(true)}
              type="button"
              variant="outline"
            >
              <span>
                <Globe2 className="mb-3 h-5 w-5 text-primary" />
                <span className="block font-semibold">Ganhar em domínios</span>
                <span className="mt-1 block text-muted-foreground text-sm">
                  Encontre o endereço ideal.
                </span>
              </span>
            </Button>
            <Button
              className="h-auto min-h-32 items-start justify-start whitespace-normal p-4 text-left"
              onClick={() => router.push("/vps")}
              type="button"
              variant="outline"
            >
              <span>
                <Server className="mb-3 h-5 w-5 text-primary" />
                <span className="block font-semibold">Ganhar em hospedagem</span>
                <span className="mt-1 block text-muted-foreground text-sm">
                  Conheça nossos planos VPS.
                </span>
              </span>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
