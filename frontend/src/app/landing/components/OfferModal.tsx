"use client";

import { Globe2, Server } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type OfferModalProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function OfferModal({ onOpenChange, open }: OfferModalProps) {
  const router = useRouter();

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ganhe agora</DialogTitle>
          <DialogDescription>
            Escolha o que você deseja contratar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
            <Button
              className="h-auto min-h-32 items-start justify-start whitespace-normal p-4 text-left"
              onClick={() => router.push("/domains/search")}
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
      </DialogContent>
    </Dialog>
  );
}
