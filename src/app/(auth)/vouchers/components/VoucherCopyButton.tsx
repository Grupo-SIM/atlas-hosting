"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function VoucherCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button onClick={handleCopy} size="sm" variant="outline">
      {copied ? (
        <>
          <Check className="mr-1 h-4 w-4 text-green-500" />
          Copiado!
        </>
      ) : (
        <>
          <Copy className="mr-1 h-4 w-4" />
          Copiar
        </>
      )}
    </Button>
  );
}
