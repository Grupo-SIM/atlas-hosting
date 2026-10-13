import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  pgAffiliateAttribution,
  pgAffiliateCommission,
} from "@/lib/db/schema/tables/affiliate";
import { pgInvoice } from "@/lib/db/schema/tables/invoice";
import { pgUser } from "@/lib/db/schema/tables/user";

/** Indicados de um afiliado do Atlas, com o valor de comissão gerado por cada um. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get("x-internal-token");
  const expected =
    process.env.API_MACHINE_INTERNAL_TOKEN ??
    process.env.INTERNAL_SERVICE_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const buyerIds = await db
    .select({ id: pgAffiliateAttribution.attributedUserId })
    .from(pgAffiliateAttribution)
    .where(eq(pgAffiliateAttribution.affiliateUserId, id))
    .union(
      db
        .select({ id: pgAffiliateCommission.buyerUserId })
        .from(pgAffiliateCommission)
        .where(
          and(
            eq(pgAffiliateCommission.affiliateUserId, id),
            ne(pgAffiliateCommission.status, "cancelled")
          )
        )
    );

  // Compras que geraram comissão para este afiliado (com a fatura), uma linha por comissão.
  // A soma por comprador é feita aqui em código: usar subquery em sql`` com colunas de
  // outra tabela faz o Drizzle omitir o prefixo da tabela e a comparação nunca bate.
  const commissionRows = await db
    .select({
      buyerUserId: pgAffiliateCommission.buyerUserId,
      commissionAmount: pgAffiliateCommission.commissionAmount,
      grossAmount: pgAffiliateCommission.grossAmount,
      createdAt: pgAffiliateCommission.createdAt,
      invoiceDescription: pgInvoice.description,
      invoiceType: pgInvoice.type,
      invoiceReference: pgInvoice.reference,
    })
    .from(pgAffiliateCommission)
    .innerJoin(pgInvoice, eq(pgInvoice.id, pgAffiliateCommission.invoiceId))
    .where(
      and(
        eq(pgAffiliateCommission.affiliateUserId, id),
        ne(pgAffiliateCommission.status, "cancelled")
      )
    )
    .orderBy(desc(pgAffiliateCommission.createdAt));

  const purchasesByBuyer = new Map<
    string,
    {
      title: string;
      type: string;
      grossAmount: number;
      commissionAmount: number;
      createdAt: Date;
    }[]
  >();
  for (const row of commissionRows) {
    const list = purchasesByBuyer.get(row.buyerUserId) ?? [];
    list.push({
      title: row.invoiceDescription?.trim() || row.invoiceReference,
      type: row.invoiceType,
      grossAmount: Number(row.grossAmount),
      commissionAmount: Number(row.commissionAmount),
      createdAt: row.createdAt,
    });
    purchasesByBuyer.set(row.buyerUserId, list);
  }

  const referrals = buyerIds.length
    ? await db
        .select({
          id: pgUser.id,
          name: pgUser.name,
          email: pgUser.email,
          cpf: pgUser.billingDocument,
        })
        .from(pgUser)
        .where(inArray(pgUser.id, buyerIds.map(b => b.id)))
    : [];

  const [balance] = await db
    .select({
      available: sql<number>`COALESCE(SUM(${pgAffiliateCommission.commissionAmount}) FILTER (WHERE ${pgAffiliateCommission.status} = 'available'), 0)`,
    })
    .from(pgAffiliateCommission)
    .where(eq(pgAffiliateCommission.affiliateUserId, id));

  const [self] = await db
    .select({
      id: pgUser.id,
      name: pgUser.name,
      email: pgUser.email,
      cpf: pgUser.billingDocument,
    })
    .from(pgUser)
    .where(eq(pgUser.id, id))
    .limit(1);

  return NextResponse.json({
    data: {
      affiliate: self
        ? { ...self, platformBalance: Number(balance?.available ?? 0) }
        : null,
      referrals: referrals.map(r => {
        const purchases = purchasesByBuyer.get(r.id) ?? [];
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          cpf: r.cpf ?? null,
          generated: Number(
            purchases.reduce((sum, p) => sum + p.commissionAmount, 0).toFixed(2)
          ),
          grossTotal: Number(
            purchases.reduce((sum, p) => sum + p.grossAmount, 0).toFixed(2)
          ),
          purchases,
        };
      }),
    },
  });
}
