import { db } from "@/lib/db";
import { pgUser, pgOrganizationDomains } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * Endpoint para sincronizar domínios da Namecheap com o banco de dados local/prod.
 * Útil para quando ambientes diferentes têm bases de dados dessincronizadas.
 * 
 * Exemplo de uso:
 * POST /api/domains/sync
 * { "email": "usuario@exemplo.com" }
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "O campo 'email' é obrigatório no corpo da requisição." },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. Localizar o usuário e seu ID de organização
    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.email, email),
    });

    if (!user || !user.organizationId) {
      return NextResponse.json(
        { 
          error: "Usuário não encontrado ou não possui uma organização vinculada.",
          email 
        }, 
        { status: 404, headers: corsHeaders }
      );
    }

    const orgId = user.organizationId;

    // 2. Buscar todos os domínios da conta master na Namecheap via API
    const ncDomainsResponse = await namecheapApi.getList({ PageSize: 100 });
    const ncDomains = ncDomainsResponse.Domains || [];

    if (ncDomains.length === 0) {
      return NextResponse.json(
        { message: "Nenhum domínio encontrado na conta Namecheap.", count: 0 },
        { headers: corsHeaders }
      );
    }

    // 3. Buscar domínios que já existem no banco de dados para esta organização
    const currentDbDomains = await db.query.pgOrganizationDomains.findMany({
      where: eq(pgOrganizationDomains.organizationId, orgId),
    });
    
    const currentDomainNames = new Set(currentDbDomains.map(d => d.domain.toLowerCase()));

    // 4. Filtrar domínios que estão na Namecheap mas não no banco de dados
    const missingDomains = ncDomains.filter(
      ncD => !currentDomainNames.has(ncD.Name.toLowerCase())
    );

    if (missingDomains.length === 0) {
      return NextResponse.json(
        { 
          message: "O banco de dados já está em sincronia com a conta Namecheap.", 
          count: 0 
        },
        { headers: corsHeaders }
      );
    }

    // 5. Inserir os domínios faltantes
    const insertValues = missingDomains.map(ncD => ({
      organizationId: orgId,
      domain: ncD.Name.toLowerCase(),
      active: true,
      createdAt: new Date(),
    }));

    await db.insert(pgOrganizationDomains).values(insertValues);

    // 6. Revalidar cache do Next.js
    revalidatePath("/", "layout"); // Revalida a aplicação inteira para garantir que o seletor atualize
    revalidateTag("dns-records", "default");

    return NextResponse.json(
      {
        message: `Sincronização concluída com sucesso!`,
        details: `${missingDomains.length} novos domínios foram vinculados à organização.`,
        syncedDomains: missingDomains.map(d => d.Name),
        count: missingDomains.length
      },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error("Erro durante a sincronização de domínios:", error);
    return NextResponse.json(
      { 
        error: "Falha interna ao sincronizar domínios.", 
        details: error.message 
      }, 
      { status: 500, headers: corsHeaders }
    );
  }
}
