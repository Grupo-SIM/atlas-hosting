"use client";

import {
  ChevronRight,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const supportTopics = [
  { icon: "💳", id: "billing", label: "Fatura e Pagamentos" },
  { icon: "🔧", id: "wordpress", label: "Problemas com WordPress" },
  { icon: "🌐", id: "hosting", label: "Plano de Hospedagem" },
  { icon: "🔍", id: "dns", label: "Configuração DNS" },
  { icon: "📧", id: "email", label: "Configuração Email" },
  { icon: "🚀", id: "newsite", label: "Novo Site" },
  { icon: "⚠️", id: "downtime", label: "Site fora do ar" },
  { icon: "❌", id: "cancel", label: "Cancelamento" },
];

const faqs = [
  {
    answer:
      "Você pode alterar sua forma de pagamento acessando a seção Pagamentos no seu painel e adicionando um novo método de pagamento.",
    question: "Como alterar a forma de pagamento?",
  },
  {
    answer:
      "Acesse a seção Sites > Novo Site e selecione a opção WordPress. A instalação é automática e leva apenas alguns minutos.",
    question: "Como instalar WordPress?",
  },
  {
    answer:
      "Vá para a seção E-mails e clique em 'Nova conta de e-mail'. Configure o endereço desejado e siga as instruções.",
    question: "Como configurar email personalizado?",
  },
  {
    answer:
      "No painel de controle, acesse a seção Backup e configure backups automáticos ou faça um backup manual.",
    question: "Como fazer backup do meu site?",
  },
];

const tickets = [
  {
    created: "2024-03-15",
    id: "#12345",
    lastUpdate: "2024-03-15",
    priority: "high",
    status: "open",
    subject: "Site não está carregando",
  },
  {
    created: "2024-03-14",
    id: "#12344",
    lastUpdate: "2024-03-14",
    priority: "normal",
    status: "resolved",
    subject: "Dúvida sobre faturamento",
  },
  {
    created: "2024-03-13",
    id: "#12343",
    lastUpdate: "2024-03-14",
    priority: "normal",
    status: "in_progress",
    subject: "Configuração de DNS",
  },
];

export default function SupportPage() {
  const [_selectedTopic, _setSelectedTopic] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive">Aberto</Badge>;
      case "in_progress":
        return <Badge variant="outline">Em Andamento</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolvido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>;
      case "normal":
        return <Badge variant="outline">Normal</Badge>;
      case "low":
        return <Badge variant="secondary">Baixa</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
            Suporte
          </h1>
          <p className="mt-1 text-muted-foreground">
            Obtenha ajuda e tire suas dúvidas
          </p>
        </div>
        <Button disabled>
          <MessageSquare className="mr-2 h-4 w-4" />
          Novo Ticket
        </Button>
      </div>

      {/* Support Contact Info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Atendimento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">24/7</div>
            <p className="text-muted-foreground text-xs">Suporte disponível</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">E-mail</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-lg">suporte@atlas.com</div>
            <p className="text-muted-foreground text-xs">Resposta em até 2h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Telefone</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-lg">+55 68 9207-8221</div>
          </CardContent>
        </Card>
      </div>

      <Tabs className="space-y-6" defaultValue="help">
        <TabsList>
          <TabsTrigger value="help">Central de Ajuda</TabsTrigger>
          <TabsTrigger disabled value="tickets">
            Meus Tickets
          </TabsTrigger>
          <TabsTrigger disabled value="contact">
            Contato
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="help">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar na central de ajuda..."
                  value={searchQuery}
                />
              </div>
            </CardContent>
          </Card>

          {/* Popular Topics */}
          <Card>
            <CardHeader>
              <CardTitle>Tópicos Populares</CardTitle>
              <CardDescription>
                Encontre ajuda rápida para problemas comuns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {supportTopics.map(topic => (
                  <Card
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    key={topic.id}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="mb-2 text-2xl">{topic.icon}</div>
                      <h3 className="font-medium text-sm">{topic.label}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
              <CardDescription>
                Respostas para as dúvidas mais comuns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    className="rounded-lg border p-4"
                    key={JSON.stringify(faq).concat(index.toString())}
                  >
                    <div className="flex cursor-pointer items-center justify-between">
                      <h4 className="font-medium">{faq.question}</h4>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                    <p className="mt-2 text-muted-foreground text-sm">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Meus Tickets de Suporte</CardTitle>
              <CardDescription>
                Acompanhe o status dos seus tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Última Atualização</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map(ticket => (
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      key={ticket.id}
                    >
                      <TableCell className="font-medium">{ticket.id}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{ticket.created}</TableCell>
                      <TableCell>{ticket.lastUpdate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Abrir Novo Ticket</CardTitle>
              <CardDescription>
                Descreva seu problema e nossa equipe irá ajudá-lo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="billing">Faturamento</SelectItem>
                        <SelectItem value="technical">Técnico</SelectItem>
                        <SelectItem value="hosting">Hospedagem</SelectItem>
                        <SelectItem value="domain">Domínio</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    placeholder="Descreva brevemente o problema"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    className="min-h-[120px]"
                    id="description"
                    placeholder="Descreva detalhadamente o problema ou dúvida..."
                  />
                </div>

                <Button className="w-full" type="submit">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Enviar Ticket
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Alternative Contact Methods */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat Online
                </CardTitle>
                <CardDescription>Fale conosco em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-green-600 text-sm">Online agora</span>
                </div>
                <Button className="w-full" variant="outline">
                  Iniciar Chat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Suporte por Telefone
                </CardTitle>
                <CardDescription>Ligue para nossa central</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2">
                  <p className="font-medium">+55 68 9207-8221</p>
                  <p className="text-muted-foreground text-sm">
                    Segunda a Sexta: 8h às 18h
                    <br />
                    Sábado: 9h às 15h
                  </p>
                </div>
                <Button className="w-full" variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Ligar Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
