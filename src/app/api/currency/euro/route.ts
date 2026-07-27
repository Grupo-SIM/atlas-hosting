import { NextResponse } from "next/server";
import currencyConversion from "@/lib/server/apis/currency";

export async function GET() {
  try {
    const [[rate], [usdRate]] = await Promise.all([
      currencyConversion.convertMultiple({
        from: "eur",
        to: "brl",
        amounts: [1],
      }),
      currencyConversion.convertMultiple({
        from: "eur",
        to: "usd",
        amounts: [1],
      }),
    ]);

    return NextResponse.json({
      rate,
      usdRate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching euro rate:", error);
    return NextResponse.json(
      { rate: 5.86, usdRate: 1.08, error: "Failed to fetch" },
      { status: 500 },
    );
  }
}