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

    return NextResponse.json({ 
      rate: rate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching euro rate:", error);
    return NextResponse.json({ rate: 5.86, error: "Failed to fetch" }, { status: 500 });
  }
}
