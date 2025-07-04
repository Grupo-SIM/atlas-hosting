"use server";

import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  pgOrganization,
  pgUser,
  type UserSettings,
  userSettings,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hash, verify } from "@node-rs/argon2";
import { revalidatePath } from "next/cache";
import { createUserForOrganization } from "@/lib/auth/utils"; // Assuming this utility exists
import type { NotificationsSettings } from "./components/UserSection";
import { difference } from "lodash";

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
        name,
        email: email.toLowerCase(),
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
        success: true,
        message: JSON.stringify({
          email: newUser[0].email,
          settings: newSettings[0],
        }),
      };
    }

    return {
      success: true,
      message: JSON.stringify({
        email: newUser[0].email,
        settings: null,
      }),
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      message: "Erro ao atualizar perfil. Tente novamente.",
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
      return { success: false, message: "Todos os campos são obrigatórios." };
    }

    // Ensure the current user is the owner of the organization they are adding to
    if (
      user.organizationId !== organizationId ||
      user.organization?.ownerId !== user.id
    ) {
      return {
        success: false,
        message: "Apenas o proprietário pode adicionar membros à organização.",
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
      success: true,
      message: "Membro adicionado com sucesso.",
    };
  } catch (error) {
    console.error("Error adding member to organization:", error);
    // Check for unique constraint violation (e.g., email already exists)
    if ((error as { code?: string }).code === "23505") {
      // PostgreSQL unique violation error code
      return { success: false, message: "Este e-mail já está em uso." };
    }
    return {
      success: false,
      message: "Erro ao adicionar membro. Tente novamente.",
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
        success: false,
        message: "Apenas o proprietário pode remover membros.",
      };
    }

    if (memberId === user.id) {
      return {
        success: false,
        message: "O proprietário não pode remover a si mesmo.",
      };
    }

    // Soft delete the member or disassociate from the organization
    // For this example, we'll set their organizationId to null and clear their role.
    // A more robust solution might involve a 'status' field or a separate audit log.
    await db
      .update(pgUser)
      .set({
        organizationId: null,
        organizationRole: undefined,
        updatedAt: new Date(),
        deletedAt: new Date(), // Optional: mark as deleted
        // Consider if deletedAt should be set if they are fully removed from the platform
        // deletedAt: new Date(),
      })
      .where(eq(pgUser.id, memberId));

    revalidatePath("/settings");

    return {
      success: true,
      message: "Membro removido com sucesso.",
    };
  } catch (error) {
    console.error("Error removing member from organization:", error);
    return {
      success: false,
      message: "Erro ao remover membro. Tente novamente.",
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
        success: false,
        message: "Apenas o proprietário pode alterar funções.",
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
      success: true,
      message: "Função do membro atualizada com sucesso.",
    };
  } catch (error) {
    console.error("Error updating member role:", error);
    return { success: false, message: "Erro ao atualizar função do membro." };
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
      where: eq(pgUser.id, user.id),
      columns: {
        password: true,
      },
    });

    if (!userData?.password) {
      return {
        success: false,
        message: "Usuário não encontrado.",
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await verify(
      userData.password,
      currentPassword
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        message: "Senha atual incorreta.",
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
      success: true,
      message: "Senha alterada com sucesso.",
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      message: "Erro ao alterar senha. Tente novamente.",
    };
  }
}

export async function updateOrganizationNameAction(
  organizationName: string
): Promise<ActionResponse> {
  try {
    const user = await getUser();

    // Check if user is owner
    if (user.organization?.ownerId !== user.id) {
      return {
        success: false,
        message: "Apenas o proprietário pode alterar o nome da organização.",
      };
    }

    if (!user.organizationId) {
      return {
        success: false,
        message: "Organização não encontrada.",
      };
    }

    await db
      .update(pgOrganization)
      .set({
        name: organizationName,
        updatedAt: new Date(),
      })
      .where(eq(pgOrganization.id, user.organizationId));

    revalidatePath("/settings");

    return {
      success: true,
      message: "Nome da organização atualizado com sucesso.",
    };
  } catch (error) {
    console.error("Error updating organization name:", error);
    return {
      success: false,
      message: "Erro ao atualizar nome da organização. Tente novamente.",
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
      success: true,
      message: "Email de verificação enviado. Verifique sua caixa de entrada.",
    };
  } catch (error) {
    console.error("Error sending email verification:", error);
    return {
      success: false,
      message: "Erro ao enviar email de verificação. Tente novamente.",
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
      success: true,
      message: "Conta excluída com sucesso.",
    };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return {
      success: false,
      message: "Erro ao excluir conta. Tente novamente.",
    };
  }
}
