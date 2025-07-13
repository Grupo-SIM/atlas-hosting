import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface DbStatusCardProps {
  domainName: string;
  status: string | null; // null if check failed or not run yet
  error?: string;
}

export function DbStatusCard({ domainName, status, error }: DbStatusCardProps) {
  const isLoading = status === null && !error;
  const isSuccess = status === "OK"; // Assuming "OK" is the success status from db.check()
  const isError = !!error || (status !== null && status !== "OK");

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>{domainName}</span>
          {isLoading && (
            <AlertTriangle className="h-5 w-5 text-yellow-500 animate-pulse" />
          )}
          {isSuccess && <CheckCircle className="h-5 w-5 text-green-500" />}
          {isError && <XCircle className="h-5 w-5 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Verificando status do banco de dados...
          </p>
        )}
        {isSuccess && (
          <p className="text-sm text-green-600">Banco de dados operacional.</p>
        )}
        {isError && (
          <div>
            <p className="text-sm text-red-600">
              Problema no banco de dados: {status}
            </p>
            {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
