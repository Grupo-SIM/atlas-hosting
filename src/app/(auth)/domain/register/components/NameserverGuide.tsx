"use client";

import { BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Registrar {
  id: string;
  name: string;
  loginUrl: string;
  instructions: string[];
}

const registrars = [
  {
    id: "godaddy",
    instructions: [
      "Faça login na sua conta GoDaddy para acessar seu Portfólio de Domínios",
      "Selecione o domínio que deseja modificar da sua lista de domínios",
      "Na página de Configurações do Domínio, clique na aba DNS",
      "Dentro da aba DNS, clique em Nameservers",
      "Selecione 'Vou usar meus próprios nameservers'",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Clique em Salvar e depois em Continuar",
      "Se tiver Proteção de Domínio ativada, complete a verificação de identidade (SMS ou email)",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://account.godaddy.com/",
    name: "GoDaddy",
  },
  {
    id: "namecheap",
    instructions: [
      "Faça login na sua conta Namecheap",
      "No painel, selecione Lista de Domínios no menu lateral esquerdo",
      "Encontre seu domínio e clique no botão Gerenciar",
      "Role para baixo até a seção Nameservers",
      "No menu dropdown, selecione CustomDNS",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Clique em Salvar Alterações",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://www.namecheap.com/myaccount/login/",
    name: "Namecheap",
  },
  {
    id: "network-solutions",
    instructions: [
      "Faça login na sua conta Network Solutions",
      "Vá para a seção Gerenciar Domínios",
      "Selecione o domínio que deseja alterar",
      "Clique em Editar DNS",
      "Selecione a opção de usar nameservers externos",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Salve as alterações",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://www.networksolutions.com/manage/",
    name: "Network Solutions",
  },
  {
    id: "squarespace",
    instructions: [
      "Faça login na sua conta Squarespace",
      "Vá para Configurações > Domínios",
      "Clique no domínio que deseja gerenciar",
      "Clique em Configurações Avançadas de DNS",
      "Selecione a opção Nameservers Personalizados",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Clique em Salvar",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://account.squarespace.com/",
    name: "Squarespace",
  },
  {
    id: "ionos",
    instructions: [
      "Faça login no seu painel IONOS",
      "Vá para Domínios & SSL",
      "Selecione o domínio desejado",
      "Clique em Gerenciar Subdomínios",
      "Vá para Configurações de DNS",
      "Altere para nameservers externos",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Confirme as alterações",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://login.ionos.com/",
    name: "IONOS (1&1)",
  },
  {
    id: "hostinger",
    instructions: [
      "Faça login no hPanel da Hostinger",
      "Vá para a seção Domínios",
      "Selecione o domínio que deseja gerenciar",
      "Clique em Gerenciar DNS",
      "Procure pela seção Nameservers",
      "Selecione a opção Nameservers Personalizados",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Clique em Salvar Alterações",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://hpanel.hostinger.com/",
    name: "Hostinger",
  },
  {
    id: "namesilo",
    instructions: [
      "Faça login na sua conta NameSilo",
      "Vá para Gerenciar Meus Domínios",
      "Clique no ícone de configuração azul ao lado do seu domínio",
      "Selecione Alterar Nameservers",
      "Escolha a opção para usar nameservers personalizados",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Clique em Enviar",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://www.namesilo.com/login",
    name: "NameSilo",
  },
  {
    id: "dynadot",
    instructions: [
      "Faça login na sua conta Dynadot",
      "Vá para Gerenciar Domínios",
      "Clique no domínio que deseja modificar",
      "Na seção Configurações de DNS, clique em Nameservers",
      "Selecione a opção Nameservers Personalizados",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Clique em Salvar Nameservers",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://www.dynadot.com/account/login",
    name: "Dynadot",
  },
  {
    id: "porkbun",
    instructions: [
      "Faça login na sua conta Porkbun",
      "Vá para o painel de domínios",
      "Clique em Detalhes do domínio que deseja alterar",
      "Role para baixo até Nameservers Autorizados",
      "Clique em Editar",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Clique em Enviar",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://porkbun.com/login",
    name: "Porkbun",
  },
  {
    id: "cloudflare",
    instructions: [
      "Faça login no painel Cloudflare",
      "Selecione seu domínio da lista",
      "Vá para a aba DNS",
      "Role para baixo até a seção Nameservers",
      "Clique em Alterar para nameservers externos",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Confirme a alteração",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://dash.cloudflare.com/login",
    name: "Cloudflare",
  },
  {
    id: "registro-br",
    instructions: [
      "Acesse o site do Registro.br",
      "Faça login com suas credenciais",
      "Vá para Meus Domínios",
      "Selecione o domínio .br que deseja alterar",
      "Clique em Alterar DNS",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Confirme as alterações",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://registro.br/",
    name: "Registro.br",
  },
  {
    id: "hover",
    instructions: [
      "Faça login no seu painel de controle Hover",
      "Se você tem múltiplos domínios, clique no domínio que deseja gerenciar",
      "Na página de visão geral do domínio, encontre a seção Nameservers no lado esquerdo",
      "Clique em Editar",
      "Uma janela pop-up aparecerá - digite os novos endereços de nameservers",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Adicione mais campos se necessário",
      "Clique em Salvar nameservers",
      "Aguarde 24-48 horas para propagação completa",
    ],
    loginUrl: "https://www.hover.com/signin",
    name: "Hover (Tucows)",
  },
  {
    id: "enom",
    instructions: [
      "Faça login na sua conta eNom",
      "No menu principal, selecione Domains, depois My domains",
      "Na lista, clique no nome do domínio que deseja gerenciar",
      "No menu dropdown Manage domain, escolha DNS server settings",
      "Selecione a opção Custom para usar nameservers de terceiros",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Salve suas alterações",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://www.enom.com/",
    name: "eNom (Tucows)",
  },
  {
    id: "alibaba-cloud",
    instructions: [
      "Faça login na sua conta Alibaba Cloud",
      "Acesse o console de serviços cloud integrado",
      "Navegue até a seção de gerenciamento de domínios",
      "Selecione o domínio que deseja modificar",
      "Encontre as configurações de nameserver",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Confirme as alterações",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://account.alibabacloud.com/",
    name: "Alibaba Cloud",
  },
  {
    id: "gmo-onamae",
    instructions: [
      "Faça login na sua conta Onamae.com",
      "Interface está principalmente em japonês",
      "Navegue até a seção de gerenciamento de domínios",
      "Selecione o domínio que deseja alterar",
      "Encontre as configurações de nameserver",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Salve as configurações",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://www.onamae.com/navi/",
    name: "GMO Internet (Onamae.com)",
  },
  {
    id: "gname",
    instructions: [
      "Faça login na sua conta Gname.com",
      "Registrador baseado em Singapura, popular nos mercados asiáticos",
      "Navegue até o gerenciamento de domínios",
      "Selecione o domínio que deseja modificar",
      "Acesse as configurações de nameserver",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Confirme as alterações",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://www.gname.com/login",
    name: "Gname.com",
  },
  {
    id: "reg-ru",
    instructions: [
      "Faça login na sua conta REG.RU",
      "Interface está principalmente em russo",
      "Navegue até a seção de domínios",
      "Selecione o domínio que deseja gerenciar",
      "Encontre as configurações de DNS/nameserver",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Salve as alterações",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://www.reg.ru/login/",
    name: "REG.RU",
  },
  {
    id: "chengdu-west",
    instructions: [
      "Faça login na sua conta west.cn",
      "Interface está principalmente em chinês",
      "Navegue até o gerenciamento de domínios",
      "Selecione o domínio que deseja alterar",
      "Acesse as configurações de nameserver",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Confirme as mudanças",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://www.west.cn/",
    name: "Chengdu West (west.cn)",
  },
  {
    id: "name-com",
    instructions: [
      "Faça login na sua conta Name.com",
      "Parte do grupo Newfold Digital, mas mantém interface distinta",
      "Navegue até o gerenciamento de domínios",
      "Selecione o domínio que deseja modificar",
      "Encontre a seção de nameservers",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Salve as configurações",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://www.name.com/account/login",
    name: "Name.com",
  },
  {
    id: "wix",
    instructions: [
      "Faça login na sua conta Wix",
      "Principalmente um construtor de sites com registro de domínio integrado",
      "Acesse as configurações de domínio através do painel principal",
      "Selecione o domínio que deseja gerenciar",
      "Navegue até as configurações DNS/nameserver",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Confirme as alterações",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://users.wix.com/",
    name: "Wix",
  },
  {
    id: "domain-com",
    instructions: [
      "Faça login no painel de controle Domain.com",
      "Navegue até a área principal de gerenciamento de domínios",
      "Clique no nome do domínio que deseja modificar",
      "Procure por uma seção ou link chamado Nameservers, Manage DNS ou DNS Settings",
      "Esta opção pode estar sob um menu Configurações Avançadas",
      "Exclua as entradas existentes antes de adicionar as novas",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Clique em Salvar, Atualizar ou Enviar para aplicar as alterações",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://www.domain.com/",
    name: "Domain.com (Newfold Digital)",
  },
  {
    id: "register-com",
    instructions: [
      "Faça login no seu painel de controle Register.com",
      "Navegue até Domain Manager, Domain Central ou My Domains",
      "Clique no nome do domínio que deseja modificar",
      "Procure por Nameservers, Manage DNS ou DNS Settings",
      "Pode estar localizado sob Configurações Avançadas",
      "Remova as entradas de nameserver existentes para evitar conflitos",
      "Digite os nameservers: dns1.registrar-servers.com e dns2.registrar-servers.com",
      "Clique em Salvar, Atualizar ou Enviar",
      "Aguarde até 48 horas para propagação completa",
    ],
    loginUrl: "https://www.register.com/",
    name: "Register.com (Newfold Digital)",
  },
] as const;

export function NameserverGuide() {
  const [selectedRegistrar, setSelectedRegistrar] = useState<string>("");
  const [open, setOpen] = useState(false);

  const selectedRegistrarData = registrars.find(
    r => r.id === selectedRegistrar
  );

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-muted-foreground text-sm">
        Guia para Alterar Nameservers
      </h4>

      <div className="flex gap-3">
        <Select onValueChange={setSelectedRegistrar} value={selectedRegistrar}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione seu registrador" />
          </SelectTrigger>
          <SelectContent>
            {registrars.map(registrar => (
              <SelectItem key={registrar.id} value={registrar.id}>
                {registrar.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              className="flex items-center gap-2"
              disabled={!selectedRegistrar}
              variant="outline"
            >
              <BookOpen className="h-4 w-4" />
              Ver Instruções
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            {selectedRegistrarData && (
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">
                      Como alterar nameservers no {selectedRegistrarData.name}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="mb-1 font-medium">Portal de acesso:</div>{" "}
                      <Link
                        className="flex items-center gap-2 text-violet-400 hover:underline"
                        href={new URL(
                          selectedRegistrarData.loginUrl
                        ).toString()}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <ExternalLink className="h-[1em] w-[1em]" />
                        {selectedRegistrarData.loginUrl}
                      </Link>
                    </div>

                    <div className="space-y-2">
                      <span className="font-medium text-sm">
                        Passo a passo:
                      </span>
                      <ol className="mt-2 flex flex-col gap-2 text-muted-foreground text-sm">
                        {selectedRegistrarData.instructions.map(
                          (step, index) => (
                            <li
                              className="flex gap-2 leading-[1.2]"
                              key={`${selectedRegistrarData.id}-step-${index}`}
                            >
                              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-xs">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          )
                        )}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
