import { db } from "@/lib/db";
import { plansTable, Plan } from "@/lib/db/schema";
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

interface EditPlanPageProps {
  params: { id: string };
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const plan = await db.query.plansTable.findFirst({
    where: eq(plansTable.id, params.id),
  });

  if (!plan) return notFound();

  async function updatePlan(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);

    await db
      .update(plansTable)
      .set({ name, description, price })
      .where(eq(plansTable.id, params.id));

    revalidatePath("/admin/plans");
    redirect("/admin/plans");
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Editar Plano</CardTitle>
          <CardDescription>
            Atualize as informações do plano abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePlan} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium">Nome</label>
              <Input name="name" defaultValue={plan.name} required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Descrição</label>
              <Input
                name="description"
                defaultValue={plan.description}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Preço (R$)</label>
              <Input
                name="price"
                type="number"
                step="0.01"
                defaultValue={plan.price}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
