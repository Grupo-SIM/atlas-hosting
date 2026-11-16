"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { syncWithdrawalStatus } from "@/app/(auth)/affiliate/actions";
import { WithdrawalModal } from "@/app/(auth)/affiliate/components/WithdrawalModal";
import { Button } from "@/components/ui/button";

export function WithdrawButton(props: {
  availableBalance: number;
  fee: number;
  minWithdrawal: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        disabled={props.availableBalance < props.minWithdrawal}
        onClick={() => setOpen(true)}
      >
        Solicitar saque
      </Button>
      <WithdrawalModal
        {...props}
        onClose={() => {
          setOpen(false);
          router.refresh();
        }}
        open={open}
      />
    </>
  );
}

export function SyncWithdrawalButton({ withdrawalId }: { withdrawalId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      aria-label="Atualizar status do saque"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await syncWithdrawalStatus(withdrawalId);
        router.refresh();
        setBusy(false);
      }}
      size="icon"
      variant="ghost"
    >
      <RefreshCw className={busy ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
    </Button>
  );
}
