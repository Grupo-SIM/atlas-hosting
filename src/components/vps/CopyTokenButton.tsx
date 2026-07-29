"use client";

import { toast } from "sonner";

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
      className="max-w-[100px] cursor-pointer truncate rounded bg-muted px-1 text-left transition-colors hover:bg-muted-foreground/20"
      onClick={handleCopy}
      title="Clique para copiar o token completo"
    >
      {token}
    </button>
  );
}
