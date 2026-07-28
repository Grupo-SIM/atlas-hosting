"use client";

import { Check, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateRandomPassword } from "@/lib/utils";

export default function MemberPasswordInput() {
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [password, setPassword] = useState("");

  const handleGenerateNewPassword = () => {
    const newPassword = generateRandomPassword(8);
    setPassword(newPassword);
    setPasswordCopied(false);
  };

  const handleCopyPassword = async () => {
    await navigator.clipboard.writeText(password);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <Input
        className="font-mono"
        id="password"
        name="password"
        onChange={e => setPassword(e.target.value)}
        value={password}
      />
      <Button
        onClick={handleGenerateNewPassword}
        size="icon"
        title="Gerar nova senha"
        type="button"
        variant="outline"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
      <Button
        onClick={handleCopyPassword}
        size="icon"
        title={passwordCopied ? "Senha copiada!" : "Copiar senha"}
        type="button"
        variant="outline"
      >
        {passwordCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
