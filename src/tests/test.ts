import WpCliApi from "@/lib/server/apis/plesk/wp-toolkit/wp-cli";

const testInstanceId = 226;

const wpCli = new WpCliApi(testInstanceId);

const pluginName = "hello";

const pluginFields = [
  "update_id",
  "name",
  "title",
  "description",
  "status",
  "update",
  "version",
  "update_version",
  "auto_update",
];

const r = await wpCli.plugin.list({
  fields: pluginFields.join(","),
  format: "json"
});

console.log({ r })

const themeFields = [
  "name",
  "status",
  "update",
  "version",
  "update_version",
  "auto_update",
  "update_package",
  "update_id",
  "title",
  "description",
];

