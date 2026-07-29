"use server";

import axios from "axios";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { auth } from "@/auth";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgOrganization, pgUser, pgUserCard } from "@/lib/db/schema";
import domApi from "@/lib/server/apis/dom";

export interface AddCardData {
  cardNumber: string;
  cardCvv: string;
  cardExpiration: string; // MM/YY format
  holderName: string;
  holderDocument: string;
  // Billing information for users without domId
  billingName?: string;
  billingEmail?: string;
  billingPhone?: string;
  billingStreet?: string;
  billingNumber?: string;
  billingNeighborhood?: string;
  billingZipCode?: string;
  billingCity?: string;
  billingState?: string;
}

export interface ActionResponse {
  status: "success" | "error";
  message: string;
  data?: unknown;
}

export async function addCard(cardData: AddCardData): Promise<ActionResponse> {
  try {
    const user = await getUser();

    // Parse expiration date
    const [expMonth, expYear] = cardData.cardExpiration.split("/");
    const fullYear = 2000 + Number.parseInt(expYear, 10);

    // If user doesn't have domId, create a DOM client first
    if (!user.organization?.domId) {
      if (
        !cardData.billingName ||
        !cardData.billingEmail ||
        !cardData.billingPhone ||
        !cardData.billingStreet ||
        !cardData.billingNumber ||
        !cardData.billingNeighborhood ||
        !cardData.billingZipCode ||
        !cardData.billingCity ||
        !cardData.billingState
      ) {
        return {
          message: "Informações de cobrança são obrigatórias",
          status: "error",
        };
      }

      // Create DOM client with billing information
      const { id } = await domApi.createClient({
        address: {
          city: cardData.billingCity,
          neighborhood: cardData.billingNeighborhood,
          number: cardData.billingNumber,
          state: cardData.billingState,
          street: cardData.billingStreet,
          zip_code: cardData.billingZipCode.replace(/\D/g, ""),
        },
        document: cardData.holderDocument.replace(/\D/g, ""),
        email: cardData.billingEmail,
        mobilePhone: cardData.billingPhone.replace(/\D/g, ""),
        name: cardData.billingName,
        userId: user.id,
      });

      await db
        .update(pgOrganization)
        .set({
          domId: id,
        })
        .where(eq(pgOrganization.id, user.organization.id));
    }

    // Create card token via DOM API
    const tokenData = await domApi.createCardToken(user.id, {
      cvv: cardData.cardCvv,
      exp_month: Number.parseInt(expMonth, 10),
      exp_year: fullYear,
      holder_document: cardData.holderDocument.replace(/\D/g, ""),
      holder_name: cardData.holderName,
      number: cardData.cardNumber.replace(/\D/g, ""),
    });

    if (!user?.organization?.wallet) {
      return {
        message: "Carteira não encontrada",
        status: "error",
      };
    }

    // Check if this is the first card (make it default)
    const existingCards = await db.query.pgUserCard.findMany({
      where: eq(pgUserCard.walletId, user.organization.wallet.id),
    });

    const isFirstCard = existingCards.length === 0;

    // Save card to database
    await db.insert(pgUserCard).values({
      brand: tokenData.brand,
      cardToken: tokenData.token,
      expiryMonth: tokenData.expiryMonth,
      expiryYear: tokenData.expiryYear,
      holderName: tokenData.holderName,
      isDefault: isFirstCard,
      last4: tokenData.last4,
      walletId: user.organization.wallet.id,
    });

    revalidatePath("/settings");

    return {
      message: "Cartão adicionado com sucesso",
      status: "success",
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("DOM API error:", error.response?.data || error.message);
    }

    console.error("Error adding card:", error);
    return {
      message:
        error instanceof Error ? error.message : "Erro ao adicionar cartão",
      status: "error",
    };
  }
}

export async function deleteCard(cardId: string): Promise<ActionResponse> {
  try {
    const user = await getUser();

    if (!user?.organization?.wallet) {
      return {
        message: "Carteira não encontrada",
        status: "error",
      };
    }

    // Verify card belongs to user's wallet
    const card = await db.query.pgUserCard.findFirst({
      where: and(
        eq(pgUserCard.id, cardId),
        eq(pgUserCard.walletId, user.organization.wallet.id)
      ),
    });

    if (!card) {
      return {
        message: "Cartão não encontrado",
        status: "error",
      };
    }

    // Delete the card from DOM API first
    try {
      await domApi.deleteCardToken(user.id, card.cardToken);
    } catch (error) {
      console.error("Error deleting card from DOM API:", error);
      // Continue with local deletion even if DOM deletion fails
    }

    // Delete the card from our database
    await db.delete(pgUserCard).where(eq(pgUserCard.id, cardId));

    // If this was the default card, make another card default if available
    if (card.isDefault) {
      const remainingCards = await db.query.pgUserCard.findMany({
        limit: 1,
        where: eq(pgUserCard.walletId, user.organization.wallet.id),
      });

      if (remainingCards.length > 0) {
        await db
          .update(pgUserCard)
          .set({ isDefault: true })
          .where(eq(pgUserCard.id, remainingCards[0].id));
      }
    }

    revalidatePath("/settings");

    return {
      message: "Cartão removido com sucesso",
      status: "success",
    };
  } catch (error) {
    console.error("Error deleting card:", error);
    return {
      message: "Erro ao remover cartão",
      status: "error",
    };
  }
}

export async function setDefaultCard(cardId: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        message: "Usuário não autenticado",
        status: "error",
      };
    }

    // Get user's wallet
    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, session.user.id),
      with: {
        organization: {
          with: {
            wallet: true,
          },
        },
      },
    });

    if (!user?.organization?.wallet) {
      return {
        message: "Carteira não encontrada",
        status: "error",
      };
    }

    // Remove default from all cards
    await db
      .update(pgUserCard)
      .set({ isDefault: false })
      .where(eq(pgUserCard.walletId, user.organization.wallet.id));

    // Set new default card
    await db
      .update(pgUserCard)
      .set({ isDefault: true })
      .where(
        and(
          eq(pgUserCard.id, cardId),
          eq(pgUserCard.walletId, user.organization.wallet.id)
        )
      );

    revalidatePath("/settings");

    return {
      message: "Cartão padrão atualizado",
      status: "success",
    };
  } catch (error) {
    console.error("Error setting default card:", error);
    return {
      message: "Erro ao definir cartão padrão",
      status: "error",
    };
  }
}

export const getUserCards = cache(async function getUserCards() {
  try {
    const user = await getUser();
    if (!user?.organization?.wallet) {
      return [];
    }

    // Get cards from local database
    return user.organization.wallet.cards ?? [];
  } catch (error) {
    console.error("Error fetching user cards:", error);
    return [];
  }
});

export async function getUserCardsForCheckout() {
  try {
    const user = await getUser();
    if (!user?.organization?.wallet) {
      return [];
    }

    return await getUserCards();
  } catch (error) {
    console.error("Error fetching user cards for checkout:", error);
    return [];
  }
}

export async function getCustomerFromDOM() {
  try {
    const user = await getUser();
    if (!user?.organization?.domId) {
      return null;
    }

    // Get customer information from DOM API
    const customerData = await domApi.getCustomer(user.id);

    return {
      address: customerData.address,
      document: customerData.document,
      email: customerData.email,
      mobilePhone: customerData.mobile_phone,
      name: customerData.name,
    };
  } catch (error) {
    console.error("Error fetching customer from DOM:", error);
    return null;
  }
}
