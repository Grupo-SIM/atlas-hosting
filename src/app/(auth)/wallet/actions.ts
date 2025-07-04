"use server";

import { auth } from "@/auth";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgOrganization, pgUser, pgUserCard } from "@/lib/db/schema";
import domApi from "@/lib/server/apis/dom";
import axios from "axios";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";

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
    const fullYear = 2000 + Number.parseInt(expYear);

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
          status: "error",
          message: "Informações de cobrança são obrigatórias",
        };
      }

      // Create DOM client with billing information
      const { id } = await domApi.createClient({
        userId: user.id,
        name: cardData.billingName,
        email: cardData.billingEmail,
        document: cardData.holderDocument.replace(/\D/g, ""),
        mobilePhone: cardData.billingPhone.replace(/\D/g, ""),
        address: {
          street: cardData.billingStreet,
          number: cardData.billingNumber,
          neighborhood: cardData.billingNeighborhood,
          zip_code: cardData.billingZipCode.replace(/\D/g, ""),
          city: cardData.billingCity,
          state: cardData.billingState,
        },
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
    if (axios.isAxiosError(error)) {
      console.error("DOM API error:", error.response?.data || error.message);
    }

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
