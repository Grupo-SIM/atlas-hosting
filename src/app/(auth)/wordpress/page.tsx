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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Sites
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSites}</div>
            <p className="text-xs text-muted-foreground">
              {activeSites} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeSites}
            </div>
            <p className="text-xs text-muted-foreground">
              WordPress funcionando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atualizações</CardTitle>
            <ArrowUpCircle
              className={`h-4 w-4 ${totalUpdatesAvailable > 0 ? "text-orange-600" : "text-muted-foreground"}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalUpdatesAvailable > 0 ? "text-orange-600" : ""}`}
            >
              {totalUpdatesAvailable}
            </div>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plugins</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlugins}</div>
            <p className="text-xs text-muted-foreground">Instalados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temas</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalThemes}</div>
            <p className="text-xs text-muted-foreground">Instalados</p>
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Plugins WordPress
                </CardTitle>
                <CardDescription>
                  Gerencie plugins em todas as suas instalações WordPress
                </CardDescription>
              </div>
              <PluginBulkActions sites={sites} />
            </div>
          </CardHeader>
          <CardContent>
            {sites.every(
              (site) => !site.plugins || site.plugins.length === 0
            ) ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum plugin encontrado
                </h3>
                <p className="text-muted-foreground">
                  Os plugins serão exibidos aqui quando disponíveis.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sites.map(
                  (site) =>
                    site.plugins &&
                    site.plugins.length > 0 && (
                      <div key={site.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{site.url}</h4>
                              <p className="text-sm text-muted-foreground">
                                {site.plugins.length} plugin
                                {site.plugins.length !== 1 ? "s" : ""} instalado
                                {site.plugins.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {site.updatesAvailable?.plugins &&
                              site.updatesAvailable.plugins.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-orange-600 border-orange-200"
                                >
                                  <ArrowUpCircle className="mr-1 h-3 w-3" />
                                  {site.updatesAvailable.plugins.length} update
                                  {site.updatesAvailable.plugins.length !== 1
                                    ? "s"
                                    : ""}
                                </Badge>
                              )}
                            <Badge variant="secondary">
                              {
                                site.plugins.filter(
                                  (p) => p.status === "active"
                                ).length
                              }{" "}
                              ativo
                              {site.plugins.filter((p) => p.status === "active")
                                .length !== 1
                                ? "s"
                                : ""}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {site.plugins.map((plugin) => (
                            <Card key={plugin.update_id} className="relative">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-sm mb-1">
                                      {plugin.title || plugin.name}
                                    </h5>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      {plugin.description || "Sem descrição"}
                                    </p>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                      >
                                        <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
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

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Badge
                                      variant={
                                        plugin.status === "active"
                                          ? "default"
                                          : "secondary"
                                      }
                                      className={
                                        plugin.status === "active"
                                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                          : ""
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
                                    {plugin.updateAvailable && (
                                      <Badge
                                        variant="outline"
                                        className="text-orange-600 border-orange-200"
                                      >
                                        <ArrowUpCircle className="mr-1 h-3 w-3" />
                                        Update
                                      </Badge>
                                    )}
                                  </div>
                                  {plugin.version && (
                                    <span className="text-xs text-muted-foreground">
                                      v{plugin.version}
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            {
                              site.plugins.filter((p) => p.status === "active")
                                .length
                            }{" "}
                            de {site.plugins.length} plugins ativos
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Plus className="mr-2 h-4 w-4" />
                              Instalar Plugin
                            </Button>
                            <Button variant="outline" size="sm">
                              <Package className="mr-2 h-4 w-4" />
                              Gerenciar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* WordPress Themes Section */}
      {sites.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Temas WordPress
                </CardTitle>
                <CardDescription>
                  Gerencie temas em todas as suas instalações WordPress
                </CardDescription>
              </div>
              <ThemeBulkActions sites={sites} />
            </div>
          </CardHeader>
          <CardContent>
            {sites.every(
              (site) => !site.themes || site.themes.length === 0
            ) ? (
              <div className="text-center py-8">
                <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum tema encontrado
                </h3>
                <p className="text-muted-foreground">
                  Os temas serão exibidos aqui quando disponíveis.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sites.map(
                  (site) =>
                    site.themes &&
                    site.themes.length > 0 && (
                      <div key={`themes-${site.id}`} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                              <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{site.url}</h4>
                              <p className="text-sm text-muted-foreground">
                                {site.themes.length} tema
                                {site.themes.length !== 1 ? "s" : ""} instalado
                                {site.themes.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {site.updatesAvailable?.themes &&
                              site.updatesAvailable.themes.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-orange-600 border-orange-200"
                                >
                                  <ArrowUpCircle className="mr-1 h-3 w-3" />
                                  {site.updatesAvailable.themes.length} update
                                  {site.updatesAvailable.themes.length !== 1
                                    ? "s"
                                    : ""}
                                </Badge>
                              )}
                            <Badge variant="secondary">
                              {
                                site.themes.filter(
                                  (t) => t.status === "active"
                                ).length
                              }{" "}
                              ativo
                              {site.themes.filter((t) => t.status === "active")
                                .length !== 1
                                ? "s"
                                : ""}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {site.themes.map((theme) => (
                            <Card key={`${site.id}-${theme.name}`} className="relative">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-sm mb-1">
                                      {theme.title || theme.name}
                                    </h5>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      {theme.description || "Sem descrição"}
                                    </p>
                                    {theme.update_id && (
                                      <p className="text-xs text-muted-foreground">
                                        ID: {theme.update_id}
                                      </p>
                                    )}
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                      >
                                        <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
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

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Badge
                                      variant={
                                        theme.status === "active"
                                          ? "default"
                                          : "secondary"
                                      }
                                      className={
                                        theme.status === "active"
                                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                          : ""
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
                                    {theme.update && theme.update_version && (
                                      <Badge
                                        variant="outline"
                                        className="text-orange-600 border-orange-200"
                                      >
                                        <ArrowUpCircle className="mr-1 h-3 w-3" />
                                        v{theme.update_version}
                                      </Badge>
                                    )}
                                    {theme.auto_update && (
                                      <Badge
                                        variant="outline"
                                        className="text-blue-600 border-blue-200"
                                      >
                                        Auto Update
                                      </Badge>
                                    )}
                                  </div>
                                  {theme.version && (
                                    <span className="text-xs text-muted-foreground">
                                      v{theme.version}
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            {
                              site.themes.filter((t) => t.status === "active")
                                .length
                            }{" "}
                            de {site.themes.length} temas ativos
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Plus className="mr-2 h-4 w-4" />
                              Instalar Tema
                            </Button>
                            <Button variant="outline" size="sm">
                              <Palette className="mr-2 h-4 w-4" />
                              Gerenciar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                )}
              </div>
            )}
          </CardContent>
        </Card>
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
