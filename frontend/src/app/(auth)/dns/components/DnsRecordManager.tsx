"use client";

import {
  Cloud,
  Copy,
  Download,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CloudflareDnsRecord,
  CloudflareDnsRecordType,
} from "@/lib/server/apis/cloudflare";
import {
  addCloudflareDnsRecordAction,
  type DnsActionResult,
  deleteCloudflareDnsRecordAction,
  importCloudflareZoneFileAction,
  updateCloudflareDnsRecordAction,
} from "../cloudflare-actions";
import { editableCloudflareRecordTypes } from "../cloudflare-record-input";

const typeDescriptions: Partial<Record<CloudflareDnsRecordType, string>> = {
  A: "Endereço IPv4",
  AAAA: "Endereço IPv6",
  CAA: "Autoridades certificadoras permitidas",
  CNAME: "Alias para outro hostname",
  HTTPS: "Parâmetros de conexão HTTPS",
  MX: "Servidor de e-mail",
  NS: "Delegação de subdomínio",
  SRV: "Localização de serviço",
  SVCB: "Parâmetros de conexão de serviço",
  TLSA: "Associação de certificado TLS",
  TXT: "Texto, políticas e verificações",
};

const ttlOptions = [
  { label: "Automático", value: "1" },
  { label: "1 minuto", value: "60" },
  { label: "5 minutos", value: "300" },
  { label: "30 minutos", value: "1800" },
  { label: "1 hora", value: "3600" },
  { label: "4 horas", value: "14400" },
  { label: "24 horas", value: "86400" },
];

export function DnsRecordsManager({
  domainId,
  domainName,
  initialRecords,
  readOnly = false,
}: {
  domainId: string;
  domainName: string;
  initialRecords: CloudflareDnsRecord[];
  readOnly?: boolean;
}) {
  const formId = useId();
  const router = useRouter();
  const [records, setRecords] = useState(initialRecords);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editing, setEditing] = useState<CloudflareDnsRecord | null>(null);
  const [deleting, setDeleting] = useState<CloudflareDnsRecord | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [recordType, setRecordType] = useState<CloudflareDnsRecordType>("A");
  const [host, setHost] = useState("@");
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("1");
  const [priority, setPriority] = useState("10");
  const [proxied, setProxied] = useState(false);
  const [comment, setComment] = useState("");
  const [srvWeight, setSrvWeight] = useState("5");
  const [srvPort, setSrvPort] = useState("443");
  const [caaFlags, setCaaFlags] = useState("0");
  const [caaTag, setCaaTag] = useState("issue");

  const [addState, addAction, adding] = useActionState(
    addCloudflareDnsRecordAction,
    null
  );
  const [updateState, updateAction, updating] = useActionState(
    updateCloudflareDnsRecordAction,
    null
  );
  const [deleteState, deleteAction, deletingRecord] = useActionState(
    deleteCloudflareDnsRecordAction,
    null
  );
  const [importState, importAction, importing] = useActionState(
    importCloudflareZoneFileAction,
    null
  );

  useEffect(() => setRecords(initialRecords), [initialRecords]);
  const handleResult = useCallback(
    (state: DnsActionResult | null, close: () => void) => {
      if (!state) return;
      if (state.success) {
        toast.success(state.message);
        close();
        router.refresh();
      } else toast.error(state.message);
    },
    [router]
  );
  useEffect(
    () => handleResult(addState, () => setEditorOpen(false)),
    [addState, handleResult]
  );
  useEffect(
    () => handleResult(updateState, () => setEditorOpen(false)),
    [handleResult, updateState]
  );
  useEffect(
    () => handleResult(deleteState, () => setDeleting(null)),
    [deleteState, handleResult]
  );
  useEffect(
    () => handleResult(importState, () => setImportOpen(false)),
    [handleResult, importState]
  );

  const openAdd = () => {
    setEditing(null);
    setRecordType("A");
    setHost("@");
    setContent("");
    setTtl("1");
    setPriority("10");
    setProxied(false);
    setComment("");
    setEditorOpen(true);
  };
  const openEdit = (record: CloudflareDnsRecord) => {
    setEditing(record);
    setRecordType(record.type);
    setHost(
      record.name === domainName
        ? "@"
        : record.name.replace(`.${domainName}`, "")
    );
    setContent(record.data?.target || record.data?.value || record.content);
    setTtl(String(record.ttl));
    setPriority(String(record.priority ?? record.data?.priority ?? 10));
    setProxied(Boolean(record.proxied));
    setComment(record.comment || "");
    setSrvWeight(String(record.data?.weight ?? 5));
    setSrvPort(String(record.data?.port ?? 443));
    setCaaFlags(String(record.data?.flags ?? 0));
    setCaaTag(record.data?.tag || "issue");
    setEditorOpen(true);
  };

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return records
      .filter(
        record =>
          (typeFilter === "all" || record.type === typeFilter) &&
          (!needle ||
            record.name.toLowerCase().includes(needle) ||
            record.content.toLowerCase().includes(needle) ||
            record.type.toLowerCase().includes(needle))
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
      );
  }, [query, records, typeFilter]);
  const canProxy = ["A", "AAAA", "CNAME"].includes(recordType);
  const editable = (record: CloudflareDnsRecord) =>
    (editableCloudflareRecordTypes as readonly string[]).includes(record.type);

  return (
    <>
      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Registros DNS</CardTitle>
            <CardDescription>
              DNS gerenciado pelo Atlas para {domainName}. TTL 1 significa
              automático.
            </CardDescription>
          </div>
          {!readOnly && (
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <a href={`/api/domains/${domainId}/dns/export`}>
                  <Download className="mr-2 h-4 w-4" /> Exportar
                </a>
              </Button>
              <Button onClick={() => setImportOpen(true)} variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Importar
              </Button>
              <Button onClick={openAdd}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar registro
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={event => setQuery(event.target.value)}
                placeholder="Buscar por nome, tipo ou conteúdo"
                value={query}
              />
            </div>
            <Select onValueChange={setTypeFilter} value={typeFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {[...new Set(records.map(record => record.type))]
                  .sort()
                  .map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead>Proxy</TableHead>
                  <TableHead>TTL</TableHead>
                  {!readOnly && (
                    <TableHead className="text-right">Ações</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(record => (
                  <TableRow key={record.id}>
                    <TableCell className="min-w-48 font-medium">
                      <span>{record.name}</span>
                      <Button
                        className="ml-1 h-7 w-7"
                        onClick={() =>
                          navigator.clipboard.writeText(record.name)
                        }
                        size="icon"
                        variant="ghost"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md break-all">
                      {record.content}
                    </TableCell>
                    <TableCell>
                      {record.proxiable ? (
                        <Badge
                          variant={record.proxied ? "default" : "secondary"}
                        >
                          <Cloud className="mr-1 h-3 w-3" />
                          {record.proxied ? "Com proxy" : "Somente DNS"}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {record.ttl === 1 ? "Auto" : `${record.ttl}s`}
                    </TableCell>
                    {!readOnly && (
                      <TableCell className="text-right">
                        <Button
                          disabled={!editable(record)}
                          onClick={() => openEdit(record)}
                          size="icon"
                          variant="ghost"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          className="text-destructive"
                          onClick={() => setDeleting(record)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell className="h-24 text-center" colSpan={6}>
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-muted-foreground text-xs">
            {filtered.length} de {records.length} registros exibidos. Tipos
            complexos importados permanecem visíveis mesmo quando não são
            editáveis neste formulário.
          </p>
        </CardContent>
      </Card>

      <Dialog onOpenChange={setEditorOpen} open={editorOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar registro DNS" : "Adicionar registro DNS"}
            </DialogTitle>
            <DialogDescription>
              As alterações são aplicadas diretamente ao DNS do Atlas.
            </DialogDescription>
          </DialogHeader>
          <form
            action={editing ? updateAction : addAction}
            className="space-y-4"
          >
            <input name="domainId" type="hidden" value={domainId} />
            {editing && (
              <input name="recordId" type="hidden" value={editing.id} />
            )}
            <div className="space-y-2">
              <Label htmlFor={`${formId}-type`}>Tipo</Label>
              <Select
                name="recordType"
                onValueChange={value =>
                  setRecordType(value as CloudflareDnsRecordType)
                }
                value={recordType}
              >
                <SelectTrigger id={`${formId}-type`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {editableCloudflareRecordTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type} — {typeDescriptions[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-host`}>Nome</Label>
              <Input
                id={`${formId}-host`}
                name="hostName"
                onChange={event => setHost(event.target.value)}
                value={host}
              />
              <p className="text-muted-foreground text-xs">
                Use @ para {domainName} ou informe apenas o subdomínio.
              </p>
            </div>
            {(recordType === "MX" || recordType === "SRV") && (
              <div className="space-y-2">
                <Label htmlFor={`${formId}-priority`}>Prioridade</Label>
                <Input
                  id={`${formId}-priority`}
                  name="priority"
                  onChange={event => setPriority(event.target.value)}
                  type="number"
                  value={priority}
                />
              </div>
            )}
            {recordType === "SRV" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Peso</Label>
                  <Input
                    name="srvWeight"
                    onChange={event => setSrvWeight(event.target.value)}
                    type="number"
                    value={srvWeight}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Porta</Label>
                  <Input
                    name="srvPort"
                    onChange={event => setSrvPort(event.target.value)}
                    type="number"
                    value={srvPort}
                  />
                </div>
              </div>
            )}
            {recordType === "CAA" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Flags</Label>
                  <Input
                    name="caaFlags"
                    onChange={event => setCaaFlags(event.target.value)}
                    type="number"
                    value={caaFlags}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tag</Label>
                  <Select
                    name="caaTag"
                    onValueChange={setCaaTag}
                    value={caaTag}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="issue">issue</SelectItem>
                      <SelectItem value="issuewild">issuewild</SelectItem>
                      <SelectItem value="iodef">iodef</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={`${formId}-content`}>
                {recordType === "SRV"
                  ? "Destino"
                  : recordType === "CAA"
                    ? "Valor"
                    : "Conteúdo"}
              </Label>
              <Input
                id={`${formId}-content`}
                name="content"
                onChange={event => setContent(event.target.value)}
                value={content}
              />
            </div>
            <div className="space-y-2">
              <Label>TTL</Label>
              <Select name="ttl" onValueChange={setTtl} value={ttl}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ttlOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {canProxy && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor={`${formId}-proxied`}>Proxy do Atlas</Label>
                  <p className="text-muted-foreground text-xs">
                    Desativado por padrão para evitar mudanças de tráfego.
                  </p>
                </div>
                <Switch
                  checked={proxied}
                  id={`${formId}-proxied`}
                  onCheckedChange={setProxied}
                />
                <input
                  name="proxied"
                  type="hidden"
                  value={proxied ? "on" : ""}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Comentário</Label>
              <Input
                name="comment"
                onChange={event => setComment(event.target.value)}
                value={comment}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button disabled={adding || updating} type="submit">
                {adding || updating ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setImportOpen} open={importOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar arquivo de zona</DialogTitle>
            <DialogDescription>
              Envie um arquivo BIND de até 256 KiB. Registros existentes não são
              removidos automaticamente.
            </DialogDescription>
          </DialogHeader>
          <form action={importAction} className="space-y-4">
            <input name="domainId" type="hidden" value={domainId} />
            <Input
              accept=".txt,.zone,text/plain"
              name="file"
              required
              type="file"
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button disabled={importing} type="submit">
                {importing ? "Importando..." : "Importar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={open => !open && setDeleting(null)}
        open={Boolean(deleting)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro DNS?</AlertDialogTitle>
            <AlertDialogDescription>
              O registro {deleting?.type} de {deleting?.name} será removido
              imediatamente do DNS do Atlas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deletingRecord}
              onClick={() => {
                if (!deleting) return;
                const data = new FormData();
                data.set("domainId", domainId);
                data.set("recordId", deleting.id);
                startTransition(() => deleteAction(data));
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
