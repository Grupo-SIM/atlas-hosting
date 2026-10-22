import { notFound } from "next/navigation";
import TestPaymentClient from "./test-payment-client";

export default function TestPaymentPage() {
  const allowed =
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_TEST_PAYMENT_INVOICE === "true";

  if (!allowed) {
    notFound();
  }

  return <TestPaymentClient />;
}
