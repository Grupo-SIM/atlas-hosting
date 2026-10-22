import { AlertCircle, Mail, Server } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPleskMailAccount } from "../actions";

interface PleskEmailAccountSetupProps {
  domains: Array<{
    id: string;
    name: string;
    pleskId?: number;
    pleskSiteId?: number;
    status: string;
  }>;
  user: {
    id: string;
    name: string;
    email: string;
  };
  cancelHref: string;
  // Optional: To display errors if the server action redirects with an error message
  errorMessage?: string;
}

export function PleskEmailAccountSetup({
  domains,
  user,
  cancelHref,
  errorMessage,
}: PleskEmailAccountSetupProps) {
  const availableDomains = domains.filter(domain => domain.status === "active");

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Nova Conta de E-mail</span>
        </CardTitle>
        <CardDescription>
          Preencha os detalhes abaixo para criar uma nova conta de e-mail.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form action={createPleskMailAccount} className="space-y-6">
          <div className="space-y-4">
            {/* Domain Selection */}
            <div className="space-y-2">
              <Label htmlFor="domain">Domínio *</Label>
              <Select
                defaultValue={availableDomains[0]?.id}
                name="domainId"
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um domínio" />
                </SelectTrigger>
                <SelectContent>
                  {availableDomains.map(domain => (
                    <SelectItem key={domain.id} value={domain.id}>
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4" />
                        <span>{domain.name}</span>
                        <Badge className="text-xs" variant="secondary">
                          Plesk
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableDomains.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhum domínio disponível. Configure um domínio com Plesk
                  primeiro.
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  className="flex-1"
                  id="username"
                  name="username"
                  pattern="[a-z0-9._-]+"
                  placeholder="admin"
                  required
                  title="Apenas letras minúsculas, números, pontos, hífens e sublinhados."
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Apenas letras minúsculas, números, pontos, hífens e sublinhados
              </p>
              {/* {username && selectedDomainData && (
                <div className="flex items-center space-x-2 p-2 bg-secondary rounded">
                  <Mail className="h-4 w-4 text-primary" />
                  This dynamic part is harder without client JS. 
                      Consider showing selected domain if only one or if pre-selected.
                      For now, it's removed for simplicity in a pure server component.
                </div>
              )} */}
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de exibição</Label>
              <Input
                defaultValue={user.name}
                id="displayName"
                name="displayName"
                placeholder="João Silva"
              />
              <p className="text-muted-foreground text-xs">
                Nome que aparecerá como remetente dos e-mails
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                minLength={8}
                name="password"
                placeholder="Digite uma senha segura"
                required
                type="password"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha *</Label>
              <Input
                id="confirmPassword"
                minLength={8}
                name="confirmPassword" // Server action should validate this against 'password'
                placeholder="Digite a senha novamente"
                required
                type="password"
              />
            </div>

            {/* Quota */}
            <div className="space-y-2">
              <Label htmlFor="quota">Cota de armazenamento (MB)</Label>
              <Select defaultValue="1000" name="quota">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">500 MB</SelectItem>
                  <SelectItem value="1000">1 GB</SelectItem>
                  <SelectItem value="2000">2 GB</SelectItem>
                  <SelectItem value="5000">5 GB</SelectItem>
                  <SelectItem value="10000">10 GB</SelectItem>
                  <SelectItem value="-1">Ilimitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Password Requirements (Static Info) */}
          <div className="rounded-lg bg-muted p-3">
            <p className="mb-2 font-medium text-sm">Requisitos da Senha:</p>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li>• Mínimo de 8 caracteres</li>
              <li>• Pelo menos uma letra maiúscula</li>
              <li>• Pelo menos um número</li>
              <li>• Pelo menos um caractere especial (ex: !@#$%)</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 border-t pt-4">
            <Link href={cancelHref}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit">Criar Conta</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
