import {
  getDomainData, // Imported from page.tsx where it's cached
  type DomainData, // Import type from page.tsx or a shared types file
} from "@/app/(authenticated)/(dashboard)/domains/register/page"; // Adjust path as needed
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/lib/auth"; // For server action
import { namecheapApi } from "@/lib/server/apis/namecheap";
import {
  DomainsCreateUserParams,
  NamecheapContactDetails,
} from "@/lib/server/apis/namecheap/types";
import { toBrl } from "@/lib/utils";
import { AlertCircle, Check, CheckCircle2, X, XCircle } from "lucide-react";
import { redirect } from "next/navigation"; // For server action
import { PropsWithChildren, ReactNode, Suspense } from "react";
import Skeleton from "react-loading-skeleton";

export async function DomainResult({ searchQuery }: { searchQuery: string }) {
  const domainData = await getDomainData(searchQuery);

  if (!domainData || !domainData.domain) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resultado da Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não foi possível verificar a disponibilidade do domínio &quot;
            {searchQuery}&quot;. Tente novamente ou verifique o termo.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { available, domain } = domainData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultado da Busca: {domain.domain}</CardTitle>
        <CardDescription>
          {available
            ? "Este domínio está disponível para registro!"
            : "Este domínio não está disponível para registro."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {available ? (
              <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{domain.domain}</h3>
              {available ? (
                <p className="text-sm text-muted-foreground">
                  Este domínio está disponível para registro
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Este domínio já está registrado.
                </p>
              )}
            </div>
          </div>
          <h2 className="font-semibold text-2xl">{toBrl(domain.priceBRL)}</h2>
        </div>

        {domain.isPremium && available && (
          <div className="mt-4 flex items-center gap-2 text-amber-500">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              Este é um domínio premium. O preço de registro é{" "}
              {toBrl(domain.priceBRL)}.
            </p>
          </div>
        )}
      </CardContent>

      <Suspense
        fallback={
          <div className="p-4">
            <Skeleton height={40} />
          </div>
        }
      >
        {available ? (
          <DomainAvailable domainData={domainData} />
        ) : (
          <DomainUnavailable domainData={domainData} />
        )}
      </Suspense>
    </Card>
  );
}

// --- Helper components for DomainResult ---

function DomainAvailableTemplate({
  text1,
  text2,
  text3,
  text4,
  children,
}: PropsWithChildren<{
  text1: ReactNode;
  text2: ReactNode;
  text3: ReactNode;
  text4: ReactNode;
}>) {
  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/10 border-t border-green-100 dark:border-green-900/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <p className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center">
          <Check className="h-4 w-4 mr-1 flex-shrink-0" />
          {text1}
        </p>
        <ul className="flex flex-wrap gap-2 items-center">
          <li className="text-xs bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
            {text2}
          </li>
          <li className="text-xs bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
            {text3}
          </li>
          <li className="text-xs bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
            {text4}
          </li>
        </ul>
        {/* Children (form with button and price) will now be flexed to the end */}
        <div className="flex-1 flex items-center justify-end gap-2 mt-2 sm:mt-0">
          {children}
        </div>
      </div>
    </div>
  );
}

async function DomainUnavailable({ domainData }: { domainData: DomainData }) {
  return (
    !domainData?.available && (
      <div className="p-4 border-t flex items-center justify-end gap-2">
        <Button variant="outline" disabled>
          <X className="h-4 w-4 mr-2" />
          Indisponível
        </Button>
        <Button variant="link" className="text-sm" asChild>
          <a
            href={`https://whois.domaintools.com/${domainData?.domain?.domain}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Tentar pesquisa WHOIS
          </a>
        </Button>
      </div>
    )
  );
}

// const getMockContactDetails = (
//   userEmail: string,
//   userName?: string
// ): NamecheapContactDetails => {
//   const nameParts = userName?.split(" ") || ["Usuário", "Teste"];
//   const firstName = nameParts[0];
//   const lastName = nameParts.slice(1).join(" ") || "Teste";

//   return {
//     FirstName: firstName,
//     LastName: lastName,
//     Address1: "Av. Cabo Branco, 1850",
//     City: "Joao Pessoa",
//     StateProvince: "PB", // State/Province code
//     PostalCode: "58045010", // Zip/Postal code
//     Country: "BR", // 2-letter country code
//     Phone: "+55.83991598702", // Format: +CountryCode.PhoneNumber
//     EmailAddress: userEmail,
//   };
// };

async function DomainAvailable({ domainData }: { domainData: DomainData }) {
  async function buyDomainAction(formData: FormData) {
    "use server";

    const user = await getUser();

    const domainName = formData.get("domainName") as string;

    const formYears = formData.get("years") as string;

    const yearsToRegister = formYears ? parseInt(formYears, 10) : 1;
    const registrationPrice = parseFloat(formData.get("price") as string); // This is the USD price
    const isPremium = formData.get("isPremium") === "true";

    if (!user || !user.email) {
      throw new Error("Usuário não autenticado ou e-mail não encontrado.");
    }
    if (!domainName) {
      throw new Error("Nome do domínio é obrigatório.");
    }

    const params: DomainsCreateUserParams = {
      DomainName: domainName,
      Years: yearsToRegister,
      Registrant: adminNamecheapDetails,
      Admin: adminNamecheapDetails,
      Tech: adminNamecheapDetails,
      AuxBilling: adminNamecheapDetails,
      AddFreeWhoisguard: "yes",
      WGEnabled: "yes",
    };

    if (isPremium) {
      params.IsPremiumDomain = true;
      params.PremiumPrice = registrationPrice; // Pass the USD premium price
    }

    try {
      console.log(
        "Attempting to register domain with params:",
        JSON.stringify(params, null, 2)
      );

      const registrationResult = await namecheapApi.createDomain(params);

      console.log("Namecheap registration result:", registrationResult);

      if (registrationResult.Registered) {
        // Optionally, store registration details in your DB here
        redirect("/domains"); // Redirect to domains list or success page
      } else {
        // Handle cases where Namecheap says not registered but no error thrown
        throw new Error(
          `Falha ao registrar o domínio ${domainName} via Namecheap. Motivo desconhecido.`
        );
      }
    } catch (error) {
      console.error(
        `Erro ao registrar o domínio ${domainName} com Namecheap:`,
        error
      );
      // Consider re-throwing a more user-friendly error or redirecting with an error message
      // For now, re-throwing the original or a generic one
      if (error instanceof Error) {
        throw new Error(`Falha ao registrar ${domainName}: ${error.message}`);
      }
      throw new Error(
        `Falha ao registrar ${domainName}. Por favor, tente novamente.`
      );
    }
  }

  return (
    domainData?.available &&
    domainData.domain && (
      <DomainAvailableTemplate
        text1="Domínio inclui serviços gratuitos:"
        text2="Administração de DNS"
        text3="Proteção de privacidade"
        text4="Encaminhamento de Email"
      >
        {/* Form now contains price text and button */}
        <form action={buyDomainAction} className="flex items-center gap-2">
          <input
            type="hidden"
            name="domainName"
            value={domainData.domain.domain}
            readOnly
          />
          <input
            type="hidden"
            name="isPremium"
            value={domainData.domain.isPremium.toString()}
            readOnly
          />
          <Button variant="action" className="w-auto" type="submit">
            Registrar domínio
          </Button>
        </form>
      </DomainAvailableTemplate>
    )
  );
}

export const adminNamecheapDetails = {
  Address1: "Beco Neuteu Maia",
  City: "Rio Branco",
  Country: "BR",
  EmailAddress: "lucasgarrafielo@gmail.com",
  FirstName: "Lucas",
  LastName: "Garrafielo",
  Phone: process.env.ADMIN_PHONENUMBER!,
  PostalCode: "69900430",
  StateProvince: "AC",
};
