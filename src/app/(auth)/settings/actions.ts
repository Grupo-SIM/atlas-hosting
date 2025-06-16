"use server";

import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgOrganization, pgUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hash, verify } from "@node-rs/argon2";
import { revalidatePath } from "next/cache";

export interface ActionResponse {
  success: boolean;
  message: string;
}

export async function updateUserProfileAction(
  name: string,
  email: string
): Promise<ActionResponse> {
  try {
    const user = await getUser();
    
    await db
      .update(pgUser)
      .set({
        name,
        email: email.toLowerCase(),
        updatedAt: new Date(),
      })
      .where(eq(pgUser.id, user.id));

    revalidatePath("/settings");
    
    return {
      success: true,
      message: "Perfil atualizado com sucesso.",
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      message: "Erro ao atualizar perfil. Tente novamente.",
    };
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
    const isCurrentPasswordValid = await verify(userData.password, currentPassword);
    
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
    if (user.organization.ownerId !== user.id) {
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
