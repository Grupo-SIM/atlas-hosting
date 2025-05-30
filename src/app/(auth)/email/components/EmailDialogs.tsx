// src/app/(auth)/email/components/EmailDialogs.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { UserEmailAccountConfig } from "@/lib/db/schema/tables/email";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  type EmailAccountFormData,
  createPleskEmailAccountAction,
  saveEmailAccountConfigAction,
} from "../actions";

// Schema for adding/editing a generic (non-Plesk or Plesk after creation) email account config
const emailConfigSchema = z.object({
  emailAddress: z.string().email("Invalid email address."),
  // emailPasswordPlesk is for the initial Plesk password, or a general password for non-Plesk
  emailPasswordPlesk: z.string().min(1, "Password is required."),

  imapHost: z.string().min(1, "IMAP Host is required."),
  imapPort: z.coerce.number().min(1, "IMAP Port is required."),
  imapUsername: z.string().min(1, "IMAP Username is required."),
  imapPassword: z.string().optional(), // Optional: if same as emailPasswordPlesk
  imapSecure: z.boolean().default(true),

  smtpHost: z.string().min(1, "SMTP Host is required."),
  smtpPort: z.coerce.number().min(1, "SMTP Port is required."),
  smtpUsername: z.string().min(1, "SMTP Username is required."),
  smtpPassword: z.string().optional(), // Optional: if same as emailPasswordPlesk
  smtpSecure: z.boolean().default(true),
});
type EmailConfigFormValues = z.infer<typeof emailConfigSchema>;

interface EmailConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: string; // For context, might prefill parts of email
  account?: UserEmailAccountConfig | null; // For editing
  onSuccess: () => void;
}

export function EmailAccountConfigDialog({
  open,
  onOpenChange,
  domain,
  account,
  onSuccess,
}: EmailConfigDialogProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<EmailConfigFormValues>({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: account
      ? {
          emailAddress: account.emailAddress,
          // Cannot prefill passwords for editing, user must re-enter if changing
          emailPasswordPlesk: "",
          imapHost: account.imapHost,
          imapPort: account.imapPort,
          imapUsername: account.imapUsername,
          imapSecure: account.imapSecure,
          smtpHost: account.smtpHost,
          smtpPort: account.smtpPort,
          smtpUsername: account.smtpUsername,
          smtpSecure: account.smtpSecure,
        }
      : {
          emailAddress: `@${domain}`,
          imapSecure: true,
          smtpSecure: true,
          imapPort: 993,
          smtpPort: 465,
        },
  });

  const onSubmit = (values: EmailConfigFormValues) => {
    startTransition(async () => {
      const actionData: EmailAccountFormData = {
        ...values,
        domain, // Ensure domain is passed
        isPleskManaged: account?.isPleskManaged || false, // Preserve if editing
        pleskSiteId: account?.pleskSiteId || undefined,
      };
      const result = await saveEmailAccountConfigAction(actionData);
      if (result.success) {
        toast.success(
          account ? "Email account updated!" : "Email account configured!"
        );
        onSuccess();
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(result.error || "An unknown error occurred.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {account ? "Edit" : "Add"} Email Account Configuration
          </DialogTitle>
          <DialogDescription>
            {account ? "Update the details for" : "Enter the details for"} your
            self-hosted email account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emailAddress">Email Address</Label>
              <Input id="emailAddress" {...form.register("emailAddress")} />
              {form.formState.errors.emailAddress && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.emailAddress.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="emailPasswordPlesk">Account Password</Label>
              <Input
                id="emailPasswordPlesk"
                type="password"
                {...form.register("emailPasswordPlesk")}
                placeholder={account ? "Enter new password to change" : ""}
              />
              {form.formState.errors.emailPasswordPlesk && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.emailPasswordPlesk.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                This password will be used if specific IMAP/SMTP passwords are
                not set.
              </p>
            </div>
          </div>

          <h3 className="text-md font-semibold border-t pt-3">
            IMAP Settings (Incoming Mail)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="imapHost">IMAP Host</Label>
              <Input id="imapHost" {...form.register("imapHost")} />
            </div>
            <div>
              <Label htmlFor="imapPort">IMAP Port</Label>
              <Input
                id="imapPort"
                type="number"
                {...form.register("imapPort")}
              />
            </div>
            <div>
              <Label htmlFor="imapUsername">IMAP Username</Label>
              <Input id="imapUsername" {...form.register("imapUsername")} />
            </div>
            <div>
              <Label htmlFor="imapPassword">IMAP Password (optional)</Label>
              <Input
                id="imapPassword"
                type="password"
                {...form.register("imapPassword")}
                placeholder="If different from account password"
              />
            </div>
            <div className="flex items-center space-x-2 col-span-full">
              <Switch
                id="imapSecure"
                checked={form.watch("imapSecure")}
                onCheckedChange={(checked) =>
                  form.setValue("imapSecure", checked)
                }
              />
              <Label htmlFor="imapSecure">Use SSL/TLS</Label>
            </div>
          </div>
          {form.formState.errors.imapHost && (
            <p className="text-xs text-destructive mt-1">
              {form.formState.errors.imapHost.message}
            </p>
          )}
          {/* ... other IMAP errors ... */}

          <h3 className="text-md font-semibold border-t pt-3">
            SMTP Settings (Outgoing Mail)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input id="smtpHost" {...form.register("smtpHost")} />
            </div>
            <div>
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                {...form.register("smtpPort")}
              />
            </div>
            <div>
              <Label htmlFor="smtpUsername">SMTP Username</Label>
              <Input id="smtpUsername" {...form.register("smtpUsername")} />
            </div>
            <div>
              <Label htmlFor="smtpPassword">SMTP Password (optional)</Label>
              <Input
                id="smtpPassword"
                type="password"
                {...form.register("smtpPassword")}
                placeholder="If different from account password"
              />
            </div>
            <div className="flex items-center space-x-2 col-span-full">
              <Switch
                id="smtpSecure"
                checked={form.watch("smtpSecure")}
                onCheckedChange={(checked) =>
                  form.setValue("smtpSecure", checked)
                }
              />
              <Label htmlFor="smtpSecure">
                Use SSL/TLS (port 465) or STARTTLS (port 587, uncheck SSL/TLS)
              </Label>
            </div>
          </div>
          {/* ... SMTP errors ... */}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : account
                  ? "Update Account"
                  : "Add Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Schema for creating Plesk email (simpler, assumes Plesk server details are known/fixed for the instance)
const pleskEmailCreateSchema = z.object({
  username: z.string().min(1, "Username (before @) is required."),
  passwordPlesk: z.string().min(8, "Password must be at least 8 characters."),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  quotaMB: z.coerce.number().optional(),
});
type PleskEmailCreateFormValues = z.infer<typeof pleskEmailCreateSchema>;

interface CreatePleskEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: string;
  onSuccess: () => void;
  // These would come from global app config or user's Plesk server settings
  pleskImapHost: string;
  pleskImapPort: number;
  pleskImapSecure: boolean;
  pleskSmtpHost: string;
  pleskSmtpPort: number;
  pleskSmtpSecure: boolean;
}

export function CreatePleskEmailDialog({
  open,
  onOpenChange,
  domain,
  onSuccess,
  ...pleskServerConfig
}: CreatePleskEmailDialogProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<PleskEmailCreateFormValues>({
    resolver: zodResolver(pleskEmailCreateSchema),
    defaultValues: { quotaMB: 1024 },
  });

  const onSubmit = (values: PleskEmailCreateFormValues) => {
    startTransition(async () => {
      const result = await createPleskEmailAccountAction({
        ...values,
        domain,
        ...pleskServerConfig,
      });
      if (result.success) {
        toast.success("Plesk email account created and configured!");
        onSuccess();
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(result.error || "An unknown error occurred.");
      }
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Plesk Email Account</DialogTitle>
          <DialogDescription>
            For domain: {domain}. This will create the account on your Plesk
            server.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="username">Username (before @{domain})</Label>
            <Input id="username" {...form.register("username")} />
            {form.formState.errors.username && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="passwordPlesk">Password</Label>
            <Input
              id="passwordPlesk"
              type="password"
              {...form.register("passwordPlesk")}
            />
            {form.formState.errors.passwordPlesk && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.passwordPlesk.message}
              </p>
            )}
          </div>
          {/* Optional fields like quota, firstName, lastName can be added here */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: UserEmailAccountConfig | null;
  domain: string;
  onSuccess: () => void;
}
export function DeleteEmailDialog({
  open,
  onOpenChange,
  account,
  domain,
  onSuccess,
}: DeleteEmailDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!account) return;
    startTransition(async () => {
      const result = await deleteEmailAccountAction(
        account.emailAddress,
        domain
      );
      if (result.success) {
        toast.success(result.message || "Email account deleted!");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to delete email account.");
      }
    });
  };

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Email Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {account.emailAddress}?
            {account.isPleskManaged &&
              " This will also attempt to remove it from Plesk."}
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
