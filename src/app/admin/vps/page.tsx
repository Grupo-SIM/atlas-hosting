"use client";

import { useState } from "react";
import { registerVpsAction } from "@/app/vps-actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Terminal, Copy, Check } from "lucide-react";

export default function AdminVpsPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Aqui usamos o e-mail do usuário como identificador inicial
      // Na action, o ideal é converter esse email para ID, mas por simplicidade
      // vou assumir que você passa o ID ou o email e a action resolve.
      // Vou ajustar a action para aceitar email também.
      const res = await registerVpsAction(email, name, ip);
      if (res.success) {
        setToken(res.token);
        toast.success("Servidor registrado com sucesso!");
      }
    } catch (error: any) {
      toast.error("Erro ao registrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Token copiado!");
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Painel Admin: Registro de VPS</CardTitle>
          <CardDescription>
            Use esta tela para gerar o Token de monitoramento para cada cliente novo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail do Usuário no Atlas</Label>
                <Input 
                  id="email" 
                  placeholder="exemplo@gmail.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome Amigável da VM</Label>
                <Input 
                  id="name" 
                  placeholder="VPS Contabo Breno" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ip">Endereço IP</Label>
                <Input 
                  id="ip" 
                  placeholder="66.94.101.192" 
                  value={ip} 
                  onChange={(e) => setIp(e.target.value)} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Gerando..." : "Gerar Token e Vincular"}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg bg-emerald-500/10 p-4 border border-emerald-500/20 text-emerald-400">
                <p className="text-sm font-medium">Servidor vinculado com sucesso!</p>
              </div>
              
              <div className="space-y-2">
                <Label>Token de Instalação</Label>
                <div className="flex gap-2">
                  <Input readOnly value={token} className="font-mono bg-muted" />
                  <Button size="icon" variant="outline" onClick={() => copyToClipboard(token)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Copie este token e cole na variável <strong>ATLAS_TOKEN</strong> do seu script Python na VM.
                </p>
              </div>

              <div className="rounded-lg bg-slate-950 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Terminal className="h-4 w-4" />
                  <span>Comando de teste rápido na VM:</span>
                </div>
                <code className="text-xs text-emerald-400 break-all leading-normal">
                   python3 monitor.py --token {token}
                </code>
              </div>

              <Button variant="ghost" onClick={() => setToken(null)} className="w-full">
                Registrar outra VM
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
