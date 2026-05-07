"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestWithdrawal } from "../actions";
import { toBrl } from "@/lib/utils";

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

  const parsedAmount = parseFloat(amount) || 0;
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
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Saque</DialogTitle>
        </DialogHeader>

        {success ? (
          <p className="text-center text-green-600 py-4">
            Solicitação enviada com sucesso!
          </p>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                min={minWithdrawal}
                max={availableBalance}
                step="0.01"
                placeholder={`Mín. ${toBrl(minWithdrawal)}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Disponível: {toBrl(availableBalance)}
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                placeholder="CPF, email, telefone ou chave aleatória"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
              />
            </div>

            {parsedAmount > 0 && (
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Valor bruto</span>
                  <span>{toBrl(parsedAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxa de saque</span>
                  <span>- {toBrl(fee)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1 mt-1">
                  <span>Você receberá</span>
                  <span>{toBrl(netAmount)}</span>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
              {loading ? "Enviando..." : "Solicitar Saque"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
