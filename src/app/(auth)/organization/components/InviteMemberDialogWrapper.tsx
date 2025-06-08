"use client";

import { Dialog } from "@/components/ui/dialog";
import type { DialogProps } from "@radix-ui/react-dialog";
import { useRouter, useSearchParams } from "next/navigation";

export default function InviteMemberDialogWrapper({
  onOpenChange: _,
  ...props
}: DialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onOpenChange = (open: boolean) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("action");

    if (!open) {
      router.push(`/organization?${newSearchParams.toString()}`);
    }
  };

  return <Dialog {...props} onOpenChange={onOpenChange} />;
}
