"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Copy, Check } from "lucide-react";
import { useState } from "react";
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
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        name="password"
        id="password"
        className="font-mono"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleGenerateNewPassword}
        title="Gerar nova senha"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleCopyPassword}
        title={passwordCopied ? "Senha copiada!" : "Copiar senha"}
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
