import type { User } from "@/lib/db/schema";

/** Admin master (Lucas): único que libera a edição de templates para outras pessoas. */
export const MASTER_ADMIN_EMAIL = "contatosimintermediacoes@gmail.com";

/** Precisa ser admin **e** ter este e-mail: perder um dos dois tira os poderes de master. */
export function isMasterAdmin(user: Pick<User, "email" | "isAdmin">): boolean {
  return (
    user.isAdmin === true &&
    user.email.trim().toLowerCase() === MASTER_ADMIN_EMAIL
  );
}
