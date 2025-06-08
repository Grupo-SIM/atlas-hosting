// Simple test script to explore WordPress plugin API responses
import { NextRequest } from "next/server";

export async function GET() {
  try {
    // Import the API dynamically
    const { PleskApi } = await import("@/lib/server/apis/plesk");
    const { getCurrentUserSelectedDomain } = await import("@/lib/server/domain-selection");
    const { createUserSession } = await import("@/lib/server/user-session");

    console.log("🔧 Testing WordPress Plugin Management API...");

    const pleskApi = new PleskApi();
    
    // Get user session and selected domain
    const userSession = await createUserSession();
    const selectedDomain = await getCurrentUserSelectedDomain(userSession.user.id);

    if (!selectedDomain) {
      return Response.json({ error: "No selected domain found" });
    }

    console.log(`📍 Testing for domain: ${selectedDomain.name} (ID: ${selectedDomain.id})`);

    // 1. List all WordPress instances
    const instancesResponse = await pleskApi.wordpress.list();
    console.log("Raw instances response:", JSON.stringify(instancesResponse, null, 2));

    // Parse instances data
    let instances = [];
    if (typeof instancesResponse === 'string') {
      try {
        instances = JSON.parse(instancesResponse);
      } catch (e) {
        console.log("Failed to parse instances JSON");
        return Response.json({ 
          error: "Failed to parse instances", 
          raw: instancesResponse 
        });
      }
    } else if (Array.isArray(instancesResponse)) {
      instances = instancesResponse;
    }

    // Filter instances for the selected domain
    const domainInstances = instances.filter((instance: any) => 
      instance.mainDomainId === selectedDomain.id
    );

    if (domainInstances.length === 0) {
      return Response.json({ 
        message: "No WordPress instances found for this domain",
        domain: selectedDomain.name,
        instances: instances
      });
    }

    // Test plugin commands for the first instance
    const testInstance = domainInstances[0];
    console.log(`🎯 Testing plugin commands for instance: ${testInstance.name} (ID: ${testInstance.id})`);

    // Test plugin list command
    const pluginListResponse = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${testInstance.id} -- plugin list --format=json`
    );

    let pluginData = null;
    if (typeof pluginListResponse === 'string') {
      try {
        pluginData = JSON.parse(pluginListResponse);
      } catch (e) {
        pluginData = pluginListResponse;
      }
    } else {
      pluginData = pluginListResponse;
    }

    return Response.json({
      success: true,
      domain: selectedDomain.name,
      instance: {
        id: testInstance.id,
        name: testInstance.name,
        siteUrl: testInstance.siteUrl
      },
      pluginData: pluginData,
      pluginDataType: typeof pluginData,
      isArray: Array.isArray(pluginData),
      samplePlugin: Array.isArray(pluginData) && pluginData.length > 0 ? pluginData[0] : null
    });

  } catch (error) {
    console.error("Test failed:", error);
    return Response.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}
