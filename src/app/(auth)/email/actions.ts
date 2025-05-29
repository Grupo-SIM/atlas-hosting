"use server";

import {
  addMailAccount,
  deleteMailAccount,
} from "@/lib/server/apis/email/client";
import type { AddMailNamePayload } from "@/lib/server/apis/email/types";
import { revalidatePath } from "next/cache";

export async function createEmailAccountAction(formData: FormData) {
  const mailName = formData.get("mailName") as string;
  const password = formData.get("password") as string;
  const siteId = formData.get("siteId")
    ? +(formData.get("siteId") as string)
    : undefined;
  const quota = formData.get("quota")
    ? Number.parseInt(formData.get("quota") as string, 10)
    : undefined;

  if (!mailName || !password || !siteId) {
    return;
  }

  const mailAccountData: AddMailNamePayload["mailname"] = {
    name: mailName,
    password: { value: password, type: "plain" },
    mailbox: {
      enabled: true,
      quota: quota ? quota * 1024 * 1024 : -1, // Convert MB to bytes, or -1 for unlimited
    },
  };

  await addMailAccount(siteId, mailAccountData);
  revalidatePath("/email"); // Or the specific path you are on

  return;
}

export async function deleteEmailAccountAction(mailNameId: number) {
  await deleteMailAccount(mailNameId);
  revalidatePath("/email");
  // You might want to return a success/error message here too
}
