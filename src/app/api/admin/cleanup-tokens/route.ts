import { cleanupExpiredTokens } from "@/lib/auth/tokens";
import { errorHandler } from "@/lib/error-handler";

/**
 * Cleanup job to remove expired tokens
 * This should be run periodically (e.g., via cron job)
 */
export async function POST() {
  try {
    await cleanupExpiredTokens();
    
    return Response.json({ 
      success: true, 
      message: "Expired tokens cleaned up successfully" 
    });
  } catch (error) {
    return errorHandler(error)
  }
}
