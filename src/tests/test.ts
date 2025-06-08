import pleskApi from "@/lib/server/apis/plesk";

const testInstanceId = "226";
const pluginName = "hello";

const pluginFields = [
  "id",
  "name",
  "title",
  "description",
  "status",
  "update",
  "version",
  "update_version",
  "auto_update",
];

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

/* const statusResult = await pleskApi.wordpress.callWp(
  `-wp-cli -instance-id ${testInstanceId} -- help ${command - eg. plugin list}`
); */
const themeListResult = await pleskApi.wordpress.callWp(
  //   `--wp-cli -instance-id ${testInstanceId} -- help instance --format=json`
  //   `--wp-cli -instance-id ${testInstanceId} -- plugin activate ${pluginName}`
  //   `--wp-cli -instance-id ${testInstanceId} -- user list --format=json`
  // `-wp-cli -instance-id ${testInstanceId} -- theme status`
  `--wp-cli -instance-id ${testInstanceId} -- theme list --fields=${themeFields.join(",")} --format=json`
);

// console.log({ themeListResult });
console.log(themeListResult.stdout);
