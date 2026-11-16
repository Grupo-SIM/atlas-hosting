"use client";

import { Pencil, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { resetTemplateOverride } from "../../template-actions";

/** Só o admin master vê: abre o editor do template e, se ele foi editado, descarta as edições. */
export default function MasterTemplateControls({
  edited,
  templateId,
  templateName,
}: {
  edited: boolean;
  templateId: string;
  templateName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const reset = () =>
    startTransition(async () => {
      const result = await resetTemplateOverride(templateId);
      if (result.ok) toast.success("Template restaurado ao original");
      else toast.error(result.error);
    });

  return (
    <>
      <Link
        className="flex items-center gap-1.5 rounded-full border border-[#1d1c1a] bg-[#1d1c1a] px-3 py-2 text-[13px] text-white"
        href={`/criador-de-sites/templates/${templateId}`}
        prefetch={false}
      >
        <Pencil className="size-[14px]" />
        Editar template
      </Link>
      {edited ? (
        <button
          className="flex items-center gap-1.5 rounded-full border border-[#e0ddd5] bg-white px-3 py-2 text-[13px] disabled:opacity-60"
          disabled={pending}
          onClick={() => setConfirming(true)}
          type="button"
        >
          <RotateCcw className="size-[14px]" />
          Descartar edições
        </button>
      ) : null}
      <AlertDialog onOpenChange={setConfirming} open={confirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Descartar as edições de "{templateName}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O template volta a ser o original do código. Os sites já criados
              com ele não mudam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={reset}>Descartar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
