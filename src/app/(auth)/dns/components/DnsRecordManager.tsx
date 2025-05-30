// src/app/(authenticated)/(dashboard)/sites/[domain]/dns/components/DnsRecordsManager.tsx
"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useActionState,
  startTransition,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner"; // Assuming you use 'sonner' for toasts

import {
  Plus,
  Pencil,
  Trash2,
  Search,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Copy,
  ArrowUpDown,
} from "lucide-react";
import { CgSpinner } from "react-icons/cg";

import type {
  DnsHostRecordItem,
  DnsRecordType,
} from "@/lib/server/apis/namecheap/types";
import {
  addDnsRecordAction,
  updateDnsRecordAction,
  deleteDnsRecordAction,
  type DnsActionResult,
} from "../actions";

const recordTypes: {
  value: DnsRecordType;
  label: string;
  description: string;
  needsPriority?: boolean;
}[] = [
  { value: "A", label: "A", description: "Aponta para um endereço IPv4" },
  { value: "AAAA", label: "AAAA", description: "Aponta para um endereço IPv6" },
  {
    value: "CNAME",
    label: "CNAME",
    description: "Aponta para outro domínio",
  },
  {
    value: "MX",
    label: "MX",
    description: "Define servidores de e-mail para o domínio",
    needsPriority: true,
  },
  {
    value: "TXT",
    label: "TXT",
    description: "Armazena informações de texto, muitas vezes para verificação",
  },
  {
    value: "URL",
    label: "URL Redirect",
    description: "Redireciona para outro endereço da web (não mascarado)",
  },
  {
    value: "URL301",
    label: "URL Redirect (301)",
    description: "Redirecionamento permanente para outro endereço da web (não mascarado)",
  },
  {
    value: "FRAME",
    label: "FRAME",
    description: "Exibe uma página da web dentro de um frame (mascarado)",
  },
  {
    value: "CAA",
    label: "CAA",
    description: "Autorização de Autoridade de Certificação",
  },
];

const commonTTLs = [
  { value: "60", label: "1 minuto" },
  { value: "300", label: "5 minutos" },
  { value: "600", label: "10 minutos" },
  { value: "1800", label: "30 minutos" },
  { value: "3600", label: "1 hora" },
  { value: "14400", label: "4 horas" },
  { value: "43200", label: "12 horas" },
  { value: "86400", label: "24 horas" },
];

interface DnsRecordsManagerProps {
  domainName: string;
  initialRecords: DnsHostRecordItem[];
  sld: string; // Not directly used by client, but good to have if actions needed it differently
  tld: string; // Same as sld
  isUsingOurDNS: boolean;
}

type FormMode = "add" | "edit";
interface EditingRecordState extends DnsHostRecordItem {
  // DnsHostRecordItem already has all necessary fields
}

export function DnsRecordsManager({
  domainName,
  initialRecords,
}: DnsRecordsManagerProps) {
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
    addDnsRecordAction,
    null
  );
  const [updateState, updateFormAction, isPendingUpdate] = useActionState(
    updateDnsRecordAction,
    null
  );
  const [deleteState, deleteFormAction, isPendingDelete] = useActionState(
    deleteDnsRecordAction,
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
        // Records will be updated by parent component re-render due to revalidateTag
      } else {
        toast.error(state.message || "Ocorreu um erro desconhecido.", {
          description: state.errors
            ?.map((e) => `${e.field ? `${e.field}: ` : ""}${e.message}`)
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

  const handleAddEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // FormData will be handled by the form action
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
      (record) =>
        record.Name.toLowerCase().includes(lowerQuery) ||
        record.Type.toLowerCase().includes(lowerQuery) ||
        record.Address.toLowerCase().includes(lowerQuery) ||
        record.TTL.toString().includes(lowerQuery) ||
        record.MXPref?.toString().includes(lowerQuery)
    );
  }, [records, searchQuery]);

  const selectedRecordTypeInfo = recordTypes.find(
    (rt) => rt.value === selectedRecordType
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
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
              variant="outline"
              size="icon"
              onClick={() => setShowHelpDialog(true)}
            >
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Guia de Registros DNS</span>
            </Button>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Registro
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar registros (ex: por nome, tipo, conteúdo)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-1/2 lg:w-1/3"
            />
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Nenhum registro DNS encontrado
              {searchQuery ? " correspondente à sua pesquisa" : ""}.
            </div>
          )}

          {filteredRecords.length > 0 && (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nome (Host)</TableHead>
                    <TableHead>Valor</TableHead>
                    {records.some((r) => r.Type === "MX") && (
                      <TableHead>Prioridade</TableHead>
                    )}
                    <TableHead>TTL</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.HostId}>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline">{record.Type}</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {recordTypes.find((rt) => rt.value === record.Type)
                              ?.description || "N/A"}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="font-medium break-all">
                        {record.Name}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-1 h-6 w-6"
                              onClick={() =>
                                handleCopyValue(record.Name, "Host name")
                              }
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
                              variant="ghost"
                              size="icon"
                              className="ml-1 h-6 w-6"
                              onClick={() =>
                                handleCopyValue(record.Address, "Address/Value")
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copiar</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      {records.some((r) => r.Type === "MX") && (
                        <TableCell>
                          {record.Type === "MX" ? record.MXPref : "N/A"}
                        </TableCell>
                      )}
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger>
                            {commonTTLs.find(
                              (ct) => ct.value === record.TTL.toString()
                            )?.label || `${record.TTL}s`}
                          </TooltipTrigger>
                          <TooltipContent>{record.TTL} segundos</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditModal(record)}
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
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive/90"
                                onClick={() => openDeleteModal(record)}
                              >
                                <Trash2 className="h-4 w-4" />{" "}
                                <span className="sr-only">Deletar</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Deletar Registro</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Record Modal */}
      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
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
            onSubmit={handleAddEditSubmit}
            className="space-y-4 py-2"
          >
            <input type="hidden" name="domainName" value={domainName} />
            {formMode === "edit" && currentEditingRecord && (
              <input
                type="hidden"
                name="hostId"
                value={currentEditingRecord.HostId}
              />
            )}

            <div>
              <label
                htmlFor="recordType"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Tipo de Registro
              </label>
              <Select
                name="recordType"
                value={selectedRecordType}
                onValueChange={(v) => setSelectedRecordType(v as DnsRecordType)}
              >
                <SelectTrigger id="recordType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {recordTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} ({type.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor="hostName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Nome (Host)
              </label>
              <Input
                id="hostName"
                name="hostName"
                placeholder="@ para raiz, www, mail, etc."
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use "@" para o domínio raiz ({domainName}). Para subdomínios,
                apenas insira a parte do subdomínio (ex: "www", "mail").
              </p>
            </div>

            {selectedRecordTypeInfo?.needsPriority && (
              <div>
                <label
                  htmlFor="mxPref"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Prioridade (MX)
                </label>
                <Input
                  id="mxPref"
                  name="mxPref"
                  type="number"
                  placeholder="e.g., 10"
                  value={mxPref}
                  onChange={(e) => setMxPref(e.target.value)}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Valor
              </label>
              <Input
                id="address"
                name="address"
                placeholder={
                  selectedRecordType === "A"
                    ? "Endereço IPv4 (ex: 192.168.1.1)"
                    : selectedRecordType === "CNAME"
                      ? "Domínio de destino (ex: exemplo.com)"
                      : "Conteúdo/Endereço"
                }
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="ttl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                TTL (Tempo De Vida)
              </label>
              <Select name="ttl" value={ttl} onValueChange={setTtl}>
                <SelectTrigger id="ttl">
                  <SelectValue placeholder="Select TTL" />
                </SelectTrigger>
                <SelectContent>
                  {commonTTLs.map((t) => (
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
                type="submit"
                disabled={formMode === "add" ? isPendingAdd : isPendingUpdate}
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
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
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
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={isPendingDelete}
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
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Guia de Registros DNS</DialogTitle>
            <DialogDescription>
              Tipos comuns de registros DNS e seus usos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {recordTypes.map((type) => (
              <div
                key={type.value}
                className="p-3 border rounded-md bg-muted/50"
              >
                <h4 className="font-semibold">
                  {type.label} ({type.value})
                </h4>
                <p className="text-sm text-muted-foreground">
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
