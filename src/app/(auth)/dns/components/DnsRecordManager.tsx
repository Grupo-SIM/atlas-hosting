// src/app/(authenticated)/(dashboard)/sites/[domain]/dns/components/DnsRecordsManager.tsx
"use client";

import { Copy, HelpCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { CgSpinner } from "react-icons/cg";
import { toast } from "sonner"; // Assuming you use 'sonner' for toasts
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type {
  DnsHostRecordItem,
  DnsRecordType,
} from "@/lib/server/apis/namecheap/types";
import {
  addPleskDnsRecordAction,
  type DnsActionResult,
  deletePleskDnsRecordAction,
  updatePleskDnsRecordAction,
} from "../plesk-actions";

const recordTypes: {
  value: DnsRecordType;
  label: string;
  description: string;
  needsPriority?: boolean;
}[] = [
  { description: "Aponta para um endereço IPv4", label: "A", value: "A" },
  { description: "Aponta para um endereço IPv6", label: "AAAA", value: "AAAA" },
  {
    description: "Aponta para outro domínio",
    label: "CNAME",
    value: "CNAME",
  },
  {
    description: "Define servidores de e-mail para o domínio",
    label: "MX",
    needsPriority: true,
    value: "MX",
  },
  {
    description: "Armazena informações de texto, muitas vezes para verificação",
    label: "TXT",
    value: "TXT",
  },
  {
    description: "Autorização de Autoridade de Certificação",
    label: "CAA",
    value: "CAA",
  },
  {
    description: "Localiza serviços por porta e protocolo",
    label: "SRV",
    value: "SRV",
  },
  {
    description: "Associa certificados TLS ao DNS",
    label: "TLSA",
    value: "TLSA",
  },
  {
    description: "Delega um subdomínio para outro nameserver",
    label: "NS",
    value: "NS",
  },
];

const commonTTLs = [
  { label: "1 minuto", value: "60" },
  { label: "5 minutos", value: "300" },
  { label: "10 minutos", value: "600" },
  { label: "30 minutos", value: "1800" },
  { label: "1 hora", value: "3600" },
  { label: "4 horas", value: "14400" },
  { label: "12 horas", value: "43200" },
  { label: "24 horas", value: "86400" },
];

interface DnsRecordsManagerProps {
  domainName: string;
  initialRecords: DnsHostRecordItem[];
  sld: string; // Not directly used by client, but good to have if actions needed it differently
  tld: string; // Same as sld
  isUsingOurDNS: boolean;
  readOnly?: boolean;
}

type FormMode = "add" | "edit";
interface EditingRecordState extends DnsHostRecordItem {
  // DnsHostRecordItem already has all necessary fields
}

export function DnsRecordsManager({
  domainName,
  initialRecords,
  readOnly = false,
}: DnsRecordsManagerProps) {
  const router = useRouter();
  const formId = useId();
  const isProtectedRecord = (record: DnsHostRecordItem) => {
    const isApex =
      record.Name.replace(/\.$/, "").toLowerCase() === domainName.toLowerCase();
    return (
      record.Type === ("SOA" as DnsRecordType) ||
      (record.Type === "NS" && isApex)
    );
  };
  const [records, setRecords] = useState<DnsHostRecordItem[]>(initialRecords);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state for adding/editing
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [selectedRecordType, setSelectedRecordType] =
    useState<DnsRecordType>("A");
  const [hostName, setHostName] = useState("@"); // Default to root
  const [address, setAddress] = useState("");
  const [ttl, setTtl] = useState("3600"); // Default 1 hour
  const [mxPref, setMxPref] = useState("10");
  const [currentEditingRecord, setCurrentEditingRecord] =
    useState<EditingRecordState | null>(null);

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] =
    useState<DnsHostRecordItem | null>(null);

  const [showHelpDialog, setShowHelpDialog] = useState(false);

  // Server action states
  const [addState, addFormAction, isPendingAdd] = useActionState(
    addPleskDnsRecordAction,
    null
  );
  const [updateState, updateFormAction, isPendingUpdate] = useActionState(
    updatePleskDnsRecordAction,
    null
  );
  const [deleteState, deleteFormAction, isPendingDelete] = useActionState(
    deletePleskDnsRecordAction,
    null
  );

  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  const processFormState = useCallback(
    (
      state: DnsActionResult | null,
      successMessage: string,
      modalCloser?: () => void
    ) => {
      if (!state) return;
      if (state.success) {
        toast.success(successMessage);
        modalCloser?.();
        router.refresh();
        // Records will be updated by parent component re-render due to revalidateTag
      } else {
        toast.error(state.message || "Ocorreu um erro desconhecido.", {
          description: state.errors
            ?.map(e => `${e.field ? `${e.field}: ` : ""}${e.message}`)
            .join("\n"),
        });
      }
    },
    []
  );

  useEffect(
    () =>
      processFormState(addState, "Registro DNS adicionado com sucesso!", () =>
        setIsAddEditModalOpen(false)
      ),
    [addState, processFormState]
  );
  useEffect(
    () =>
      processFormState(
        updateState,
        "Registro DNS atualizado com sucesso!",
        () => setIsAddEditModalOpen(false)
      ),
    [updateState, processFormState]
  );
  useEffect(
    () =>
      processFormState(deleteState, "Registro DNS excluído com sucesso!", () =>
        setIsDeleteModalOpen(false)
      ),
    [deleteState, processFormState]
  );

  const openAddModal = () => {
    setFormMode("add");
    setSelectedRecordType("A");
    setHostName("@");
    setAddress("");
    setTtl("3600");
    setMxPref("10");
    setCurrentEditingRecord(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (record: DnsHostRecordItem) => {
    setFormMode("edit");
    setSelectedRecordType(record.Type as DnsRecordType);
    setHostName(record.Name);
    setAddress(record.Address);
    setTtl(record.TTL.toString());
    setMxPref(record.MXPref?.toString() || "10");
    setCurrentEditingRecord(record);
    setIsAddEditModalOpen(true);
  };

  const openDeleteModal = (record: DnsHostRecordItem) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSubmit = () => {
    if (!recordToDelete) return;
    const formData = new FormData();
    formData.append("domainName", domainName);
    formData.append("hostId", recordToDelete.HostId.toString());

    startTransition(() => {
      deleteFormAction(formData);
    });
  };

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    const lowerQuery = searchQuery.toLowerCase();
    return records.filter(
      record =>
        record.Name.toLowerCase().includes(lowerQuery) ||
        record.Type.toLowerCase().includes(lowerQuery) ||
        record.Address.toLowerCase().includes(lowerQuery) ||
        record.TTL.toString().includes(lowerQuery) ||
        record.MXPref?.toString().includes(lowerQuery)
    );
  }, [records, searchQuery]);

  const selectedRecordTypeInfo = recordTypes.find(
    rt => rt.value === selectedRecordType
  );

  const handleCopyValue = (value: string, fieldName: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() =>
        toast.success(`${fieldName} copiado para a área de transferência!`)
      )
      .catch(() => toast.error(`Falha ao copiar ${fieldName}.`));
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Gerenciar Registros DNS</CardTitle>
            <CardDescription>
              Visualizar, adicionar, editar ou excluir registros DNS para{" "}
              {domainName}. As alterações podem levar até 24 horas para
              propagar.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowHelpDialog(true)}
              size="icon"
              variant="outline"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Guia de Registros DNS</span>
            </Button>
            {!readOnly && (
              <Button onClick={openAddModal}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Registro
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              className="w-full pl-10 md:w-1/2 lg:w-1/3"
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar registros (ex: por nome, tipo, conteúdo)"
              value={searchQuery}
            />
          </div>

          {filteredRecords.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum registro DNS encontrado
              {searchQuery ? " correspondente à sua pesquisa" : ""}.
            </div>
          )}

          {filteredRecords.length > 0 && (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nome (Host)</TableHead>
                    <TableHead>Valor</TableHead>
                    {records.some(r => r.Type === "MX") && (
                      <TableHead>Prioridade</TableHead>
                    )}
                    <TableHead>TTL</TableHead>
                    {!readOnly && (
                      <TableHead className="text-right">Ações</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map(record => (
                    <TableRow key={record.HostId}>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline">{record.Type}</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {recordTypes.find(rt => rt.value === record.Type)
                              ?.description || "N/A"}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="break-all font-medium">
                        {record.Name}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="ml-1 h-6 w-6"
                              onClick={() =>
                                handleCopyValue(record.Name, "Host name")
                              }
                              size="icon"
                              variant="ghost"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copiar</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="break-all">
                        {record.Address}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="ml-1 h-6 w-6"
                              onClick={() =>
                                handleCopyValue(record.Address, "Address/Value")
                              }
                              size="icon"
                              variant="ghost"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copiar</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      {records.some(r => r.Type === "MX") && (
                        <TableCell>
                          {record.Type === "MX" ? record.MXPref : "N/A"}
                        </TableCell>
                      )}
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger>
                            {commonTTLs.find(
                              ct => ct.value === record.TTL.toString()
                            )?.label || `${record.TTL}s`}
                          </TooltipTrigger>
                          <TooltipContent>{record.TTL} segundos</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      {!readOnly && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="h-8 w-8"
                                  disabled={isProtectedRecord(record)}
                                  onClick={() => openEditModal(record)}
                                  size="icon"
                                  variant="ghost"
                                >
                                  <Pencil className="h-4 w-4" />{" "}
                                  <span className="sr-only">Editar</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar Registro</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="h-8 w-8 text-destructive hover:text-destructive/90"
                                  disabled={isProtectedRecord(record)}
                                  onClick={() => openDeleteModal(record)}
                                  size="icon"
                                  variant="ghost"
                                >
                                  <Trash2 className="h-4 w-4" />{" "}
                                  <span className="sr-only">Deletar</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Deletar Registro</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Record Modal */}
      <Dialog onOpenChange={setIsAddEditModalOpen} open={isAddEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {formMode === "add"
                ? "Adicionar Novo Registro DNS"
                : "Editar Registro DNS"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "add"
                ? "Insira os detalhes para o seu novo registro DNS."
                : `Modificando registro para ${currentEditingRecord?.Name}`}
            </DialogDescription>
          </DialogHeader>
          <form
            action={formMode === "add" ? addFormAction : updateFormAction}
            className="space-y-4 py-2"
          >
            <input name="domainName" type="hidden" value={domainName} />
            {formMode === "edit" && currentEditingRecord && (
              <input
                name="hostId"
                type="hidden"
                value={currentEditingRecord.HostId}
              />
            )}

            <div>
              <label
                className="mb-1 block font-medium text-gray-700 text-sm dark:text-gray-300"
                htmlFor={`${formId}-record-type`}
              >
                Tipo de Registro
              </label>
              <Select
                name="recordType"
                onValueChange={v => setSelectedRecordType(v as DnsRecordType)}
                value={selectedRecordType}
              >
                <SelectTrigger id={`${formId}-record-type`}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {recordTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} ({type.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                className="mb-1 block font-medium text-gray-700 text-sm dark:text-gray-300"
                htmlFor={`${formId}-host`}
              >
                Nome (Host)
              </label>
              <Input
                id={`${formId}-host`}
                name="hostName"
                onChange={e => setHostName(e.target.value)}
                placeholder="@ para raiz, www, mail, etc."
                value={hostName}
              />
              <p className="mt-1 text-muted-foreground text-xs">
                Use "@" para o domínio raiz ({domainName}). Para subdomínios,
                apenas insira a parte do subdomínio (ex: "www", "mail").
              </p>
            </div>

            {selectedRecordTypeInfo?.needsPriority && (
              <div>
                <label
                  className="mb-1 block font-medium text-gray-700 text-sm dark:text-gray-300"
                  htmlFor={`${formId}-mx-pref`}
                >
                  Prioridade (MX)
                </label>
                <Input
                  id={`${formId}-mx-pref`}
                  name="mxPref"
                  onChange={e => setMxPref(e.target.value)}
                  placeholder="e.g., 10"
                  type="number"
                  value={mxPref}
                />
              </div>
            )}

            <div>
              <label
                className="mb-1 block font-medium text-gray-700 text-sm dark:text-gray-300"
                htmlFor={`${formId}-address`}
              >
                Valor
              </label>
              <Input
                id={`${formId}-address`}
                name="address"
                onChange={e => setAddress(e.target.value)}
                placeholder={
                  selectedRecordType === "A"
                    ? "Endereço IPv4 (ex: 192.168.1.1)"
                    : selectedRecordType === "CNAME"
                      ? "Domínio de destino (ex: exemplo.com)"
                      : "Conteúdo/Endereço"
                }
                value={address}
              />
            </div>

            <div>
              <label
                className="mb-1 block font-medium text-gray-700 text-sm dark:text-gray-300"
                htmlFor={`${formId}-ttl`}
              >
                TTL (Tempo De Vida)
              </label>
              <Select name="ttl" onValueChange={setTtl} value={ttl}>
                <SelectTrigger id={`${formId}-ttl`}>
                  <SelectValue placeholder="Select TTL" />
                </SelectTrigger>
                <SelectContent>
                  {commonTTLs.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button
                disabled={formMode === "add" ? isPendingAdd : isPendingUpdate}
                type="submit"
              >
                {(formMode === "add" ? isPendingAdd : isPendingUpdate) ? (
                  <>
                    <CgSpinner className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Salvando...
                  </>
                ) : formMode === "add" ? (
                  "Adicionar Registro"
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog onOpenChange={setIsDeleteModalOpen} open={isDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o registro DNS para o host "
              {recordToDelete?.Name}" do tipo {recordToDelete?.Type} apontando
              para "{recordToDelete?.Address}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              disabled={isPendingDelete}
              onClick={handleDeleteSubmit}
              variant="destructive"
            >
              {isPendingDelete ? (
                <>
                  <CgSpinner className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Excluindo...
                </>
              ) : (
                "Excluir Registro"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog onOpenChange={setShowHelpDialog} open={showHelpDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Guia de Registros DNS</DialogTitle>
            <DialogDescription>
              Tipos comuns de registros DNS e seus usos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4">
            {recordTypes.map(type => (
              <div
                className="rounded-md border bg-muted/50 p-3"
                key={type.value}
              >
                <h4 className="font-semibold">
                  {type.label} ({type.value})
                </h4>
                <p className="text-muted-foreground text-sm">
                  {type.description}
                </p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
