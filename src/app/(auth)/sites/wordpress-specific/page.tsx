import {
  Activity,
  ArrowUpCircle,
  Calendar,
  CheckCircle,
  Download,
  ExternalLink,
  FileText,
  Globe,
  MoreHorizontal,
  Package,
  Palette,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { getWordPressSitesForSelectedDomain } from "./actions";
import { PluginBulkActions } from "./components/plugin-bulk-actions";
import { ThemeBulkActions } from "./components/theme-bulk-actions";

export default async function WordPressPage() {
  const user = await getUser();

  const sites = await getWordPressSitesForSelectedDomain();

  // Calculate stats from real data
  const totalSites = sites.length;
  const activeSites = sites.filter(site => site.status === "Working").length;
  const totalUpdatesAvailable = sites.reduce((acc, site) => {
    return (
      acc +
      (site.updatesAvailable?.core ? 1 : 0) +
      (site.updatesAvailable?.plugins?.length || 0) +
      (site.updatesAvailable?.themes?.length || 0)
    );
  }, 0);
  const totalPlugins = sites.reduce(
    (acc, site) => acc + (site.plugins?.length || 0),
    0
  );
  const totalThemes = sites.reduce(
    (acc, site) => acc + (site.themes?.length || 0),
    0
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
            WordPress
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie suas instalações WordPress para{" "}
            {user.selectedDomain || "seu domínio"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={async () => {
              "use server";
              revalidatePath("/wordpress");
            }}
            type="submit"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Verificar Atualizações
          </Button>
          <Button asChild>
            <Link href="/sites/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Instalação
            </Link>
          </Button>
        </div>
      </div>

      {/* WordPress Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card className="border-1 border-border border-solid bg-gradient-to-br from-background to-muted/20 shadow-none">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium text-muted-foreground text-xs">
                +
                {activeSites > 0
                  ? Math.round((activeSites / totalSites) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-2xl tracking-tight">
                {totalSites}
              </div>
              <p className="text-muted-foreground text-sm">Total de Sites</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-1 border-border border-solid bg-gradient-to-br from-background to-green-50/50 shadow-none dark:to-green-950/20">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium text-green-600 text-xs">
                Funcionando
              </span>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-2xl text-green-600 tracking-tight">
                {activeSites}
              </div>
              <p className="text-muted-foreground text-sm">Sites Ativos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-1 border-border border-solid bg-gradient-to-br from-background to-orange-50/50 shadow-none dark:to-orange-950/20">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900">
                <ArrowUpCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              {totalUpdatesAvailable > 0 && (
                <span className="font-medium text-orange-600 text-xs">
                  Disponíveis
                </span>
              )}
            </div>
            <div className="space-y-1">
              <div
                className={`font-bold text-2xl tracking-tight ${totalUpdatesAvailable > 0 ? "text-orange-600" : ""}`}
              >
                {totalUpdatesAvailable}
              </div>
              <p className="text-muted-foreground text-sm">Atualizações</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-1 border-border border-solid bg-gradient-to-br from-background to-purple-50/50 shadow-none dark:to-purple-950/20">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium text-muted-foreground text-xs">
                Instalados
              </span>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-2xl tracking-tight">
                {totalPlugins}
              </div>
              <p className="text-muted-foreground text-sm">Plugins</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-1 border-border border-solid bg-gradient-to-br from-background to-pink-50/50 shadow-none dark:to-pink-950/20">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-pink-100 p-2 dark:bg-pink-900">
                <Palette className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              </div>
              <span className="font-medium text-muted-foreground text-xs">
                Instalados
              </span>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-2xl tracking-tight">
                {totalThemes}
              </div>
              <p className="text-muted-foreground text-sm">Temas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WordPress Sites Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Instalações WordPress</CardTitle>
          <CardDescription>
            Gerencie todas as suas instalações WordPress em{" "}
            {user.selectedDomain || "seu domínio"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sites.length === 0 ? (
            <div className="py-8 text-center">
              <Globe className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-lg">
                Nenhuma instalação WordPress encontrada
              </h3>
              <p className="mb-4 text-muted-foreground">
                Crie sua primeira instalação WordPress para começar.
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Instalação
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Plugins</TableHead>
                  <TableHead>Temas</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map(site => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium">{site.url}</div>
                          <div className="text-muted-foreground text-sm">
                            {site.path}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          site.status === "Working"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : ""
                        }
                        variant={
                          site.status === "Working" ? "default" : "secondary"
                        }
                      >
                        {site.status === "Working" ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {site.status === "Working" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{site.version}</span>
                        {site.updatesAvailable?.core && (
                          <Badge
                            className="border-orange-200 text-orange-600"
                            variant="outline"
                          >
                            <ArrowUpCircle className="mr-1 h-3 w-3" />
                            Atualização
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{site.plugins?.length || 0}</span>
                        {site.updatesAvailable?.plugins &&
                          site.updatesAvailable.plugins.length > 0 && (
                            <Badge
                              className="border-orange-200 text-orange-600"
                              variant="outline"
                            >
                              {site.updatesAvailable.plugins.length} update
                              {site.updatesAvailable.plugins.length !== 1
                                ? "s"
                                : ""}
                            </Badge>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{site.themes?.length || 0}</span>
                        {site.updatesAvailable?.themes &&
                          site.updatesAvailable.themes.length > 0 && (
                            <Badge
                              className="border-orange-200 text-orange-600"
                              variant="outline"
                            >
                              {site.updatesAvailable.themes.length} update
                              {site.updatesAvailable.themes.length !== 1
                                ? "s"
                                : ""}
                            </Badge>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {site.createdAt
                            ? new Date(site.createdAt).toLocaleDateString(
                                "pt-BR"
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="h-8 w-8 p-0" variant="ghost">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a
                              href={site.url}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Visitar Site
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a
                              href={`${site.url}/wp-admin`}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Admin WordPress
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Logs
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Criar Backup
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            Gerenciar Usuários
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* WordPress Plugins Section */}
      {sites.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-2xl tracking-tight">
                <Package className="h-6 w-6 text-primary" />
                Plugins WordPress
              </h2>
              <p className="mt-1 text-muted-foreground">
                Gerencie plugins em todas as suas instalações WordPress
              </p>
            </div>
            <PluginBulkActions sites={sites} />
          </div>

          {sites.every(site => !site.plugins || site.plugins.length === 0) ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="mb-4 h-16 w-16 text-muted-foreground/50" />
                <h3 className="mb-2 font-semibold text-xl">
                  Nenhum plugin encontrado
                </h3>
                <p className="max-w-md text-center text-muted-foreground">
                  Os plugins serão exibidos aqui quando disponíveis nas suas
                  instalações WordPress.
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Instalar Primeiro Plugin
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {sites.map(
                site =>
                  site.plugins &&
                  site.plugins.length > 0 && (
                    <Card
                      className="overflow-hidden"
                      key={`plugins-${site.id}`}
                    >
                      <CardHeader className="border-b bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                              <Globe className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {site.url}
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                {site.plugins.length} plugin
                                {site.plugins.length !== 1 ? "s" : ""} instalado
                                {site.plugins.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {site.updatesAvailable?.plugins &&
                              site.updatesAvailable.plugins.length > 0 && (
                                <Badge
                                  className="border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                                  variant="outline"
                                >
                                  <ArrowUpCircle className="mr-1 h-3 w-3" />
                                  {site.updatesAvailable.plugins.length} update
                                  {site.updatesAvailable.plugins.length !== 1
                                    ? "s"
                                    : ""}
                                </Badge>
                              )}
                            <Badge
                              className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                              variant="secondary"
                            >
                              {
                                site.plugins.filter(p => p.status === "active")
                                  .length
                              }{" "}
                              ativo
                              {site.plugins.filter(p => p.status === "active")
                                .length !== 1
                                ? "s"
                                : ""}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {site.plugins.map(plugin => (
                            <Card
                              className="group border-0 bg-gradient-to-br from-background to-muted/20 shadow-sm transition-all duration-200 hover:shadow-md"
                              key={plugin.name}
                            >
                              <CardContent className="p-5">
                                <div className="mb-3 flex items-start justify-between">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="mb-1 truncate font-semibold text-base">
                                      {plugin.title || plugin.name}
                                    </h4>
                                    <p className="mb-2 line-clamp-2 text-muted-foreground text-sm">
                                      {plugin.description ||
                                        "Sem descrição disponível"}
                                    </p>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                        size="sm"
                                        variant="ghost"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-48"
                                    >
                                      <DropdownMenuItem>
                                        {plugin.status === "active" ? (
                                          <>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Desativar
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Ativar
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      {plugin.version <
                                        (plugin.updateVersion ?? 0) && (
                                        <DropdownMenuItem>
                                          <ArrowUpCircle className="mr-2 h-4 w-4" />
                                          Atualizar
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Configurações
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Remover
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        className={cn(
                                          "text-xs",
                                          plugin.status === "active"
                                            ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                            : "bg-muted"
                                        )}
                                        variant={
                                          plugin.status === "active"
                                            ? "default"
                                            : "outline"
                                        }
                                      >
                                        {plugin.status === "active" ? (
                                          <CheckCircle className="mr-1 h-3 w-3" />
                                        ) : (
                                          <XCircle className="mr-1 h-3 w-3" />
                                        )}
                                        {plugin.status === "active"
                                          ? "Ativo"
                                          : "Inativo"}
                                      </Badge>
                                      {plugin.version && (
                                        <span className="font-mono text-muted-foreground text-xs">
                                          v{plugin.version}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {plugin.version <
                                    (plugin.updateVersion ?? 0) && (
                                    <div className="flex flex-wrap gap-1">
                                      <Badge
                                        className="border-amber-200 bg-amber-50 text-amber-700 text-xs dark:bg-amber-950 dark:text-amber-300"
                                        variant="outline"
                                      >
                                        <ArrowUpCircle className="mr-1 h-3 w-3" />
                                        Update Disponível
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <div className="mt-6 flex items-center justify-between border-border/50 border-t pt-6">
                          <div className="text-muted-foreground text-sm">
                            <span className="font-medium text-foreground">
                              {
                                site.plugins.filter(p => p.status === "active")
                                  .length
                              }
                            </span>{" "}
                            de {site.plugins.length} plugins ativos
                          </div>
                          <div className="flex gap-2">
                            <Button className="h-9" size="sm" variant="outline">
                              <Plus className="mr-2 h-4 w-4" />
                              Instalar Plugin
                            </Button>
                            <Button className="h-9" size="sm" variant="outline">
                              <Package className="mr-2 h-4 w-4" />
                              Gerenciar Plugins
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
              )}
            </div>
          )}
        </div>
      )}

      {/* WordPress Themes Section */}
      {sites.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-2xl tracking-tight">
                <Palette className="h-6 w-6 text-primary" />
                Temas WordPress
              </h2>
              <p className="mt-1 text-muted-foreground">
                Gerencie temas em todas as suas instalações WordPress
              </p>
            </div>
            <ThemeBulkActions sites={sites} />
          </div>

          {sites.every(site => !site.themes || site.themes.length === 0) ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Palette className="mb-4 h-16 w-16 text-muted-foreground/50" />
                <h3 className="mb-2 font-semibold text-xl">
                  Nenhum tema encontrado
                </h3>
                <p className="max-w-md text-center text-muted-foreground">
                  Os temas serão exibidos aqui quando disponíveis nas suas
                  instalações WordPress.
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Instalar Primeiro Tema
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {sites.map(
                site =>
                  site.themes &&
                  site.themes.length > 0 && (
                    <Card className="overflow-hidden" key={`themes-${site.id}`}>
                      <CardHeader className="border-b bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
                              <Globe className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {site.url}
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                {site.themes.length} tema
                                {site.themes.length !== 1 ? "s" : ""} instalado
                                {site.themes.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {site.updatesAvailable?.themes &&
                              site.updatesAvailable.themes.length > 0 && (
                                <Badge
                                  className="border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                                  variant="outline"
                                >
                                  <ArrowUpCircle className="mr-1 h-3 w-3" />
                                  {site.updatesAvailable.themes.length} update
                                  {site.updatesAvailable.themes.length !== 1
                                    ? "s"
                                    : ""}
                                </Badge>
                              )}
                            <Badge
                              className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                              variant="secondary"
                            >
                              {
                                site.themes.filter(t => t.status === "active")
                                  .length
                              }{" "}
                              ativo
                              {site.themes.filter(t => t.status === "active")
                                .length !== 1
                                ? "s"
                                : ""}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {site.themes.map(theme => (
                            <Card
                              className="group border-0 bg-gradient-to-br from-background to-muted/20 shadow-sm transition-all duration-200 hover:shadow-md"
                              key={`${site.id}-${theme.name}`}
                            >
                              <CardContent className="p-5">
                                <div className="mb-3 flex items-start justify-between">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="mb-1 truncate font-semibold text-base">
                                      {theme.title || theme.name}
                                    </h4>
                                    <p className="mb-2 line-clamp-2 text-muted-foreground text-sm">
                                      {theme.description ||
                                        "Sem descrição disponível"}
                                    </p>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                        size="sm"
                                        variant="ghost"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-48"
                                    >
                                      <DropdownMenuItem>
                                        {theme.status === "active" ? (
                                          <>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Desativar
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Ativar
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      {theme.update && theme.update_version && (
                                        <DropdownMenuItem>
                                          <ArrowUpCircle className="mr-2 h-4 w-4" />
                                          Atualizar para v{theme.update_version}
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Personalizar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Download className="mr-2 h-4 w-4" />
                                        Backup
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Remover
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        className={cn(
                                          "text-xs",
                                          theme.status === "active"
                                            ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                            : "bg-muted"
                                        )}
                                        variant={
                                          theme.status === "active"
                                            ? "default"
                                            : "outline"
                                        }
                                      >
                                        {theme.status === "active" ? (
                                          <CheckCircle className="mr-1 h-3 w-3" />
                                        ) : (
                                          <XCircle className="mr-1 h-3 w-3" />
                                        )}
                                        {theme.status === "active"
                                          ? "Ativo"
                                          : "Inativo"}
                                      </Badge>
                                      {theme.version && (
                                        <span className="font-mono text-muted-foreground text-xs">
                                          v{theme.version}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {(theme.update || theme.auto_update) && (
                                    <div className="flex flex-wrap gap-1">
                                      {theme.update && theme.update_version && (
                                        <Badge
                                          className="border-amber-200 bg-amber-50 text-amber-700 text-xs dark:bg-amber-950 dark:text-amber-300"
                                          variant="outline"
                                        >
                                          <ArrowUpCircle className="mr-1 h-3 w-3" />
                                          v{theme.update_version}
                                        </Badge>
                                      )}
                                      {theme.auto_update && (
                                        <Badge
                                          className="border-blue-200 bg-blue-50 text-blue-700 text-xs dark:bg-blue-950 dark:text-blue-300"
                                          variant="outline"
                                        >
                                          Auto Update
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <div className="mt-6 flex items-center justify-between border-border/50 border-t pt-6">
                          <div className="text-muted-foreground text-sm">
                            <span className="font-medium text-foreground">
                              {
                                site.themes.filter(t => t.status === "active")
                                  .length
                              }
                            </span>{" "}
                            de {site.themes.length} temas ativos
                          </div>
                          <div className="flex gap-2">
                            <Button className="h-9" size="sm" variant="outline">
                              <Plus className="mr-2 h-4 w-4" />
                              Instalar Tema
                            </Button>
                            <Button className="h-9" size="sm" variant="outline">
                              <Palette className="mr-2 h-4 w-4" />
                              Gerenciar Temas
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="text-center">
            <Plus className="mx-auto h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <CardTitle className="text-lg">Nova Instalação</CardTitle>
            <CardDescription>
              Instale o WordPress em um novo diretório
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="group cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="text-center">
            <Package className="mx-auto h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <CardTitle className="text-lg">Gerenciar Plugins</CardTitle>
            <CardDescription>
              Instale, atualize e configure plugins
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="group cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="text-center">
            <Shield className="mx-auto h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <CardTitle className="text-lg">Segurança</CardTitle>
            <CardDescription>Configure backups e segurança</CardDescription>
          </CardHeader>
        </Card>

        <Card className="group cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="text-center">
            <Activity className="mx-auto h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <CardTitle className="text-lg">Monitoramento</CardTitle>
            <CardDescription>Acompanhe performance e logs</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
