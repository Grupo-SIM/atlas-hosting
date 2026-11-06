"use client";

import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { createSite } from "../../actions";

interface Props {
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
  templateId: string;
  templateName: string;
}

/** Cria o site a partir do template e já abre o editor; endereço e publicação ficam para o fim. */
export default function UseTemplateButton({
  ariaLabel,
  children,
  className,
  templateId,
  templateName,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const create = async () => {
    if (pending) return;
    setPending(true);
    const result = await createSite({ name: templateName, templateId });
    if (!result.ok) {
      toast.error(result.error);
      setPending(false);
      return;
    }
    router.push(`/criador-de-sites/${result.siteId}`);
  };

  return (
    <button
      aria-label={ariaLabel}
      className={className}
      disabled={pending}
      onClick={() => void create()}
      type="button"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader className="size-[14px] animate-spin" />
          {children ? "Criando..." : null}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
