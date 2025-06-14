"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { memo, useMemo } from "react";
import { isEqual } from "lodash";

interface DomainStatus {
  domain: string;
  status: string | null;
  error: string | null;
  loading: boolean;
}

interface DbStatusChecklistProps {
  domainStatuses: DomainStatus[];
}

// Memoized Status Icon Component
interface StatusIconProps {
  status: string | null;
  loading: boolean;
}

const StatusIcon = memo<StatusIconProps>(({ status, loading }) => {
  if (loading) {
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  }
  
  if (status === "OK") {
    return (
      <div className="flex items-center text-green-500">
        <CheckCircle className="h-5 w-5 mr-2" />
        <span>OK</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-red-500">
      <XCircle className="h-5 w-5 mr-2" />
      <span>Erro</span>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.status === nextProps.status &&
    prevProps.loading === nextProps.loading
  );
});

StatusIcon.displayName = "StatusIcon";

// Memoized Status Item Component
interface StatusItemProps {
  domainStatus: DomainStatus;
}

const StatusItem = memo<StatusItemProps>(({ domainStatus }) => {
  return (
    <li className="flex items-center justify-between p-3 bg-background/70 rounded-md border">
      <span className="font-medium">{domainStatus.domain}</span>
      <StatusIcon 
        status={domainStatus.status} 
        loading={domainStatus.loading} 
      />
    </li>
  );
}, (prevProps, nextProps) => {
  return isEqual(prevProps.domainStatus, nextProps.domainStatus);
});

StatusItem.displayName = "StatusItem";

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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Visão Geral da Saúde do Banco de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Nenhuma instalação do WordPress encontrada para verificar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 shadow-lg border border-border/40 bg-card/50 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Saúde do Banco de Dados WordPress
        </CardTitle>
        {statusSummary && (
          <p className="text-sm text-muted-foreground mt-2">
            {statusSummary.okCount} OK, {statusSummary.errorCount} com erro
            {statusSummary.loadingCount > 0 && `, ${statusSummary.loadingCount} verificando`}
            {' '}de {statusSummary.total} domínios
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {domainStatuses.map((domainStatus) => (
            <StatusItem 
              key={domainStatus.domain} 
              domainStatus={domainStatus}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return isEqual(prevProps.domainStatuses, nextProps.domainStatuses);
});

DbStatusChecklist.displayName = "DbStatusChecklist";

export default DbStatusChecklist;
