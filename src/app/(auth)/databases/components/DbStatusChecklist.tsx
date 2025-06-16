"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Database, Activity, Shield, AlertTriangle } from "lucide-react";
import { memo, useMemo } from "react";
import { isEqual } from "lodash";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";

interface DomainStatus {
  domain: string;
  status: string | null;
  error: string | null;
  loading: boolean;
}

interface DbStatusChecklistProps {
  domainStatuses: DomainStatus[];
}

// Memoized Database Status Card Component
interface DatabaseStatusCardProps {
  domainStatus: DomainStatus;
  index: number;
}

const DatabaseStatusCard = memo<DatabaseStatusCardProps>(({ domainStatus, index }) => {
  const getStatusIcon = () => {
    if (domainStatus.loading) {
      return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
    }
    
    if (domainStatus.status === "OK") {
      return <CheckCircle className="h-6 w-6 text-emerald-500" />;
    }
    
    return <XCircle className="h-6 w-6 text-red-500" />;
  };

  const getStatusColor = () => {
    if (domainStatus.loading) return "bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700";
    if (domainStatus.status === "OK") return "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50";
    return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/50";
  };

  const getStatusBadge = () => {
    if (domainStatus.loading) return <Badge variant="secondary">Verificando...</Badge>;
    if (domainStatus.status === "OK") return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300">Saudável</Badge>;
    return <Badge variant="destructive">Com Erro</Badge>;
  };

  return (
    <Card className={`h-full ${getStatusColor()} hover:shadow-lg transition-all duration-300 group`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/50 dark:bg-black/20">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                {domainStatus.domain.replace(/^https?:\/\/(www\.)?/, '')}
              </h3>
              <p className="text-xs text-muted-foreground">WordPress Database</p>
            </div>
          </div>
          {getStatusIcon()}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {getStatusBadge()}
          </div>
          
          {domainStatus.error && (
            <div className="mt-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {domainStatus.error}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-xs text-muted-foreground pt-2 border-t border-white/50 dark:border-black/20">
            <div className="flex items-center space-x-1">
              <Activity className="h-3 w-3" />
              <span>Monitorado</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Protegido</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.index === nextProps.index &&
    isEqual(prevProps.domainStatus, nextProps.domainStatus)
  );
});

DatabaseStatusCard.displayName = "DatabaseStatusCard";

const DbStatusChecklist = memo<DbStatusChecklistProps>(({
  domainStatuses,
}) => {
  const hasStatuses = useMemo(() => 
    domainStatuses && domainStatuses.length > 0, 
    [domainStatuses]
  );

  const statusSummary = useMemo(() => {
    if (!hasStatuses) return null;
    
    const okCount = domainStatuses.filter(s => s.status === "OK").length;
    const errorCount = domainStatuses.filter(s => s.status === "Error").length;
    const loadingCount = domainStatuses.filter(s => s.loading).length;
    
    return { okCount, errorCount, loadingCount, total: domainStatuses.length };
  }, [domainStatuses, hasStatuses]);

  if (!hasStatuses) {
    return (
      <Card className="mb-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <Database className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Nenhum Banco de Dados Encontrado
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Nenhuma instalação do WordPress encontrada para monitorar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-8 space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-3 rounded-full">
          <Database className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Saúde dos Bancos de Dados
          </h2>
        </div>
        
        {statusSummary && (
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                {statusSummary.okCount} Saudáveis
              </span>
            </div>
            {statusSummary.errorCount > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-red-700 dark:text-red-300 font-medium">
                  {statusSummary.errorCount} Com Erro
                </span>
              </div>
            )}
            {statusSummary.loadingCount > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-slate-400 rounded-full animate-pulse" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {statusSummary.loadingCount} Verificando
                </span>
              </div>
            )}
            <div className="text-muted-foreground">
              Total: {statusSummary.total}
            </div>
          </div>
        )}
      </div>

      {/* Carousel Section */}
      <div className="relative">
        {domainStatuses.length === 1 ? (
          <div className="max-w-sm mx-auto">
            <DatabaseStatusCard 
              domainStatus={domainStatuses[0]} 
              index={0}
            />
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {domainStatuses.map((domainStatus, index) => (
                <CarouselItem 
                  key={domainStatus.domain} 
                  className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <DatabaseStatusCard 
                    domainStatus={domainStatus} 
                    index={index}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {domainStatuses.length > 3 && (
              <>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </>
            )}
          </Carousel>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return isEqual(prevProps.domainStatuses, nextProps.domainStatuses);
});

DbStatusChecklist.displayName = "DbStatusChecklist";

export default DbStatusChecklist;
