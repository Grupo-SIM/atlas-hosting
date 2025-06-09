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
import {
  ArrowUpCircle,
  CheckCircle,
  ExternalLink,
  Globe,
  MoreHorizontal,
  Package,
  Palette,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Users,
  Activity,
  AlertTriangle,
  FileText,
  Calendar,
  Download,
  XCircle,
} from "lucide-react";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWordPressSitesForSelectedDomain } from "./actions";
import { revalidatePath } from "next/cache";
import { PluginCard } from "./components/plugin-card";
import { PluginBulkActions } from "./components/plugin-bulk-actions";
import { ThemeBulkActions } from "./components/theme-bulk-actions";
import { cn } from "@/lib/utils";

export default async function WordPressPage() {
  const user = await getUser();

  const sites = await getWordPressSitesForSelectedDomain();

  // Calculate stats from real data
  const totalSites = sites.length;
  const activeSites = sites.filter((site) => site.status === "Working").length;
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
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            WordPress
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas instalações WordPress para{" "}
            {user.selectedDomain || "seu domínio"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            type="submit"
            onClick={async () => {
              "use server";
              revalidatePath("/wordpress");
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Verificar Atualizações
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Instalação
          </Button>
        </div>
      </div>

      {/* WordPress Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="shadow-none border-1 border-solid border-border bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                +{activeSites > 0 ? Math.round((activeSites / totalSites) * 100) : 0}%
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight">{totalSites}</div>
              <p className="text-sm text-muted-foreground">Total de Sites</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-1 border-solid border-border bg-gradient-to-br from-background to-green-50/50 dark:to-green-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs text-green-600 font-medium">
                Funcionando
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight text-green-600">
                {activeSites}
              </div>
              <p className="text-sm text-muted-foreground">Sites Ativos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-1 border-solid border-border  bg-gradient-to-br from-background to-orange-50/50 dark:to-orange-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                <ArrowUpCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              {totalUpdatesAvailable > 0 && (
                <span className="text-xs text-orange-600 font-medium">
                  Disponíveis
                </span>
              )}
            </div>
            <div className="space-y-1">
              <div className={`text-2xl font-bold tracking-tight ${totalUpdatesAvailable > 0 ? "text-orange-600" : ""}`}>
                {totalUpdatesAvailable}
              </div>
              <p className="text-sm text-muted-foreground">Atualizações</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-1 border-solid border-border  bg-gradient-to-br from-background to-purple-50/50 dark:to-purple-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Instalados
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight">{totalPlugins}</div>
              <p className="text-sm text-muted-foreground">Plugins</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-1 border-solid border-border bg-gradient-to-br from-background to-pink-50/50 dark:to-pink-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900">
                <Palette className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Instalados
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight">{totalThemes}</div>
              <p className="text-sm text-muted-foreground">Temas</p>
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
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma instalação WordPress encontrada
              </h3>
              <p className="text-muted-foreground mb-4">
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
                {sites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium">{site.url}</div>
                          <div className="text-sm text-muted-foreground">
                            {site.path}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          site.status === "Working" ? "default" : "secondary"
                        }
                        className={
                          site.status === "Working"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : ""
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
                            variant="outline"
                            className="text-orange-600 border-orange-200"
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
                              variant="outline"
                              className="text-orange-600 border-orange-200"
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
                              variant="outline"
                              className="text-orange-600 border-orange-200"
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
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a
                              href={site.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Visitar Site
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a
                              href={`${site.url}/wp-admin`}
                              target="_blank"
                              rel="noopener noreferrer"
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
              <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Plugins WordPress
              </h2>
              <p className="text-muted-foreground mt-1">
                Gerencie plugins em todas as suas instalações WordPress
              </p>
            </div>
            <PluginBulkActions sites={sites} />
          </div>

          {sites.every(
            (site) => !site.plugins || site.plugins.length === 0
          ) ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhum plugin encontrado
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Os plugins serão exibidos aqui quando disponíveis nas suas instalações WordPress.
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
                (site) =>
                  site.plugins &&
                  site.plugins.length > 0 && (
                    <Card key={`plugins-${site.id}`} className="overflow-hidden">
                      <CardHeader className="bg-muted/30 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <Globe className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{site.url}</h3>
                              <p className="text-sm text-muted-foreground">
                                {site.plugins.length} plugin{site.plugins.length !== 1 ? "s" : ""} instalado{site.plugins.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {site.updatesAvailable?.plugins &&
                              site.updatesAvailable.plugins.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300"
                                >
                                  <ArrowUpCircle className="mr-1 h-3 w-3" />
                                  {site.updatesAvailable.plugins.length} update{site.updatesAvailable.plugins.length !== 1 ? "s" : ""}
                                </Badge>
                              )}
                            <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                              {site.plugins.filter((p) => p.status === "active").length} ativo{site.plugins.filter((p) => p.status === "active").length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {site.plugins.map((plugin) => (
                            <Card key={`${site.id}-${plugin.update_id}`} className="group hover:shadow-md transition-all duration-200 border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
                              <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-base mb-1 truncate">
                                      {plugin.title || plugin.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                      {plugin.description || "Sem descrição disponível"}
                                    </p>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
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
                                      {plugin.updateAvailable && (
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
                                        variant={plugin.status === "active" ? "default" : "outline"}
                                        className={cn(
                                          "text-xs",
                                          plugin.status === "active"
                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                                            : "bg-muted"
                                        )}
                                      >
                                        {plugin.status === "active" ? (
                                          <CheckCircle className="mr-1 h-3 w-3" />
                                        ) : (
                                          <XCircle className="mr-1 h-3 w-3" />
                                        )}
                                        {plugin.status === "active" ? "Ativo" : "Inativo"}
                                      </Badge>
                                      {plugin.version && (
                                        <span className="text-xs text-muted-foreground font-mono">
                                          v{plugin.version}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {plugin.updateAvailable && (
                                    <div className="flex flex-wrap gap-1">
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
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

                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {site.plugins.filter((p) => p.status === "active").length}
                            </span>{" "}
                            de {site.plugins.length} plugins ativos
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-9">
                              <Plus className="mr-2 h-4 w-4" />
                              Instalar Plugin
                            </Button>
                            <Button variant="outline" size="sm" className="h-9">
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
              <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <Palette className="h-6 w-6 text-primary" />
                Temas WordPress
              </h2>
              <p className="text-muted-foreground mt-1">
                Gerencie temas em todas as suas instalações WordPress
              </p>
            </div>
            <ThemeBulkActions sites={sites} />
          </div>

          {sites.every(
            (site) => !site.themes || site.themes.length === 0
          ) ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Palette className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhum tema encontrado
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Os temas serão exibidos aqui quando disponíveis nas suas instalações WordPress.
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
                (site) =>
                  site.themes &&
                  site.themes.length > 0 && (
                    <Card key={`themes-${site.id}`} className="overflow-hidden">
                      <CardHeader className="bg-muted/30 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                              <Globe className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{site.url}</h3>
                              <p className="text-sm text-muted-foreground">
                                {site.themes.length} tema{site.themes.length !== 1 ? "s" : ""} instalado{site.themes.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {site.updatesAvailable?.themes &&
                              site.updatesAvailable.themes.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300"
                                >
                                  <ArrowUpCircle className="mr-1 h-3 w-3" />
                                  {site.updatesAvailable.themes.length} update{site.updatesAvailable.themes.length !== 1 ? "s" : ""}
                                </Badge>
                              )}
                            <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                              {site.themes.filter((t) => t.status === "active").length} ativo{site.themes.filter((t) => t.status === "active").length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {site.themes.map((theme) => (
                            <Card key={`${site.id}-${theme.name}`} className="group hover:shadow-md transition-all duration-200 border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
                              <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-base mb-1 truncate">
                                      {theme.title || theme.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                      {theme.description || "Sem descrição disponível"}
                                    </p>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
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
                                        variant={theme.status === "active" ? "default" : "outline"}
                                        className={cn(
                                          "text-xs",
                                          theme.status === "active"
                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                                            : "bg-muted"
                                        )}
                                      >
                                        {theme.status === "active" ? (
                                          <CheckCircle className="mr-1 h-3 w-3" />
                                        ) : (
                                          <XCircle className="mr-1 h-3 w-3" />
                                        )}
                                        {theme.status === "active" ? "Ativo" : "Inativo"}
                                      </Badge>
                                      {theme.version && (
                                        <span className="text-xs text-muted-foreground font-mono">
                                          v{theme.version}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {(theme.update || theme.auto_update) && (
                                    <div className="flex flex-wrap gap-1">
                                      {theme.update && theme.update_version && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                                        >
                                          <ArrowUpCircle className="mr-1 h-3 w-3" />
                                          v{theme.update_version}
                                        </Badge>
                                      )}
                                      {theme.auto_update && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
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

                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {site.themes.filter((t) => t.status === "active").length}
                            </span>{" "}
                            de {site.themes.length} temas ativos
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-9">
                              <Plus className="mr-2 h-4 w-4" />
                              Instalar Tema
                            </Button>
                            <Button variant="outline" size="sm" className="h-9">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardHeader className="text-center">
            <Plus className="h-8 w-8 mx-auto text-primary group-hover:scale-110 transition-transform" />
            <CardTitle className="text-lg">Nova Instalação</CardTitle>
            <CardDescription>
              Instale o WordPress em um novo diretório
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardHeader className="text-center">
            <Package className="h-8 w-8 mx-auto text-primary group-hover:scale-110 transition-transform" />
            <CardTitle className="text-lg">Gerenciar Plugins</CardTitle>
            <CardDescription>
              Instale, atualize e configure plugins
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardHeader className="text-center">
            <Shield className="h-8 w-8 mx-auto text-primary group-hover:scale-110 transition-transform" />
            <CardTitle className="text-lg">Segurança</CardTitle>
            <CardDescription>Configure backups e segurança</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardHeader className="text-center">
            <Activity className="h-8 w-8 mx-auto text-primary group-hover:scale-110 transition-transform" />
            <CardTitle className="text-lg">Monitoramento</CardTitle>
            <CardDescription>Acompanhe performance e logs</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
