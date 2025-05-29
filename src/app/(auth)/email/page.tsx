import { getMailAccounts } from "@/lib/server/apis/email/client";
import { createEmailAccountAction, deleteEmailAccountAction } from "./actions";
import {
  getUserCurrentDomain,
  getUserDomains,
} from "@/lib/server/utils";
import type { ListDomainDomain } from "@/lib/server/apis/namesilo/types";
import type { MailName } from "@/lib/server/apis/email/types";
import { getUser } from "@/lib/auth";
import pleskApi from "@/lib/server/apis/plesk";
import DomainSelector from "@/components/domains/DomainSelector";

// A simple client component for the delete button to avoid full page reload on confirm
// You could also use a form for deletion.
const DeleteButton = ({ mailNameId }: { mailNameId: number }) => {
  // This component would ideally be in its own file e.g. src/components/email/DeleteButton.tsx
  // For simplicity, it's inline here.
  // To make it a client component, you'd add "use client" at the top of its file.
  // And then handle the form submission with startTransition for pending states.
  return (
    <form
      action={async () => {
        if (confirm("Tem certeza que deseja excluir esta conta de e-mail?")) {
          await deleteEmailAccountAction(mailNameId);
        }
      }}
    >
      <button type="submit" className="text-red-500 hover:text-red-700">
        Excluir
      </button>
    </form>
  );
};

export default async function EmailPage() {
  const user = await getUser();

  const domains = await getUserDomains(user.id);
  const selectedDomain = await getUserCurrentDomain(user);

  console.log("Selected Domain:", selectedDomain);

  if (!selectedDomain) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Nenhum domínio selecionado</h1>
        <p>
          Por favor, selecione um domínio para gerenciar as contas de e-mail.
        </p>
      </div>
    );
  }

  let mailAccounts: MailName[] = [];
  let error: string | null = null;

  console.log({ selectedDomain });

  try {
    mailAccounts = await getMailAccounts(+user.pleskId!);
    console.log("Mail Accounts:", mailAccounts);
  } catch (e) {
    console.error("Erro ao buscar contas de e-mail:", e);
    error =
      "Não foi possível carregar as contas de e-mail. Tente novamente mais tarde.";
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="flex items-center justify-between text-2xl font-bold mb-4">
        <span>Gerenciamento de Contas de E-mail ({selectedDomain.Name})</span>
        <DomainSelector domains={domains} selectedDomain={selectedDomain} />
      </h1>

      {error && (
        <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>
      )}

      <div className="mb-8 p-4 border rounded shadow">
        <h2 className="text-xl font-semibold mb-3">
          Criar Nova Conta de E-mail
        </h2>
        {/* For more complex forms with client-side validation, create a separate client component */}
        <form action={createEmailAccountAction} className="space-y-3">
          <div>
            <label
              htmlFor="mailName"
              className="block text-sm font-medium text-gray-700"
            >
              Nome de Usuário do E-mail (ex: info):
            </label>
            <input
              type="text"
              name="mailName"
              id="mailName"
              required={true}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha:
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required={true}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Criar Conta
          </button>
        </form>
      </div>

      <h2 className="text-xl font-semibold mb-3">
        Contas de E-mail Existentes
      </h2>
      {mailAccounts.length > 0 ? (
        <ul className="space-y-2">
          {mailAccounts.map((account) => (
            <li
              key={account.id}
              className="p-3 border rounded shadow-sm flex justify-between items-center"
            >
              <div>
                <span className="font-medium">
                  {account.name}@
                  {account.site_name || `site-id-${account.site_id}`}
                </span>
                {account.mailbox && (
                  <span className="text-sm text-gray-600 ml-2">
                    (Cota:{" "}
                    {account.mailbox.quota === -1
                      ? "Ilimitada"
                      : `${(account.mailbox.quota || 0) / 1024 / 1024} MB`}
                    )
                  </span>
                )}
              </div>
              <DeleteButton mailNameId={account.id} />
            </li>
          ))}
        </ul>
      ) : (
        !error && <p>Nenhuma conta de e-mail encontrada para este site.</p>
      )}
    </div>
  );
}
