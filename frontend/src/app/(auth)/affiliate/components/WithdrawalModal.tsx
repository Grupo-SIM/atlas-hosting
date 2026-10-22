"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toBrl } from "@/lib/utils";
import { requestWithdrawal } from "../actions";

interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  availableBalance: number;
  minWithdrawal: number;
  fee: number;
}

export function WithdrawalModal({
  open,
  onClose,
  availableBalance,
  minWithdrawal,
  fee,
}: WithdrawalModalProps) {
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const parsedAmount = Number.parseFloat(amount) || 0;
  const netAmount = Math.max(0, parsedAmount - fee);
  const canSubmit =
    parsedAmount >= minWithdrawal &&
    parsedAmount <= availableBalance &&
    pixKey.trim().length >= 5;

  async function handleSubmit() {
    setError("");
    setLoading(true);
    const result = await requestWithdrawal(parsedAmount, pixKey);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmount("");
        setPixKey("");
        onClose();
      }, 1500);
    }
  }

  return (
    <Dialog onOpenChange={v => !v && onClose()} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Saque</DialogTitle>
        </DialogHeader>

        {success ? (
          <p className="py-4 text-center text-green-600">
            Solicitação enviada com sucesso!
          </p>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                max={availableBalance}
                min={minWithdrawal}
                onChange={e => setAmount(e.target.value)}
                placeholder={`Mín. ${toBrl(minWithdrawal)}`}
                step="0.01"
                type="number"
                value={amount}
              />
              <p className="text-muted-foreground text-xs">
                Disponível: {toBrl(availableBalance)}
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                onChange={e => setPixKey(e.target.value)}
                placeholder="CPF, email, telefone ou chave aleatória"
                value={pixKey}
              />
            </div>

            {parsedAmount > 0 && (
              <div className="space-y-1 rounded-md bg-muted p-3 text-sm">
                <div className="flex justify-between">
                  <span>Valor bruto</span>
                  <span>{toBrl(parsedAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxa de saque</span>
                  <span>- {toBrl(fee)}</span>
                </div>
                <div className="mt-1 flex justify-between border-t pt-1 font-medium">
                  <span>Você receberá</span>
                  <span>{toBrl(netAmount)}</span>
                </div>
              </div>
            )}

            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button disabled={loading} onClick={onClose} variant="outline">
              Cancelar
            </Button>
            <Button disabled={!canSubmit || loading} onClick={handleSubmit}>
              {loading ? "Enviando..." : "Solicitar Saque"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
