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
import { type Plan } from "@/lib/db/schema"; // Added Plan type
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default function NewPlanPage() {
  async function handleCreatePlan(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const maxSites = parseInt(formData.get("maxSites") as string);
    const maxStorage = parseFloat(formData.get("maxStorage") as string);
    const ssl = formData.get("ssl") === "on";
    const backup = formData.get("backup") === "on";
    const email = formData.get("email") === "on";
    const cdn = formData.get("cdn") === "on";
    const supportPriority = formData.get("supportPriority") === "on";
    const featured = formData.get("featured") === "on";

    // Construct the input object matching the server action's expected type
    const planInput: Omit<Plan, "id" | "createdAt" | "updatedAt"> = {
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

    await createPlanAction(undefined, planInput); // Pass undefined as prevState

    revalidatePath("/admin/plans");
    redirect("/admin/plans");
  }

  return (
    <div className="max-w-xl mx-auto py-10">
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
              <Label htmlFor="name" className="block mb-1 font-medium">
                Nome
              </Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="description" className="block mb-1 font-medium">
                Descrição
              </Label>
              <Input id="description" name="description" required />
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
                required
              />
            </div>
            <div>
              <Label htmlFor="maxSites" className="block mb-1 font-medium">
                Max. Sites
              </Label>
              <Input id="maxSites" name="maxSites" type="number" required />
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
                required
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
            <Button type="submit" className="w-full">
              Criar Plano
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
