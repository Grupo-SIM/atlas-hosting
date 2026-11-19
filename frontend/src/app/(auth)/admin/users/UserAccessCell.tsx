"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AREA_GROUPS,
  isMasterOnlyArea,
  type Level,
} from "@/lib/permissions/catalog";
import { isMasterAdmin } from "@/lib/permissions/master";
import type { AccessUser } from "./access-label";
import { TeamUserDialog } from "./TeamManager";
import type { TeamUserRow } from "./team-actions";

/** O que a tela precisa saber de quem está logado e da equipe para mostrar e editar o acesso de cada usuário. */
export interface AccessContext {
  /** Pode dar acesso a contas que já existem (o master, e os admins que ele liberou). */
  canExisting: boolean;
  levels: Record<string, Level>;
  master: boolean;
  /** Equipe visível para quem está logado, por id. */
  rows: TeamUserRow[];
}

/** Administrador completo: tem todas as áreas, e isso não se limita aqui. Mostra o que ele acessa. */
function AdminInfoDialog({
  onOpenChange,
  user,
}: {
  onOpenChange: (open: boolean) => void;
  user: AccessUser;
}) {
  const master = isMasterAdmin({ email: user.email, isAdmin: true });
  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Acessos de {user.name}</DialogTitle>
          <DialogDescription>
            {master
              ? "Administrador master: tem todas as áreas e é o único que libera Editar templates e Usuários já cadastrados."
              : "Administrador completo: edita todas as áreas, menos as que só o master libera."}{" "}
            O acesso de administrador completo não se limita por aqui. Para dar
            acessos limitados, use uma conta de equipe.
          </DialogDescription>
        </DialogHeader>
        <ul className="divide-y rounded-md border text-sm">
          {AREA_GROUPS.flatMap(g => g.areas)
            .filter(a => a.available)
            .map(a => {
              const has = master || !isMasterOnlyArea(a.key);
              return (
                <li
                  className="flex items-center justify-between gap-3 px-3 py-2"
                  key={a.key}
                >
                  <span>{a.label}</span>
                  <Badge variant={has ? "default" : "outline"}>
                    {has ? "Edita" : "Só o master"}
                  </Badge>
                </li>
              );
            })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Lápis de acesso de uma linha da tabela de usuários: abre a janela com as permissões. Usuário de equipe: edita as
 * áreas; conta que já existe: dá acesso (quem pode); administrador completo: mostra o que ele tem.
 */
export function UserAccessButton({
  access,
  row,
  user,
}: {
  access: AccessContext;
  row?: TeamUserRow;
  user: AccessUser;
}) {
  const [open, setOpen] = useState(false);
  // Conta comum sem a permissão de mexer em contas existentes: não há o que abrir.
  if (!(row || user.isAdmin || access.canExisting)) return null;
  return (
    <>
      <Button
        aria-label={`Permissões de ${user.name}`}
        onClick={() => setOpen(true)}
        size="icon"
        title="Ver e editar as permissões"
        variant="ghost"
      >
        <Pencil className="size-4" />
      </Button>
      {open && row ? (
        <TeamUserDialog
          key={row.id}
          levels={access.levels}
          master={access.master}
          onOpenChange={o => !o && setOpen(false)}
          open
          user={row}
        />
      ) : null}
      {open && !row && user.isAdmin ? (
        <AdminInfoDialog onOpenChange={o => !o && setOpen(false)} user={user} />
      ) : null}
      {open && !row && !user.isAdmin ? (
        <TeamUserDialog
          key={user.id}
          levels={access.levels}
          master={access.master}
          onOpenChange={o => !o && setOpen(false)}
          open
          target={{ email: user.email, id: user.id, name: user.name }}
        />
      ) : null}
    </>
  );
}
