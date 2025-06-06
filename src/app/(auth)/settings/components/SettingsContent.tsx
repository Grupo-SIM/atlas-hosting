"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletSection } from "./WalletSection";
import { SubscriptionSection } from "./SubscriptionSection";
import { OrganizationSection } from "./OrganizationSection";
import { UserSection } from "./UserSection";
import type { User } from "@/lib/db/schema/tables/user";

interface SettingsContentProps {
  user: User;
  invoices: any[];
}

export function SettingsContent({ user, invoices }: SettingsContentProps) {
  return (
    <Tabs defaultValue="user" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="user">Perfil</TabsTrigger>
        <TabsTrigger value="organization">Organização</TabsTrigger>
        <TabsTrigger value="subscription">Assinatura</TabsTrigger>
        <TabsTrigger value="wallet">Carteira</TabsTrigger>
      </TabsList>

      <TabsContent value="user" className="space-y-6">
        <UserSection user={user} />
      </TabsContent>

      <TabsContent value="organization" className="space-y-6">
        <OrganizationSection user={user} />
      </TabsContent>

      <TabsContent value="subscription" className="space-y-6">
        <SubscriptionSection user={user} />
      </TabsContent>

      <TabsContent value="wallet" className="space-y-6">
        <WalletSection user={user} invoices={invoices} />
      </TabsContent>
    </Tabs>
  );
}
