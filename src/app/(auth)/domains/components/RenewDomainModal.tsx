"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ModernCheckoutForm from "@/components/checkout/ModernCheckoutForm";
import { createDomainRenewalInvoice } from "@/app/actions";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RenewDomainModalProps {
  domainName: string;
  onClose: () => void;
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; invoiceId: string; priceBRL: number };

export function RenewDomainModal({ domainName, onClose }: RenewDomainModalProps) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    createDomainRenewalInvoice(domainName).then((res) => {
      if (res.status === "error") {
        setState({ status: "error", message: res.message });
      } else {
        setState({ status: "ready", invoiceId: res.invoiceId, priceBRL: res.priceBRL });
      }
    });
  }, [domainName]);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Renovar Domínio
          </DialogTitle>
          <DialogDescription>
            Renovação de <strong>{domainName}</strong> por mais 1 ano.
            {state.status === "ready" && (
              <> Valor: <strong>R$ {(state.priceBRL / 100).toFixed(2).replace(".", ",")}</strong></>
            )}
          </DialogDescription>
        </DialogHeader>

        {state.status === "loading" && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {state.status === "error" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-muted-foreground text-center">{state.message}</p>
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </div>
        )}

        {state.status === "ready" && (
          <ModernCheckoutForm invoiceId={state.invoiceId} />
        )}
      </DialogContent>
    </Dialog>
  );
}
