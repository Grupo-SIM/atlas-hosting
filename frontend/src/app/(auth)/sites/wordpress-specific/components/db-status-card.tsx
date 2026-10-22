import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="w-full shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between font-semibold text-lg">
          <span>{domainName}</span>
          {isLoading && (
            <AlertTriangle className="h-5 w-5 animate-pulse text-yellow-500" />
          )}
          {isSuccess && <CheckCircle className="h-5 w-5 text-green-500" />}
          {isError && <XCircle className="h-5 w-5 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-muted-foreground text-sm">
            Verificando status do banco de dados...
          </p>
        )}
        {isSuccess && (
          <p className="text-green-600 text-sm">Banco de dados operacional.</p>
        )}
        {isError && (
          <div>
            <p className="text-red-600 text-sm">
              Problema no banco de dados: {status}
            </p>
            {error && <p className="mt-1 text-red-700 text-xs">{error}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
