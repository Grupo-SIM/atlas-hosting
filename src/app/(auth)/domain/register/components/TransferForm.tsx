"use client";

import { Cloud, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { addExternalDomain } from "../transfer-actions";

export function TransferForm({ defaultDomain }: { defaultDomain?: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const cloudflareId = useId();
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
      formRef.current?.reset();
      router.push("/domains");
    } else if (state?.status === "error") {
      toast({
        description: state.message,
        title: "Erro",
        variant: "destructive",
      });
    }
  }, [router, state, toast]);

  return (
    <form action={formAction} className="space-y-4" ref={formRef}>
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
        defaultValue="cloudflare"
        name="dnsMode"
      >
        <Label className="cursor-pointer" htmlFor={cloudflareId}>
          <Card className="h-full transition-colors has-[[data-state=checked]]:border-primary">
            <CardContent className="flex gap-3 p-4">
              <RadioGroupItem id={cloudflareId} value="cloudflare" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  <Cloud className="h-4 w-4" /> Gerenciar DNS pelo Atlas
                </div>
                <p className="text-muted-foreground text-xs">
                  Importe, adicione e edite registros diretamente no Atlas.
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
      <Button disabled={isPending} type="submit">
        {isPending ? "Adicionando..." : "Adicionar Domínio"}
      </Button>
    </form>
  );
}
