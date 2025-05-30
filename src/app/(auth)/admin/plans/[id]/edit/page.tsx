import { updatePlan as updatePlanAction } from "@/app/actions"; // Renamed import
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Added Label
import { db } from "@/lib/db";
import { pgPlan, type Plan } from "@/lib/db/schema"; // Ensured Plan type is imported
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

interface EditPlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPlanPage({
  params: _params,
}: EditPlanPageProps) {
  const params = await _params;

  const plan = await db.query.pgPlan.findFirst({
    where: eq(pgPlan.id, params.id),
  });

  if (!plan) { return notFound(); }

  async function handleUpdatePlan(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number.parseFloat(formData.get("price") as string);
    const maxSites = Number.parseInt(formData.get("maxSites") as string);
    const maxStorage = Number.parseFloat(formData.get("maxStorage") as string);
    const ssl = formData.get("ssl") === "on";
    const backup = formData.get("backup") === "on";
    const email = formData.get("email") === "on";
    const cdn = formData.get("cdn") === "on";
    const supportPriority = formData.get("supportPriority") === "on";
    const featured = formData.get("featured") === "on";

    const planUpdate: Partial<Omit<Plan, "id" | "createdAt" | "updatedAt">> = {
      name,
      description,
      price,
      maxSites,
      maxStorage,
      ssl,
      backup,
      email,
      cdn,
      supportPriority,
      featured,
    };

    await updatePlanAction(params.id, planUpdate); // Use imported server action

    revalidatePath("/admin/plans");
    revalidatePath(`/admin/plans/${params.id}/edit`);
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
          <form action={handleUpdatePlan} className="space-y-6">
            <div>
              <Label htmlFor="name" className="block mb-1 font-medium">
                Nome
              </Label>
              <Input id="name" name="name" defaultValue={plan.name} required={true} />
            </div>
            <div>
              <Label htmlFor="description" className="block mb-1 font-medium">
                Descrição
              </Label>
              <Input
                id="description"
                name="description"
                defaultValue={plan.description}
                required={true}
              />
            </div>
            <div>
              <Label htmlFor="price" className="block mb-1 font-medium">
                Preço (R$)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={plan.price}
                required={true}
              />
            </div>
            <div>
              <Label htmlFor="maxSites" className="block mb-1 font-medium">
                Max. Sites
              </Label>
              <Input
                id="maxSites"
                name="maxSites"
                type="number"
                defaultValue={plan.maxSites}
                required={true}
              />
            </div>
            <div>
              <Label htmlFor="maxStorage" className="block mb-1 font-medium">
                Max. Armazenamento (GB)
              </Label>
              <Input
                id="maxStorage"
                name="maxStorage"
                type="number"
                step="0.1"
                defaultValue={plan.maxStorage}
                required={true}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ssl"
                name="ssl"
                defaultChecked={plan.ssl ?? false}
              />
              <Label htmlFor="ssl">SSL Grátis</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="backup"
                name="backup"
                defaultChecked={plan.backup ?? false}
              />
              <Label htmlFor="backup">Backup</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email"
                name="email"
                defaultChecked={plan.email ?? false}
              />
              <Label htmlFor="email">Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cdn"
                name="cdn"
                defaultChecked={plan.cdn ?? false}
              />
              <Label htmlFor="cdn">CDN</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="supportPriority"
                name="supportPriority"
                defaultChecked={plan.supportPriority ?? false}
              />
              <Label htmlFor="supportPriority">Suporte Prioritário</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                name="featured"
                defaultChecked={plan.featured ?? false}
              />
              <Label htmlFor="featured">Destacado</Label>
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
