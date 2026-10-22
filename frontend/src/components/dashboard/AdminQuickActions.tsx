import { Globe, Server, Ticket, Users } from "lucide-react";
import { MotionDiv } from "./MotionDiv";
import {
  containerVariants,
  itemVariants,
  QuickActionCard,
} from "./QuickActions";

/**
 * Mesma UI do dashboard do cliente — só troca os cards. Cada card é um dos itens
 * de admin que saíram da sidebar; as telas de destino continuam as mesmas.
 */
export function AdminQuickActions() {
  return (
    <MotionDiv
      animate="visible"
      className="space-y-8"
      initial="hidden"
      variants={containerVariants}
    >
      <MotionDiv variants={itemVariants}>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-600 to-zinc-800 shadow-lg">
            <Server className="h-4 w-4 text-white" />
          </div>
          <h2 className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text font-bold text-2xl text-transparent">
            Infraestrutura
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <QuickActionCard
            gradient="from-zinc-500 to-zinc-700"
            href="/admin/vps"
            Icon={Server}
            pattern="grid"
            subtitle="Gerencie os servidores VPS da plataforma"
            title="Administração de VPS"
          />

          <QuickActionCard
            gradient="from-zinc-500 to-zinc-700"
            href="/admin/suppliers"
            Icon={Globe}
            pattern="grid"
            subtitle="Saldo Namecheap para domínios"
            title="Fornecedores"
          />

          <QuickActionCard
            gradient="from-neutral-500 to-neutral-700"
            href="/admin/vps-plans"
            Icon={Server}
            pattern="dots"
            subtitle="Assinaturas VPS e links de pagamento"
            title="Planos VPS"
          />
        </div>
      </MotionDiv>

      <MotionDiv variants={itemVariants}>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-500 to-neutral-700 shadow-lg">
            <Users className="h-4 w-4 text-white" />
          </div>
          <h2 className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text font-bold text-2xl text-transparent">
            Clientes
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <QuickActionCard
            gradient="from-zinc-500 to-zinc-700"
            href="/admin/users"
            Icon={Users}
            pattern="dots"
            subtitle="Gerencie contas de usuários da plataforma"
            title="Usuários"
          />

          <QuickActionCard
            gradient="from-neutral-500 to-neutral-700"
            href="/admin/affiliates"
            Icon={Users}
            pattern="grid"
            subtitle="Acompanhe afiliados e suas indicações"
            title="Afiliados"
          />

          <QuickActionCard
            gradient="from-stone-500 to-stone-700"
            href="/admin/vouchers"
            Icon={Ticket}
            pattern="waves"
            subtitle="Crie e gerencie vouchers de desconto"
            title="Vouchers"
          />
        </div>
      </MotionDiv>
    </MotionDiv>
  );
}
