import { getWordPressSitesForSelectedDomain } from "@/app/(auth)/sites/wordpress-specific/actions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Suspense } from "react";
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
import type { User } from "@/lib/db/schema";

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
      {services.map((service) => (
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
              {service.metrics?.trend && getTrendIcon(service.metrics.trend)}
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
                    <Progress value={service.metrics.value} className="h-1.5" />
                  </div>
                ) : (
                  service.metrics.value && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {service.metrics.label}
                      </span>
                      <Badge variant="outline" className="text-xs font-mono">
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
              <span className="capitalize font-medium">{getStatusName(service.status)}</span>
            </span>
          </Badge>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 dark:from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}

// Service block skeleton
function ServiceBlockSkeleton() {
  return (
    <div className="rounded-xl border-2 p-4 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="w-20 h-6 rounded-full" />
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
        };
      } else {
        return {
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
        };
      }
    } else {
      return {
        id: "hosting",
        name: "Hospedagem Web",
        status: "error",
        details: "Domínio não encontrado no painel de hospedagem Plesk",
        icon: <Server className="h-5 w-5" />,
      };
    }
  } catch (error) {
    console.error(
      `Error fetching Plesk hosting status for ${domainName}:`,
      error
    );
    return {
      id: "hosting",
      name: "Hospedagem Web",
      status: "error",
      details: "Não foi possível obter o status da hospedagem do Plesk",
      icon: <Server className="h-5 w-5" />,
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
      };
    } else {
      const httpResponse = await fetch(`http://${domainName}`, {
        method: "HEAD",
        signal: AbortSignal.timeout(10000),
      }).catch(() => null);

      if (httpResponse?.ok) {
        return {
          id: "ssl",
          name: "Certificado SSL",
          status: "issues",
          details: "Site acessível via HTTP mas SSL/HTTPS não está funcionando",
          icon: <ShieldCheck className="h-5 w-5" />,
          fixable: true,
          domainName,
        };
      } else {
        return {
          id: "ssl",
          name: "Certificado SSL",
          status: "error",
          details:
            "Site não acessível - Verifique configuração DNS e hospedagem",
          icon: <ShieldCheck className="h-5 w-5" />,
          fixable: true,
          domainName,
        };
      }
    }
  } catch (error) {
    console.error(`Error checking SSL status for ${domainName}:`, error);
    return {
      id: "ssl",
      name: "Certificado SSL",
      status: "error",
      details: "Não foi possível verificar o status do certificado SSL",
      icon: <ShieldCheck className="h-5 w-5" />,
      fixable: true,
      domainName,
    };
  }
}

async function fetchDnsStatus(domainName: string): Promise<Service> {
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

      const recordCount = dnsResponse.Hosts?.length || 0;

      if (hasARecord) {
        return {
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
        };
      } else {
        return {
          id: "dns",
          name: "Registros DNS",
          status: "issues",
          details: `${recordCount} registros DNS encontrados mas faltando registro A essencial`,
          icon: <Globe className="h-5 w-5" />,
        };
      }
    } catch (error) {
      console.error(`Error fetching DNS status for ${domainName}:`, error);
      return {
        id: "dns",
        name: "Registros DNS",
        status: "error",
        details: "Não foi possível obter registros DNS do Namecheap",
        icon: <Globe className="h-5 w-5" />,
      };
    }
  } else {
    return {
      id: "dns",
      name: "Registros DNS",
      status: "unknown",
      details: "Formato de domínio inválido para verificação DNS",
      icon: <Globe className="h-5 w-5" />,
    };
  }
}

async function fetchWordPressStatus(domainName: string): Promise<Service[]> {
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
              format: "json",
              fields: "name,status,update,version",
            })) as WpPluginList[];

            const sitePluginCount = plugins?.length || 0;
            const sitePluginUpdates =
              plugins?.filter((plugin) => String(plugin.update) === "available")
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
      ];
    } else {
      return [];
    }
  } catch (error) {
    console.error(
      `Error checking WordPress health for domain ${domainName}:`,
      error
    );
    return [
      {
        id: "wp-error",
        name: "Sites WordPress",
        status: "error",
        details: "Não foi possível obter informações dos sites WordPress",
        icon: <Power className="h-5 w-5" />,
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
      };
    } else {
      return {
        id: "site-access",
        name: "Acessibilidade do Site",
        status: "issues",
        details: `Site retornou HTTP ${response.status}`,
        icon: <Globe className="h-5 w-5" />,
      };
    }
  } catch (error) {
    return {
      id: "site-access",
      name: "Acessibilidade do Site",
      status: "error",
      details: "Site não está acessível ou expirou o tempo limite",
      icon: <Globe className="h-5 w-5" />,
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
  const wpSites = await getWordPressSitesForSelectedDomain().then((sites) =>
    sites.filter((site) => {
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
          {/* Health Score Display - async component with suspense */}
          <div className="flex items-center space-x-3">
            <Suspense fallback={<HealthScoreSkeleton />}>
              <HealthScoreDisplay
                hostingPromise={hostingPromise}
                sslPromise={sslPromise}
                dnsPromise={dnsPromise}
                wpPromise={wpPromise}
                siteAccessPromise={siteAccessPromise}
                showWordPress={showWordPress}
              />
            </Suspense>
          </div>
        </div>

        {/* Overall Health Progress Bar - async component with suspense */}
        <Suspense fallback={<HealthProgressSkeleton />}>
          <HealthProgressBar
            hostingPromise={hostingPromise}
            sslPromise={sslPromise}
            dnsPromise={dnsPromise}
            wpPromise={wpPromise}
            siteAccessPromise={siteAccessPromise}
            showWordPress={showWordPress}
          />
        </Suspense>
      </CardHeader>

      <CardContent className="pt-6">
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
            <DnsServiceBlock domainName={domainName} dnsPromise={dnsPromise} />
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
              hostingPromise={hostingPromise}
              sslPromise={sslPromise}
              dnsPromise={dnsPromise}
              wpPromise={wpPromise}
              siteAccessPromise={siteAccessPromise}
              showWordPress={showWordPress}
            />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
}

export function ServerStatus({ user }: { user: User }) {
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
  return (
    <Suspense fallback={<ServerStatusSkeleton />}>
      <AsyncServerStatusContent domainName={user.selectedDomain} />
    </Suspense>
  );
}

function ServerStatusSkeleton() {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="border-b border-border/40 pb-6 bg-gradient-to-r from-background to-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
        </div>
        <div className="mt-4">
          <Skeleton className="h-3 w-40 mb-2" />
          <Skeleton className="h-2 w-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-6 grid gap-4">
        {[...Array(5)].map((_, i) => (
          <ServiceBlockSkeleton key={i} />
        ))}
        <Skeleton className="h-4 w-full mt-6" />
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
    (s) => s.status === "operational"
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
        <div className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>
          {healthScore}%
        </div>
        <div className="text-xs text-muted-foreground">Score de Saúde</div>
      </div>
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
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
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="w-12 h-12 rounded-full" />
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
    (s) => s.status === "operational"
  ).length;
  const totalServices = allServices.length;
  const healthScore =
    totalServices > 0
      ? Math.round((operationalCount / totalServices) * 100)
      : 0;

  return (
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
  );
}

// Progress bar skeleton for loading state
function HealthProgressSkeleton() {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          Saúde Geral do Sistema
        </span>
        <span className="text-xs text-muted-foreground">Carregando...</span>
      </div>
      <Progress value={0} className="h-2 bg-muted/50" />
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
    (s) => s.status === "operational"
  ).length;
  const issuesCount = allServices.filter((s) => s.status === "issues").length;
  const errorCount = allServices.filter((s) => s.status === "error").length;

  return (
    <div className="mt-6 pt-4 border-t border-border/40">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Última atualização: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              {operationalCount} Operacional{operationalCount !== 1 ? "is" : ""}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>
              {issuesCount} Problema{issuesCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
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
    <div className="mt-6 pt-4 border-t border-border/40">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Última atualização: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Operacional</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Problemas</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Erros</span>
          </div>
        </div>
      </div>
    </div>
  );
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
