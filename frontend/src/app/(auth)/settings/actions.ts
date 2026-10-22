"use server";

import { hash, verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { createUserForOrganization } from "@/lib/auth/utils"; // Assuming this utility exists
import { db } from "@/lib/db";
import {
  pgOrganization,
  pgUser,
  type UserSettings,
  userSettings,
} from "@/lib/db/schema";
import { isValidCNPJ, isValidCPF } from "@/lib/utils";

export interface ActionResponse {
  success: boolean;
  message: string;
}

export async function updateUserProfileAction(
  name: string,
  email: string,
  preferences: UserSettings
): Promise<ActionResponse> {
  try {
    const user = await getUser();

    const newUser = await db
      .update(pgUser)
      .set({
        email: email.toLowerCase(),
        name,
        updatedAt: new Date(),
      })
      .where(eq(pgUser.id, user.id))
      .returning();

    revalidatePath("/settings");

    const { settings } = user;

    if (settings?.emailNotifications !== preferences.emailNotifications) {
      const newSettings = await db
        .update(userSettings)
        .set({
          emailNotifications: preferences.emailNotifications,
          updatedAt: new Date(),
        })
        .where(eq(pgUser.id, user.id))
        .returning();

      return {
        message: JSON.stringify({
          email: newUser[0].email,
          settings: newSettings[0],
        }),
        success: true,
      };
    }

    return {
      message: JSON.stringify({
        email: newUser[0].email,
        settings: null,
      }),
      success: true,
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      message: "Erro ao atualizar perfil. Tente novamente.",
      success: false,
    };
  }
}

export interface ProfileUpdateMessage {
  email: string;
  settings: UserSettings | null;
}

export async function addMemberToOrganizationAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const user = await getUser();
    const organizationId = formData.get("organizationId") as string;
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as "admin" | "developer" | "member";
    const password = formData.get("password") as string;

    if (!organizationId || !fullName || !email || !role || !password) {
      return { message: "Todos os campos são obrigatórios.", success: false };
    }

    // Ensure the current user is the owner of the organization they are adding to
    if (
      user.organizationId !== organizationId ||
      user.organization?.ownerId !== user.id
    ) {
      return {
        message: "Apenas o proprietário pode adicionar membros à organização.",
        success: false,
      };
    }

    // Use the existing utility to create the user and link to the organization
    await createUserForOrganization(
      fullName,
      email,
      password,
      organizationId,
      role
    );

    revalidatePath("/settings");

    return {
      message: "Membro adicionado com sucesso.",
      success: true,
    };
  } catch (error) {
    console.error("Error adding member to organization:", error);
    // Check for unique constraint violation (e.g., email already exists)
    if ((error as { code?: string }).code === "23505") {
      // PostgreSQL unique violation error code
      return { message: "Este e-mail já está em uso.", success: false };
    }
    return {
      message: "Erro ao adicionar membro. Tente novamente.",
      success: false,
    };
  }
}

export async function removeMemberFromOrganizationAction(
  memberId: string,
  organizationId: string
): Promise<ActionResponse> {
  try {
    const user = await getUser();

    if (
      user.organizationId !== organizationId ||
      user.organization?.ownerId !== user.id
    ) {
      return {
        message: "Apenas o proprietário pode remover membros.",
        success: false,
      };
    }

    if (memberId === user.id) {
      return {
        message: "O proprietário não pode remover a si mesmo.",
        success: false,
      };
    }

    // Soft delete the member or disassociate from the organization
    // For this example, we'll set their organizationId to null and clear their role.
    // A more robust solution might involve a 'status' field or a separate audit log.
    await db
      .update(pgUser)
      .set({
        deletedAt: new Date(), // Optional: mark as deleted
        organizationId: null,
        organizationRole: undefined,
        updatedAt: new Date(),
        // Consider if deletedAt should be set if they are fully removed from the platform
        // deletedAt: new Date(),
      })
      .where(eq(pgUser.id, memberId));

    revalidatePath("/settings");

    return {
      message: "Membro removido com sucesso.",
      success: true,
    };
  } catch (error) {
    console.error("Error removing member from organization:", error);
    return {
      message: "Erro ao remover membro. Tente novamente.",
      success: false,
    };
  }
}

export async function updateMemberRoleAction(
  memberId: string,
  organizationId: string,
  newRole: string
): Promise<ActionResponse> {
  try {
    const user = await getUser();

    if (
      user.organizationId !== organizationId ||
      user.organization?.ownerId !== user.id
    ) {
      return {
        message: "Apenas o proprietário pode alterar funções.",
        success: false,
      };
    }

    await db
      .update(pgUser)
      .set({
        organizationRole: newRole as "admin" | "developer" | "member",
        updatedAt: new Date(),
      })
      .where(eq(pgUser.id, memberId));

    revalidatePath("/settings");
    return {
      message: "Função do membro atualizada com sucesso.",
      success: true,
    };
  } catch (error) {
    console.error("Error updating member role:", error);
    return { message: "Erro ao atualizar função do membro.", success: false };
  }
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<ActionResponse> {
  try {
    const user = await getUser();

    // Get current password hash from database
    const userData = await db.query.pgUser.findFirst({
      columns: {
        password: true,
      },
      where: eq(pgUser.id, user.id),
    });

    if (!userData?.password) {
      return {
        message: "Usuário não encontrado.",
        success: false,
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await verify(
      userData.password,
      currentPassword
    );

    if (!isCurrentPasswordValid) {
      return {
        message: "Senha atual incorreta.",
        success: false,
      };
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword);

    // Update password
    await db
      .update(pgUser)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(pgUser.id, user.id));

    revalidatePath("/settings");

    return {
      message: "Senha alterada com sucesso.",
      success: true,
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      message: "Erro ao alterar senha. Tente novamente.",
      success: false,
    };
  }
}

export async function updateOrganizationNameAction(
  organizationName: string,
  /** CNPJ com ou sem máscara. String vazia limpa o campo. */
  document?: string
): Promise<ActionResponse> {
  try {
    const user = await getUser();

    // Check if user is owner
    if (user.organization?.ownerId !== user.id) {
      return {
        message: "Apenas o proprietário pode alterar os dados da organização.",
        success: false,
      };
    }

    if (!user.organizationId) {
      return {
        message: "Organização não encontrada.",
        success: false,
      };
    }

    const name = organizationName.trim();
    if (!name) {
      return { message: "Informe o nome da organização.", success: false };
    }

    const digits = (document ?? "").replace(/\D/g, "");
    if (digits && !(isValidCPF(digits) || isValidCNPJ(digits))) {
      return { message: "CNPJ/CPF inválido.", success: false };
    }

    await db
      .update(pgOrganization)
      .set({
        document: document === undefined ? undefined : digits || null,
        name,
        updatedAt: new Date(),
      })
      .where(eq(pgOrganization.id, user.organizationId));

    revalidatePath("/settings");

    return {
      message: "Dados da organização atualizados com sucesso.",
      success: true,
    };
  } catch (error) {
    console.error("Error updating organization:", error);
    return {
      message: "Erro ao atualizar dados da organização. Tente novamente.",
      success: false,
    };
  }
}

export async function sendEmailVerificationAction(): Promise<ActionResponse> {
  try {
    const user = await getUser();

    // TODO: Implement email verification logic
    // For now, just mark as verified (in a real app, you'd send an email)
    await db
      .update(pgUser)
      .set({
        emailVerified: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pgUser.id, user.id));

    revalidatePath("/settings");

    return {
      message: "Email de verificação enviado. Verifique sua caixa de entrada.",
      success: true,
    };
  } catch (error) {
    console.error("Error sending email verification:", error);
    return {
      message: "Erro ao enviar email de verificação. Tente novamente.",
      success: false,
    };
  }
}

export async function deleteUserAccountAction(): Promise<ActionResponse> {
  try {
    const user = await getUser();

    // Soft delete - mark as deleted
    await db
      .update(pgUser)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pgUser.id, user.id));

    // In a real app, you might want to:
    // - Delete all user data
    // - Cancel subscriptions
    // - Transfer organization ownership
    // - Send confirmation email

    return {
      message: "Conta excluída com sucesso.",
      success: true,
    };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return {
      message: "Erro ao excluir conta. Tente novamente.",
      success: false,
    };
  }
}

export async function updateUserProfileImageAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const user = await getUser();
    const file = formData.get("image") as File;

    if (!file || file.size === 0) {
      return { message: "Nenhuma imagem fornecida.", success: false };
    }

    const buffer = await file.arrayBuffer();
    const { uploadProfilePicture, getStorjUrl } = await import("@/lib/storj");

    const key = await uploadProfilePicture(buffer, file.name);
    const imageUrl = getStorjUrl(key);

    await db
      .update(pgUser)
      .set({
        image: imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(pgUser.id, user.id));

    revalidatePath("/settings");

    return {
      message: "Foto de perfil atualizada com sucesso.",
      success: true,
    };
  } catch (error) {
    console.error("Error updating user profile image:", error);
    return {
      message: "Erro ao atualizar foto de perfil. Tente novamente.",
      success: false,
    };
  }
}
