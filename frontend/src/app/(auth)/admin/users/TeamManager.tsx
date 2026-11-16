"use client";

import {
  Eye,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  type AccessProfile,
  AREA_GROUPS,
  type AreaLevel,
  covers,
  GRANTABLE_AREAS,
  isMasterOnlyArea,
  type Level,
  OUTSIDE_ALL_AREAS,
  PROFILE_LABELS,
} from "@/lib/permissions/catalog";
import {
  createTeamUserAction,
  removeTeamUserAction,
  type TeamUserRow,
  updateTeamUserAction,
} from "./team-actions";

const PROFILE_INFO: Record<
  AccessProfile,
  { description: string; icon: typeof Eye }
> = {
  admin: {
    description:
      "Cadastra pessoas, define o acesso de cada uma e usa todas as áreas.",
    icon: ShieldCheck,
  },
  editor: {
    description: "Em cada área liberada, só visualiza ou também altera.",
    icon: Pencil,
  },
  viewer: {
    description: "Só consulta as áreas liberadas. Não altera nada.",
    icon: Eye,
  },
};

type Selected = Record<string, AreaLevel | undefined>;

function randomPassword(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(bytes, n => alphabet[n % alphabet.length]).join("");
}

function summary(row: TeamUserRow): string {
  const templates = row.permissions.some(p => p.area === "admin_templates")
    ? " + Editar templates"
    : "";
  if (row.profile === "admin") {
    return `Todas as áreas, inclusive Usuários${templates}`;
  }
  const n = row.permissions.length;
  if (row.accessAll) {
    const extra = row.permissions.some(p => p.area === OUTSIDE_ALL_AREAS)
      ? " + Usuários"
      : "";
    return `Todas as áreas (${row.accessAll === "edit" ? "edita" : "visualiza"})${extra}${templates}`;
  }
  return `${n} ${n === 1 ? "área" : "áreas"}`;
}

function TeamUserDialog({
  levels,
  onOpenChange,
  open,
  user,
}: {
  levels: Record<string, Level>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  /** Ausente = criar. */
  user?: TeamUserRow;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const editing = Boolean(user);

  const initialSelected = (): Selected => {
    const out: Selected = {};
    for (const p of user?.permissions ?? []) out[p.area] = p.level;
    return out;
  };
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<AccessProfile>(
    user?.profile ?? "viewer"
  );
  const [all, setAll] = useState(Boolean(user?.accessAll));
  const [selected, setSelected] = useState<Selected>(initialSelected);

  const actorCovers = (area: string, needed: AreaLevel) =>
    covers(levels[area] ?? "none", needed);
  // Administrador = todas as áreas, menos as que só o master libera (Editar templates).
  const canAdminProfile = GRANTABLE_AREAS.filter(
    a => !isMasterOnlyArea(a.key)
  ).every(a => actorCovers(a.key, "edit"));
  const profileLevel: AreaLevel = profile === "editor" ? "edit" : "view";
  const canAll = GRANTABLE_AREAS.filter(
    a => a.key !== OUTSIDE_ALL_AREAS && !isMasterOnlyArea(a.key)
  ).every(a => actorCovers(a.key, profileLevel));

  /** O que a pessoa tem em cada área, já aplicando perfil e "todas as áreas". */
  const effective = useMemo(() => {
    const out: Selected = {};
    for (const a of GRANTABLE_AREAS) {
      const masterOnly = isMasterOnlyArea(a.key);
      if (profile === "admin" && !masterOnly) out[a.key] = "edit";
      else if (all && a.key !== OUTSIDE_ALL_AREAS && !masterOnly)
        out[a.key] = profileLevel;
      else
        out[a.key] = masterOnly && selected[a.key] ? "edit" : selected[a.key];
    }
    return out;
  }, [profile, all, selected, profileLevel]);

  const locked = (areaKey: string) =>
    !isMasterOnlyArea(areaKey) &&
    (profile === "admin" || (all && areaKey !== OUTSIDE_ALL_AREAS));

  const setArea = (key: string, level: AreaLevel | undefined) =>
    setSelected(s => ({ ...s, [key]: level }));

  // O que só o master libera (editar templates) é "edita" ou nada: não existe só visualizar.
  const toggleArea = (key: string, on: boolean) =>
    setArea(key, on ? (isMasterOnlyArea(key) ? "edit" : "view") : undefined);

  const toggleGroup = (keys: string[], on: boolean) =>
    setSelected(s => {
      const next = { ...s };
      for (const k of keys) {
        if (!actorCovers(k, "view")) continue;
        next[k] = on
          ? (next[k] ?? (isMasterOnlyArea(k) ? "edit" : "view"))
          : undefined;
      }
      return next;
    });

  const changeProfile = (next: AccessProfile) => {
    setProfile(next);
    if (next === "viewer") {
      setSelected(s =>
        Object.fromEntries(
          // Visualizador não altera nada: editar templates não cabe nele.
          Object.entries(s).map(([k, v]) => [
            k,
            v && !isMasterOnlyArea(k) ? ("view" as const) : undefined,
          ])
        )
      );
    }
    if (next === "admin") setAll(false);
  };

  const submit = () => {
    const permissions = GRANTABLE_AREAS.flatMap(a => {
      const masterOnly = isMasterOnlyArea(a.key);
      // Administrador e "todas as áreas" já cobrem o resto; o que só o master libera vai sempre explícito.
      if (profile === "admin" && !masterOnly) return [];
      if (all && a.key !== OUTSIDE_ALL_AREAS && !masterOnly) return [];
      const level = selected[a.key];
      return level ? [{ area: a.key, level }] : [];
    });
    startTransition(async () => {
      const input = {
        accessAll: profile !== "admin" && all ? profileLevel : null,
        email,
        name,
        password,
        permissions,
        profile,
      };
      const result = user
        ? await updateTeamUserAction(user.id, input)
        : await createTeamUserAction(input);
      if (result.ok) {
        toast.success(editing ? "Acessos atualizados" : "Usuário criado");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar usuário e acessos" : "Novo usuário"}
          </DialogTitle>
          <DialogDescription>
            O que a pessoa pode fazer e em quais áreas ela entra. Ninguém recebe
            mais acesso do que você tem.
          </DialogDescription>
        </DialogHeader>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="team-name">Nome</Label>
            <Input
              id="team-name"
              onChange={e => setName(e.target.value)}
              value={name}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team-email">E-mail</Label>
            <Input
              disabled={editing}
              id="team-email"
              onChange={e => setEmail(e.target.value)}
              type="email"
              value={email}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="team-password">
              {editing ? "Nova senha (vazio mantém a atual)" : "Senha"}
            </Label>
            <div className="flex gap-2">
              <Input
                autoComplete="new-password"
                id="team-password"
                onChange={e => setPassword(e.target.value)}
                value={password}
              />
              <Button
                onClick={() => setPassword(randomPassword())}
                type="button"
                variant="outline"
              >
                Gerar
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Você passa a senha para a pessoa. Ela entra com o e-mail acima,
              sem precisar verificar o e-mail.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <div>
            <h3 className="font-medium text-sm">Perfil</h3>
            <p className="text-muted-foreground text-xs">
              O que a pessoa pode fazer.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {(["viewer", "editor", "admin"] as AccessProfile[]).map(p => {
              const Icon = PROFILE_INFO[p].icon;
              const on = profile === p;
              const disabled = p === "admin" && !canAdminProfile;
              return (
                <button
                  aria-pressed={on}
                  className={`rounded-lg border p-3 text-left transition ${
                    on
                      ? "border-primary bg-primary/5"
                      : "hover:border-foreground/30"
                  } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                  disabled={disabled}
                  key={p}
                  onClick={() => changeProfile(p)}
                  type="button"
                >
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <Icon className="size-4" />
                    {PROFILE_LABELS[p]}
                  </div>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {PROFILE_INFO[p].description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <h3 className="font-medium text-sm">Áreas</h3>
            <p className="text-muted-foreground text-xs">
              Área desmarcada: a pessoa não vê. Marcada: ela visualiza
              {profile === "editor" ? " ou edita, conforme a chave" : ""}.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="font-medium text-sm">Todas as áreas</div>
              <p className="text-muted-foreground text-xs">
                {profile === "editor" ? "Edita" : "Visualiza"} todas, inclusive
                as que forem criadas depois. Usuários fica de fora e se libera à
                parte.
              </p>
            </div>
            <Switch
              checked={profile !== "admin" && all}
              disabled={profile === "admin" || !canAll}
              onCheckedChange={setAll}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {AREA_GROUPS.map(group => {
              const keys = group.areas.filter(a => a.available).map(a => a.key);
              const marked = keys.filter(k => effective[k]).length;
              const groupLocked = keys.length === 0 || keys.every(locked);
              return (
                <div className="rounded-lg border" key={group.key}>
                  <div className="flex items-center gap-2 border-b px-3 py-2">
                    <Checkbox
                      checked={keys.length > 0 && marked === keys.length}
                      disabled={groupLocked}
                      onCheckedChange={v => toggleGroup(keys, v === true)}
                    />
                    <span className="font-medium text-sm">{group.label}</span>
                    {keys.length > 0 && (
                      <span className="ml-auto text-muted-foreground text-xs">
                        {marked}/{keys.length}
                      </span>
                    )}
                  </div>
                  <ul className="divide-y">
                    {group.areas.map(area => {
                      const level = effective[area.key];
                      const blocked =
                        !area.available ||
                        !actorCovers(area.key, "view") ||
                        (profile === "viewer" && isMasterOnlyArea(area.key));
                      return (
                        <li
                          className={`flex items-start gap-2 px-3 py-2 ${blocked ? "opacity-50" : ""}`}
                          key={area.key}
                        >
                          <Checkbox
                            checked={Boolean(level)}
                            className="mt-0.5"
                            disabled={blocked || locked(area.key)}
                            onCheckedChange={v =>
                              toggleArea(area.key, v === true)
                            }
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-sm">
                              {area.label}
                              {area.sensitive && (
                                <TriangleAlert
                                  aria-label="Pede cuidado"
                                  className="size-3.5 text-amber-500"
                                />
                              )}
                              {!area.available && (
                                <Badge variant="secondary">em breve</Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {area.description}
                            </p>
                          </div>
                          {area.available && level && (
                            <div className="flex shrink-0 items-center gap-2 text-xs">
                              <span className="text-muted-foreground">
                                {level === "edit" ? "Edita" : "Visualiza"}
                              </span>
                              {profile === "editor" &&
                                !isMasterOnlyArea(area.key) && (
                                  <Switch
                                    checked={level === "edit"}
                                    disabled={
                                      locked(area.key) ||
                                      !actorCovers(area.key, "edit")
                                    }
                                    onCheckedChange={v =>
                                      setArea(area.key, v ? "edit" : "view")
                                    }
                                  />
                                )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <DialogFooter>
          <Button
            disabled={pending}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button disabled={pending} onClick={submit}>
            {pending ? "Salvando…" : editing ? "Salvar" : "Criar usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Lista da equipe com criar, editar e remover. `levels` é o acesso de quem está logado (o teto do que pode conceder). */
export function TeamManager({
  levels,
  rows,
}: {
  levels: Record<string, Level>;
  rows: TeamUserRow[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TeamUserRow | null>(null);
  const [removing, setRemoving] = useState<TeamUserRow | null>(null);
  const [pending, startTransition] = useTransition();

  const remove = () => {
    const target = removing;
    if (!target) return;
    startTransition(async () => {
      const result = await removeTeamUserAction(target.id);
      if (result.ok) {
        toast.success("Acesso removido");
        setRemoving(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-lg">
            <Shield className="size-4" />
            Equipe e acessos
          </h3>
          <p className="text-muted-foreground text-sm">
            Crie usuários com acesso a áreas específicas da administração:
            visualizar, editar ou administrar.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <UserPlus className="mr-2 size-4" />
          Novo usuário
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed p-6 text-center text-muted-foreground text-sm">
          <Plus className="mx-auto mb-2 size-4" />
          Nenhum usuário de equipe ainda.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {rows.map(row => (
            <li
              className="flex flex-wrap items-center gap-3 px-3 py-2.5"
              key={row.id}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-medium text-sm">
                  {row.name}
                  {row.suspended && (
                    <Badge variant="destructive">suspenso</Badge>
                  )}
                </div>
                <div className="truncate text-muted-foreground text-xs">
                  {row.email}
                  {row.parentName ? ` · criado por ${row.parentName}` : ""}
                </div>
              </div>
              <Badge variant="secondary">{PROFILE_LABELS[row.profile]}</Badge>
              <span className="text-muted-foreground text-xs">
                {summary(row)}
              </span>
              <div className="flex gap-1">
                <Button
                  aria-label={`Editar ${row.name}`}
                  onClick={() => setEditing(row)}
                  size="icon"
                  variant="ghost"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  aria-label={`Remover ${row.name}`}
                  onClick={() => setRemoving(row)}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {creating && (
        <TeamUserDialog
          levels={levels}
          onOpenChange={o => !o && setCreating(false)}
          open
        />
      )}
      {editing && (
        <TeamUserDialog
          key={editing.id}
          levels={levels}
          onOpenChange={o => !o && setEditing(null)}
          open
          user={editing}
        />
      )}
      <AlertDialog
        onOpenChange={o => !o && setRemoving(null)}
        open={Boolean(removing)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover {removing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              A pessoa perde o acesso na hora (as sessões abertas caem e a senha
              é apagada). O histórico da conta fica guardado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={pending} onClick={remove}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
