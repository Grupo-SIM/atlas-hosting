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
import { Suspense } from "react";
import { getWordPressSitesForSelectedDomain } from "@/app/(auth)/sites/wordpress-specific/actions";
import { SslFixButton } from "@/components/dashboard/ServerStatusClient";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/lib/db/schema";
import { cloudflareApi } from "@/lib/server/apis/cloudflare";
import pleskApi from "@/lib/server/apis/plesk";
import WpCliApi, {
  type WpPluginList,
  type WpThemeList,
} from "@/lib/server/apis/plesk/wp-toolkit/wp-cli";

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

// Async component for Web Hosting service status
async function HostingServiceBlock({
  domainName,
  hostingPromise,
}: {
  domainName: string;
  hostingPromise: Promise<Service>;
}) {
  const service = await hostingPromise;
  return <ServiceBlock service={service} />;
}

// Async component for SSL Certificate service status
async function SslServiceBlock({
  domainName,
  sslPromise,
}: {
  domainName: string;
  sslPromise: Promise<Service>;
}) {
  const service = await sslPromise;
  return <ServiceBlock service={service} />;
}

// Async component for DNS Records service status
async function DnsServiceBlock({
  domainName,
  dnsPromise,
}: {
  domainName: string;
  dnsPromise: Promise<Service>;
}) {
  const service = await dnsPromise;
  return <ServiceBlock service={service} />;
}

// Async component for WordPress services status
async function WordPressServicesBlock({
  domainName,
  wpPromise,
}: {
  domainName: string;
  wpPromise: Promise<Service[]>;
}) {
  const services = await wpPromise;
  return (
    <>
      {services.map(service => (
        <ServiceBlock key={service.id} service={service} />
      ))}
    </>
  );
}

// Async component for Site Access service status
async function SiteAccessServiceBlock({
  domainName,
  siteAccessPromise,
}: {
  domainName: string;
  siteAccessPromise: Promise<Service>;
}) {
  const service = await siteAccessPromise;
  return <ServiceBlock service={service} />;
}

// Reusable service block component
function ServiceBlock({ service }: { service: Service }) {
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

  return (
    <div
      className={`group relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md ${getStatusBgColor(service.status)}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-1 items-start space-x-4">
          {/* Service Icon */}
          <div
            className={`rounded-xl p-3 transition-colors duration-200 ${
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
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center space-x-2">
              <h3 className="font-semibold text-foreground text-sm">
                {service.name}
              </h3>
              {service.metrics?.trend && getTrendIcon(service.metrics.trend)}
            </div>

            <p className="mb-3 text-muted-foreground text-xs leading-relaxed">
              {service.details}
            </p>

            {/* Metrics Display */}
            {service.metrics && (
              <div className="space-y-2">
                {typeof service.metrics.max === "number" &&
                typeof service.metrics.value === "number" ? (
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium text-muted-foreground text-xs">
                        {service.metrics.label}
                      </span>
                      <span className="font-mono text-foreground text-xs">
                        {service.metrics.value}%
                      </span>
                    </div>
                    <Progress className="h-1.5" value={service.metrics.value} />
                  </div>
                ) : (
                  service.metrics.value && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-muted-foreground text-xs">
                        {service.metrics.label}
                      </span>
                      <Badge className="font-mono text-xs" variant="outline">
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
        <div className="ml-4 flex items-center">
          <Badge
            className={`border-0 px-3 py-1 font-medium text-xs shadow-sm ${
              service.status === "operational"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                : service.status === "issues"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                  : service.status === "error"
                    ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300"
            }
            `}
            variant="outline"
          >
            <span className="flex items-center space-x-1.5">
              {getStatusIcon(service.status)}
              <span className="font-medium capitalize">
                {getStatusName(service.status)}
              </span>
            </span>
          </Badge>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-primary/10" />
    </div>
  );
}

// Service block skeleton
function ServiceBlockSkeleton() {
  return (
    <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4 dark:border-slate-500/20 dark:bg-slate-500/10">
      <div className="flex items-start justify-between">
        <div className="flex flex-1 items-start space-x-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

// Data fetching functions
async function fetchHostingStatus(domainName: string): Promise<Service> {
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
        return {
          details: `Domínio Configurado - Status: ${(statusObj.status === "active" && "Ativo") ?? "Inativo"}`,
          icon: <Server className="h-5 w-5" />,
          id: "hosting",
          metrics: {
            label: "Tempo Online",
            max: 100,
            trend: hostingStatus === "operational" ? "stable" : "down",
            value: hostingStatus === "operational" ? "100" : "0",
          },
          name: "Hospedagem Web",
          status: hostingStatus,
        };
      }
      return {
        details: `Domínio Plesk Ativo - ID: ${pleskDomain.id}`,
        icon: <Server className="h-5 w-5" />,
        id: "hosting",
        metrics: {
          label: "Tempo Online",
          max: 100,
          trend: "stable",
          value: "100",
        },
        name: "Hospedagem Web",
        status: "operational",
      };
    }
    return {
      details: "Domínio não encontrado no painel de hospedagem Plesk",
      icon: <Server className="h-5 w-5" />,
      id: "hosting",
      name: "Hospedagem Web",
      status: "error",
    };
  } catch (error) {
    console.error(
      `Error fetching Plesk hosting status for ${domainName}:`,
      error
    );
    return {
      details: "Não foi possível obter o status da hospedagem do Plesk",
      icon: <Server className="h-5 w-5" />,
      id: "hosting",
      name: "Hospedagem Web",
      status: "error",
    };
  }
}

async function fetchSslStatus(domainName: string): Promise<Service> {
  try {
    // Check SSL using HTTP request to the domain
    const sslResponse = await fetch(`https://${domainName}`, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000),
    }).catch(() => null);

    if (sslResponse?.ok) {
      return {
        details: "Certificado SSL válido detectado - HTTPS acessível",
        domainName,
        fixable: false,
        icon: <ShieldCheck className="h-5 w-5" />,
        id: "ssl",
        metrics: {
          label: "Status do Certificado",
          trend: "stable",
          value: "Válido",
        },
        name: "Certificado SSL",
        status: "operational",
      };
    }
    const httpResponse = await fetch(`http://${domainName}`, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000),
    }).catch(() => null);

    if (httpResponse?.ok) {
      return {
        details: "Site acessível via HTTP mas SSL/HTTPS não está funcionando",
        domainName,
        fixable: true,
        icon: <ShieldCheck className="h-5 w-5" />,
        id: "ssl",
        name: "Certificado SSL",
        status: "issues",
      };
    }
    return {
      details: "Site não acessível - Verifique configuração DNS e hospedagem",
      domainName,
      fixable: true,
      icon: <ShieldCheck className="h-5 w-5" />,
      id: "ssl",
      name: "Certificado SSL",
      status: "error",
    };
  } catch (error) {
    console.error(`Error checking SSL status for ${domainName}:`, error);
    return {
      details: "Não foi possível verificar o status do certificado SSL",
      domainName,
      fixable: true,
      icon: <ShieldCheck className="h-5 w-5" />,
      id: "ssl",
      name: "Certificado SSL",
      status: "error",
    };
  }
}

async function fetchDnsStatus(domainName: string): Promise<Service> {
  if (domainName.includes(".")) {
    try {
      const zone = await cloudflareApi.findZone(domainName);
      if (!zone) throw new Error("Zona Cloudflare não encontrada.");
      const records = await cloudflareApi.listDnsRecords(zone.id);

      const hasARecord = records.some(
        record =>
          record.type === "A" &&
          record.name.toLowerCase() === domainName.toLowerCase()
      );

      const recordCount = records.length;

      if (hasARecord) {
        return {
          details: `${recordCount} registros DNS configurados - Registro A encontrado`,
          icon: <Globe className="h-5 w-5" />,
          id: "dns",
          metrics: {
            label: "Registros DNS",
            trend: "stable",
            value: recordCount,
          },
          name: "Registros DNS",
          status: "operational",
        };
      }
      return {
        details: `${recordCount} registros DNS encontrados mas faltando registro A essencial`,
        icon: <Globe className="h-5 w-5" />,
        id: "dns",
        name: "Registros DNS",
        status: "issues",
      };
    } catch (error) {
      console.error(`Error fetching DNS status for ${domainName}:`, error);
      return {
        details: "Não foi possível obter registros DNS da Cloudflare",
        icon: <Globe className="h-5 w-5" />,
        id: "dns",
        name: "Registros DNS",
        status: "error",
      };
    }
  } else {
    return {
      details: "Formato de domínio inválido para verificação DNS",
      icon: <Globe className="h-5 w-5" />,
      id: "dns",
      name: "Registros DNS",
      status: "unknown",
    };
  }
}

async function fetchWordPressStatus(domainName: string): Promise<Service[]> {
  try {
    // Get ALL WordPress instances for the domain (not just selected)
    const sites = await getWordPressSitesForSelectedDomain();
    // Get all WordPress sites that match this domain (including subdomains, paths, etc.)
    const wpSites = sites.filter(site => {
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

    if (wpSites.length > 0) {
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
              fields: "name,status,update,version",
              format: "json",
            })) as WpPluginList[];

            const sitePluginCount = plugins?.length || 0;
            const sitePluginUpdates =
              plugins?.filter(plugin => String(plugin.update) === "available")
                .length || 0;

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
              fields: "name,status,update,version",
              format: "json",
            })) as WpThemeList[];

            const siteThemeCount = themes?.length || 0;
            const siteThemeUpdates =
              themes?.filter(theme => String(theme.update) === "available")
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
          console.error(`Error processing WordPress site ${wpSite.id}:`, error);
          sitesWithIssues++;
        }
      }

      // Calculate overall WordPress health across all sites
      const totalUpdates =
        totalPluginUpdates + totalThemeUpdates + totalCoreUpdates;
      const wpStatus = totalUpdates > 0 ? "issues" : "operational";
      const healthScore = Math.max(0, 100 - totalUpdates * 5); // Less penalty per update for multi-site

      return [
        {
          details: `${wpSites.length} site${wpSites.length > 1 ? "s" : ""} WordPress - ${operationalSites} operacional${operationalSites !== 1 ? "is" : ""}, ${sitesWithIssues} com problemas`,
          icon: <Monitor className="h-5 w-5" />,
          id: "wp-overview",
          metrics: {
            label: "Sites WP",
            trend: sitesWithIssues === 0 ? "stable" : "down",
            value: wpSites.length,
          },
          name: "Visão Geral WordPress",
          status: wpStatus,
        },
        {
          details:
            totalCoreUpdates > 0
              ? `${totalCoreUpdates} site${totalCoreUpdates > 1 ? "s" : ""} precisam de atualizações do core`
              : `Todos os ${wpSites.length} sites têm a versão mais recente do WordPress`,
          icon: <Power className="h-5 w-5" />,
          id: "wp-core",
          metrics: {
            label: "Status do Core",
            trend: totalCoreUpdates === 0 ? "stable" : "down",
            value:
              totalCoreUpdates > 0 ? "Atualizações Disponíveis" : "Atualizado",
          },
          name: "WordPress Core",
          status: totalCoreUpdates > 0 ? "issues" : "operational",
        },
        {
          details: `${totalPluginCount} plugins totais em ${wpSites.length} site${wpSites.length > 1 ? "s" : ""}, ${totalPluginUpdates} atualizações disponíveis`,
          icon: <Layers className="h-5 w-5" />,
          id: "wp-plugins",
          metrics: {
            label: "Total Plugins",
            trend: totalPluginUpdates > 0 ? "down" : "stable",
            value: totalPluginCount,
          },
          name: "WordPress Plugins",
          status: totalPluginUpdates > 0 ? "issues" : "operational",
        },
        {
          details: `${totalThemeCount} temas totais em ${wpSites.length} site${wpSites.length > 1 ? "s" : ""}, ${totalThemeUpdates} atualizações disponíveis`,
          icon: <Monitor className="h-5 w-5" />,
          id: "wp-themes",
          metrics: {
            label: "Total Temas",
            trend: totalThemeUpdates > 0 ? "down" : "stable",
            value: totalThemeCount,
          },
          name: "WordPress Themes",
          status: totalThemeUpdates > 0 ? "issues" : "operational",
        },
        {
          details: `Score Geral de Saúde: ${healthScore}% - ${totalUpdates} atualizações pendentes em todos os sites`,
          icon: <Activity className="h-5 w-5" />,
          id: "wp-health",
          metrics: {
            label: "Score de Saúde",
            max: 100,
            trend:
              healthScore > 80 ? "stable" : healthScore > 50 ? "down" : "down",
            value: healthScore,
          },
          name: "Saúde WordPress",
          status: wpStatus,
        },
      ];
    }
    return [];
  } catch (error) {
    console.error(
      `Error checking WordPress health for domain ${domainName}:`,
      error
    );
    return [
      {
        details: "Não foi possível obter informações dos sites WordPress",
        icon: <Power className="h-5 w-5" />,
        id: "wp-error",
        name: "Sites WordPress",
        status: "error",
      },
    ];
  }
}

async function fetchSiteAccessStatus(domainName: string): Promise<Service> {
  try {
    const response = await fetch(`https://${domainName}`, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      return {
        details: `Site está acessível (HTTP ${response.status})`,
        icon: <Globe className="h-5 w-5" />,
        id: "site-access",
        metrics: {
          label: "Status HTTP",
          trend: "stable",
          value: response.status,
        },
        name: "Acessibilidade do Site",
        status: "operational",
      };
    }
    return {
      details: `Site retornou HTTP ${response.status}`,
      icon: <Globe className="h-5 w-5" />,
      id: "site-access",
      name: "Acessibilidade do Site",
      status: "issues",
    };
  } catch (error) {
    return {
      details: "Site não está acessível ou expirou o tempo limite",
      icon: <Globe className="h-5 w-5" />,
      id: "site-access",
      name: "Acessibilidade do Site",
      status: "error",
    };
  }
}

async function AsyncServerStatusContent({
  domainName,
}: {
  domainName: string;
}) {
  // Start all the data fetching promises in parallel (don't await yet)
  const hostingPromise = fetchHostingStatus(domainName);
  const sslPromise = fetchSslStatus(domainName);
  const dnsPromise = fetchDnsStatus(domainName);
  const wpPromise = fetchWordPressStatus(domainName);
  const siteAccessPromise = fetchSiteAccessStatus(domainName);

  // Determine if we need to show WordPress services or site access
  const wpSites = await getWordPressSitesForSelectedDomain().then(sites =>
    sites.filter(site => {
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
    })
  );

  const showWordPress = wpSites.length > 0;

  // Render the Card structure and async service blocks
  return (
    <Card className="flex h-full flex-col border-0 bg-gradient-to-br from-background to-muted/30 shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl">
      <CardHeader className="border-border/40 border-b bg-gradient-to-r from-background to-muted/20 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text font-bold text-transparent text-xl">
              Status dos Serviços
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              Monitoramento em tempo real para{" "}
              <span className="font-semibold text-primary">{domainName}</span>
            </CardDescription>
          </div>
          {/* Health Score Display - async component with suspense */}
          <div className="flex items-center space-x-3">
            <Suspense fallback={<HealthScoreSkeleton />}>
              <HealthScoreDisplay
                dnsPromise={dnsPromise}
                hostingPromise={hostingPromise}
                showWordPress={showWordPress}
                siteAccessPromise={siteAccessPromise}
                sslPromise={sslPromise}
                wpPromise={wpPromise}
              />
            </Suspense>
          </div>
        </div>

        {/* Overall Health Progress Bar - async component with suspense */}
        <Suspense fallback={<HealthProgressSkeleton />}>
          <HealthProgressBar
            dnsPromise={dnsPromise}
            hostingPromise={hostingPromise}
            showWordPress={showWordPress}
            siteAccessPromise={siteAccessPromise}
            sslPromise={sslPromise}
            wpPromise={wpPromise}
          />
        </Suspense>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col pt-6">
        <div className="grid gap-4">
          {/* Hosting Service Block */}
          <Suspense fallback={<ServiceBlockSkeleton />}>
            <HostingServiceBlock
              domainName={domainName}
              hostingPromise={hostingPromise}
            />
          </Suspense>

          {/* SSL Service Block */}
          <Suspense fallback={<ServiceBlockSkeleton />}>
            <SslServiceBlock domainName={domainName} sslPromise={sslPromise} />
          </Suspense>

          {/* DNS Service Block */}
          <Suspense fallback={<ServiceBlockSkeleton />}>
            <DnsServiceBlock dnsPromise={dnsPromise} domainName={domainName} />
          </Suspense>

          {/* WordPress Services Block - only if WordPress sites exist */}
          {showWordPress ? (
            <Suspense
              fallback={
                <>
                  <ServiceBlockSkeleton />
                  <ServiceBlockSkeleton />
                  <ServiceBlockSkeleton />
                  <ServiceBlockSkeleton />
                  <ServiceBlockSkeleton />
                </>
              }
            >
              <WordPressServicesBlock
                domainName={domainName}
                wpPromise={wpPromise}
              />
            </Suspense>
          ) : (
            /* Site Access Service Block - only if no WordPress sites */
            <Suspense fallback={<ServiceBlockSkeleton />}>
              <SiteAccessServiceBlock
                domainName={domainName}
                siteAccessPromise={siteAccessPromise}
              />
            </Suspense>
          )}

          {/* Summary Footer */}
          <Suspense fallback={<ServiceSummaryFooterSkeleton />}>
            <ServiceSummaryFooter
              dnsPromise={dnsPromise}
              hostingPromise={hostingPromise}
              showWordPress={showWordPress}
              siteAccessPromise={siteAccessPromise}
              sslPromise={sslPromise}
              wpPromise={wpPromise}
            />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
}

// Desativar para não fazer requisições ao Plesk/DNS. Reativar quando hospedagem estiver disponível.
const HOSTING_STATUS_ENABLED = false;

const COMING_SOON_SERVICES: Service[] = [
  {
    details: "Em breve disponível para seus domínios",
    icon: <Server className="h-5 w-5" />,
    id: "hosting",
    name: "Hospedagem Web",
    status: "operational",
  },
  {
    details: "Certificados SSL automáticos gratuitos",
    icon: <ShieldCheck className="h-5 w-5" />,
    id: "ssl",
    name: "Certificado SSL",
    status: "operational",
  },
  {
    details: "Gerenciamento completo de DNS",
    icon: <Globe className="h-5 w-5" />,
    id: "dns",
    name: "Registros DNS",
    status: "operational",
  },
  {
    details: "Monitoramento 24/7 de uptime",
    icon: <Globe className="h-5 w-5" />,
    id: "site-access",
    name: "Acessibilidade do Site",
    status: "operational",
  },
];

function ServerStatusComingSoon({ domainName }: { domainName?: string }) {
  return (
    <div className="pointer-events-none relative select-none opacity-50">
      <Card className="flex h-full flex-col border-0 bg-gradient-to-br from-background to-muted/30 shadow-lg">
        <CardHeader className="border-border/40 border-b bg-gradient-to-r from-background to-muted/20 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text font-bold text-transparent text-xl">
                Status dos Serviços
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                {domainName ? (
                  <>
                    Monitoramento para{" "}
                    <span className="font-semibold text-primary">
                      {domainName}
                    </span>
                  </>
                ) : (
                  "Monitoramento em tempo real"
                )}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="font-bold text-2xl text-emerald-600 dark:text-emerald-400">
                  Em Breve
                </div>
                <div className="text-muted-foreground text-xs">Hospedagem</div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
                <Monitor className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-muted-foreground text-xs">
                Saúde Geral do Sistema
              </span>
              <span className="text-muted-foreground text-xs">
                {COMING_SOON_SERVICES.length}/{COMING_SOON_SERVICES.length}{" "}
                serviços operacionais
              </span>
            </div>
            <Progress className="h-2 bg-muted/50" value={100} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-6">
          <div className="grid gap-4">
            {COMING_SOON_SERVICES.map(service => (
              <ServiceBlock key={service.id} service={service} />
            ))}
            <div className="mt-6 border-border/40 border-t pt-4">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Funcionalidade em desenvolvimento</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{COMING_SOON_SERVICES.length} Operacionais</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ServerStatus({ user }: { user: User }) {
  if (!HOSTING_STATUS_ENABLED) {
    return (
      <ServerStatusComingSoon domainName={user?.selectedDomain ?? undefined} />
    );
  }

  if (!user?.selectedDomain) {
    return (
      <Card className="flex h-full flex-col shadow-lg">
        <CardHeader className="border-border/60 border-b pb-4">
          <CardTitle className="font-semibold text-lg">
            Status dos Serviços
          </CardTitle>
          <CardDescription className="text-sm">
            Nenhum domínio selecionado para monitoramento
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="py-4 text-center text-muted-foreground text-sm">
            Por favor, selecione um domínio para visualizar o status dos
            serviços.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Suspense fallback={<ServerStatusSkeleton />}>
      <AsyncServerStatusContent domainName={user.selectedDomain} />
    </Suspense>
  );
}

function ServerStatusSkeleton() {
  return (
    <Card className="flex h-full flex-col border-0 bg-gradient-to-br from-background to-muted/30 shadow-lg">
      <CardHeader className="border-border/40 border-b bg-gradient-to-r from-background to-muted/20 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="mb-1 h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <Skeleton className="mb-1 h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>
        <div className="mt-4">
          <Skeleton className="mb-2 h-3 w-40" />
          <Skeleton className="h-2 w-full" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6">
        {[...Array(5)].map((_, i) => (
          <ServiceBlockSkeleton key={i} />
        ))}
        <Skeleton className="mt-6 h-4 w-full" />
      </CardContent>
    </Card>
  );
}

// Health score component that calculates percentage when all services are resolved
async function HealthScoreDisplay({
  hostingPromise,
  sslPromise,
  dnsPromise,
  wpPromise,
  siteAccessPromise,
  showWordPress,
}: {
  hostingPromise: Promise<Service>;
  sslPromise: Promise<Service>;
  dnsPromise: Promise<Service>;
  wpPromise: Promise<Service[]>;
  siteAccessPromise: Promise<Service>;
  showWordPress: boolean;
}) {
  // Await all promises to calculate health score
  const [
    hostingService,
    sslService,
    dnsService,
    wpServices,
    siteAccessService,
  ] = await Promise.all([
    hostingPromise,
    sslPromise,
    dnsPromise,
    wpPromise,
    siteAccessPromise,
  ]);

  // Collect all services
  const allServices: Service[] = [
    hostingService,
    sslService,
    dnsService,
    ...(showWordPress ? wpServices : [siteAccessService]),
  ];

  // Calculate health score
  const operationalCount = allServices.filter(
    s => s.status === "operational"
  ).length;
  const totalServices = allServices.length;
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
    <>
      <div className="text-right">
        <div className={`font-bold text-2xl ${getHealthColor(healthScore)}`}>
          {healthScore}%
        </div>
        <div className="text-muted-foreground text-xs">Score de Saúde</div>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
        <Monitor className="h-6 w-6 text-primary" />
      </div>
    </>
  );
}

// Health score skeleton for loading state
function HealthScoreSkeleton() {
  return (
    <>
      <div className="text-right">
        <Skeleton className="mb-1 h-8 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-12 w-12 rounded-full" />
    </>
  );
}

// Progress bar component that shows overall health when resolved
async function HealthProgressBar({
  hostingPromise,
  sslPromise,
  dnsPromise,
  wpPromise,
  siteAccessPromise,
  showWordPress,
}: {
  hostingPromise: Promise<Service>;
  sslPromise: Promise<Service>;
  dnsPromise: Promise<Service>;
  wpPromise: Promise<Service[]>;
  siteAccessPromise: Promise<Service>;
  showWordPress: boolean;
}) {
  // Await all promises to calculate health metrics
  const [
    hostingService,
    sslService,
    dnsService,
    wpServices,
    siteAccessService,
  ] = await Promise.all([
    hostingPromise,
    sslPromise,
    dnsPromise,
    wpPromise,
    siteAccessPromise,
  ]);

  // Collect all services
  const allServices: Service[] = [
    hostingService,
    sslService,
    dnsService,
    ...(showWordPress ? wpServices : [siteAccessService]),
  ];

  // Calculate health score and counts
  const operationalCount = allServices.filter(
    s => s.status === "operational"
  ).length;
  const totalServices = allServices.length;
  const healthScore =
    totalServices > 0
      ? Math.round((operationalCount / totalServices) * 100)
      : 0;

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-muted-foreground text-xs">
          Saúde Geral do Sistema
        </span>
        <span className="text-muted-foreground text-xs">
          {operationalCount}/{totalServices} serviços operacionais
        </span>
      </div>
      <Progress className="h-2 bg-muted/50" value={healthScore} />
    </div>
  );
}

// Progress bar skeleton for loading state
function HealthProgressSkeleton() {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-muted-foreground text-xs">
          Saúde Geral do Sistema
        </span>
        <span className="text-muted-foreground text-xs">Carregando...</span>
      </div>
      <Progress className="h-2 bg-muted/50" value={0} />
    </div>
  );
}

// Summary footer component that shows service counts when resolved
async function ServiceSummaryFooter({
  hostingPromise,
  sslPromise,
  dnsPromise,
  wpPromise,
  siteAccessPromise,
  showWordPress,
}: {
  hostingPromise: Promise<Service>;
  sslPromise: Promise<Service>;
  dnsPromise: Promise<Service>;
  wpPromise: Promise<Service[]>;
  siteAccessPromise: Promise<Service>;
  showWordPress: boolean;
}) {
  // Await all promises to calculate status counts
  const [
    hostingService,
    sslService,
    dnsService,
    wpServices,
    siteAccessService,
  ] = await Promise.all([
    hostingPromise,
    sslPromise,
    dnsPromise,
    wpPromise,
    siteAccessPromise,
  ]);

  // Collect all services
  const allServices: Service[] = [
    hostingService,
    sslService,
    dnsService,
    ...(showWordPress ? wpServices : [siteAccessService]),
  ];

  const operationalCount = allServices.filter(
    s => s.status === "operational"
  ).length;
  const issuesCount = allServices.filter(s => s.status === "issues").length;
  const errorCount = allServices.filter(s => s.status === "error").length;

  return (
    <div className="mt-6 border-border/40 border-t pt-4">
      <div className="flex items-center justify-between text-muted-foreground text-xs">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Última atualização: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>
              {operationalCount} Operacional{operationalCount !== 1 ? "is" : ""}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span>
              {issuesCount} Problema{issuesCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span>
              {errorCount} Erro{errorCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Summary footer skeleton for loading state
function ServiceSummaryFooterSkeleton() {
  return (
    <div className="mt-6 border-border/40 border-t pt-4">
      <div className="flex items-center justify-between text-muted-foreground text-xs">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Última atualização: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Operacional</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Problemas</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span>Erros</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusName(
  status: "error" | "operational" | "issues" | "unknown"
): string {
  switch (status) {
    case "operational":
      return "Operacional";
    case "issues":
      return "Problemas";
    case "error":
      return "Erro";
    default:
      return "Desconhecido";
  }
}
