import { Suspense } from "react";
import ChangeEmailVerificationForm from "@/components/auth/ChangeEmailVerificationForm";

export default function ChangeEmailVerifyPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ChangeEmailVerificationForm />
    </Suspense>
  );
}
