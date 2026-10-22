"use client";

import { ArrowRightLeft, CheckCircle2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import {
  createDomainTransfer,
  verifyDomainTransferRecipient,
} from "@/app/(auth)/domains/transfer-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function DomainTransferDialog({
  domainId,
  domainName,
  open,
  onOpenChange,
  trigger,
}: {
  domainId: string;
  domainName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dialogOpen = open ?? isOpen;
  const setDialogOpen = onOpenChange ?? setIsOpen;
  const dialogTrigger =
    trigger ??
    (open === undefined ? (
      <Button className="w-full justify-start" variant="outline">
        <ArrowRightLeft className="mr-2 h-4 w-4" /> Transferir domínio
      </Button>
    ) : null);

  function showResult(result: { message: string; success: boolean }) {
    toast({
      description: result.message,
      title: result.success ? "Sucesso" : "Não foi possível continuar",
      variant: result.success ? "default" : "destructive",
    });
  }

  function verifyRecipient() {
    startTransition(async () => {
      const result = await verifyDomainTransferRecipient(domainId, email);
      setIsVerified(result.success);
      showResult(result);
    });
  }

  function submitTransfer() {
    startTransition(async () => {
      const result = await createDomainTransfer(domainId, email);
      showResult(result);
      if (!result.success) return;
      setDialogOpen(false);
      setEmail("");
      setIsVerified(false);
      router.refresh();
    });
  }

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      {dialogTrigger && <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transferir {domainName}</DialogTitle>
          <DialogDescription>
            Informe uma conta Atlas verificada. Você e o destinatário precisarão confirmar a transferência.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor={`domain-transfer-${domainId}`}>
            E-mail da conta destino
          </Label>
          <div className="flex gap-2">
            <Input
              autoComplete="email"
              disabled={isPending}
              id={`domain-transfer-${domainId}`}
              name="domainTransferEmail"
              onChange={event => {
                setEmail(event.currentTarget.value);
                setIsVerified(false);
              }}
              placeholder="cliente@exemplo.com"
              type="email"
              value={email}
            />
            <Button
              disabled={isPending || !email.trim()}
              onClick={verifyRecipient}
              type="button"
              variant="outline"
            >
              <Mail className="mr-2 h-4 w-4" /> Verificar
            </Button>
          </div>
          {isVerified && (
            <p className="flex items-center gap-2 text-emerald-600 text-sm">
              <CheckCircle2 className="h-4 w-4" /> Conta Atlas verificada.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            disabled={isPending || !isVerified}
            onClick={submitTransfer}
            type="button"
          >
            {isPending ? "Enviando..." : "Solicitar transferência"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
