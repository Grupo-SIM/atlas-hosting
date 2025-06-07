"use server";

import { auth } from "@/auth";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgUser, pgUserCard } from "@/lib/db/schema";
import domApi from "@/lib/server/apis/dom";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";

export interface AddCardData {
  cardNumber: string;
  cardCvv: string;
  cardExpiration: string; // MM/YY format
  holderName: string;
  holderDocument: string;
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
    const fullYear = 2000 + Number.parseInt(expYear);

    // Create card token via DOM API
    const tokenData = await domApi.createCardToken(user.id, {
      number: cardData.cardNumber.replace(/\D/g, ""),
      cvv: cardData.cardCvv,
      exp_month: Number.parseInt(expMonth),
      exp_year: fullYear,
      holder_name: cardData.holderName,
      holder_document: cardData.holderDocument.replace(/\D/g, ""),
    });

    if (!user?.organization?.wallet) {
      return {
        status: "error",
        message: "Carteira não encontrada",
      };
    }

    // Check if this is the first card (make it default)
    const existingCards = await db.query.pgUserCard.findMany({
      where: eq(pgUserCard.walletId, user.organization.wallet.id),
    });

    const isFirstCard = existingCards.length === 0;

    // Save card to database
    await db.insert(pgUserCard).values({
      walletId: user.organization.wallet.id,
      cardToken: tokenData.token,
      last4: tokenData.last4,
      brand: tokenData.brand,
      expiryMonth: tokenData.expiryMonth,
      expiryYear: tokenData.expiryYear,
      holderName: tokenData.holderName,
      isDefault: isFirstCard,
    });

    revalidatePath("/settings");

    return {
      status: "success",
      message: "Cartão adicionado com sucesso",
    };
  } catch (error) {
    console.error("Error adding card:", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Erro ao adicionar cartão",
    };
  }
}

export async function deleteCard(cardId: string): Promise<ActionResponse> {
  try {
    const user = await getUser();

    if (!user?.organization?.wallet) {
      return {
        status: "error",
        message: "Carteira não encontrada",
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
        status: "error",
        message: "Cartão não encontrado",
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
        where: eq(pgUserCard.walletId, user.organization.wallet.id),
        limit: 1,
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
      status: "success",
      message: "Cartão removido com sucesso",
    };
  } catch (error) {
    console.error("Error deleting card:", error);
    return {
      status: "error",
      message: "Erro ao remover cartão",
    };
  }
}

export async function setDefaultCard(cardId: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "Usuário não autenticado",
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
        status: "error",
        message: "Carteira não encontrada",
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
      status: "success",
      message: "Cartão padrão atualizado",
    };
  } catch (error) {
    console.error("Error setting default card:", error);
    return {
      status: "error",
      message: "Erro ao definir cartão padrão",
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
    const localCards = user.organization.wallet.cards ?? [];

    // Get cards from DOM API for up-to-date information
    try {
      const domCards = await domApi.getCustomerCardTokens(user.id);

      // Merge local card data with DOM card data
      const mergedCards = localCards.map((localCard) => {
        const domCard = domCards.find(
          (dc: {
            token: string;
            last4?: string;
            brand?: string;
            exp_month?: string;
            exp_year?: string;
            holder_name?: string;
          }) => dc.token === localCard.cardToken
        );
        return {
          ...localCard,
          // Override with fresh DOM data if available
          ...(domCard && {
            last4: domCard.last4 || localCard.last4,
            brand: domCard.brand || localCard.brand,
            expiryMonth: domCard.exp_month || localCard.expiryMonth,
            expiryYear: domCard.exp_year || localCard.expiryYear,
            holderName: domCard.holder_name || localCard.holderName,
          }),
        };
      });

      return mergedCards;
    } catch (domError) {
      console.error(
        "Error fetching cards from DOM API, falling back to local data:",
        domError
      );
      // Fall back to local data if DOM API fails
      return localCards;
    }
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
      name: customerData.name,
      email: customerData.email,
      document: customerData.document,
      mobilePhone: customerData.mobile_phone,
      address: customerData.address,
    };
  } catch (error) {
    console.error("Error fetching customer from DOM:", error);
    return null;
  }
}
