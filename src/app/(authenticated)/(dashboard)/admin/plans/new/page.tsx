import { db } from "@/lib/db";
import { plansTable } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

export default function NewPlanPage() {
  async function createPlan(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);

    await db.insert(plansTable).values({ name, description, price });

    revalidatePath("/admin/plans");
    redirect("/admin/plans");
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Novo Plano</CardTitle>
          <CardDescription>Preencha as informações para criar um novo plano.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createPlan} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium">Nome</label>
              <Input name="name" required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Descrição</label>
              <Input name="description" required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Preço (R$)</label>
              <Input name="price" type="number" step="0.01" required />
            </div>
            <div>
              <label className="block mb-1 font-medium">ID Plesk</label>
              <Input name="pleskPlanId" type="number" required />
            </div>
            <Button type="submit" className="w-full">Criar Plano</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 