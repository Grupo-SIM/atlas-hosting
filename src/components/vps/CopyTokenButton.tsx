"use client";

import { toast } from "sonner";
import { Copy } from "lucide-react";

interface CopyTokenButtonProps {
  token: string;
}

export default function CopyTokenButton({ token }: CopyTokenButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    toast.success("Token copiado para a área de transferência!");
  };

  return (
    <button 
      onClick={handleCopy}
      className="bg-muted hover:bg-muted-foreground/20 px-1 rounded truncate max-w-[100px] transition-colors cursor-pointer text-left"
      title="Clique para copiar o token completo"
    >
      {token}
    </button>
  );
}
