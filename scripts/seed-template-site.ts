import "./load-env.mjs";
import { getTemplate, listTemplates, siteSchema } from "@repo/site-builder";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgBuilderSite, pgUser } from "@/lib/db/schema";

/**
 * Cria no banco um site do Criador de Sites a partir de um template — o mesmo insert que a ação
 * `createSite` faz quando alguém clica em "Usar este template", mas direto, sem passar pela tela.
 * Só insere em `builder_sites`; não publica nada.
 *
 * Uso:
 *   bun run site:seed -- --template margem --email dono@exemplo.com
 *   bun run site:seed -- --template margem --email dono@exemplo.com --name "Meu estúdio" --apply
 *
 * Sem --apply, só mostra o que seria criado (nada é gravado).
 * Se o dono já tem um site com o mesmo nome e template, não cria outro.
 */
interface CliOptions {
  apply: boolean;
  email: string;
  name?: string;
  templateId: string;
}

function usage(): string {
  const ids = listTemplates()
    .map(t => t.id)
    .join(", ");
  return [
    "Uso:",
    "  bun run site:seed -- --template <id> --email <email do dono>",
    '  bun run site:seed -- --template <id> --email <email do dono> --name "Nome" --apply',
    "",
    `Templates: ${ids}`,
    "Sem --apply, apenas mostra o que seria criado.",
  ].join("\n");
}

function optionValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function parseOptions(args: string[]): CliOptions {
  if (args.includes("--help")) {
    console.log(usage());
    process.exit(0);
  }
  const templateId = optionValue(args, "--template");
  const email = optionValue(args, "--email");
  if (!(templateId && email)) {
    console.error(usage());
    process.exit(1);
  }
  return {
    apply: args.includes("--apply"),
    email: email.trim().toLowerCase(),
    name: optionValue(args, "--name")?.trim(),
    templateId,
  };
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));

  const template = getTemplate(options.templateId);
  if (!template) {
    console.error(`Template "${options.templateId}" não existe.\n\n${usage()}`);
    process.exit(1);
  }

  const name = options.name || template.name;
  if (name.length === 0 || name.length > 120) {
    console.error("O nome precisa ter de 1 a 120 caracteres.");
    process.exit(1);
  }

  const content = { ...template.site, name };
  const valid = siteSchema.safeParse(content);
  if (!valid.success) {
    console.error("O template não passa no siteSchema:", valid.error.issues);
    process.exit(1);
  }

  // Leitura: acha o dono. O Criador de Sites é só de admin (ver `lib/site-builder/access.ts`).
  const [owner] = await db
    .select({ id: pgUser.id, isAdmin: pgUser.isAdmin })
    .from(pgUser)
    .where(eq(pgUser.email, options.email))
    .limit(1);
  if (!owner) {
    console.error(`Nenhum usuário com o e-mail ${options.email}.`);
    process.exit(1);
  }

  const [existing] = await db
    .select({ id: pgBuilderSite.id })
    .from(pgBuilderSite)
    .where(
      and(
        eq(pgBuilderSite.userId, owner.id),
        eq(pgBuilderSite.templateId, template.id),
        eq(pgBuilderSite.name, name)
      )
    )
    .limit(1);

  const summary = {
    action: options.apply ? "apply" : "preview",
    alreadyExists: existing?.id ?? null,
    owner: {
      email: options.email,
      isAdmin: Boolean(owner.isAdmin),
      userId: owner.id,
    },
    pages: content.pages.length,
    posts: content.posts.length,
    site: { name, templateId: template.id },
  };
  console.log(JSON.stringify(summary, null, 2));

  if (!owner.isAdmin) {
    console.warn(
      "Aviso: este usuário não é admin, então ainda não consegue abrir o Criador de Sites."
    );
  }
  if (existing) {
    console.log("Já existe um site igual para este dono; nada a fazer.");
    return;
  }
  if (!options.apply) {
    console.log("Prévia apenas. Rode de novo com --apply para criar o site.");
    return;
  }

  const [created] = await db
    .insert(pgBuilderSite)
    .values({
      content,
      name,
      templateId: template.id,
      userId: owner.id,
    })
    .returning({ id: pgBuilderSite.id });
  console.log(
    `Site criado: ${created?.id} (abre em /criador-de-sites/${created?.id})`
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
