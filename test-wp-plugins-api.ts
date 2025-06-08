// Test file to explore real Plesk WP Toolkit API responses for plugin management
import { PleskApi } from "@/lib/server/apis/plesk";
import { getCurrentUserSelectedDomain } from "@/lib/server/domain-selection";
import { createUserSession } from "@/lib/server/user-session";

interface PluginInfo {
  name: string;
  status: 'active' | 'inactive';
  version: string;
  update?: string;
  description?: string;
  slug?: string;
  title?: string;
}

interface WordPressInstanceInfo {
  id: number;
  siteUrl: string;
  name: string;
  version: string;
  path: string;
  mainDomainId: number;
}

async function testWordPressPlugins() {
  console.log("🔧 Testing WordPress Plugin Management API...\n");

  try {
    const pleskApi = new PleskApi();
    
    // Get user session and selected domain
    const userSession = await createUserSession();
    const selectedDomain = await getCurrentUserSelectedDomain(userSession.user.id);

    if (!selectedDomain) {
      console.log("❌ No selected domain found");
      return;
    }

    console.log(`📍 Testing for domain: ${selectedDomain.name} (ID: ${selectedDomain.id})\n`);

    // 1. List all WordPress instances
    console.log("1️⃣ Listing WordPress instances...");
    const instancesResponse = await pleskApi.wordpress.list();
    console.log("Raw instances response:", JSON.stringify(instancesResponse, null, 2));

    // Parse instances data (assuming it's JSON)
    let instances: WordPressInstanceInfo[] = [];
    if (typeof instancesResponse === 'string') {
      try {
        instances = JSON.parse(instancesResponse);
      } catch (e) {
        console.log("Failed to parse instances JSON, raw response:", instancesResponse);
        return;
      }
    } else if (Array.isArray(instancesResponse)) {
      instances = instancesResponse;
    }

    // Filter instances for the selected domain
    const domainInstances = instances.filter(instance => 
      instance.mainDomainId === selectedDomain.id
    );

    console.log(`\n✅ Found ${domainInstances.length} WordPress instances for domain ${selectedDomain.name}`);
    
    if (domainInstances.length === 0) {
      console.log("❌ No WordPress instances found for this domain");
      return;
    }

    // 2. Test plugin commands for the first instance
    const testInstance = domainInstances[0];
    console.log(`\n🎯 Testing plugin commands for instance: ${testInstance.name} (ID: ${testInstance.id})`);

    // Test different plugin-related wp-cli commands
    const pluginCommands = [
      `--wp-cli -instance-id ${testInstance.id} -- plugin list --format=json`,
      `--wp-cli -instance-id ${testInstance.id} -- plugin list --status=active --format=json`,
      `--wp-cli -instance-id ${testInstance.id} -- plugin list --status=inactive --format=json`,
      `--wp-cli -instance-id ${testInstance.id} -- plugin status --format=json`,
    ];

    for (const [index, command] of pluginCommands.entries()) {
      console.log(`\n${index + 2}️⃣ Testing command: ${command.split(' -- ')[1]}`);
      
      try {
        const response = await pleskApi.wordpress.callWp(command);
        console.log("Raw response:", JSON.stringify(response, null, 2));
        
        // Try to parse if it's JSON string
        if (typeof response === 'string') {
          try {
            const parsed = JSON.parse(response);
            console.log("Parsed JSON:", JSON.stringify(parsed, null, 2));
            
            // If it's plugin list, analyze the structure
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log("\n📋 Sample plugin structure:");
              console.log(JSON.stringify(parsed[0], null, 2));
              
              console.log("\n📊 Plugin summary:");
              const activeCount = parsed.filter(p => p.status === 'active').length;
              const inactiveCount = parsed.filter(p => p.status === 'inactive').length;
              const withUpdates = parsed.filter(p => p.update && p.update !== 'none').length;
              
              console.log(`- Total plugins: ${parsed.length}`);
              console.log(`- Active: ${activeCount}`);
              console.log(`- Inactive: ${inactiveCount}`);
              console.log(`- With updates available: ${withUpdates}`);
            }
          } catch (parseError) {
            console.log("Response is not JSON, keeping as string");
          }
        }
      } catch (error) {
        console.log(`❌ Command failed:`, error);
      }
    }

    // 3. Test additional plugin management commands
    console.log(`\n6️⃣ Testing plugin information commands...`);
    
    try {
      // Get plugin list to find a plugin to test with
      const pluginListResponse = await pleskApi.wordpress.callWp(
        `--wp-cli -instance-id ${testInstance.id} -- plugin list --format=json`
      );
      
      let plugins: PluginInfo[] = [];
      if (typeof pluginListResponse === 'string') {
        plugins = JSON.parse(pluginListResponse);
      } else if (Array.isArray(pluginListResponse)) {
        plugins = pluginListResponse;
      }

      if (plugins.length > 0) {
        const samplePlugin = plugins[0];
        console.log(`\n🔍 Testing commands for plugin: ${samplePlugin.name}`);
        
        // Test plugin-specific commands
        const specificCommands = [
          `--wp-cli -instance-id ${testInstance.id} -- plugin get ${samplePlugin.name} --format=json`,
          `--wp-cli -instance-id ${testInstance.id} -- plugin is-installed ${samplePlugin.name}`,
          `--wp-cli -instance-id ${testInstance.id} -- plugin is-active ${samplePlugin.name}`,
        ];

        for (const command of specificCommands) {
          console.log(`\n🧪 Testing: ${command.split(' -- ')[1]}`);
          try {
            const response = await pleskApi.wordpress.callWp(command);
            console.log("Response:", JSON.stringify(response, null, 2));
          } catch (error) {
            console.log(`❌ Command failed:`, error);
          }
        }
      }
    } catch (error) {
      console.log(`❌ Plugin information test failed:`, error);
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Export the test function
export { testWordPressPlugins };

// If running directly, execute the test
if (require.main === module) {
  testWordPressPlugins().catch(console.error);
}
