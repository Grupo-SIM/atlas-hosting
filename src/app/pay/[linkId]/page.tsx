import { db } from "@/lib/db";
import { pgVpsPaymentLink } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth";
import { createVpsInvoice } from "@/app/actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pagamento — Atlas Hosting" };

function StatusMessage({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-[#000B12] flex items-center justify-center px-6">
      <div className="text-center space-y-4 max-w-md">
        <p className="text-2xl font-black text-white">{title}</p>
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
  });

  if (!link) {
    return <StatusMessage title="Link não encontrado" message="Verifique se o endereço está correto." />;
  }
  if (link.status === "cancelled") {
    return <StatusMessage title="Link cancelado" message="Este link de pagamento foi cancelado." />;
  }
  if (link.status === "used") {
    return <StatusMessage title="Link já utilizado" message="Este link de pagamento já foi usado." />;
  }

  const commonConfig = {
    type: link.productType,
    duration: String(link.intervalMonths),
    qty: "1",
    paymentLinkId: link.id,
    customLinkAmountBrl: link.amountBrl,
    customLinkAllowPix: link.allowPix,
  };

  // Genérico — sem conta vinculada: reusa o fluxo de checkout já existente (login
  // ou dados de convidado), que já sabe lidar com preço/config customizados.
  if (!link.linkedUserId) {
    const query = new URLSearchParams({
      planId: link.planId,
      type: commonConfig.type,
      duration: commonConfig.duration,
      qty: commonConfig.qty,
      paymentLinkId: commonConfig.paymentLinkId,
      customLinkAmountBrl: String(commonConfig.customLinkAmountBrl),
      customLinkAllowPix: String(commonConfig.customLinkAllowPix),
    }).toString();
    redirect(`/checkout/personal-data?${query}`);
  }

  // Vinculado a um cliente específico — só essa conta pode usar o link.
  const user = await getOptionalUser();
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/pay/${link.id}`)}`);
  }
  if (user.id !== link.linkedUserId) {
    return (
      <StatusMessage
        title="Link de outra conta"
        message="Este link de pagamento foi gerado para outra conta. Faça login com a conta correta para continuar."
      />
    );
  }

  const result = await createVpsInvoice({
    planId: link.planId,
    config: commonConfig,
  });

  if (result.status === "success" && result.redirectUrl) {
    redirect(result.redirectUrl);
  }

  return (
    <StatusMessage
      title="Erro ao gerar cobrança"
      message={(result as any).message || "Não foi possível gerar a cobrança. Tente novamente."}
    />
  );
}
