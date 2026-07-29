import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
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
import { type Plan, pgPlan } from "@/lib/db/schema"; // Ensured Plan type is imported

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

  if (!plan) {
    return notFound();
  }

  async function handleUpdatePlan(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number.parseFloat(formData.get("price") as string);
    const maxSites = Number.parseInt(formData.get("maxSites") as string, 10);
    const maxStorage = Number.parseFloat(formData.get("maxStorage") as string);
    const ssl = formData.get("ssl") === "on";
    const backup = formData.get("backup") === "on";
    const email = formData.get("email") === "on";
    const cdn = formData.get("cdn") === "on";
    const supportPriority = formData.get("supportPriority") === "on";
    const featured = formData.get("featured") === "on";

    const planUpdate: Partial<Omit<Plan, "id" | "createdAt" | "updatedAt">> = {
      backup,
      cdn,
      description,
      email,
      featured,
      maxSites,
      maxStorage,
      name,
      price,
      ssl,
      supportPriority,
    };

    await updatePlanAction(params.id, planUpdate); // Use imported server action

    revalidatePath("/admin/plans");
    revalidatePath(`/admin/plans/${params.id}/edit`);
    redirect("/admin/plans");
  }

  return (
    <div className="mx-auto max-w-xl py-10">
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
              <Label className="mb-1 block font-medium" htmlFor="name">
                Nome
              </Label>
              <Input
                defaultValue={plan.name}
                id="name"
                name="name"
                required={true}
              />
            </div>
            <div>
              <Label className="mb-1 block font-medium" htmlFor="description">
                Descrição
              </Label>
              <Input
                defaultValue={plan.description}
                id="description"
                name="description"
                required={true}
              />
            </div>
            <div>
              <Label className="mb-1 block font-medium" htmlFor="price">
                Preço (R$)
              </Label>
              <Input
                defaultValue={plan.price}
                id="price"
                name="price"
                required={true}
                step="0.01"
                type="number"
              />
            </div>
            <div>
              <Label className="mb-1 block font-medium" htmlFor="maxSites">
                Max. Sites
              </Label>
              <Input
                defaultValue={plan.maxSites}
                id="maxSites"
                name="maxSites"
                required={true}
                type="number"
              />
            </div>
            <div>
              <Label className="mb-1 block font-medium" htmlFor="maxStorage">
                Max. Armazenamento (GB)
              </Label>
              <Input
                defaultValue={plan.maxStorage}
                id="maxStorage"
                name="maxStorage"
                required={true}
                step="0.1"
                type="number"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                defaultChecked={plan.ssl ?? false}
                id="ssl"
                name="ssl"
              />
              <Label htmlFor="ssl">SSL Grátis</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                defaultChecked={plan.backup ?? false}
                id="backup"
                name="backup"
              />
              <Label htmlFor="backup">Backup</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                defaultChecked={plan.email ?? false}
                id="email"
                name="email"
              />
              <Label htmlFor="email">Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                defaultChecked={plan.cdn ?? false}
                id="cdn"
                name="cdn"
              />
              <Label htmlFor="cdn">CDN</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                defaultChecked={plan.supportPriority ?? false}
                id="supportPriority"
                name="supportPriority"
              />
              <Label htmlFor="supportPriority">Suporte Prioritário</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                defaultChecked={plan.featured ?? false}
                id="featured"
                name="featured"
              />
              <Label htmlFor="featured">Destacado</Label>
            </div>
            <Button className="w-full" type="submit">
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
