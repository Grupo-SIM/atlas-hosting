// Test script for WordPress themes
import pleskApi from "../src/lib/server/apis/plesk";

const themeFields = [
  "name",
  "title", 
  "description",
  "status",
  "update",
  "version",
  "update_version",
  "author",
  "template",
];

async function testThemes() {
  console.log("Testing WordPress themes with wp-cli...");
  
  // Test with the known working instance ID 226
  const instanceId = 226;
  
  try {
    console.log(`\n=== Testing theme list for instance ${instanceId} ===`);
    
    // Test basic theme list
    const basicResponse = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- theme list`
    );
    console.log("Basic theme list:");
    console.log(basicResponse.stdout);
    
    // Test with JSON format
    const jsonResponse = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- theme list --format=json`
    );
    console.log("\nJSON theme list:");
    console.log(jsonResponse.stdout);
    
    // Test with specific fields
    const fieldsResponse = await pleskApi.wordpress.callWp(
      `--wp-cli -instance-id ${instanceId} -- theme list --format=json --fields=${themeFields.join(",")}`
    );
    console.log("\nJSON theme list with fields:");
    console.log(fieldsResponse.stdout);
    
    // Try to parse the JSON
    if (fieldsResponse.stdout) {
      const themes = JSON.parse(fieldsResponse.stdout);
      console.log("\nParsed themes:");
      console.log(JSON.stringify(themes, null, 2));
    }
    
  } catch (error) {
    console.error("Error testing themes:", error);
  }
}

testThemes();
