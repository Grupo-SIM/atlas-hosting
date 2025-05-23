// src/app/(authenticated)/(dashboard)/sites/new/components/SubmitButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { CgSpinner } from "react-icons/cg";

interface SubmitButtonProps {
  domain: string;
  adminUsername: string;
  adminPassword: string;
  siteName: string;
  isPending: boolean;
  buttonLabel: string;
}

export function SubmitButton({
  domain,
  adminUsername,
  adminPassword,
  siteName,
  isPending,
  buttonLabel,
}: SubmitButtonProps) {
  const canSubmit = domain && adminUsername && adminPassword && siteName;

  return (
    <Button
      type="submit"
      disabled={isPending || !canSubmit}
      className="w-full sm:w-auto"
    >
      {isPending && <CgSpinner className="mr-2 h-4 w-4 animate-spin" />}
      {buttonLabel}
    </Button>
  );
}
