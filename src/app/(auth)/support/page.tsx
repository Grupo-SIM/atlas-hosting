"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  MessageSquare,
  ChevronRight,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

const supportTopics = [
  { id: "billing", label: "Fatura e Pagamentos", icon: "💳" },
  { id: "wordpress", label: "Problemas com WordPress", icon: "🔧" },
  { id: "hosting", label: "Plano de Hospedagem", icon: "🌐" },
  { id: "dns", label: "Configuração DNS", icon: "🔍" },
  { id: "email", label: "Configuração Email", icon: "📧" },
  { id: "newsite", label: "Novo Site", icon: "🚀" },
  { id: "downtime", label: "Site fora do ar", icon: "⚠️" },
  { id: "cancel", label: "Cancelamento", icon: "❌" },
];

const faqs = [
  {
    question: "Como alterar a forma de pagamento?",
    answer:
      "Você pode alterar sua forma de pagamento acessando a seção Pagamentos no seu painel e adicionando um novo método de pagamento.",
  },
  {
    question: "Como instalar WordPress?",
    answer:
      "Acesse a seção Sites > Novo Site e selecione a opção WordPress. A instalação é automática e leva apenas alguns minutos.",
  },
  {
    question: "Como configurar email personalizado?",
    answer:
      "Vá para a seção E-mails e clique em 'Nova conta de e-mail'. Configure o endereço desejado e siga as instruções.",
  },
  {
    question: "Como fazer backup do meu site?",
    answer:
      "No painel de controle, acesse a seção Backup e configure backups automáticos ou faça um backup manual.",
  },
];

const tickets = [
  {
    id: "#12345",
    subject: "Site não está carregando",
    status: "open",
    priority: "high",
    created: "2024-03-15",
    lastUpdate: "2024-03-15",
  },
  {
    id: "#12344",
    subject: "Dúvida sobre faturamento",
    status: "resolved",
    priority: "normal",
    created: "2024-03-14",
    lastUpdate: "2024-03-14",
  },
  {
    id: "#12343",
    subject: "Configuração de DNS",
    status: "in_progress",
    priority: "normal",
    created: "2024-03-13",
    lastUpdate: "2024-03-14",
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
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Suporte
          </h1>
          <p className="text-muted-foreground mt-1">
            Obtenha ajuda e tire suas dúvidas
          </p>
        </div>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          Novo Ticket
        </Button>
      </div>

      {/* Support Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendimento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24/7</div>
            <p className="text-xs text-muted-foreground">Suporte disponível</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-mail</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">suporte@atlas.com</div>
            <p className="text-xs text-muted-foreground">Resposta em até 2h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Telefone</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">(11) 4000-0000</div>
            <p className="text-xs text-muted-foreground">Seg-Sex 8h às 18h</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="help" className="space-y-6">
        <TabsList>
          <TabsTrigger value="help">Central de Ajuda</TabsTrigger>
          <TabsTrigger value="tickets">Meus Tickets</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
        </TabsList>

        <TabsContent value="help" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar na central de ajuda..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {supportTopics.map((topic) => (
                  <Card
                    key={topic.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{topic.icon}</div>
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
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between cursor-pointer">
                      <h4 className="font-medium">{faq.question}</h4>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
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
                  {tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/50"
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

        <TabsContent value="contact" className="space-y-6">
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
                    <Label for="category">Categoria</Label>
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
                    <Label for="priority">Prioridade</Label>
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
                  <Label for="subject">Assunto</Label>
                  <Input
                    id="subject"
                    placeholder="Descreva brevemente o problema"
                  />
                </div>

                <div className="space-y-2">
                  <Label for="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva detalhadamente o problema ou dúvida..."
                    className="min-h-[120px]"
                  />
                </div>

                <Button type="submit" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Enviar Ticket
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Alternative Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat Online
                </CardTitle>
                <CardDescription>Fale conosco em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-green-600">Online agora</span>
                </div>
                <Button variant="outline" className="w-full">
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
                <div className="space-y-2 mb-4">
                  <p className="font-medium">(11) 4000-0000</p>
                  <p className="text-sm text-muted-foreground">
                    Segunda a Sexta: 8h às 18h
                    <br />
                    Sábado: 9h às 15h
                  </p>
                </div>
                <Button variant="outline" className="w-full">
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
