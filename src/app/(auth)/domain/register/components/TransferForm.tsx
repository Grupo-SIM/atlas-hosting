"use client";

import { Copy, Eye, Server } from "lucide-react";
import { useActionState, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { addExternalDomain } from "../transfer-actions";

export function TransferForm({ defaultDomain }: { defaultDomain?: string }) {
  const { toast } = useToast();
  const atlasId = useId();
  const externalId = useId();
  const [state, formAction, isPending] = useActionState(
    addExternalDomain,
    null
  );

  useEffect(() => {
    if (state?.status === "success") {
      toast({
        description: state.message,
        title: "Sucesso!",
        variant: "default",
      });
    } else if (state?.status === "error") {
      toast({
        description: state.message,
        title: "Erro",
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-5">
      <Input
        className="w-full"
        defaultValue={defaultDomain || ""}
        disabled={isPending}
        name="domain"
        placeholder="Digite seu domínio (ex: meudominio.com)"
        required
      />
      <RadioGroup
        className="grid gap-3 sm:grid-cols-2"
        defaultValue="atlas"
        name="dnsMode"
      >
        <Label className="cursor-pointer" htmlFor={atlasId}>
          <Card className="h-full transition-colors has-[[data-state=checked]]:border-primary">
            <CardContent className="flex gap-3 p-4">
              <RadioGroupItem id={atlasId} value="atlas" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  <Server className="h-4 w-4" /> Gerenciar DNS pelo Atlas
                </div>
                <p className="text-muted-foreground text-xs">
                  Edite registros DNS pelo painel Atlas. Recomendado.
                </p>
              </div>
            </CardContent>
          </Card>
        </Label>
        <Label className="cursor-pointer" htmlFor={externalId}>
          <Card className="h-full transition-colors has-[[data-state=checked]]:border-primary">
            <CardContent className="flex gap-3 p-4">
              <RadioGroupItem id={externalId} value="external" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  <Eye className="h-4 w-4" /> Manter no provedor atual
                </div>
                <p className="text-muted-foreground text-xs">
                  O Atlas apenas verifica e exibe informações públicas.
                </p>
              </div>
            </CardContent>
          </Card>
        </Label>
      </RadioGroup>
      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        {isPending ? "Adicionando..." : "Adicionar Domínio"}
      </Button>
      {state?.verification && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <div>
            <p className="font-medium">Crie este registro TXT no DNS atual</p>
            <p className="text-muted-foreground text-sm">
              Não altere A, MX ou nameservers antes de verificarmos a
              propriedade.
            </p>
          </div>
          {[
            ["Host", state.verification.host],
            ["Valor", state.verification.value],
          ].map(([label, value]) => (
            <div className="rounded-md bg-background p-3" key={label}>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-sm">{label}</span>
                <Button
                  onClick={() => navigator.clipboard.writeText(value)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Copiar
                </Button>
              </div>
              <code className="break-all text-xs">{value}</code>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
