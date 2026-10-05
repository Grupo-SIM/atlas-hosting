import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getRealUser } from "@/lib/auth";
import { NamecheapOverview, ContaboOverview, SupplierSkeleton } from "./components";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const admin = await getRealUser();
  if (!admin.isAdmin) redirect("/home");
  return <div className="flex-1 space-y-6 p-4 md:p-8">
    <div><h1 className="font-bold text-3xl">Fornecedores</h1><p className="text-muted-foreground">Consulta da conta Namecheap e inventário Contabo. Atualize a página para consultar novamente.</p></div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Suspense fallback={<SupplierSkeleton title="Namecheap" />}><NamecheapOverview /></Suspense>
      <Suspense fallback={<SupplierSkeleton title="Contabo" inventory />}><ContaboOverview /></Suspense>
    </div>
  </div>;
}
