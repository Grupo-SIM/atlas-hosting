import { NextRequest, NextResponse } from "next/server";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import { db } from "@/lib/db";
import { pgDomainPricingCache } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.NAMECHEAP_API_USER || !process.env.NAMECHEAP_API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log("Forcing domain pricing cache refresh...");
    
    // Use the new public method to force refresh
    await namecheapApi.refreshDomainPricingCache();
    
    // Check if cache was populated
    const cachedCount = await db.query.pgDomainPricingCache.findMany({
      limit: 10,
    });
    
    return NextResponse.json({
      success: true,
      message: "Domain pricing cache refresh completed.",
      cachePopulated: cachedCount.length > 0,
      cachedTlds: cachedCount.map(p => p.tld),
      note: cachedCount.length === 0 
        ? "Cache refresh completed but no data found. This may indicate an API issue."
        : `Cache successfully populated with ${cachedCount.length}+ TLDs.`,
    });
  } catch (error) {
    console.error("Error refreshing domain pricing cache:", error);
    
    return NextResponse.json(
      {
        error: "Failed to refresh pricing cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also allow GET for convenience
export async function GET(request: NextRequest) {
  return POST(request);
}

