// "use client";

// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { type DomainListItem } from "@/lib/server/apis/namecheap/types";
// import { AlertTriangle, Check, Mail, Settings } from "lucide-react";
// import { useRouter } from "next/navigation";
// import React, { useState, useTransition } from "react";
// import { linkZohoOrganizationAction } from "../actions"; // Server action

// interface EmailPageClientProps {
//   domains: DomainListItem[];
// }

// function formatBytes(bytes: number): string {
//   if (bytes === 0) return "0 B";
//   const k = 1024;
//   const sizes = ["B", "KB", "MB", "GB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
// }

// export function EmailPageClient({ domains }: EmailPageClientProps) {
//   const router = useRouter();
//   const [isPending, startTransition] = useTransition();
//   const [zohoOrgIdInput, setZohoOrgIdInput] = useState("");
//   const [actionMessage, setActionMessage] = useState<{
//     type: "error" | "success";
//     message: string;
//   } | null>(null);

//   const handleDomainChange = (newDomain: string) => {
//     router.push(`/email?domain=${encodeURIComponent(newDomain)}`);
//   };

//   const emailComponents = useEmailComponents(
//     activeZohoOrg?.emailAccounts ?? [],
//     activeZohoOrg?.domainInfo.domainName ?? ""
//   );

//   const handleLinkZohoOrg = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     if (!selectedDomainName || !zohoOrgIdInput) {
//       setActionMessage({
//         type: "error",
//         message: "Domain and Zoho Org ID are required.",
//       });
//       return;
//     }
//     setActionMessage(null);

//     startTransition(async () => {
//       const formData = new FormData();
//       formData.append("domainName", selectedDomainName);
//       formData.append("zohoOrgId", zohoOrgIdInput);

//       const result = await linkZohoOrganizationAction(formData);
//       if (result.error) {
//         setActionMessage({ type: "error", message: result.error });
//       } else if (result.success) {
//         setActionMessage({ type: "success", message: result.success });
//         // The page will revalidate due to revalidatePath in action,
//         // or you can explicitly router.refresh() or push.
//         router.refresh(); // Or router.push(`/email?domain=${encodeURIComponent(selectedDomainName)}`);
//       }
//     });
//   };

//   const displayZohoErrorMessage =
//     initialZohoErrorMessage ||
//     (actionMessage?.type === "error" ? actionMessage.message : null);
//   const displayZohoSuccessMessage =
//     actionMessage?.type === "success" ? actionMessage.message : null;

//   // Determine if the selected domain is known to be a Zoho-configured domain from the server's perspective
//   // This is true if activeZohoOrg has data.
//   const isSelectedDomainZohoConfigured = !!activeZohoOrg;

//   return (
//     <div className="p-6 space-y-6">
//       {/* Dialogs */}
//       {emailComponents.dialogs}

//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
//             E-mails
//           </h1>
//           <p className="text-muted-foreground mt-1">
//             Gerencie suas contas de e-mail
//           </p>
//         </div>
//         <emailComponents.HeaderActions />
//       </div>

//       {/* Domain Selection */}
//       {userOwnedDomains.length > 0 && (
//         <Card>
//           <CardContent className="pt-6">
//             <div className="space-y-4">
//               <div>
//                 <label htmlFor="domainSelect" className="text-sm font-medium">
//                   Selecionar Domínio
//                 </label>
//                 <Select
//                   value={selectedDomainName || ""}
//                   onValueChange={handleDomainChange}
//                 >
//                   <SelectTrigger id="domainSelect" className="h-12 mt-2">
//                     <SelectValue placeholder="Selecione um domínio" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {userOwnedDomains.map((domain) => (
//                       <SelectItem key={domain.ID} value={domain.Name}>
//                         {domain.Name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {displayZohoErrorMessage && (
//         <Alert variant="destructive">
//           <AlertTriangle className="h-4 w-4" />
//           <AlertTitle>Erro de Configuração Zoho</AlertTitle>
//           <AlertDescription>{displayZohoErrorMessage}</AlertDescription>
//         </Alert>
//       )}
//       {displayZohoSuccessMessage && (
//         <Alert variant="default">
//           <Check className="h-4 w-4" />
//           <AlertTitle>Sucesso</AlertTitle>
//           <AlertDescription>{displayZohoSuccessMessage}</AlertDescription>
//         </Alert>
//       )}

//       {selectedDomainName && isSelectedDomainZohoConfigured && activeZohoOrg ? (
//         <>
//           {/* Domain Overview */}
//           <Card>
//             <CardContent className="pt-6">
//               <div className="flex items-start gap-4">
//                 <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
//                   <Mail className="h-6 w-6 text-primary" />
//                 </div>
//                 <div className="flex-1">
//                   <h2 className="text-xl font-semibold">
//                     {activeZohoOrg.domainInfo.domainName}
//                   </h2>
//                   <div className="flex items-center gap-2 mt-1">
//                     <span className="text-sm text-muted-foreground">
//                       Domínio verificado:{" "}
//                       {activeZohoOrg.domainInfo.verified ? "Sim" : "Não"}
//                     </span>
//                     <emailComponents.DomainActions />
//                   </div>
//                 </div>
//                 <Badge
//                   variant={
//                     activeZohoOrg.domainInfo.verified ? "default" : "secondary"
//                   }
//                   className="flex items-center gap-1"
//                 >
//                   <Check className="h-3 w-3" />
//                   {activeZohoOrg.domainInfo.verified ? "Ativo" : "Pendente"}
//                 </Badge>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Email Accounts Table for the activeZohoDomain */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Contas de E-mail</CardTitle>
//               <CardDescription>
//                 Gerencie suas contas de e-mail para{" "}
//                 {activeZohoOrg.domainInfo.domainName}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <emailComponents.AccountsTable />
//             </CardContent>
//           </Card>
//         </>
//       ) : (
//         <>
//           {selectedDomainName &&
//             !isSelectedDomainZohoConfigured &&
//             !initialZohoErrorMessage && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>
//                     Configurar E-mail Zoho para {selectedDomainName}
//                   </CardTitle>
//                   <CardDescription>
//                     Este domínio ainda não está configurado para usar os
//                     serviços de e-mail da Zoho através da nossa plataforma. Se
//                     você já possui uma Organização Zoho para este domínio,
//                     insira o ID da Organização abaixo. Caso contrário, você
//                     precisará criar uma organização no Zoho Mail primeiro.
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <form onSubmit={handleLinkZohoOrg} className="space-y-4">
//                     <div>
//                       <Label htmlFor="zohoOrgId">Zoho Organization ID</Label>
//                       <Input
//                         id="zohoOrgId"
//                         name="zohoOrgId"
//                         value={zohoOrgIdInput}
//                         onChange={(e) => setZohoOrgIdInput(e.target.value)}
//                         placeholder="Ex: 123456789"
//                         className="mt-1"
//                       />
//                     </div>
//                     <Button
//                       type="submit"
//                       disabled={isPending || !zohoOrgIdInput.trim()}
//                     >
//                       {isPending
//                         ? "Vinculando..."
//                         : "Vincular Organização Zoho"}
//                     </Button>
//                   </form>
//                   <Alert className="mt-6">
//                     <Info className="h-4 w-4" />
//                     <AlertTitle>O que é o ID da Organização Zoho?</AlertTitle>
//                     <AlertDescription>
//                       Você pode encontrar o ID da sua Organização Zoho no painel
//                       de administração do Zoho Mail (geralmente em &quot;Painel
//                       de Controle&quot; &gt; &quot;Organização&quot; ou
//                       &quot;Detalhes da Empresa&quot;). Certifique-se de que o
//                       domínio &apos;{selectedDomainName}&apos; está corretamente
//                       configurado e verificado dentro dessa organização Zoho.
//                     </AlertDescription>
//                   </Alert>
//                 </CardContent>
//               </Card>
//             )}
//           {!selectedDomainName && userOwnedDomains.length > 0 && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Gerenciamento de E-mail</CardTitle>
//                 <CardDescription>
//                   Por favor, selecione um domínio da lista acima para ver os
//                   detalhes e gerenciar as contas de e-mail.
//                 </CardDescription>
//               </CardHeader>
//             </Card>
//           )}
//         </>
//       )}

//       {/* Email Statistics (These are for the selected Zoho organization, if active) */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Contas de E-mail
//             </CardTitle>
//             <Mail className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {activeZohoOrg?.emailAccounts.length ?? 0}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {activeZohoOrg
//                 ? `Contas em ${activeZohoOrg.domainInfo.domainName}`
//                 : "N/A"}
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Armazenamento Usado
//             </CardTitle>
//             <Settings className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {formatBytes(activeZohoOrg?.totalUsed ?? 0)}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               De {formatBytes(activeZohoOrg?.totalQuota ?? 0)}{" "}
//               {activeZohoOrg
//                 ? `(total em ${activeZohoOrg.domainInfo.domainName})`
//                 : "(N/A)"}
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Status Geral das Contas
//             </CardTitle>
//             <Check className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">
//               {emailAccounts.filter((account) => account.status === "active")
//                 .length > 0
//                 ? "Ativo"
//                 : "Inativo"}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {
//                 emailAccounts.filter((account) => account.status === "active")
//                   .length
//               }{" "}
//               de {emailAccounts.length} contas ativas (na organização)
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Quick Setup Guide (General Zoho info) */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Configuração Rápida</CardTitle>
//           <CardDescription>
//             Configure seu cliente de e-mail preferido
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <h4 className="font-semibold">Servidor de Entrada (IMAP)</h4>
//               <div className="text-sm text-muted-foreground space-y-1">
//                 <p>Servidor: imappro.zoho.com</p>
//                 <p>Porta: 993</p>
//                 <p>Segurança: SSL/TLS</p>
//               </div>
//             </div>
//             <div className="space-y-2">
//               <h4 className="font-semibold">Servidor de Saída (SMTP)</h4>
//               <div className="text-sm text-muted-foreground space-y-1">
//                 <p>Servidor: smtppro.zoho.com</p>
//                 <p>Porta: 465</p>
//                 <p>Segurança: SSL/TLS</p>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
