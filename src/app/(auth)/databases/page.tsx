import { getUser } from "@/lib/auth";
import { getUserWordPressSites } from "@/lib/server/utils";
import WpCliApi from "@/lib/server/apis/plesk/wp-toolkit/wp-cli";
import DbStatusChecklist from "./components/DbStatusChecklist";
import { DatabaseEditor } from "./components/DatabaseEditor";
import { Suspense, memo } from "react";
import { AlertTriangle, Database } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WpDomainWithCli {
  id: number;
  domain: string;
  instanceId: number;
  wpCli: WpCliApi;
}

interface DomainStatus {
  domain: string;
  status: "OK" | "Error" | null;
  error: string | null;
  loading: boolean;
}

// Memoized Error Card Component
interface ErrorCardProps {
  selectedDomainName: string;
}

const WordPressNotFoundCard = memo<ErrorCardProps>(({ selectedDomainName }) => (
  <Card className="mt-8 shadow-lg border border-amber-500/50 bg-amber-50/50 backdrop-blur-lg">
    <CardHeader>
      <CardTitle className="flex items-center text-amber-700">
        <AlertTriangle className="h-6 w-6 mr-2" />
        Instalação do WordPress Não Encontrada
      </CardTitle>
    </CardHeader>
    <CardContent className="text-center">
      <p className="mb-4 text-amber-600">
        Seu domínio selecionado (<strong>{selectedDomainName}</strong>) não
        possui uma instalação do WordPress. Portanto, seus bancos de dados não
        podem ser exibidos aqui.
      </p>
      <Button
        asChild
        variant="default"
        className="bg-amber-500 hover:bg-amber-600"
      >
        <Link href="/sites/new">Instalar WordPress</Link>
      </Button>
    </CardContent>
  </Card>
));

WordPressNotFoundCard.displayName = "WordPressNotFoundCard";

// Memoized Database Editor Section
interface DatabaseEditorSectionProps {
  selectedDomainName: string;
  instanceId: number;
  searchParams: Record<string, string | undefined>;
}

const DatabaseEditorSection = memo<DatabaseEditorSectionProps>(
  ({ selectedDomainName, instanceId, searchParams }) => (
    <div className="mt-8">
      <DatabaseEditor instanceId={instanceId} searchParams={searchParams} />
    </div>
  )
);

DatabaseEditorSection.displayName = "DatabaseEditorSection";

// Memoized Domain Selection Card
const DomainSelectionCard = memo(() => (
  <Card className="mt-8 shadow-lg border border-blue-500/50 bg-blue-50/50 backdrop-blur-lg">
    <CardHeader>
      <CardTitle className="flex items-center text-blue-700">
        <Database className="h-6 w-6 mr-2" />
        Selecionar um Domínio
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-blue-600">
        Por favor, selecione um domínio para visualizar os detalhes de seu banco
        de dados.
      </p>
    </CardContent>
  </Card>
));

DomainSelectionCard.displayName = "DomainSelectionCard";

async function fetchDomainStatuses(
  wpDomains: WpDomainWithCli[]
): Promise<DomainStatus[]> {
  return Promise.all(
    wpDomains.map(async (wpDomain) => {
      try {
        const checkResult = await wpDomain.wpCli.db.check();
        const isSuccess = /success/i.test(checkResult);
        return {
          domain: wpDomain.domain,
          status: isSuccess ? "OK" : "Error",
          error: isSuccess ? null : checkResult,
          loading: false,
        };
      } catch (err: unknown) {
        let errorMessage = "Falha ao verificar status do banco de dados.";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        return {
          domain: wpDomain.domain,
          status: "Error",
          error: errorMessage,
          loading: false,
        };
      }
    })
  );
}

export default async function DatabasesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getUser();
  if (!user) {
    return <p>Por favor, faça login para visualizar os bancos de dados.</p>;
  }

  const wpDomainsRaw = await getUserWordPressSites(user);
  const wpDomains: WpDomainWithCli[] = wpDomainsRaw.map((domain) => ({
    ...domain,
    wpCli: new WpCliApi(domain.instanceId),
  }));

  // Fetch statuses in the Server Component
  const domainStatuses = await fetchDomainStatuses(wpDomains);

  // Await search params and normalize them
  const resolvedSearchParams = await searchParams;
  const normalizedSearchParams = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  ) as Record<string, string | undefined>;

  const selectedDomainName = user.selectedDomain;
  const currentDomainHasWordPress = wpDomains.some((d) =>
    [
      `https://${selectedDomainName}`,
      `https://www.${selectedDomainName}`,
    ].includes(d.domain)
  );
  const selectedWpDomain = wpDomains.find((d) =>
    [
      `https://${selectedDomainName}`,
      `https://www.${selectedDomainName}`,
    ].includes(d.domain)
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
        Gerenciamento de Banco de Dados
      </h1>

      <Suspense fallback={<p>Carregando status dos bancos de dados...</p>}>
        <DbStatusChecklist domainStatuses={domainStatuses} />
      </Suspense>

      {/* Conditional rendering with memoized components */}
      {selectedDomainName && !currentDomainHasWordPress && (
        <WordPressNotFoundCard selectedDomainName={selectedDomainName} />
      )}

      {selectedDomainName && currentDomainHasWordPress && selectedWpDomain && (
        <DatabaseEditorSection
          selectedDomainName={selectedDomainName}
          instanceId={selectedWpDomain.instanceId}
          searchParams={normalizedSearchParams}
        />
      )}

      {!selectedDomainName && <DomainSelectionCard />}
    </div>
  );
}
