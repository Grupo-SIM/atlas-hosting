"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  createPlan as createPlanAction,
  updatePlan as updatePlanAction,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Plan } from "@/lib/db/schema";

const planFormSchema = z.object({
  backup: z.boolean().default(false),
  cdn: z.boolean().default(false),
  description: z.string().optional().default(""),
  email: z.boolean().default(false),
  featured: z.boolean().default(false),
  maxSites: z.coerce
    .number()
    .int()
    .min(0, "Número de sites deve ser não-negativo"),
  maxStorage: z.coerce
    .number()
    .min(0, "Armazenamento (GB) deve ser não-negativo"),
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.coerce.number().min(0, "Preço deve ser não-negativo"),
  ssl: z.boolean().default(false),
  supportPriority: z.boolean().default(false),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

interface PlanFormProps {
  plan?: Plan | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PlanForm({ plan, onSuccess, onCancel }: PlanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!plan;

  const form = useForm<PlanFormValues>({
    defaultValues: {
      backup: plan?.backup ?? undefined,
      cdn: plan?.cdn ?? undefined,
      description: plan?.description || "",
      email: plan?.email ?? undefined,
      featured: plan?.featured ?? undefined,
      maxSites: plan?.maxSites || 0,
      maxStorage: plan?.maxStorage || 0,
      name: plan?.name || "",
      price: plan?.price || 0,
      ssl: plan?.ssl ?? undefined,
      supportPriority: plan?.supportPriority ?? undefined,
    },
    resolver: zodResolver(planFormSchema),
  });

  async function onSubmit(data: PlanFormValues) {
    startTransition(async () => {
      try {
        if (isEditing && plan?.id) {
          await updatePlanAction(plan.id, data);
        } else {
          // The createPlanAction expects (prevState, input)
          // For now, passing undefined as prevState. Adjust if your action handles it differently.
          await createPlanAction(
            undefined,
            data as Omit<Plan, "id" | "createdAt" | "updatedAt">
          );
        }
        onSuccess();
        router.refresh(); // Refreshes Server Components and re-fetches data
      } catch (_error) {
        // TODO: Add user-facing error messages (e.g., via toast)
      }
    });
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4 md:space-y-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Plano</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Plano Básico" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva as características principais do plano..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="29.90"
                    step="0.01"
                    type="number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxSites"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Máx. Sites</FormLabel>
                <FormControl>
                  <Input placeholder="1" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxStorage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Armazenamento (GB)</FormLabel>
                <FormControl>
                  <Input placeholder="10" step="0.1" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormLabel>Recursos Inclusos</FormLabel>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {[
              { label: "SSL Gratuito", name: "ssl" },
              { label: "Backup Automático", name: "backup" },
              { label: "Contas de Email", name: "email" },
              { label: "CDN Inclusa", name: "cdn" },
              { label: "Suporte Prioritário", name: "supportPriority" },
              { label: "Plano em Destaque", name: "featured" },
            ].map(item => (
              <FormField
                control={form.control}
                key={item.name}
                name={item.name as keyof PlanFormValues}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <FormLabel className="font-normal text-sm">
                      {item.label}
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            disabled={isPending}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending
              ? isEditing
                ? "Salvando..."
                : "Criando..."
              : isEditing
                ? "Salvar Alterações"
                : "Criar Plano"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
