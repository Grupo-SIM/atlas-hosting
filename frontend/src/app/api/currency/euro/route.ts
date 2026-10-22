import { NextResponse } from "next/server";
import currencyConversion from "@/lib/server/apis/currency";

export async function GET() {
  try {
    const [[rate], [usdRate]] = await Promise.all([
      currencyConversion.convertMultiple({
        amounts: [1],
        from: "eur",
        to: "brl",
      }),
      currencyConversion.convertMultiple({
        amounts: [1],
        from: "eur",
        to: "usd",
      }),
    ]);

    return NextResponse.json({
      rate,
      timestamp: new Date().toISOString(),
      usdRate,
    });
  } catch (error) {
    console.error("Error fetching euro rate:", error);
    return NextResponse.json(
      { error: "Failed to fetch", rate: 5.86, usdRate: 1.08 },
      { status: 500 }
    );
  }
}
