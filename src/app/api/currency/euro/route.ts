import { NextResponse } from "next/server";
import currencyConversion from "@/lib/server/apis/currency";

export async function GET() {
  try {
    // Get EUR to BRL rate
    // The API returns 1 BRL = X EUR if we fetch brl.json
    // So to get 1 EUR in BRL, we can do 1 / (1 BRL in EUR)
    const [rate] = await currencyConversion.convertMultiple({
      from: "eur",
      to: "brl",
      amounts: [1],
    });

    // We use a profit multiplier (traditionally x2 in this project)
    const finalRate = rate * 2;

    return NextResponse.json({ 
      rate: finalRate,
      rawRate: rate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching euro rate:", error);
    return NextResponse.json({ rate: 11.72, error: "Failed to fetch" }, { status: 500 });
  }
}
