"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  createPlan as createPlanAction,
  updatePlan as updatePlanAction,
} from "@/app/actions";

const planFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional().default(""),
  price: z.coerce.number().min(0, "Preço deve ser não-negativo"),
  maxSites: z.coerce
    .number()
    .int()
    .min(0, "Número de sites deve ser não-negativo"),
  maxStorage: z.coerce
    .number()
    .min(0, "Armazenamento (GB) deve ser não-negativo"),
  ssl: z.boolean().default(false),
  backup: z.boolean().default(false),
  email: z.boolean().default(false),
  cdn: z.boolean().default(false),
  supportPriority: z.boolean().default(false),
  featured: z.boolean().default(false),
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
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: plan?.name || "",
      description: plan?.description || "",
      price: plan?.price || 0,
      maxSites: plan?.maxSites || 0,
      maxStorage: plan?.maxStorage || 0,
      ssl: plan?.ssl,
      backup: plan?.backup,
      email: plan?.email,
      cdn: plan?.cdn,
      supportPriority: plan?.supportPriority,
      featured: plan?.featured,
    },
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
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 md:space-y-6"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="29.90"
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
                  <Input type="number" placeholder="1" {...field} />
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
                  <Input type="number" step="0.1" placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormLabel>Recursos Inclusos</FormLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {[
              { name: "ssl", label: "SSL Gratuito" },
              { name: "backup", label: "Backup Automático" },
              { name: "email", label: "Contas de Email" },
              { name: "cdn", label: "CDN Inclusa" },
              { name: "supportPriority", label: "Suporte Prioritário" },
              { name: "featured", label: "Plano em Destaque" },
            ].map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name as keyof PlanFormValues}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <FormLabel className="text-sm font-normal">
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
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
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
