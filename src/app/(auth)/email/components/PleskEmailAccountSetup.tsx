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
import { AlertCircle, Mail, Server } from "lucide-react";
import Link from "next/link";
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
  const availableDomains = domains.filter(
    (domain) => domain.status === "active"
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
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
                name="domainId"
                defaultValue={availableDomains[0]?.id}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um domínio" />
                </SelectTrigger>
                <SelectContent>
                  {availableDomains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4" />
                        <span>{domain.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          Plesk
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableDomains.length === 0 && (
                <p className="text-sm text-muted-foreground">
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
                  name="username"
                  id="username"
                  placeholder="admin"
                  className="flex-1"
                  pattern="[a-z0-9._-]+"
                  title="Apenas letras minúsculas, números, pontos, hífens e sublinhados."
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
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
                id="displayName"
                name="displayName"
                defaultValue={user.name}
                placeholder="João Silva"
              />
              <p className="text-xs text-muted-foreground">
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
                name="password"
                type="password"
                placeholder="Digite uma senha segura"
                required
                minLength={8}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword" // Server action should validate this against 'password'
                type="password"
                placeholder="Digite a senha novamente"
                required
                minLength={8}
              />
            </div>

            {/* Quota */}
            <div className="space-y-2">
              <Label htmlFor="quota">Cota de armazenamento (MB)</Label>
              <Select name="quota" defaultValue="1000">
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
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Requisitos da Senha:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Mínimo de 8 caracteres</li>
              <li>• Pelo menos uma letra maiúscula</li>
              <li>• Pelo menos um número</li>
              <li>• Pelo menos um caractere especial (ex: !@#$%)</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Link href={cancelHref}>
              <Button variant="outline" type="button">
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
