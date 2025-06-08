import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgInvoice } from "@/lib/db/schema";
import { formatDate, toBrl } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { eq } from "drizzle-orm";
import {
  ArrowDownLeft,
  ArrowUpCircle,
  ArrowUpRight,
  History,
  Plus,
} from "lucide-react";

const quickAddAmounts = [50, 100, 250, 500];

export default async function WalletPage() {
  const user = await getUser();

  const invoices = await db.query.pgInvoice.findMany({
    where: eq(pgInvoice.orgId, user.organization.id),
    orderBy: (pgInvoice, { desc }) => [pgInvoice.createdAt],
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Minha carteira
          </h1>
          <p className="text-muted-foreground">
            Gerencie seu saldo e métodos de pagamento
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar fundos
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Saldo</CardTitle>
            <CardDescription>Saldo disponível em sua carteira</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">
                  {toBrl(user.organization.wallet?.balance ?? 0)}
                </span>
                <Badge
                  variant="outline"
                  className="ml-3 bg-green-500/10 text-green-500"
                >
                  <ArrowUpCircle className="mr-1 h-3 w-3" />
                  +$300 this month
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Última transação:{" "}
                {format(invoices[0]?.createdAt, "PPP", { locale: ptBR })}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Transações recentes</h3>
              <div className="space-y-3">
                {invoices.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          h-8 w-8 rounded-full flex items-center justify-center
                          ${
                            // transaction.type === "deposit"
                            false
                              ? "bg-green-500/10 text-green-500"
                              : "bg-amber-500/10 text-amber-500"
                          }
                        `}
                      >
                        {false ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-medium ${false ? "text-green-500" : ""}`}
                    >
                      {false ? "+" : ""}
                      {toBrl(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">
                <History className="mr-2 h-4 w-4" />
                Ver todas as transações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Métodos de pagamento</CardTitle>
                <CardDescription>Gerencie seus cartões salvos</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar cartão
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar novo cartão</DialogTitle>
                    <DialogDescription>
                      Adicione um novo cartão à sua carteira para pagamentos
                      futuros
                    </DialogDescription>
                  </DialogHeader>
                  {/* Card input form would go here */}
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* user.organization.wallet..map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium capitalize">{card.type}</p>
                      {card.isDefault && (
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary"
                        >
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      •••• {card.last4} • Expires {card.expiry}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={card.isDefault ? "text-primary" : ""}
                  >
                    {card.isDefault ? (
                      <Star className="h-4 w-4" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )) */}
          </CardContent>
        </Card>
      </div>

      {/* Add Funds Dialog */}
      {/* <Dialog open={isAddingFunds} onOpenChange={setIsAddingFunds}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Funds to Wallet</DialogTitle>
            <DialogDescription>
              Choose an amount and payment method to add funds
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-2">
              {quickAddAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className="h-12"
                  onClick={() => handleQuickAddAmount(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Or enter custom amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-7"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Select payment method
              </Label>
              <div className="space-y-2">
                {savedCards.map((card) => (
                  <div
                    key={card.id}
                    className={`
                        flex items-center justify-between p-3 border rounded-lg cursor-pointer
                        ${selectedCard === card.id ? "border-primary bg-primary/5" : "hover:bg-accent/50"}
                        transition-colors
                      `}
                    onClick={() => setSelectedCard(card.id)}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">
                        {card.type} •••• {card.last4}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              disabled={
                isProcessing ||
                (!selectedAmount && !customAmount) ||
                !selectedCard
              }
              onClick={handleAddFunds}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Add ${selectedAmount || customAmount || "0"} to Wallet
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
