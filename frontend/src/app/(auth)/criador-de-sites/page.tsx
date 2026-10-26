import { listTemplates } from "@repo/site-builder";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { pgBuilderSite } from "@/lib/db/schema";
import { requireBuilderUser } from "@/lib/site-builder/access";
import { createSiteFromTemplate, deleteSite } from "./actions";

export const metadata: Metadata = {
  description: "Crie seu site a partir de um template pronto",
  title: "Criador de Sites - Atlas Hosting",
};

export default async function SiteBuilderPage() {
  const user = await requireBuilderUser();
  const templates = listTemplates();
  const mySites = await db
    .select({
      id: pgBuilderSite.id,
      name: pgBuilderSite.name,
      updatedAt: pgBuilderSite.updatedAt,
    })
    .from(pgBuilderSite)
    .where(eq(pgBuilderSite.userId, user.id))
    .orderBy(desc(pgBuilderSite.updatedAt));

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
          Criador de Sites
        </h1>
        <p className="mt-1 text-muted-foreground">
          Escolha um template, veja a prévia e personalize do seu jeito.
        </p>
      </div>

      {mySites.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">Meus sites</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mySites.map(site => (
              <Card key={site.id}>
                <CardHeader>
                  <CardTitle>{site.name}</CardTitle>
                  <CardDescription>
                    Editado em{" "}
                    {format(site.updatedAt, "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="gap-2">
                  <Button asChild>
                    <Link href={`/criador-de-sites/${site.id}`}>Abrir</Link>
                  </Button>
                  <form action={deleteSite}>
                    <input name="siteId" type="hidden" value={site.id} />
                    <Button type="submit" variant="outline">
                      Excluir
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Templates</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => (
            <Card className="overflow-hidden" key={template.id}>
              <div className="flex h-40 items-center justify-center bg-[#030712]">
                <img
                  alt={template.name}
                  className="max-h-24 object-contain"
                  src={template.preview}
                />
              </div>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardFooter className="gap-2">
                <Button asChild variant="outline">
                  <Link href={`/criador-de-sites/preview/${template.id}`}>
                    Ver prévia
                  </Link>
                </Button>
                <form action={createSiteFromTemplate}>
                  <input name="templateId" type="hidden" value={template.id} />
                  <Button type="submit">Usar template</Button>
                </form>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
