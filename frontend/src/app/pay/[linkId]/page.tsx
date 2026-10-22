import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createVpsInvoice } from "@/app/actions";
import { db } from "@/lib/db";
import { pgVpsPaymentLink } from "@/lib/db/schema";
import { paymentLinkEffectiveStatus } from "@/lib/payment-links/status";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pagamento — Atlas Hosting" };

function StatusMessage({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#000B12] px-6">
      <div className="max-w-md space-y-4 text-center">
        <p className="font-black text-2xl text-white">{title}</p>
        <p className="text-slate-400">{message}</p>
      </div>
    </div>
  );
}

export default async function PayLinkPage({
  params,
}: {
  params: Promise<{ linkId: string }>;
}) {
  const { linkId } = await params;

  const link = await db.query.pgVpsPaymentLink.findFirst({
    where: eq(pgVpsPaymentLink.id, linkId),
    with: { resultingInvoice: true },
  });

  if (!link) {
    return (
      <StatusMessage
        message="Verifique se o endereço está correto."
        title="Link não encontrado"
      />
    );
  }

  const effectiveStatus = paymentLinkEffectiveStatus(
    link.status,
    (link.resultingInvoice as { status?: string } | null)?.status
  );

  if (effectiveStatus === "cancelled") {
    return (
      <StatusMessage
        message="Este link de pagamento foi cancelado."
        title="Link cancelado"
      />
    );
  }
  if (effectiveStatus === "paid") {
    return (
      <StatusMessage
        message="Este link de pagamento já foi usado."
        title="Link já utilizado"
      />
    );
  }

  const commonConfig = {
    customLinkAllowBoleto: link.allowBoleto,
    customLinkAllowPix: link.allowPix,
    customLinkAmountBrl: link.amountBrl,
    duration: String(link.intervalMonths),
    paymentLinkId: link.id,
    qty: "1",
    type: link.productType,
  };

  // Genérico — sem conta vinculada: reusa o fluxo de checkout já existente (login
  // ou dados de convidado), que já sabe lidar com preço/config customizados.
  if (!link.linkedUserId) {
    const query = new URLSearchParams({
      customLinkAllowBoleto: String(commonConfig.customLinkAllowBoleto),
      customLinkAllowPix: String(commonConfig.customLinkAllowPix),
      customLinkAmountBrl: String(commonConfig.customLinkAmountBrl),
      duration: commonConfig.duration,
      paymentLinkId: commonConfig.paymentLinkId,
      planId: link.planId,
      qty: commonConfig.qty,
      type: commonConfig.type,
    }).toString();
    redirect(`/checkout/personal-data?${query}`);
  }

  // Vinculado a um cliente: a cobrança nasce na conta dele, mas quem tem o link
  // paga — sem login. `createVpsInvoice` resolve o dono pelo próprio link.
  const result = await createVpsInvoice({
    config: commonConfig,
    planId: link.planId,
  });

  if (result.status === "success" && result.redirectUrl) {
    redirect(result.redirectUrl);
  }

  return (
    <StatusMessage
      message={
        (result as any).message ||
        "Não foi possível gerar a cobrança. Tente novamente."
      }
      title="Erro ao gerar cobrança"
    />
  );
}
