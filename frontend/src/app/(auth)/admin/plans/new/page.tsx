import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPlan as createPlanAction } from "@/app/actions"; // Renamed import to avoid conflict
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox import
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Added Label import
import type { Plan } from "@/lib/db/schema"; // Added Plan type

export default function NewPlanPage() {
  async function handleCreatePlan(formData: FormData) {
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

    // Construct the input object matching the server action's expected type
    const planInput: Omit<Plan, "id" | "createdAt" | "updatedAt"> = {
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

    await createPlanAction(undefined, planInput); // Pass undefined as prevState

    revalidatePath("/admin/plans");
    redirect("/admin/plans");
  }

  return (
    <div className="mx-auto max-w-xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Novo Plano</CardTitle>
          <CardDescription>
            Preencha as informações para criar um novo plano.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCreatePlan} className="space-y-6">
            <div>
              <Label className="mb-1 block font-medium" htmlFor="name">
                Nome
              </Label>
              <Input id="name" name="name" required={true} />
            </div>
            <div>
              <Label className="mb-1 block font-medium" htmlFor="description">
                Descrição
              </Label>
              <Input id="description" name="description" required={true} />
            </div>
            <div>
              <Label className="mb-1 block font-medium" htmlFor="price">
                Preço (R$)
              </Label>
              <Input
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
                id="maxStorage"
                name="maxStorage"
                required={true}
                step="0.1"
                type="number"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="ssl" name="ssl" />
              <Label htmlFor="ssl">SSL Grátis</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="backup" name="backup" />
              <Label htmlFor="backup">Backup</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="email" name="email" />
              <Label htmlFor="email">Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cdn" name="cdn" />
              <Label htmlFor="cdn">CDN</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="supportPriority" name="supportPriority" />
              <Label htmlFor="supportPriority">Suporte Prioritário</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="featured" name="featured" />
              <Label htmlFor="featured">Destacado</Label>
            </div>
            <Button className="w-full" type="submit">
              Criar Plano
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
