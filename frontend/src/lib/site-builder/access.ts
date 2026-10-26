import { notFound } from "next/navigation";
import { getRealUser } from "@/lib/auth";
import type { User } from "@/lib/db/schema";

export const FORBIDDEN_MESSAGE =
  "Recurso disponível apenas para administradores.";

/**
 * Por enquanto o Criador de Sites é exclusivo do admin. Este é o único ponto que decide isso:
 * para abrir o recurso a todos, troque a regra aqui (e o `adminOnly` do item em `navigation.ts`).
 * Usa o usuário REAL (como as demais telas de admin), então impersonar um cliente não muda o dono dos sites.
 */
export async function getBuilderUser(): Promise<User | null> {
  const user = await getRealUser();
  return user.isAdmin ? user : null;
}

/** Para páginas: quem não é admin vê 404, como se a rota não existisse. */
export async function requireBuilderUser(): Promise<User> {
  const user = await getBuilderUser();
  if (!user) notFound();
  return user;
}
