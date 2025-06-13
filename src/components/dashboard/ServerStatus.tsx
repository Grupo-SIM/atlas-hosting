import { getWordPressSitesForSelectedDomain } from "@/app/(auth)/wordpress/actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SslFixButton } from "@/components/dashboard/ServerStatusClient";
import { getUser } from "@/lib/auth";
import namecheapApi from "@/lib/server/apis/namecheap";
import pleskApi from "@/lib/server/apis/plesk";
import WpCliApi, {
  type WpPluginList,
  type WpThemeList,
} from "@/lib/server/apis/plesk/wp-toolkit/wp-cli";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  HelpCircle,
  Layers,
  Monitor,
  Power,
  Server,
  ShieldCheck,
  XCircle,
  Zap,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  status: "operational" | "issues" | "error" | "unknown";
  details: string;
  icon: React.ReactNode;
  fixable?: boolean;
  domainName?: string;
  metrics?: {
    value?: number | string;
    max?: number;
    label?: string;
    trend?: "up" | "down" | "stable";
  };
}

// Simplified helper from your worker - ensure it's robust or use a library
function getDomainParts(
  domainName: string
): { sld: string; tld: string } | null {
  const domainParts = domainName.split(".");
  if (domainParts.length < 2) return null;
  const commonSecondLevel = ["co", "com", "org", "net", "gov", "ac", "edu"];
  if (
    domainParts.length > 2 &&
    commonSecondLevel.includes(
      domainParts[domainParts.length - 2].toLowerCase()
    )
  ) {
    const tld = domainParts.slice(-2).join(".");
    const sld = domainParts.slice(0, -2).join(".");
    return { sld, tld };
  }
  // If not a common second-level domain or only two parts (e.g., example.com)
  const tld = domainParts.pop()?.toLowerCase() || "";
  const sld = domainParts.join(".");
  if (!tld || !sld) return null;
  return { sld, tld };
}

export async function ServerStatus() {
  const user = await getUser();

  if (!user.selectedDomain) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="text-lg font-semibold">
            Status dos Serviços
          </CardTitle>
          <CardDescription className="text-sm">
            Nenhum domínio selecionado para monitoramento
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground py-4 text-center">
            Por favor, selecione um domínio para visualizar o status dos
            serviços.
          </p>
        </CardContent>
      </Card>
    );
  }

  const domainName = user.selectedDomain;
  const services: Service[] = [];

  // Initialize WordPress CLI API

  try {
    // Get ALL WordPress instances for the domain (not just selected)
    const sites = await getWordPressSitesForSelectedDomain();
    // Get all WordPress sites that match this domain (including subdomains, paths, etc.)
    const wpSites = sites.filter((site) => {
      try {
        const siteHostname = new URL(site.domain).hostname;
        return (
          siteHostname === domainName ||
          siteHostname === `www.${domainName}` ||
          siteHostname.endsWith(`.${domainName}`)
        );
      } catch (e) {
        return false;
      }
    });

    // 1. Web Hosting (Plesk) - Real Implementation
    try {
      const pleskDomain = await pleskApi.getDomain(domainName);
      if (pleskDomain) {
        const domainStatus = await pleskApi.domainsApi.domainsIdStatusGet(
          pleskDomain.id as number
        );
        const status = domainStatus.data;

        if (status && typeof status === "object" && "status" in status) {
          const statusObj = status as { status?: string };
          const hostingStatus =
            statusObj.status === "active" ? "operational" : "issues";
          services.push({
            id: "hosting",
            name: "Hospedagem Web",
            status: hostingStatus,
            details: `Domínio Configurado - Status: ${(statusObj.status === "active" && "Ativo") ?? "Inativo"}`,
            icon: <Server className="h-5 w-5" />,
            metrics: {
              value: hostingStatus === "operational" ? "100" : "0",
              max: 100,
              label: "Tempo Online",
              trend: hostingStatus === "operational" ? "stable" : "down",
            },
          });
        } else {
          services.push({
            id: "hosting",
            name: "Hospedagem Web",
            status: "operational",
            details: `Domínio Plesk Ativo - ID: ${pleskDomain.id}`,
            icon: <Server className="h-5 w-5" />,
            metrics: {
              value: "100",
              max: 100,
              label: "Tempo Online",
              trend: "stable",
            },
          });
        }
      } else {
        services.push({
          id: "hosting",
          name: "Hospedagem Web",
          status: "error",
          details: "Domínio não encontrado no painel de hospedagem Plesk",
          icon: <Server className="h-5 w-5" />,
        });
      }
    } catch (error) {
      console.error(
        `Error fetching Plesk hosting status for ${domainName}:`,
        error
      );
      services.push({
        id: "hosting",
        name: "Hospedagem Web",
        status: "error",
        details: "Não foi possível obter o status da hospedagem do Plesk",
        icon: <Server className="h-5 w-5" />,
      });
    }

    // 2. SSL Certificate - Real Implementation
    try {
      // Check SSL using HTTP request to the domain
      const sslResponse = await fetch(`https://${domainName}`, {
        method: "HEAD",
        signal: AbortSignal.timeout(10000),
      }).catch(() => null);

      if (sslResponse?.ok) {
        services.push({
          id: "ssl",
          name: "Certificado SSL",
          status: "operational",
          details: "Certificado SSL válido detectado - HTTPS acessível",
          icon: <ShieldCheck className="h-5 w-5" />,
          fixable: false,
          domainName,
          metrics: {
            value: "Válido",
            label: "Status do Certificado",
            trend: "stable",
          },
        });
      } else {
        const httpResponse = await fetch(`http://${domainName}`, {
          method: "HEAD",
          signal: AbortSignal.timeout(10000),
        }).catch(() => null);

        if (httpResponse?.ok) {
          services.push({
            id: "ssl",
            name: "Certificado SSL",
            status: "issues",
            details:
              "Site acessível via HTTP mas SSL/HTTPS não está funcionando",
            icon: <ShieldCheck className="h-5 w-5" />,
            fixable: true,
            domainName,
          });
        } else {
          services.push({
            id: "ssl",
            name: "Certificado SSL",
            status: "error",
            details:
              "Site não acessível - Verifique configuração DNS e hospedagem",
            icon: <ShieldCheck className="h-5 w-5" />,
            fixable: true,
            domainName,
          });
        }
      }
    } catch (error) {
      console.error(`Error checking SSL status for ${domainName}:`, error);
      services.push({
        id: "ssl",
        name: "Certificado SSL",
        status: "error",
        details: "Não foi possível verificar o status do certificado SSL",
        icon: <ShieldCheck className="h-5 w-5" />,
        fixable: true,
        domainName,
      });
    }

    // 3. DNS Records (Namecheap) - Real Implementation
    const domainParts = getDomainParts(domainName);
    if (domainParts) {
      try {
        const dnsResponse = await namecheapApi.getDnsHosts({
          SLD: domainParts.sld,
          TLD: domainParts.tld,
        });

        const hasARecord = dnsResponse.Hosts?.some(
          (record) =>
            record.Type === "A" &&
            (record.Name === "@" ||
              record.Name === domainName ||
              record.Name === "")
        );

        const hasMXRecord = dnsResponse.Hosts?.some(
          (record) => record.Type === "MX"
        );
        const recordCount = dnsResponse.Hosts?.length || 0;

        if (hasARecord) {
          services.push({
            id: "dns",
            name: "Registros DNS",
            status: "operational",
            details: `${recordCount} registros DNS configurados - Registro A encontrado`,
            icon: <Globe className="h-5 w-5" />,
            metrics: {
              value: recordCount,
              label: "Registros DNS",
              trend: "stable",
            },
          });
        } else {
          services.push({
            id: "dns",
            name: "Registros DNS",
            status: "issues",
            details: `${recordCount} registros DNS encontrados mas faltando registro A essencial`,
            icon: <Globe className="h-5 w-5" />,
          });
        }
      } catch (error) {
        console.error(`Error fetching DNS status for ${domainName}:`, error);
        services.push({
          id: "dns",
          name: "Registros DNS",
          status: "error",
          details: "Não foi possível obter registros DNS do Namecheap",
          icon: <Globe className="h-5 w-5" />,
        });
      }
    } else {
      services.push({
        id: "dns",
        name: "Registros DNS",
        status: "unknown",
        details: "Formato de domínio inválido para verificação DNS",
        icon: <Globe className="h-5 w-5" />,
      });
    }

    // 4. WordPress Application Health - Real Implementation with Enhanced Multi-Site Monitoring
    if (wpSites.length > 0) {
      try {
        let totalPluginCount = 0;
        let totalPluginUpdates = 0;
        let totalThemeCount = 0;
        let totalThemeUpdates = 0;
        let totalCoreUpdates = 0;
        let operationalSites = 0;
        let sitesWithIssues = 0;

        // Aggregate data from all WordPress sites
        for (const wpSite of wpSites) {
          try {
            const siteIdNumber = wpSite.id;
            const wpCliWithInstance = new WpCliApi(siteIdNumber);

            // Check WordPress core version and updates
            let coreStatus = "operational";
            try {
              const coreUpdate = await wpCliWithInstance.core.checkUpdate({
                format: "json",
              });
              if (
                coreUpdate &&
                Array.isArray(coreUpdate) &&
                coreUpdate.length > 0
              ) {
                totalCoreUpdates++;
                coreStatus = "issues";
              }
            } catch {
              // If no updates, continue with operational status
            }

            // Check plugins for this site
            try {
              const plugins = (await wpCliWithInstance.plugin.list({
                format: "json",
                fields: "name,status,update,version",
              })) as WpPluginList[];

              const sitePluginCount = plugins?.length || 0;
              const sitePluginUpdates =
                plugins?.filter(
                  (plugin) => String(plugin.update) === "available"
                ).length || 0;

              totalPluginCount += sitePluginCount;
              totalPluginUpdates += sitePluginUpdates;
            } catch (error) {
              console.error(
                `Error fetching plugins for site ${wpSite.id}:`,
                error
              );
            }

            // Check themes for this site
            try {
              const themes = (await wpCliWithInstance.theme.list({
                format: "json",
                fields: "name,status,update,version",
              })) as WpThemeList[];

              const siteThemeCount = themes?.length || 0;
              const siteThemeUpdates =
                themes?.filter((theme) => String(theme.update) === "available")
                  .length || 0;

              totalThemeCount += siteThemeCount;
              totalThemeUpdates += siteThemeUpdates;
            } catch (error) {
              console.error(
                `Error fetching themes for site ${wpSite.id}:`,
                error
              );
            }

            // Count operational vs sites with issues
            const siteUpdates = coreStatus === "issues" ? 1 : 0;
            if (siteUpdates === 0) {
              operationalSites++;
            } else {
              sitesWithIssues++;
            }
          } catch (error) {
            console.error(
              `Error processing WordPress site ${wpSite.id}:`,
              error
            );
            sitesWithIssues++;
          }
        }

        // Calculate overall WordPress health across all sites
        const totalUpdates =
          totalPluginUpdates + totalThemeUpdates + totalCoreUpdates;
        const wpStatus = totalUpdates > 0 ? "issues" : "operational";
        const healthScore = Math.max(0, 100 - totalUpdates * 5); // Less penalty per update for multi-site

        services.push({
          id: "wp-overview",
          name: "Visão Geral WordPress",
          status: wpStatus,
          details: `${wpSites.length} site${wpSites.length > 1 ? "s" : ""} WordPress - ${operationalSites} operacional${operationalSites !== 1 ? "is" : ""}, ${sitesWithIssues} com problemas`,
          icon: <Monitor className="h-5 w-5" />,
          metrics: {
            value: wpSites.length,
            label: "Sites WP",
            trend: sitesWithIssues === 0 ? "stable" : "down",
          },
        });

        services.push({
          id: "wp-core",
          name: "WordPress Core",
          status: totalCoreUpdates > 0 ? "issues" : "operational",
          details:
            totalCoreUpdates > 0
              ? `${totalCoreUpdates} site${totalCoreUpdates > 1 ? "s" : ""} precisam de atualizações do core`
              : `Todos os ${wpSites.length} sites têm a versão mais recente do WordPress`,
          icon: <Power className="h-5 w-5" />,
          metrics: {
            value:
              totalCoreUpdates > 0 ? "Atualizações Disponíveis" : "Atualizado",
            label: "Status do Core",
            trend: totalCoreUpdates === 0 ? "stable" : "down",
          },
        });

        services.push({
          id: "wp-plugins",
          name: "WordPress Plugins",
          status: totalPluginUpdates > 0 ? "issues" : "operational",
          details: `${totalPluginCount} plugins totais em ${wpSites.length} site${wpSites.length > 1 ? "s" : ""}, ${totalPluginUpdates} atualizações disponíveis`,
          icon: <Layers className="h-5 w-5" />,
          metrics: {
            value: totalPluginCount,
            label: "Total Plugins",
            trend: totalPluginUpdates > 0 ? "down" : "stable",
          },
        });

        services.push({
          id: "wp-themes",
          name: "WordPress Themes",
          status: totalThemeUpdates > 0 ? "issues" : "operational",
          details: `${totalThemeCount} temas totais em ${wpSites.length} site${wpSites.length > 1 ? "s" : ""}, ${totalThemeUpdates} atualizações disponíveis`,
          icon: <Monitor className="h-5 w-5" />,
          metrics: {
            value: totalThemeCount,
            label: "Total Temas",
            trend: totalThemeUpdates > 0 ? "down" : "stable",
          },
        });

        services.push({
          id: "wp-health",
          name: "Saúde WordPress",
          status: wpStatus,
          details: `Score Geral de Saúde: ${healthScore}% - ${totalUpdates} atualizações pendentes em todos os sites`,
          icon: <Activity className="h-5 w-5" />,
          metrics: {
            value: healthScore,
            max: 100,
            label: "Score de Saúde",
            trend:
              healthScore > 80 ? "stable" : healthScore > 50 ? "down" : "down",
          },
        });
      } catch (error) {
        console.error(
          `Error checking WordPress health for domain ${domainName}:`,
          error
        );
        services.push({
          id: "wp-error",
          name: "Sites WordPress",
          status: "error",
          details: "Não foi possível obter informações dos sites WordPress",
          icon: <Power className="h-5 w-5" />,
        });
      }
    } else {
      // Check basic site accessibility if no WordPress instance found
      try {
        const response = await fetch(`https://${domainName}`, {
          method: "HEAD",
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          services.push({
            id: "site-access",
            name: "Acessibilidade do Site",
            status: "operational",
            details: `Site está acessível (HTTP ${response.status})`,
            icon: <Globe className="h-5 w-5" />,
            metrics: {
              value: response.status,
              label: "Status HTTP",
              trend: "stable",
            },
          });
        } else {
          services.push({
            id: "site-access",
            name: "Acessibilidade do Site",
            status: "issues",
            details: `Site retornou HTTP ${response.status}`,
            icon: <Globe className="h-5 w-5" />,
          });
        }
      } catch (error) {
        services.push({
          id: "site-access",
          name: "Acessibilidade do Site",
          status: "error",
          details: "Site não está acessível ou expirou o tempo limite",
          icon: <Globe className="h-5 w-5" />,
        });
      }
    }
  } catch (error) {
    console.error("Error in ServerStatus component:", error);
    services.push({
      id: "error",
      name: "Erro do Sistema",
      status: "error",
      details: "Ocorreu um erro ao verificar o status dos serviços",
      icon: <XCircle className="h-5 w-5" />,
    });
  }

  const getStatusColor = (status: Service["status"]) => {
    switch (status) {
      case "operational":
        return "text-emerald-600 dark:text-emerald-400";
      case "issues":
        return "text-amber-600 dark:text-amber-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-slate-600 dark:text-slate-400";
    }
  };

  const getStatusBgColor = (status: Service["status"]) => {
    switch (status) {
      case "operational":
        return "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
      case "issues":
        return "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
      case "error":
        return "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20";
      default:
        return "bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20";
    }
  };

  const getStatusIcon = (status: Service["status"]) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-4 w-4" />;
      case "issues":
        return <AlertTriangle className="h-4 w-4" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend?: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <Zap className="h-3 w-3 text-emerald-500" />;
      case "down":
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case "stable":
        return <Activity className="h-3 w-3 text-emerald-500" />;
      default:
        return null;
    }
  };

  // Calculate overall health score
  const operationalCount = services.filter(
    (s) => s.status === "operational"
  ).length;
  const totalServices = services.length;
  const healthScore =
    totalServices > 0
      ? Math.round((operationalCount / totalServices) * 100)
      : 0;

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border-0 bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="border-b border-border/40 pb-6 bg-gradient-to-r from-background to-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Status dos Serviços
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Monitoramento em tempo real para{" "}
              <span className="font-semibold text-primary">{domainName}</span>
            </CardDescription>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div
                className={`text-2xl font-bold ${getHealthColor(healthScore)}`}
              >
                {healthScore}%
              </div>
              <div className="text-xs text-muted-foreground">
                Score de Saúde
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Monitor className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Overall Health Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Saúde Geral do Sistema
            </span>
            <span className="text-xs text-muted-foreground">
              {operationalCount}/{totalServices} serviços operacionais
            </span>
          </div>
          <Progress value={healthScore} className="h-2 bg-muted/50" />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {services.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhuma informação de serviço disponível ou site não totalmente
              configurado.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className={`
                  relative group rounded-xl border-2 p-4 transition-all duration-300 ease-in-out
                  hover:shadow-md hover:-translate-y-0.5 cursor-pointer
                  ${getStatusBgColor(service.status)}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Service Icon */}
                    <div
                      className={`
                      p-3 rounded-xl transition-colors duration-200
                      ${
                        service.status === "operational"
                          ? "bg-emerald-100 dark:bg-emerald-500/20"
                          : service.status === "issues"
                            ? "bg-amber-100 dark:bg-amber-500/20"
                            : service.status === "error"
                              ? "bg-red-100 dark:bg-red-500/20"
                              : "bg-slate-100 dark:bg-slate-500/20"
                      }
                      ${getStatusColor(service.status)}
                    `}
                    >
                      {service.icon}
                    </div>

                    {/* Service Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-sm text-foreground">
                          {service.name}
                        </h3>
                        {service.metrics?.trend &&
                          getTrendIcon(service.metrics.trend)}
                      </div>

                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {service.details}
                      </p>

                      {/* Metrics Display */}
                      {service.metrics && (
                        <div className="space-y-2">
                          {typeof service.metrics.max === "number" &&
                          typeof service.metrics.value === "number" ? (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {service.metrics.label}
                                </span>
                                <span className="text-xs font-mono text-foreground">
                                  {service.metrics.value}%
                                </span>
                              </div>
                              <Progress
                                value={service.metrics.value}
                                className="h-1.5"
                              />
                            </div>
                          ) : (
                            service.metrics.value && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {service.metrics.label}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-xs font-mono"
                                >
                                  {service.metrics.value}
                                </Badge>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {/* SSL Fix Button */}
                      {service.id === "ssl" && service.fixable && service.domainName && (
                        <SslFixButton 
                          domainName={service.domainName} 
                          serviceStatus={service.status} 
                        />
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center ml-4">
                    <Badge
                      variant="outline"
                      className={`
                        text-xs font-medium px-3 py-1 border-0 shadow-sm
                        ${
                          service.status === "operational"
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : service.status === "issues"
                              ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                              : service.status === "error"
                                ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300"
                                : "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300"
                        }
                      `}
                    >
                      <span className="flex items-center space-x-1.5">
                        {getStatusIcon(service.status)}
                        <span className="capitalize font-medium">
                          {service.status}
                        </span>
                      </span>
                    </Badge>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 dark:from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}

            {/* Summary Footer */}
            <div className="mt-6 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Última atualização: {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>
                      {
                        services.filter((s) => s.status === "operational")
                          .length
                      }{" "}
                      Operacional
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>
                      {services.filter((s) => s.status === "issues").length}{" "}
                      Problemas
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>
                      {services.filter((s) => s.status === "error").length}{" "}
                      Erros
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
