"use client";

import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Plan } from "@/lib/db/schema";
import { PlanForm } from "./PlanForm";

// import { deletePlan as deletePlanAction } from "@/app/actions"; // TODO: Uncomment when deletePlanAction is implemented in actions.ts

interface PlansSectionProps {
  initialPlans: Plan[];
}

export default function PlansSection({ initialPlans }: PlansSectionProps) {
  const router = useRouter();
  // The initialPlans prop will keep this component updated when router.refresh() is called
  // No need for a separate 'plans' state if initialPlans is always the source of truth after refresh
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<Plan | null>(null);
  // Key to force re-mount PlanForm, ensuring defaultValues are correctly applied
  const [planFormKey, setPlanFormKey] = React.useState(Date.now());

  const handleOpenNewPlanModal = () => {
    setEditingPlan(null);
    setPlanFormKey(Date.now()); // Reset form by changing key
    setIsCreateModalOpen(true);
  };

  const handleOpenEditPlanModal = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanFormKey(Date.now()); // Reset form for editing
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    // Delay resetting editingPlan to allow modal fade-out animation if any
    setTimeout(() => setEditingPlan(null), 300);
  };

  const handleFormSuccess = () => {
    handleModalClose();
    router.refresh(); // Re-fetches data on the server component, updating initialPlans
  };

  const handleDeletePlan = async (_planId: string) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita."
      )
    ) {
      try {
        // alert("Plano deletado (simulação). Implemente a ação no servidor."); // Optional: for quick feedback during dev
        router.refresh();
      } catch (_error) {
        // alert("Erro ao deletar o plano. Verifique o console."); // Optional: for quick feedback during dev
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex w-full items-center justify-between">
            <CardTitle>Planos de Assinatura</CardTitle>
            <Button onClick={handleOpenNewPlanModal}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Plano
            </Button>
          </div>
          <CardDescription>
            Visualize, adicione, edite e remova os planos disponíveis para os
            usuários.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Descrição
                  </TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="hidden sm:table-cell">Sites</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Armz. (GB)
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">SSL</TableHead>
                  <TableHead className="hidden lg:table-cell">Backup</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Destaque
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialPlans.map(plan => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="hidden max-w-xs truncate text-muted-foreground text-sm md:table-cell">
                      {plan.description}
                    </TableCell>
                    <TableCell>
                      R$ {plan.price ? plan.price.toFixed(2) : "0.00"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {plan.maxSites}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {plan.maxStorage}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {plan.ssl ? "Sim" : "Não"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {plan.backup ? "Sim" : "Não"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {plan.featured ? "Sim" : "Não"}
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      <Button
                        aria-label="Editar Plano"
                        className="h-8 w-8"
                        onClick={() => handleOpenEditPlanModal(plan)}
                        size="icon"
                        variant="outline"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        aria-label="Excluir Plano"
                        className="h-8 w-8"
                        onClick={() => handleDeletePlan(plan.id)}
                        size="icon"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {initialPlans.length === 0 && (
            <p className="py-6 text-center text-muted-foreground">
              Nenhum plano encontrado. Clique em &quot;Adicionar Plano&quot;
              para começar.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create Plan Modal */}
      <Dialog onOpenChange={setIsCreateModalOpen} open={isCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Plano</DialogTitle>
            <DialogDescription>
              Preencha os detalhes para criar um novo plano.
            </DialogDescription>
          </DialogHeader>
          {isCreateModalOpen && (
            <PlanForm
              key={planFormKey} // Ensures form resets when re-opened
              onCancel={handleModalClose}
              onSuccess={handleFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Plan Modal */}
      <Dialog onOpenChange={setIsEditModalOpen} open={isEditModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>
              Modifique os detalhes do plano existente.
            </DialogDescription>
          </DialogHeader>
          {isEditModalOpen && editingPlan && (
            <PlanForm
              key={planFormKey} // Ensures form resets with plan data
              onCancel={handleModalClose}
              onSuccess={handleFormSuccess}
              plan={editingPlan}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
