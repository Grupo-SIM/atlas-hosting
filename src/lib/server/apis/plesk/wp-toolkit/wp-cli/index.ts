import pleskApi from "@/lib/server/apis/plesk";

/**
 * Base class for all WP-CLI command groups.
 * It contains the logic to build and execute a command string.
 */
abstract class WpCliCommand {
  constructor(public readonly instanceId?: number) {}

  /**
   * Executes the final command string via the Plesk API.
   * @param command The complete wp-cli command string.
   * @returns The result from the API call, cast to the specified type.
   */
  protected async execute<T>(command: string): Promise<T> {
    const data = await pleskApi.wordpress.callWp(command);

    console.log(data);

    if (data.stderr) {
      throw new Error(data.stderr);
    }

    try {
      return JSON.parse(data.stdout) as T;
    } catch {
      return data.stdout as T;
    }
  }

  /**
   * Constructs a wp-cli command string from base command, arguments, and options.
   * @param base The base command (e.g., "plugin install").
   * @param args An array of positional arguments.
   * @param options An object of flags and their values.
   * @returns A fully formed command string.
   */
  protected buildCommand(
    base: string,
    args: (string | number | string[] | undefined)[] = [],
    options: Record<string, string | number | boolean | undefined> = {}
  ): string {
    let command = `--wp-cli -instance-id ${this.instanceId} -- ${base}`;

    const flatArgs = args.flat().filter((arg) => arg !== undefined);
    if (flatArgs.length > 0) {
      command += ` ${flatArgs
        .map((arg) => {
          const val = String(arg);
          return val.includes(" ") ? `"${val}"` : val;
        })
        .join(" ")}`;
    }

    for (const [key, value] of Object.entries(options ?? {})) {
      if (value === undefined || value === null || value === false) {
        continue;
      }

      const flag = `--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;

      if (value === true) {
        command += ` ${flag}`;
      } else {
        const val = String(value);
        command += ` ${flag}=${val.includes(" ") ? `"${val}"` : val}`;
      }
    }

    return command.trim();
  }
}

// #region Type export Interfaces

// --- DATA STRUCTURES ---
export interface WpThemeList {
  name: string | number;
  status: string | number;
  update: string | number;
  version: string | number;
  updateVersion: string | number;
  autoUpdate: string | number;
  updatePackage: string | number;
  updateId: string | number;
  title: string | number;
  description: string | number;
}

export interface WpPostTypeList {
  name: string | number;
  label: string | number;
  description: string | number;
  hierarchical: string | number;
  public: string | number;
  capabilityType: string | number;
  count: string | number;
}

export interface WpPostTypeGet {
  name: string | number;
  label: string | number;
  description: string | number;
  hierarchical: string | number;
  public: string | number;
  capabilityType: string | number;
  labels: string | number;
  cap: string | number;
  supports: string | number;
  count: string | number;
}

export interface WpPluginList {
  name: string | number;
  status: string | number;
  update: string | number;
  version: string | number;
  updateVersion: string | number;
  autoUpdate: string | number;
  updatePackage: string | number;
  updateId: string | number;
  title: string | number;
  description: string | number;
  file: string | number;
  author: string | number;
  testedUpTo: string | number;
  requires: string | number;
  requiresPhp: string | number;
  wporgStatus: string | number;
  wporgLastUpdated: string | number;
}

export interface WpPluginGet {
  name: string | number;
  title: string | number;
  author: string | number;
  version: string | number;
  description: string | number;
  status: string | number;
  requiresWp: string | number;
  requiresPhp: string | number;
  requiresPlugins: string | number;
}

export interface WpWidgetList {
  name: string | number;
  id: string | number;
  position: string | number;
  options: string | number;
}

export interface WpPostList {
  ID: string | number;
  postTitle: string | number;
  postName: string | number;
  postDate: string | number;
  postStatus: string | number;
  postAuthor: string | number;
  postDateGmt: string | number;
  postContent: string | number;
  postExcerpt: string | number;
  commentStatus: string | number;
  pingStatus: string | number;
  postPassword: string | number;
  toPing: string | number;
  pinged: string | number;
  postModified: string | number;
  postModifiedGmt: string | number;
  postContentFiltered: string | number;
  postParent: string | number;
  guid: string | number;
  menuOrder: string | number;
  postType: string | number;
  postMimeType: string | number;
  commentCount: string | number;
  filter: string | number;
  url: string | number;
}

export interface WpMediaImageSize {
  name: string | number;
  width: string | number;
  height: string | number;
  crop: string | number;
  ratio: string | number;
}

export interface WpDbSearch {
  table: string | number;
  column: string | number;
  match: string | number;
  primaryKeyName: string | number;
  primaryKeyValue: string | number;
}

export interface WpMenuList {
  termId: string | number;
  name: string | number;
  slug: string | number;
  count: string | number;
  termGroup: string | number;
  termTaxonomyId: string | number;
  taxonomy: string | number;
  description: string | number;
  parent: string | number;
  locations: string | number;
}

export interface WpUserList {
  ID: string | number;
  userLogin: string | number;
  displayName: string | number;
  userEmail: string | number;
  userRegistered: string | number;
  roles: string | number;
  userPass: string | number;
  userNicename: string | number;
  userUrl: string | number;
  userActivationKey: string | number;
  userStatus: string | number;
  spam: string | number;
  deleted: string | number;
  caps: string | number;
  capKey: string | number;
  allcaps: string | number;
  filter: string | number;
  url: string | number;
}

export interface WpTermList {
  termId: string | number;
  termTaxonomyId: string | number;
  name: string | number;
  slug: string | number;
  description: string | number;
  parent: string | number;
  count: string | number;
  url: string | number;
}

export interface WpCommentList {
  commentID: string | number;
  commentPostID: string | number;
  commentDate: string | number;
  commentApproved: string | number;
  commentAuthor: string | number;
  commentAuthorEmail: string | number;
  commentAuthorUrl: string | number;
  commentAuthorIP: string | number;
  commentDateGmt: string | number;
  commentContent: string | number;
  commentKarma: string | number;
  commentAgent: string | number;
  commentType: string | number;
  commentParent: string | number;
  userId: string | number;
  url: string | number;
}

export interface WpTaxonomyList {
  name: string | number;
  label: string | number;
  description: string | number;
  objectType: string | number;
  showTagcloud: string | number;
  hierarchical: string | number;
  public: string | number;
  count: string | number;
}

export interface WpTaxonomyGet {
  name: string | number;
  label: string | number;
  description: string | number;
  objectType: string | number;
  showTagcloud: string | number;
  hierarchical: string | number;
  public: string | number;
  labels: string | number;
  cap: string | number;
  count: string | number;
}

export interface WpSidebarList {
  name: string | number;
  id: string | number;
  description: string | number;
  class: string | number;
  beforeWidget: string | number;
  afterWidget: string | number;
  beforeTitle: string | number;
  afterTitle: string | number;
}

export interface WpRoleList {
  name: string | number;
  role: string | number;
}

export interface WpOptionList {
  optionName: string | number;
  optionValue: string | number;
  autoload: string | number;
  sizeBytes: string | number;
}

export interface WpSiteList {
  blogId: string | number;
  url: string | number;
  lastUpdated: string | number;
  registered: string | number;
  siteId: string | number;
  domain: string | number;
  path: string | number;
  public: string | number;
  archived: string | number;
  mature: string | number;
  spam: string | number;
  deleted: string | number;
  langId: string | number;
}

export interface WpTransientList {
  name: string | number;
  value: string | number;
  expiration: string | number;
}

export interface WpPackageList {
  name: string | number;
  authors: string | number;
  version: string | number;
  update: string | number;
  updateVersion: string | number;
  description: string | number;
}

export interface WpPackageBrowse {
  name: string | number;
  description: string | number;
  authors: string | number;
  version: string | number;
}

// --- OPTIONS export INTERFACES ---
export interface ThemeListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Prints the value of a single field for each theme. */
  field?: string;
  /** Limit the output to specific object fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "count" | "yaml";
  /** Filter the output by theme status. */
  status?: "active" | "parent" | "inactive";
  /** If set, the theme update check will be skipped. */
  skipUpdateCheck?: boolean;
}

export interface ThemeIsActiveOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface ThemeModOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface ThemeAutoUpdatesOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface ThemeUpdateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, all themes that have updates will be updated. */
  all?: boolean;
  /** Comma separated list of theme names that should be excluded from updating. */
  exclude?: string;
  /** Only perform updates for minor releases (e.g. from 1.3 to 1.4 instead of 2.0) */
  minor?: boolean;
  /** Only perform updates for patch releases (e.g. from 1.3 to 1.3.3 instead of 1.4) */
  patch?: boolean;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "summary";
  /** If set, the theme will be updated to the specified version. */
  version?: string;
  /** Preview which themes would be updated. */
  dryRun?: boolean;
  /** Retry downloads without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack. */
  insecure?: boolean;
}

export interface ThemeStatusOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface ThemePathOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, get the path to the closest parent directory, instead of the theme's "style.css" file. */
  dir?: boolean;
}

export interface ThemeEnableOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, the theme is enabled for the entire network */
  network?: boolean;
  /** If set, the theme is activated for the current site. Note that the "network" flag has no influence on this. */
  activate?: boolean;
}

export interface ThemeDisableOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, the theme is disabled on the network level. Note that individual sites may still have this theme enabled if it was enabled for them independently. */
  network?: boolean;
}

export interface ThemeGetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Instead of returning the whole theme, returns the value of a single field. */
  field?: string;
  /** Limit the output to specific fields. Defaults to all fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "yaml";
}

export interface ThemeSearchOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Optional page to display. */
  page?: number;
  /** Optional number of results to display. Defaults to 10. */
  perPage?: number;
  /** Prints the value of a single field for each theme. */
  field?: string;
  /** Ask for specific fields from the API. Defaults to name,slug,author,rating. Acceptable values: */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "count" | "yaml";
}

export interface ThemeIsInstalledOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface ThemeActivateOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface ThemeInstallOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, get that particular version from wordpress.org, instead of the stable version. */
  version?: string;
  /** If set, the command will overwrite any installed version of the theme, without prompting for confirmation. */
  force?: boolean;
  /** If set, the command will install the theme while ignoring any WordPress or PHP version requirements specified by the theme authors. */
  ignoreRequirements?: boolean;
  /** If set, the theme will be activated immediately after install. */
  activate?: boolean;
  /** Retry downloads without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack. */
  insecure?: boolean;
}

export interface ThemeDeleteOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, all themes will be deleted except active theme. */
  all?: boolean;
  /** To delete active theme use this. */
  force?: boolean;
}

export interface PostTypeListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Prints the value of a single field for each post type. */
  field?: string;
  /** Limit the output to specific post type fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "count" | "yaml";
}

export interface PostTypeGetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Instead of returning the whole taxonomy, returns the value of a single field. */
  field?: string;
  /** Limit the output to specific fields. Defaults to all fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "yaml";
}

export interface SearchReplaceOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Run the entire search/replace operation and show report, but don't save changes to the database. */
  dryRun?: boolean;
  /** Search/replace through all the tables registered to $wpdb in a multisite install. */
  network?: boolean;
  /** Enable replacement on any tables that match the table prefix even if not registered on $wpdb. */
  allTablesWithPrefix?: boolean;
  /** Enable replacement on ALL tables in the database, regardless of the prefix, and even if not registered on $wpdb. Overrides --network and --all-tables-with-prefix. */
  allTables?: boolean;
  /** Write transformed data as SQL file instead of saving replacements to the database. If <file> is not supplied, will output to STDOUT. */
  export?: boolean;
  /** Define number of rows in single INSERT statement when doing SQL export. You might want to change this depending on your database configuration (e.g. if you need to do fewer queries). Default: 50 */
  exportInsertSize?: string;
  /** Do not perform the replacement on specific tables. Use commas to specify multiple tables. Wildcards are supported, e.g. `'wp_*options'` or `'wp_post*'`. */
  skipTables?: string;
  /** Do not perform the replacement on specific columns. Use commas to specify multiple columns. */
  skipColumns?: string;
  /** Perform the replacement on specific columns. Use commas to specify multiple columns. */
  includeColumns?: string;
  /** Force the use of PHP (instead of SQL) which is more thorough, but slower. */
  precise?: boolean;
  /** Enable recursing into objects to replace strings. Defaults to true; pass --no-recurse-objects to disable. */
  recurseObjects?: boolean;
  /** Prints rows to the console as they're updated. */
  verbose?: boolean;
  /** Runs the search using a regular expression (without delimiters). Warning: search-replace will take about 15-20x longer when using --regex. */
  regex?: boolean;
  /** Pass PCRE modifiers to regex search-replace (e.g. 'i' for case-insensitivity). */
  regexFlags?: string;
  /** The delimiter to use for the regex. It must be escaped if it appears in the search string. The default value is the result of `chr(1)`. */
  regexDelimiter?: string;
  /** The maximum possible replacements for the regex per row (or per unserialized data bit per row). Defaults to -1 (no limit). */
  regexLimit?: string;
  /** Render output in a particular format. */
  format?: "table" | "count";
  /** Produce report. Defaults to true. */
  report?: boolean;
  /** Report changed fields only. Defaults to false, unless logging, when it defaults to true. */
  reportChangedOnly?: boolean;
  /** Log the items changed. If <file> is not supplied or is "-", will output to STDOUT. Warning: causes a significant slow down, similar or worse to enabling --precise or --regex. */
  log?: boolean;
  /** For logging, number of characters to display before the old match and the new replacement. Default 40. Ignored if not logging. */
  beforeContext?: string;
  /** For logging, number of characters to display after the old match and the new replacement. Default 40. Ignored if not logging. */
  afterContext?: string;
}

export interface PluginListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Prints the value of a single field for each plugin. */
  field?: string;
  /** Limit the output to specific object fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "count" | "json" | "yaml";
  /** Filter the output by plugin status. */
  status?: "active" | "active-network" | "dropin" | "inactive" | "must-use";
  /** If set, the plugin update check will be skipped. */
  skipUpdateCheck?: boolean;
  /** If set, only recently active plugins will be shown and the status filter will be ignored. */
  recentlyActive?: boolean;
}

export interface PluginDeactivateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Uninstall the plugin after deactivation. */
  uninstall?: boolean;
  /** If set, all plugins will be deactivated. */
  all?: boolean;
  /** Comma separated list of plugin slugs that should be excluded from deactivation. */
  exclude?: string;
  /** If set, the plugin will be deactivated for the entire multisite network. */
  network?: boolean;
}

export interface PluginIsActiveOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, check if plugin is network-activated. */
  network?: boolean;
}

export interface PluginAutoUpdatesOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface PluginUninstallOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Deactivate the plugin before uninstalling. Default behavior is to warn and skip if the plugin is active. */
  deactivate?: boolean;
  /** If set, the plugin files will not be deleted. Only the uninstall procedure will be run. */
  skipDelete?: boolean;
  /** If set, all plugins will be uninstalled. */
  all?: boolean;
  /** Comma separated list of plugin slugs to be excluded from uninstall. */
  exclude?: string;
}

export interface PluginUpdateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, all plugins that have updates will be updated. */
  all?: boolean;
  /** Comma separated list of plugin names that should be excluded from updating. */
  exclude?: string;
  /** Only perform updates for minor releases (e.g. from 1.3 to 1.4 instead of 2.0) */
  minor?: boolean;
  /** Only perform updates for patch releases (e.g. from 1.3 to 1.3.3 instead of 1.4) */
  patch?: boolean;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "summary";
  /** If set, the plugin will be updated to the specified version. */
  version?: string;
  /** Preview which plugins would be updated. */
  dryRun?: boolean;
  /** Retry downloads without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack. */
  insecure?: boolean;
}

export interface PluginVerifyChecksumsOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, all plugins will be verified. */
  all?: boolean;
  /** If set, even "soft changes" like readme.txt changes will trigger checksum errors. */
  strict?: boolean;
  /** Verify checksums against a specific plugin version. */
  version?: string;
  /** Render output in a specific format. */
  format?: "table" | "json" | "csv" | "yaml" | "count";
  /** Retry downloads without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack. */
  insecure?: boolean;
  /** Comma separated list of plugin names that should be excluded from verifying. */
  exclude?: string;
}

export interface PluginStatusOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface PluginPathOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, get the path to the closest parent directory, instead of the plugin file. */
  dir?: boolean;
}

export interface PluginGetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Instead of returning the whole plugin, returns the value of a single field. */
  field?: string;
  /** Limit the output to specific fields. Defaults to all fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "yaml";
}

export interface PluginSearchOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Optional page to display. */
  page?: number;
  /** Optional number of results to display. */
  perPage?: number;
  /** Prints the value of a single field for each plugin. */
  field?: string;
  /** Ask for specific fields from the API. Defaults to name,slug,author_profile,rating. Acceptable values: */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "count" | "json" | "yaml";
}

export interface PluginToggleOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, the plugin will be toggled for the entire multisite network. */
  network?: boolean;
}

export interface PluginIsInstalledOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface PluginActivateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, all plugins will be activated. */
  all?: boolean;
  /** Comma separated list of plugin slugs to be excluded from activation. */
  exclude?: string;
  /** If set, the plugin will be activated for the entire multisite network. */
  network?: boolean;
}

export interface PluginInstallOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, get that particular version from wordpress.org, instead of the stable version. */
  version?: string;
  /** If set, the command will overwrite any installed version of the plugin, without prompting for confirmation. */
  force?: boolean;
  ignoreRequirements?: boolean;
  /** If set, the plugin will be activated immediately after install. */
  activate?: boolean;
  /** If set, the plugin will be network activated immediately after install */
  activateNetwork?: boolean;
  /** Retry downloads without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack. */
  insecure?: boolean;
}

export interface PluginDeleteOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, all plugins will be deleted. */
  all?: boolean;
  /** Comma separated list of plugin slugs to be excluded from deletion. */
  exclude?: string;
}

export interface WidgetListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Limit the output to specific object fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "ids" | "json" | "count" | "yaml";
}

export interface WidgetDeactivateOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface WidgetAddOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface WidgetUpdateOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface WidgetMoveOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Assign the widget to a new position. */
  position?: string;
  /** Assign the widget to a new sidebar */
  sidebarId?: string;
}

export interface WidgetResetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, all sidebars will be reset. */
  all?: boolean;
}

export interface WidgetDeleteOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface PostListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Prints the value of a single field for each post. */
  field?: string;
  /** Limit the output to specific object fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "ids" | "json" | "count" | "yaml";
}

export interface PostUrlToIdOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface PostUpdateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The ID of the user who added the post. Default is the current user ID. */
  postAuthor?: string;
  /** The date of the post. Default is the current time. */
  postDate?: string;
  /** The date of the post in the GMT timezone. Default is the value of $post_date. */
  postDateGmt?: string;
  /** The post content. Default empty. */
  postContent?: string;
  /** The filtered post content. Default empty. */
  postContentFiltered?: string;
  /** The post title. Default empty. */
  postTitle?: string;
  /** The post excerpt. Default empty. */
  postExcerpt?: string;
  /** The post status. Default 'draft'. */
  postStatus?: string;
  /** The post type. Default 'post'. */
  postType?: string;
  /** Whether the post can accept comments. Accepts 'open' or 'closed'. Default is the value of 'default_comment_status' option. */
  commentStatus?: string;
  /** Whether the post can accept pings. Accepts 'open' or 'closed'. Default is the value of 'default_ping_status' option. */
  pingStatus?: string;
  /** The password to access the post. Default empty. */
  postPassword?: string;
  /** The post name. Default is the sanitized post title when creating a new post. */
  postName?: string;
  /** Space or carriage return-separated list of URLs to ping. Default empty. */
  toPing?: string;
  /** Space or carriage return-separated list of URLs that have been pinged. Default empty. */
  pinged?: string;
  /** The date when the post was last modified. Default is the current time. */
  postModified?: string;
  /** The date when the post was last modified in the GMT timezone. Default is the current time. */
  postModifiedGmt?: string;
  /** Set this for the post it belongs to, if any. Default 0. */
  postParent?: string;
  /** The order the post should be displayed in. Default 0. */
  menuOrder?: string;
  /** The mime type of the post. Default empty. */
  postMimeType?: string;
  /** Global Unique ID for referencing the post. Default empty. */
  guid?: string;
  /** Array of category names, slugs, or IDs. Defaults to value of the 'default_category' option. */
  postCategory?: string;
  /** Array of tag names, slugs, or IDs. Default empty. */
  tagsInput?: string;
  /** Array of taxonomy terms keyed by their taxonomy name. Default empty. */
  taxInput?: string;
  /** Array in JSON format of post meta values keyed by their post meta key. Default empty. */
  metaInput?: string;
  /** Recalculate term count in batch, for a performance boost. */
  deferTermCounting?: boolean;
}

export interface PostTermOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface PostGenerateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** How many posts to generate? */
  count?: number;
  /** The type of the generated posts. */
  postType?: string;
  /** The status of the generated posts. */
  postStatus?: string;
  /** The post title. */
  postTitle?: string;
  /** The author of the generated posts. */
  postAuthor?: string;
  /** The date of the post. Default is the current time. */
  postDate?: string;
  /** The date of the post in the GMT timezone. Default is the value of --post_date. */
  postDateGmt?: string;
  /** If set, the command reads the post_content from STDIN. */
  postContent?: boolean;
  /** For hierarchical post types, generate child posts down to a certain depth. */
  maxDepth?: number;
  /** Render output in a particular format. */
  format?: "progress" | "ids";
}

export interface PostEditOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface PostGetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Instead of returning the whole post, returns the value of a single field. */
  field?: string;
  /** Limit the output to specific fields. Defaults to all fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "yaml";
}

export interface PostExistsOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface PostCreateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The ID of the user who added the post. Default is the current user ID. */
  postAuthor?: string;
  /** The date of the post. Default is the current time. */
  postDate?: string;
  /** The date of the post in the GMT timezone. Default is the value of $post_date. */
  postDateGmt?: string;
  /** The post content. Default empty. */
  postContent?: string;
  /** The filtered post content. Default empty. */
  postContentFiltered?: string;
  /** The post title. Default empty. */
  postTitle?: string;
  /** The post excerpt. Default empty. */
  postExcerpt?: string;
  /** The post status. Default 'draft'. */
  postStatus?: string;
  /** The post type. Default 'post'. */
  postType?: string;
  /** Whether the post can accept comments. Accepts 'open' or 'closed'. Default is the value of 'default_comment_status' option. */
  commentStatus?: string;
  /** Whether the post can accept pings. Accepts 'open' or 'closed'. Default is the value of 'default_ping_status' option. */
  pingStatus?: string;
  /** The password to access the post. Default empty. */
  postPassword?: string;
  /** The post name. Default is the sanitized post title when creating a new post. */
  postName?: string;
  /** Post id of a post to be duplicated. */
  fromPost?: number;
  /** Space or carriage return-separated list of URLs to ping. Default empty. */
  toPing?: string;
  /** Space or carriage return-separated list of URLs that have been pinged. Default empty. */
  pinged?: string;
  /** The date when the post was last modified. Default is the current time. */
  postModified?: string;
  /** The date when the post was last modified in the GMT timezone. Default is the current time. */
  postModifiedGmt?: string;
  /** Set this for the post it belongs to, if any. Default 0. */
  postParent?: string;
  /** The order the post should be displayed in. Default 0. */
  menuOrder?: string;
  /** The mime type of the post. Default empty. */
  postMimeType?: string;
  /** Global Unique ID for referencing the post. Default empty. */
  guid?: string;
  /** Array of category names, slugs, or IDs. Defaults to value of the 'default_category' option. */
  postCategory?: string;
  /** Array of tag names, slugs, or IDs. Default empty. */
  tagsInput?: string;
  /** Array of taxonomy terms keyed by their taxonomy name. Default empty. */
  taxInput?: string;
  /** Array in JSON format of post meta values keyed by their post meta key. Default empty. */
  metaInput?: string;
  /** Immediately open system's editor to write or edit post content. */
  edit?: boolean;
  /** Output just the new post id. */
  porcelain?: boolean;
}

export interface PostMetaOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface PostDeleteOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Skip the trash bin. */
  force?: boolean;
  /** Recalculate term count in batch, for a performance boost. */
  deferTermCounting?: boolean;
}

export interface ConfigListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Limit the output to specific fields. Defaults to all fields. */
  fields?: string;
  /** Render output in a particular format. Dotenv is limited to non-object values. */
  format?: "table" | "csv" | "json" | "yaml" | "dotenv";
  /** Enforce strict matching when a filter is provided. */
  strict?: boolean;
  /** Specify the file path to the config file to be read. Defaults to the root of the WordPress installation and the filename "wp-config.php". */
  configFile?: string;
}

export interface ConfigHasOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Type of the config value to set. Defaults to 'all'. */
  type?: "constant" | "variable" | "all";
  /** Specify the file path to the config file to be checked. Defaults to the root of the WordPress installation and the filename "wp-config.php". */
  configFile?: string;
}

export interface ConfigEditOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Specify the file path to the config file to be edited. Defaults to the root of the WordPress installation and the filename "wp-config.php". */
  configFile?: string;
}

export interface ConfigPathOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface ConfigSetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Add the value if it doesn't exist yet. This is the default behavior, override with --no-add. */
  add?: boolean;
  /** Place the value into the wp-config.php file as is, instead of as a quoted string. */
  raw?: boolean;
  /** Anchor string where additions of new values are anchored around. Defaults to "/* That's all, stop editing!". The special case "EOF" string uses the end of the file as the anchor. */
  anchor?: string;
  /** Where to place the new values in relation to the anchor string. */
  placement?: "before" | "after";
  /** Separator string to put between an added value and its anchor string. The following escape sequences will be recognized and properly interpreted: '\n' => newline, '\r' => carriage return, '\t' => tab. Defaults to a single EOL ("\n" on *nix and "\r\n" on Windows). */
  separator?: string;
  /** Type of the config value to set. Defaults to 'all'. */
  type?: "constant" | "variable" | "all";
  /** Specify the file path to the config file to be modified. Defaults to the root of the WordPress installation and the filename "wp-config.php". */
  configFile?: string;
}

export interface ConfigGetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Type of config value to retrieve. Defaults to 'all'. */
  type?: "constant" | "variable" | "all";
  /** Get value in a particular format. Dotenv is limited to non-object values. */
  format?: "var_export" | "json" | "yaml" | "dotenv";
  /** Specify the file path to the config file to be read. Defaults to the root of the WordPress installation and the filename "wp-config.php". */
  configFile?: string;
}

export interface ConfigIsTrueOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Type of config value to retrieve. Defaults to 'all'. */
  type?: "constant" | "variable" | "all";
  /** Specify the file path to the config file to be read. Defaults to the root of the WordPress installation and the filename "wp-config.php". */
  configFile?: string;
}

export interface ConfigShuffleSaltsOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If an unknown key is requested to be shuffled, add it instead of throwing a warning. */
  force?: boolean;
  /** Specify the file path to the config file to be modified. Defaults to the root of the WordPress installation and the filename "wp-config.php". */
  configFile?: string;
  /** Retry API download without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack. */
  insecure?: boolean;
}

export interface ConfigCreateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Set the database name. */
  dbname: string;
  /** Set the database user. */
  dbuser: string;
  /** Set the database user password. */
  dbpass?: string;
  /** Set the database host. */
  dbhost?: string;
  /** Set the database table prefix. */
  dbprefix?: string;
  /** Set the database charset. */
  dbcharset?: string;
  /** Set the database collation. */
  dbcollate?: string;
  /** Set the WPLANG constant. Defaults to $wp_local_package variable. */
  locale?: string;
  /** If set, the command copies additional PHP code into wp-config.php from STDIN. */
  extraPhp?: boolean;
  /** If set, keys and salts won't be generated, but should instead be passed via `--extra-php`. */
  skipSalts?: boolean;
  /** If set, the database connection is not checked. */
  skipCheck?: boolean;
  /** Overwrites existing files, if present. */
  force?: boolean;
  /** Specify the file path to the config file to be created. Defaults to the root of the WordPress installation and the filename "wp-config.php". */
  configFile?: string;
  /** Retry API download without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack. */
  insecure?: boolean;
}

export interface ConfigDeleteOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Type of the config value to delete. Defaults to 'all'. */
  type?: "constant" | "variable" | "all";
  /** Specify the file path to the config file to be modified. Defaults to the root of the WordPress installation and the filename "wp-config.php". */
  configFile?: string;
}

export interface EvalFileOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Load and execute file without loading WordPress. */
  skipWordpress?: boolean;
  /** Process the provided file via include instead of evaluating its contents. */
  useInclude?: boolean;
}

export interface MediaImportOptions
  extends Record<string, string | number | boolean | undefined> {
  /** ID of the post to attach the imported files to. */
  postId?: number;
  /** Name of the post to attach the imported files to. */
  postName?: string;
  /** Attachment name (post_name field). */
  fileName?: string;
  /** Attachment title (post title field). */
  title?: string;
  /** Caption for attachment (post excerpt field). */
  caption?: string;
  /** Alt text for image (saved as post meta). */
  alt?: string;
  /** "Description" field (post content) of attachment post. */
  desc?: string;
  /** If set, media files (local only) are imported to the library but not moved on disk. File names will not be run through wp_unique_filename() with this set. */
  skipCopy?: boolean;
  /** Use the file modified time as the post published &amp; modified dates. Remote files will always use the current time. */
  preserveFiletime?: boolean;
  /** If set, set the imported image as the Featured Image of the post it is attached to. */
  featuredImage?: boolean;
  /** Output a single field for each imported image. Defaults to attachment ID when used as flag. */
  porcelain?: "url";
}

export interface MediaFixOrientationOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Check images needing orientation without performing the operation. */
  dryRun?: boolean;
}

export interface MediaRegenerateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Name of the image size to regenerate. Only thumbnails of this image size will be regenerated, thumbnails of other image sizes will not. */
  imageSize?: string;
  /** Skip deletion of the original thumbnails. If your thumbnails are linked from sources outside your control, it's likely best to leave them around. Defaults to false. */
  skipDelete?: boolean;
  /** Only generate thumbnails for images missing image sizes. */
  onlyMissing?: boolean;
  /** Only delete thumbnails for old unregistered image sizes. */
  deleteUnknown?: boolean;
  /** Answer yes to the confirmation message. Confirmation only shows when no IDs passed as arguments. */
  yes?: boolean;
}

export interface MediaImageSizeOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Limit the output to specific fields. Defaults to all fields. */
  fields?: string;
  /** Render output in a specific format */
  format?: "table" | "json" | "csv" | "yaml" | "count";
}

export interface DbImportOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Username to pass to mysql. Defaults to DB_USER. */
  dbuser?: string;
  /** Password to pass to mysql. Defaults to DB_PASSWORD. */
  dbpass?: string;
  /** When using an SQL file, do not include speed optimization such as disabling auto-commit and key checks. */
  skipOptimization?: boolean;
  /** Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration. */
  defaults?: boolean;
}

export interface DbCliOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Use a specific database. Defaults to DB_NAME. */
  database?: string;
  /** Use a specific character set. Defaults to DB_CHARSET when defined. */
  defaultCharacterSet?: string;
  /** Username to pass to mysql. Defaults to DB_USER. */
  dbuser?: string;
  /** Password to pass to mysql. Defaults to DB_PASSWORD. */
  dbpass?: string;
  /** Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration. */
  defaults?: boolean;
}

export interface DbTablesOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Can be all, global, ms_global, blog, or old tables. Defaults to all. */
  scope?: string;
  /** List all the tables in a multisite install. */
  network?: boolean;
  /** List all tables that match the table prefix even if not registered on $wpdb. Overrides --network. */
  allTablesWithPrefix?: boolean;
  /** List all tables in the database, regardless of the prefix, and even if not registered on $wpdb. Overrides --all-tables-with-prefix. */
  allTables?: boolean;
  /** Render output in a particular format. */
  format?: "list" | "csv";
}

export interface DbExportOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Username to pass to mysqldump. Defaults to DB_USER. */
  dbuser?: string;
  /** Password to pass to mysqldump. Defaults to DB_PASSWORD. */
  dbpass?: string;
  /** The comma separated list of specific tables to export. Excluding this parameter will export all tables in the database. */
  tables?: string;
  /** The comma separated list of specific tables that should be skipped from exporting. Excluding this parameter will export all tables in the database. */
  excludeTables?: string;
  /** Skips adding the default --no-tablespaces option to mysqldump. */
  includeTablespaces?: boolean;
  /** Output filename for the exported database. */
  porcelain?: boolean;
  /** Include a `DROP TABLE IF EXISTS` statement before each `CREATE TABLE` statement. */
  addDropTable?: boolean;
  /** Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration. */
  defaults?: boolean;
}

export interface DbCleanOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Username to pass to mysql. Defaults to DB_USER. */
  dbuser?: string;
  /** Password to pass to mysql. Defaults to DB_PASSWORD. */
  dbpass?: string;
  /** Answer yes to the confirmation message. */
  yes?: boolean;
  /** Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration. */
  defaults?: boolean;
}

export interface DbDropOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Username to pass to mysql. Defaults to DB_USER. */
  dbuser?: string;
  /** Password to pass to mysql. Defaults to DB_PASSWORD. */
  dbpass?: string;
  /** Answer yes to the confirmation message. */
  yes?: boolean;
  /** Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration. */
  defaults?: boolean;
}

export interface DbOptimizeOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Username to pass to mysqlcheck. Defaults to DB_USER. */
  dbuser?: string;
  /** Password to pass to mysqlcheck. Defaults to DB_PASSWORD. */
  dbpass?: string;
  /** Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration. */
  defaults?: boolean;
}

export interface DbQueryOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Username to pass to mysql. Defaults to DB_USER. */
  dbuser?: string;
  /** Password to pass to mysql. Defaults to DB_PASSWORD. */
  dbpass?: string;
  /** Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration. */
  defaults?: boolean;
}

export interface DbColumnsOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "yaml";
}

export interface DbRepairOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Username to pass to mysqlcheck. Defaults to DB_USER. */
  dbuser?: string;
  /** Password to pass to mysqlcheck. Defaults to DB_PASSWORD. */
  dbpass?: string;
  /** Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration. */
  defaults?: boolean;
}

export interface DbSearchOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Search through all the tables registered to $wpdb in a multisite install. */
  network?: boolean;
  /** Search through all tables that match the registered table prefix, even if not registered on $wpdb. On one hand, sometimes plugins use tables without registering them to $wpdb. On another hand, this could return tables you don't expect. Overrides --network. */
  allTablesWithPrefix?: boolean;
  /** Search through ALL tables in the database, regardless of the prefix, and even if not registered on $wpdb. Overrides --network and --all-tables-with-prefix. */
  allTables?: boolean;
  /** Number of characters to display before the match. */
  beforeContext?: string;
  /** Number of characters to display after the match. */
  afterContext?: string;
  /** Runs the search as a regular expression (without delimiters). The search becomes case-sensitive (i.e. no PCRE flags are added). Delimiters must be escaped if they occur in the expression. Because the search is run on individual columns, you can use the `^` and `$` tokens to mark the start and end of a match, respectively. */
  regex?: boolean;
  /** Pass PCRE modifiers to the regex search (e.g. 'i' for case-insensitivity). */
  regexFlags?: string;
  /** The delimiter to use for the regex. It must be escaped if it appears in the search string. The default value is the result of `chr(1)`. */
  regexDelimiter?: string;
  /** Output the 'table:column' line once before all matching row lines in the table column rather than before each matching row. */
  tableColumnOnce?: boolean;
  /** Place the 'table:column' output on the same line as the row id and match ('table:column:id:match'). Overrides --table_column_once. */
  oneLine?: boolean;
  /** Only output the string matches (including context). No 'table:column's or row ids are outputted. */
  matchesOnly?: boolean;
  /** Output stats on the number of matches found, time taken, tables/columns/rows searched, tables skipped. */
  stats?: boolean;
  /** Percent color code to use for the 'table:column' output. For a list of available percent color codes, see below. Default '%G' (bright green). */
  tableColumnColor?: string;
  /** Percent color code to use for the row id output. For a list of available percent color codes, see below. Default '%Y' (bright yellow). */
  idColor?: string;
  /** Percent color code to use for the match (unless both before and after context are 0, when no color code is used). For a list of available percent color codes, see below. Default '%3%k' (black on a mustard background). */
  matchColor?: string;
  /** Get a specific subset of the fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "yaml" | "ids" | "count";
}

export interface DbCheckOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Username to pass to mysqlcheck. Defaults to DB_USER. */
  dbuser?: string;
  /** Password to pass to mysqlcheck. Defaults to DB_PASSWORD. */
  dbpass?: string;
  /** Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration. */
  defaults?: boolean;
}

export interface DbSizeOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Display the database size only, as a bare number. */
  sizeFormat?:
    | "b"
    | "kb"
    | "mb"
    | "gb"
    | "tb"
    | "B"
    | "KB"
    | "KiB"
    | "MB"
    | "MiB"
    | "GB"
    | "GiB"
    | "TB"
    | "TiB";
  /** Display each table name and size instead of the database size. */
  tables?: boolean;
  /** Display database sizes in human readable formats. */
  humanReadable?: boolean;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "yaml";
  /** Can be all, global, ms_global, blog, or old tables. Defaults to all. */
  scope?: string;
  /** List all the tables in a multisite install. */
  network?: boolean;
  /** Number of digits after decimal point. Defaults to 0. */
  decimals?: string;
  /** List all tables that match the table prefix even if not registered on $wpdb. Overrides --network. */
  allTablesWithPrefix?: boolean;
  /** List all tables in the database, regardless of the prefix, and even if not registered on $wpdb. Overrides --all-tables-with-prefix. */
  allTables?: boolean;
  /** Ascending or Descending order. */
  order?: "asc" | "desc";
  /** Order by fields. */
  orderby?: "name" | "size";
}

export interface DbPrefixOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface DbCreateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Username to pass to mysql. Defaults to DB_USER. */
  dbuser?: string;
  /** Password to pass to mysql. Defaults to DB_PASSWORD. */
  dbpass?: string;
  /** Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration. */
  defaults?: boolean;
}

export interface DbResetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Username to pass to mysql. Defaults to DB_USER. */
  dbuser?: string;
  /** Password to pass to mysql. Defaults to DB_PASSWORD. */
  dbpass?: string;
  /** Answer yes to the confirmation message. */
  yes?: boolean;
  /** Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration. */
  defaults?: boolean;
}

export interface ProfileEvalFileOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Focus on key metrics for all hooks, or callbacks on a specific hook. */
  hook?: boolean;
  /** Display one or more fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "json" | "yaml" | "csv";
  /** Ascending or Descending order. */
  order?: "ASC" | "DESC";
  /** Set orderby which field. */
  orderby?: string;
}

export interface ProfileStageOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Expand upon all stages. */
  all?: boolean;
  /** Filter out logs with zero-ish values from the set. */
  spotlight?: boolean;
  /** Execute a request against a specified URL. Defaults to the home URL. */
  url?: string;
  /** Limit the output to specific fields. Default is all fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "json" | "yaml" | "csv";
  /** Ascending or Descending order. */
  order?: "ASC" | "DESC";
  /** Set orderby which field. */
  orderby?: string;
}

export interface ProfileEvalOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Focus on key metrics for all hooks, or callbacks on a specific hook. */
  hook?: boolean;
  /** Display one or more fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "json" | "yaml" | "csv";
  /** Ascending or Descending order. */
  order?: "ASC" | "DESC";
  /** Set orderby which field. */
  orderby?: string;
}

export interface ProfileHookOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Profile callbacks for all WordPress hooks. */
  all?: boolean;
  /** Filter out logs with zero-ish values from the set. */
  spotlight?: boolean;
  /** Execute a request against a specified URL. Defaults to the home URL. */
  url?: string;
  /** Display one or more fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "json" | "yaml" | "csv";
  /** Ascending or Descending order. */
  order?: "ASC" | "DESC";
  /** Set orderby which field. */
  orderby?: string;
}

export interface NetworkMetaOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface MenuListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Limit the output to specific object fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "count" | "ids" | "yaml";
}

export interface MenuItemOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface MenuLocationOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface MenuCreateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Output just the new menu id. */
  porcelain?: boolean;
}

export interface MenuDeleteOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface ImportOptions
  extends Record<string, string | number | boolean | undefined> {
  /** How the author mapping should be handled. Options are 'create', 'mapping.csv', or 'skip'. The first will create any non-existent users from the WXR file. The second will read author mapping associations from a CSV, or create a CSV for editing if the file path doesn't exist. The CSV requires two columns, and a header row like "old_user_login,new_user_login". The last option will skip any author mapping. */
  authors: string;
  /** Skip importing specific data. Supported options are: 'attachment' and 'image_resize' (skip time-consuming thumbnail generation). */
  skip?: string;
}

export interface CoreUpdateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Only perform updates for minor releases (e.g. update from WP 4.3 to 4.3.3 instead of 4.4.2). */
  minor?: boolean;
  /** Update to a specific version, instead of to the latest version. Alternatively accepts 'nightly'. */
  version?: string;
  /** Update even when installed WP version is greater than the requested version. */
  force?: boolean;
  /** Select which language you want to download. */
  locale?: string;
  /** Retry download without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack. */
  insecure?: boolean;
}

export interface CoreVerifyChecksumsOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Verify all files and folders in the root directory, and warn if any non-WordPress items are found. */
  includeRoot?: boolean;
  /** Verify checksums against a specific version of WordPress. */
  version?: string;
  /** Verify checksums against a specific locale of WordPress. */
  locale?: string;
  /** Retry downloads without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack. */
  insecure?: boolean;
  /** Exclude specific files from the checksum verification. Provide a comma-separated list of file paths. */
  exclude?: string;
}

export interface CoreVersionOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Show extended version information. */
  extra?: boolean;
}

export interface CoreMultisiteInstallOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The address of the new site. */
  url?: string;
  /** Base path after the domain name that each site url in the network will start with. */
  base?: string;
  /** If passed, the network will use subdomains, instead of subdirectories. Doesn't work with 'localhost'. */
  subdomains?: boolean;
  /** The title of the new site. */
  title: string;
  /** The name of the admin user. */
  adminUser: string;
  /** The password for the admin user. Defaults to randomly generated string. */
  adminPassword?: string;
  /** The email address for the admin user. */
  adminEmail: string;
  /** Don't send an email notification to the new admin user. */
  skipEmail?: boolean;
  /** Don't add multisite constants to wp-config.php. */
  skipConfig?: boolean;
}

export interface CoreCheckUpdateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Compare only the first two parts of the version number. */
  minor?: boolean;
  /** Compare only the first part of the version number. */
  major?: boolean;
  /** Bypass the transient cache and force a fresh update check. */
  forceCheck?: boolean;
  /** Prints the value of a single field for each update. */
  field?: string;
  /** Limit the output to specific object fields. Defaults to version,update_type,package_url. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "count" | "json" | "yaml";
}

export interface CoreMultisiteConvertOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The title of the new network. */
  title?: string;
  /** Base path after the domain name that each site url will start with. */
  base?: string;
  /** If passed, the network will use subdomains, instead of subdirectories. Doesn't work with 'localhost'. */
  subdomains?: boolean;
  /** Don't add multisite constants to wp-config.php. */
  skipConfig?: boolean;
}

export interface CoreDownloadOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Specify the path in which to install WordPress. Defaults to current directory. */
  path?: string;
  /** Select which language you want to download. */
  locale?: string;
  /** Select which version you want to download. Accepts a version number, 'latest' or 'nightly'. */
  version?: string;
  /** Download WP without the default themes and plugins. */
  skipContent?: boolean;
  /** Overwrites existing files, if present. */
  force?: boolean;
  /** Retry download without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack. */
  insecure?: boolean;
  /** Whether to extract the downloaded file. Defaults to true. */
  extract?: boolean;
}

export interface CoreUpdateDbOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Update databases for all sites on a network */
  network?: boolean;
  /** Compare database versions without performing the update. */
  dryRun?: boolean;
}

export interface CoreIsInstalledOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Check if this is a multisite installation. */
  network?: boolean;
}

export interface CoreInstallOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The address of the new site. */
  url: string;
  /** The title of the new site. */
  title: string;
  /** The name of the admin user. */
  adminUser: string;
  /** The password for the admin user. Defaults to randomly generated string. */
  adminPassword?: string;
  /** The email address for the admin user. */
  adminEmail: string;
  /** The locale/language for the installation (e.g. `de_DE`). Default is `en_US`. */
  locale?: string;
  /** Don't send an email notification to the new admin user. */
  skipEmail?: boolean;
}

export interface CliInfoOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Render output in a particular format. */
  format?: "list" | "json";
}

export interface CliParamDumpOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Display current values also. */
  withValues?: boolean;
  /** Render output in a particular format. */
  format?: "var_export" | "json";
}

export interface CliUpdateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Only perform patch updates. */
  patch?: boolean;
  /** Only perform minor updates. */
  minor?: boolean;
  /** Only perform major updates. */
  major?: boolean;
  /** Update to the latest stable release. Skips update check. */
  stable?: boolean;
  /** Update to the latest built version of the master branch. Potentially unstable. */
  nightly?: boolean;
  /** Do not prompt for confirmation. */
  yes?: boolean;
  /** Retry without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack. */
  insecure?: boolean;
}

export interface CliVersionOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CliAliasOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CliHasCommandOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CliCheckUpdateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Only list patch updates. */
  patch?: boolean;
  /** Only list minor updates. */
  minor?: boolean;
  /** Only list major updates. */
  major?: boolean;
  /** Prints the value of a single field for each update. */
  field?: string;
  /** Limit the output to specific object fields. Defaults to version,update_type,package_url,status,requires_php. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "count" | "yaml";
}

export interface CliCmdDumpOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CliCompletionsOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The current command line to be executed. */
  line: string;
  /** The index to the current cursor position relative to the beginning of the command. */
  point: string;
}

export interface CliCacheOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface UserListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Only display users with a certain role. */
  role?: string;
  /** List all users in the network for multisite. */
  network?: boolean;
  /** Prints the value of a single field for each user. */
  field?: string;
  /** Limit the output to specific object fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "ids" | "json" | "count" | "yaml";
}

export interface UserRemoveCapOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Forcefully remove a capability. */
  force?: boolean;
}

export interface UserSessionOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface UserUpdateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** A string that contains the plain text password for the user. */
  userPass?: string;
  /** A string that contains a URL-friendly name for the user. The default is the user's username. */
  userNicename?: string;
  /** A string containing the user's URL for the user's web site. */
  userUrl?: string;
  /** A string containing the user's email address. */
  userEmail?: string;
  /** A string that will be shown on the site. Defaults to user's username. */
  displayName?: string;
  /** The user's nickname, defaults to the user's username. */
  nickname?: string;
  /** The user's first name. */
  firstName?: string;
  /** The user's last name. */
  lastName?: string;
  /** A string containing content about the user. */
  description?: string;
  /** A string for whether to enable the rich editor or not. False if not empty. */
  richEditing?: string;
  /** The date the user registered. */
  userRegistered?: string;
  /** A string used to set the user's role. */
  role?: string;
  /** Don't send an email notification to the user. */
  skipEmail?: boolean;
}

export interface UserTermOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface UserRemoveRoleOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface UserGenerateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** How many users to generate? */
  count?: number;
  /** The role of the generated users. Default: default role from WP */
  role?: string;
  /** Render output in a particular format. */
  format?: "progress" | "ids";
}

export interface UserImportCsvOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Send an email to new users with their account details. */
  sendEmail?: boolean;
  /** Don't update users that already exist. */
  skipUpdate?: boolean;
}

export interface UserListCapsOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Render output in a particular format. */
  format?: "list" | "table" | "csv" | "json" | "count" | "yaml";
  /** Render output in a particular format. */
  origin?: "all" | "user" | "role";
  /** Exclude capabilities that match role names from output. */
  excludeRoleNames?: boolean;
}

export interface UserApplicationPasswordOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface UserResetPasswordOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Don't send an email notification to the affected user(s). */
  skipEmail?: boolean;
  /** Show the new password(s). */
  showPassword?: boolean;
  /** Output only the new password(s). */
  porcelain?: boolean;
}

export interface UserAddCapOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface UserUnspamOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface UserSetRoleOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface UserSpamOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface UserCheckPasswordOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Escape password with `wp_slash()` to mimic the same behavior as `wp-login.php`. */
  escapeChars?: boolean;
}

export interface UserSignupOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface UserGetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Instead of returning the whole user, returns the value of a single field. */
  field?: string;
  /** Get a specific subset of the user's fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "yaml";
}

export interface UserExistsOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface UserCreateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The role of the user to create. Default: default role. Possible values include 'administrator', 'editor', 'author', 'contributor', 'subscriber'. */
  role?: string;
  /** The user password. Default: randomly generated. */
  userPass?: string;
  /** The date the user registered. Default: current date. */
  userRegistered?: string;
  /** The display name. */
  displayName?: string;
  /** A string that contains a URL-friendly name for the user. The default is the user's username. */
  userNicename?: string;
  /** A string containing the user's URL for the user's web site. */
  userUrl?: string;
  /** The user's nickname, defaults to the user's username. */
  nickname?: string;
  /** The user's first name. */
  firstName?: string;
  /** The user's last name. */
  lastName?: string;
  /** A string containing content about the user. */
  description?: string;
  /** A string for whether to enable the rich editor or not. False if not empty. */
  richEditing?: string;
  /** Send an email to the user with their new account details. */
  sendEmail?: boolean;
  /** Output just the new user id. */
  porcelain?: boolean;
}

export interface UserAddRoleOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface UserMetaOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface UserDeleteOptions
  extends Record<string, string | number | boolean | undefined> {
  /** On multisite, delete the user from the entire network. */
  network?: boolean;
  /** User ID to reassign the posts to. */
  reassign?: string;
  /** Answer yes to any confirmation prompts. */
  yes?: boolean;
}

export interface ShellOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Force the use of WP-CLI's built-in PHP REPL, even if the Boris or PsySH PHP REPLs are available. */
  basic?: boolean;
}

export interface RewriteListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Show rewrite rules matching a particular URL. */
  match?: string;
  /** Show rewrite rules from a particular source. */
  source?: string;
  /** Limit the output to specific fields. Defaults to match,query,source. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "count" | "yaml";
}

export interface RewriteStructureOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Set the base for category permalinks, i.e. '/category/'. */
  categoryBase?: string;
  /** Set the base for tag permalinks, i.e. '/tag/'. */
  tagBase?: string;
  /** Perform a hard flush - update `.htaccess` rules as well as rewrite rules in database. */
  hard?: boolean;
}

export interface RewriteFlushOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Perform a hard flush - update `.htaccess` rules as well as rewrite rules in database. Works only on single site installs. */
  hard?: boolean;
}

export interface TermListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Prints the value of a single field for each term. */
  field?: string;
  /** Limit the output to specific object fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "ids" | "json" | "count" | "yaml";
}

export interface TermUpdateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Explicitly handle the term value as a slug or id. */
  by?: "slug" | "id";
  /** A new name for the term. */
  name?: string;
  /** A new slug for the term. */
  slug?: string;
  /** A new description for the term. */
  description?: string;
  /** A new parent for the term. */
  parent?: number;
}

export interface TermMigrateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Explicitly handle the term value as a slug or id. */
  by?: "slug" | "id";
  /** Taxonomy slug of the term to migrate. */
  from?: string;
  /** Taxonomy slug to migrate to. */
  to?: string;
}

export interface TermGenerateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** How many terms to generate? */
  count?: number;
  /** Generate child terms down to a certain depth. */
  maxDepth?: number;
  /** Render output in a particular format. */
  format?: "progress" | "ids";
}

export interface TermRecountOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface TermGetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Explicitly handle the term value as a slug or id. */
  by?: "slug" | "id";
  /** Instead of returning the whole term, returns the value of a single field. */
  field?: string;
  /** Limit the output to specific fields. Defaults to all fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "yaml";
}

export interface TermCreateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** A unique slug for the new term. Defaults to sanitized version of name. */
  slug?: string;
  /** A description for the new term. */
  description?: string;
  /** A parent for the new term. */
  parent?: number;
  /** Output just the new term id. */
  porcelain?: boolean;
}

export interface TermMetaOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface TermDeleteOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Explicitly handle the term value as a slug or id. */
  by?: "slug" | "id";
}

export interface CommentListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Prints the value of a single field for each comment. */
  field?: string;
  /** Limit the output to specific object fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "ids" | "csv" | "json" | "count" | "yaml";
}

export interface CommentUpdateOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CommentApproveOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CommentGenerateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** How many comments to generate? */
  count?: number;
  /** Assign comments to a specific post. */
  postId?: string;
  /** Render output in a particular format. */
  format?: "progress" | "ids";
}

export interface CommentStatusOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CommentUnapproveOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CommentTrashOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CommentUnspamOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CommentRecountOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CommentSpamOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CommentGetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Instead of returning the whole comment, returns the value of a single field. */
  field?: string;
  /** Limit the output to specific fields. Defaults to all fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "yaml";
}

export interface CommentUntrashOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CommentExistsOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CommentCreateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Output just the new comment id. */
  porcelain?: boolean;
}

export interface CommentCountOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CommentMetaOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CommentDeleteOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Skip the trash bin. */
  force?: boolean;
}

export interface MaintenanceModeDeactivateOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface MaintenanceModeIsActiveOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface MaintenanceModeStatusOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface MaintenanceModeActivateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Force maintenance mode activation operation. */
  force?: boolean;
}

export interface TaxonomyListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Prints the value of a single field for each taxonomy. */
  field?: string;
  /** Limit the output to specific taxonomy fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "count" | "yaml";
}

export interface TaxonomyGetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Instead of returning the whole taxonomy, returns the value of a single field. */
  field?: string;
  /** Limit the output to specific fields. Defaults to all fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "yaml";
}

export interface ExportOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Full path to directory where WXR export files should be stored. Defaults to current working directory. */
  dir?: string;
  /** Output the whole XML using standard output (incompatible with --dir=) */
  stdout?: boolean;
  /** Don't include comments in the WXR export file. */
  skipComments?: boolean;
  /** A single export file should have this many megabytes. -1 for unlimited. */
  maxFileSize?: string;
  /** Use a custom format for export filenames. Defaults to '{site}.wordpress.{date}.{n}.xml'. */
  filenameFormat?: string;
  /** Include specified export section only in the first export file. Valid options are categories, tags, nav_menu_items, custom_taxonomies_terms. Separate multiple sections with a comma. Defaults to none. */
  includeOnce?: string;
  /** Export orphaned terms with `parent=0`, instead of throwing an exception. */
  allowOrphanTerms?: boolean;
}

export interface SidebarListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Limit the output to specific object fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "ids" | "count" | "yaml";
}

export interface ScaffoldPostTypeOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The text used to translate the update messages. */
  label?: string;
  /** The textdomain to use for the labels. */
  textdomain?: string;
  /** The dashicon to use in the menu. */
  dashicon?: string;
  /** Create a file in the active theme directory, instead of sending to STDOUT. Specify a theme with `--theme=<theme>` to have the file placed in that theme. */
  theme?: boolean;
  /** Create a file in the given plugin's directory, instead of sending to STDOUT. */
  plugin?: string;
  /** Just generate the `register_post_type()` call and nothing else. */
  raw?: boolean;
  /** Overwrite files that already exist. */
  force?: boolean;
}

export interface ScaffoldBlockOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The display title for your block. */
  title?: string;
  /** The dashicon to make it easier to identify your block. */
  dashicon?: string;
  /** The category name to help users browse and discover your block. */
  category?: "common" | "embed" | "formatting" | "layout" | "widgets";
  /** Create files in the active theme directory. Specify a theme with `--theme=<theme>` to have the file placed in that theme. */
  theme?: boolean;
  /** Create files in the given plugin's directory. */
  plugin?: string;
  /** Overwrite files that already exist. */
  force?: boolean;
}

export interface ScaffoldPluginOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Put the new plugin in some arbitrary directory path. Plugin directory will be path plus supplied slug. */
  dir?: string;
  /** What to put in the 'Plugin Name:' header. */
  pluginName?: string;
  /** What to put in the 'Description:' header. */
  pluginDescription?: string;
  /** What to put in the 'Author:' header. */
  pluginAuthor?: string;
  /** What to put in the 'Author URI:' header. */
  pluginAuthorUri?: string;
  /** What to put in the 'Plugin URI:' header. */
  pluginUri?: string;
  /** Don't generate files for unit testing. */
  skipTests?: boolean;
  /** Choose a configuration file for a continuous integration provider. */
  ci?: "circle" | "gitlab" | "bitbucket" | "github";
  /** Activate the newly generated plugin. */
  activate?: boolean;
  /** Network activate the newly generated plugin. */
  activateNetwork?: boolean;
  /** Overwrite files that already exist. */
  force?: boolean;
}

export interface ScaffoldPluginTestsOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Generate test files for a non-standard plugin path. If no plugin slug is specified, the directory name is used. */
  dir?: string;
  /** Choose a configuration file for a continuous integration provider. */
  ci?: "circle" | "gitlab" | "bitbucket" | "github";
  /** Overwrite files that already exist. */
  force?: boolean;
}

export interface ScaffoldChildThemeOptions
  extends Record<string, string | number | boolean | undefined> {
  /** What to put in the 'Template:' header in 'style.css'. */
  parentTheme: string;
  /** What to put in the 'Theme Name:' header in 'style.css'. */
  themeName?: string;
  /** What to put in the 'Author:' header in 'style.css'. */
  author?: string;
  /** What to put in the 'Author URI:' header in 'style.css'. */
  authorUri?: string;
  /** What to put in the 'Theme URI:' header in 'style.css'. */
  themeUri?: string;
  /** Activate the newly created child theme. */
  activate?: boolean;
  /** Enable the newly created child theme for the entire network. */
  enableNetwork?: boolean;
  /** Overwrite files that already exist. */
  force?: boolean;
}

export interface ScaffoldUnderscoresOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Activate the newly downloaded theme. */
  activate?: boolean;
  /** Enable the newly downloaded theme for the entire network. */
  enableNetwork?: boolean;
  /** What to put in the 'Theme Name:' header in 'style.css'. */
  themeName?: string;
  /** What to put in the 'Author:' header in 'style.css'. */
  author?: string;
  /** What to put in the 'Author URI:' header in 'style.css'. */
  authorUri?: string;
  /** Include stylesheets as SASS. */
  sassify?: boolean;
  /** Include WooCommerce boilerplate files. */
  woocommerce?: boolean;
  /** Overwrite files that already exist. */
  force?: boolean;
}

export interface ScaffoldTaxonomyOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Post types to register for use with the taxonomy. */
  postTypes?: string;
  /** The text used to translate the update messages. */
  label?: string;
  /** The textdomain to use for the labels. */
  textdomain?: string;
  /** Create a file in the active theme directory, instead of sending to STDOUT. Specify a theme with `--theme=<theme>` to have the file placed in that theme. */
  theme?: boolean;
  /** Create a file in the given plugin's directory, instead of sending to STDOUT. */
  plugin?: string;
  /** Just generate the `register_taxonomy()` call and nothing else. */
  raw?: boolean;
  /** Overwrite files that already exist. */
  force?: boolean;
}

export interface ScaffoldThemeTestsOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Generate test files for a non-standard theme path. If no theme slug is specified, the directory name is used. */
  dir?: string;
  /** Choose a configuration file for a continuous integration provider. */
  ci?: "circle" | "gitlab" | "bitbucket" | "github";
  /** Overwrite files that already exist. */
  force?: boolean;
}

export interface SuperAdminListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Render output in a particular format. */
  format?: "list" | "table" | "csv" | "json" | "count" | "ids" | "yaml";
}

export interface SuperAdminAddOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface SuperAdminRemoveOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CapListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Render output in a particular format. */
  format?: "list" | "table" | "csv" | "json" | "count" | "yaml";
  /** Display all capabilities defined for a role including grant. */
  showGrant?: boolean;
}

export interface CapAddOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Adds the capability as an explicit boolean value, instead of implicitly defaulting to `true`. */
  grant?: "true" | "false";
}

export interface CapRemoveOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface RoleListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Limit the output to specific object fields. */
  fields?: string;
  /** Prints the value of a single field. */
  field?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "count" | "yaml";
}

export interface RoleExistsOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface RoleCreateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Clone capabilities from an existing role. */
  clone?: string;
}

export interface RoleResetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** If set, all default roles will be reset. */
  all?: boolean;
}

export interface RoleDeleteOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface OptionListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Use wildcards ( * and ? ) to match option name. */
  search?: string;
  /** Pattern to exclude. Use wildcards ( * and ? ) to match option name. */
  exclude?: string;
  /** Match only autoload options when value is on, and only not-autoload option when off. */
  autoload?: string;
  /** List only transients. Use `--no-transients` to ignore all transients. */
  transients?: boolean;
  /** Unserialize option values in output. */
  unserialize?: boolean;
  /** Prints the value of a single field. */
  field?: string;
  /** Limit the output to specific object fields. */
  fields?: string;
  /** The serialization format for the value. total_bytes displays the total size of matching options in bytes. */
  format?: "table" | "json" | "csv" | "count" | "yaml" | "total_bytes";
  /** Set orderby which field. */
  orderby?: "option_id" | "option_name" | "option_value";
  /** Set ascending or descending order. */
  order?: "asc" | "desc";
}

export interface OptionSetAutoloadOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface OptionAddOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The serialization format for the value. */
  format?: "plaintext" | "json";
  /** Should this option be automatically loaded. */
  autoload?: "on" | "off" | "yes" | "no";
}

export interface OptionPatchOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The serialization format for the value. */
  format?: "plaintext" | "json";
}

export interface OptionUpdateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Requires WP 4.2. Should this option be automatically loaded. */
  autoload?: "on" | "off" | "yes" | "no";
  /** The serialization format for the value. */
  format?: "plaintext" | "json";
}

export interface OptionPluckOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The output format of the value. */
  format?: "plaintext" | "json" | "yaml";
}

export interface OptionGetAutoloadOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface OptionGetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Get value in a particular format. */
  format?: "var_export" | "json" | "yaml";
}

export interface OptionDeleteOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface SiteListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The network to which the sites belong. */
  network?: string;
  /** Only list the sites with these blog_id values (comma-separated). */
  site_In?: string;
  /** Only list the sites with this user. */
  siteUser?: string;
  /** Prints the value of a single field for each site. */
  field?: string;
  /** Comma-separated list of fields to show. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "count" | "ids" | "json" | "yaml";
}

export interface SiteDeactivateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Path of the site to be deactivated. Subdomain on subdomain installs, directory on subdirectory installs. */
  slug?: string;
}

export interface SiteGenerateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** How many sites to generates? */
  count?: number;
  /** Path for the new site. Subdomain on subdomain installs, directory on subdirectory installs. */
  slug?: string;
  /** Email for admin user. User will be created if none exists. Assignment to super admin if not included. */
  email?: string;
  /** Network to associate new site with. Defaults to current network (typically 1). */
  networkId?: string;
  /** If set, the new site will be non-public (not indexed) */
  private?: boolean;
  /** Render output in a particular format. */
  format?: "progress" | "ids";
}

export interface SiteArchiveOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Path of the site to archive. Subdomain on subdomain installs, directory on subdirectory installs. */
  slug?: string;
}

export interface SiteEmptyOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Also delete *all* files in the site's uploads directory. */
  uploads?: boolean;
  /** Proceed to empty the site without a confirmation prompt. */
  yes?: boolean;
}

export interface SitePrivateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Path of the site to be set as private. Subdomain on subdomain installs, directory on subdirectory installs. */
  slug?: string;
}

export interface SiteSwitchLanguageOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface SiteOptionOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface SiteUnspamOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Path of the site to be removed from spam. Subdomain on subdomain installs, directory on subdirectory installs. */
  slug?: string;
}

export interface SiteSpamOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Path of the site to be marked as spam. Subdomain on subdomain installs, directory on subdirectory installs. */
  slug?: string;
}

export interface SitePublicOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Path of the site to be set as public. Subdomain on subdomain installs, directory on subdirectory installs. */
  slug?: string;
}

export interface SiteUnarchiveOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Path of the site to unarchive. Subdomain on subdomain installs, directory on subdirectory installs. */
  slug?: string;
}

export interface SiteMatureOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Path of the site to be set as mature. Subdomain on subdomain installs, directory on subdirectory installs. */
  slug?: string;
}

export interface SiteActivateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Path of the site to be activated. Subdomain on subdomain installs, directory on subdirectory installs. */
  slug?: string;
}

export interface SiteCreateOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Path for the new site. Subdomain on subdomain installs, directory on subdirectory installs. */
  slug: string;
  /** Title of the new site. Default: prettified slug. */
  title?: string;
  /** Email for admin user. User will be created if none exists. Assignment to super admin if not included. */
  email?: string;
  /** Network to associate new site with. Defaults to current network (typically 1). */
  networkId?: string;
  /** If set, the new site will be non-public (not indexed) */
  private?: boolean;
  /** If set, only the site id will be output on success. */
  porcelain?: boolean;
}

export interface SiteUnmatureOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Path of the site to be set as unmature. Subdomain on subdomain installs, directory on subdirectory installs. */
  slug?: string;
}

export interface SiteMetaOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface SiteDeleteOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Path of the site to be deleted. Subdomain on subdomain installs, directory on subdirectory installs. */
  slug?: string;
  /** Answer yes to the confirmation message. */
  yes?: boolean;
  /** Delete the blog from the list, but don't drop its tables. */
  keepTables?: boolean;
}

export interface EmbedHandlerOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface EmbedProviderOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface EmbedFetchOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Width of the embed in pixels. */
  width?: string;
  /** Height of the embed in pixels. */
  height?: string;
  /** Cache oEmbed response for a given post. */
  postId?: string;
  /** Enable oEmbed discovery. Defaults to true. */
  discover?: boolean;
  /** Ignore already cached oEmbed responses. Has no effect if using the 'raw' option, which doesn't use the cache. */
  skipCache?: boolean;
  /** Remove the filter that WordPress from 4.4 onwards uses to sanitize oEmbed responses. Has no effect if using the 'raw' option, which by-passes sanitization. */
  skipSanitization?: boolean;
  /** If the URL is handled by a registered embed handler and returns a shortcode, do shortcode and return result. Has no effect if using the 'raw' option, which by-passes handlers. */
  doShortcode?: boolean;
  /** Limit the size of the resulting HTML when using discovery. Default 150 KB (the standard WordPress limit). Not compatible with 'no-discover'. */
  limitResponseSize?: string;
  /** Return the raw oEmbed response instead of the resulting HTML. Ignores the cache and does not sanitize responses or use registered embed handlers. */
  raw?: boolean;
  /** Render raw oEmbed data in a particular format. Defaults to json. Can only be specified in conjunction with the 'raw' option. */
  rawFormat?: "json" | "xml";
}

export interface EmbedCacheOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CronScheduleOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CronEventOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CronTestOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface FindOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Skip the paths that are ignored by default. */
  skipIgnoredPaths?: boolean;
  /** Include additional ignored paths as CSV (e.g. '/sys-backup/,/temp/'). */
  includeIgnoredPaths?: string;
  /** Only recurse to a specified depth, inclusive. */
  maxDepth?: string;
  /** Limit the output to specific row fields. */
  fields?: string;
  /** Output a specific field for each row. */
  field?: string;
  /** Render output in a specific format. */
  format?: "table" | "json" | "csv" | "yaml" | "count";
  /** Log useful information to STDOUT. */
  verbose?: boolean;
}

export interface ServerOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The hostname to bind the server to. */
  host?: string;
  /** The port number to bind the server to. */
  port?: string;
  /** The path to use as the document root. If the path global parameter is set, the default value is it. */
  docroot?: string;
  /** Configure the server with a specific .ini file. */
  config?: string;
}

export interface I18nUpdatePoOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface I18nMakePhpOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface I18nMakeJsonOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Text domain to use for the JSON file name. Overrides the default one extracted from the PO file. */
  domain?: string;
  /** Additional custom JS extensions, comma separated list. By default searches for .min.js and .js extensions. */
  extensions?: string;
  /** Whether to purge the strings that were extracted from the original source file. Defaults to true, use `--no-purge` to skip the removal. */
  purge?: boolean;
  /** Whether MO files should be updated as well after updating PO files. Only has an effect when used in combination with `--purge`. */
  updateMoFiles?: boolean;
  /** Pretty-print resulting JSON files. */
  prettyPrint?: boolean;
  /** Whether to use a mapping file for the strings, as a JSON value, array to specify multiple. Each element can either be a string (file path) or object (map). */
  useMap?: string;
}

export interface I18nMakeMoOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface I18nMakePotOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Plugin or theme slug. Defaults to the source directory's basename. */
  slug?: string;
  /** Text domain to look for in the source code, unless the `--ignore-domain` option is used. By default, the "Text Domain" header of the plugin or theme is used. If none is provided, it falls back to the project slug. */
  domain?: string;
  /** Ignore the text domain completely and extract strings with any text domain. */
  ignoreDomain?: boolean;
  /** Comma-separated list of POT files whose contents should be merged with the extracted strings. If left empty, defaults to the destination POT file. POT file headers will be ignored. */
  merge?: boolean;
  /** Comma-separated list of POT files whose contents should act as some sort of denylist for string extraction. Any string which is found on that denylist will not be extracted. This can be useful when you want to create multiple POT files from the same source directory with slightly different content and no duplicate strings between them. */
  subtract?: string;
  /** Whether source code references and comments from the generated POT file should be instead added to the POT file used for subtraction. Warning: this modifies the files passed to `--subtract`! */
  subtractAndMerge?: boolean;
  /** Comma-separated list of files and paths that should be used for string extraction. If provided, only these files and folders will be taken into account for string extraction. For example, `--include="src,my-file.php` will ignore anything besides `my-file.php` and files in the `src` directory. Simple glob patterns can be used, i.e. `--include=foo-*.php` includes any PHP file with the `foo-` prefix. Leading and trailing slashes are ignored, i.e. `/my/directory/` is the same as `my/directory`. */
  include?: string;
  /** Comma-separated list of files and paths that should be skipped for string extraction. For example, `--exclude=.github,myfile.php` would ignore any strings found within `myfile.php` or the `.github` folder. Simple glob patterns can be used, i.e. `--exclude=foo-*.php` excludes any PHP file with the `foo-` prefix. Leading and trailing slashes are ignored, i.e. `/my/directory/` is the same as `my/directory`. The following files and folders are always excluded: node_modules, .git, .svn, .CVS, .hg, vendor, *.min.js. */
  exclude?: string;
  /** Array in JSON format of custom headers which will be added to the POT file. Defaults to empty array. */
  headers?: string;
  /** Whether to write `#: filename:line` lines. Defaults to true, use `--no-location` to skip the removal. Note that disabling this option makes it harder for technically skilled translators to understand each message’s context. */
  location?: boolean;
  /** Skips JavaScript string extraction. Useful when this is done in another build step, e.g. through Babel. */
  skipJs?: boolean;
  /** Skips PHP string extraction. */
  skipPhp?: boolean;
  /** Skips Blade-PHP string extraction. */
  skipBlade?: boolean;
  /** Skips string extraction from block.json files. */
  skipBlockJson?: boolean;
  /** Skips string extraction from theme.json files. */
  skipThemeJson?: boolean;
  /** Skips string audit where it tries to find possible mistakes in translatable strings. Useful when running in an automated environment. */
  skipAudit?: boolean;
  /** String that should be added as a comment to the top of the resulting POT file. By default, a copyright comment is added for WordPress plugins and themes in the following manner: */
  fileComment?: string;
  /** Name to use for package name in the resulting POT file's `Project-Id-Version` header. Overrides plugin or theme name, if applicable. */
  packageName?: string;
}

export interface LanguageThemeOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface LanguagePluginOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface LanguageCoreOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface AdminOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface TransientListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Use wildcards ( * and ? ) to match transient name. */
  search?: string;
  /** Pattern to exclude. Use wildcards ( * and ? ) to match transient name. */
  exclude?: string;
  /** Get the values of network|site transients. On single site, this is a specially-named cache key. On multisite, this is a global cache (instead of local to the site). */
  network?: boolean;
  /** Unserialize transient values in output. */
  unserialize?: boolean;
  /** Human-readable output for expirations. */
  humanReadable?: boolean;
  /** Limit the output to specific object fields. */
  fields?: string;
  /** The serialization format for the value. */
  format?: "table" | "json" | "csv" | "count" | "yaml";
}

export interface TransientPatchOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The serialization format for the value. */
  format?: "plaintext" | "json";
  /** Time until expiration, in seconds. */
  expiration?: string;
  /** Get the value of a network|site transient. On single site, this is a specially-named cache key. On multisite, this is a global cache (instead of local to the site). */
  network?: boolean;
}

export interface TransientTypeOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface TransientPluckOptions
  extends Record<string, string | number | boolean | undefined> {
  /** The output format of the value. */
  format?: "plaintext" | "json" | "yaml";
  /** Get the value of a network|site transient. On single site, this is a specially-named cache key. On multisite, this is a global cache (instead of local to the site). */
  network?: boolean;
}

export interface TransientSetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Set the value of a network|site transient. On single site, this is is a specially-named cache key. On multisite, this is a global cache (instead of local to the site). */
  network?: boolean;
}

export interface TransientGetOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Render output in a particular format. */
  format?: "table" | "csv" | "json" | "yaml";
  /** Get the value of a network|site transient. On single site, this is is a specially-named cache key. On multisite, this is a global cache (instead of local to the site). */
  network?: boolean;
}

export interface TransientDeleteOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Delete the value of a network|site transient. On single site, this is is a specially-named cache key. On multisite, this is a global cache (instead of local to the site). */
  network?: boolean;
  /** Delete all transients. */
  all?: boolean;
  /** Delete all expired transients. */
  expired?: boolean;
}

export interface PackageListOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Limit the output to specific fields. Defaults to all fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "ids" | "json" | "yaml";
}

export interface PackageUninstallOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Retry downloads without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack. */
  insecure?: boolean;
}

export interface PackageUpdateOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface PackagePathOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface PackageBrowseOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Limit the output to specific fields. Defaults to all fields. */
  fields?: string;
  /** Render output in a particular format. */
  format?: "table" | "csv" | "ids" | "json" | "yaml";
}

export interface PackageInstallOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Retry downloads without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack. */
  insecure?: boolean;
}

export interface EvalOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Execute code without loading WordPress. */
  skipWordpress?: boolean;
}

export interface DistArchiveOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Automatically create the target directory as needed. */
  createTargetDir?: boolean;
  /** Forces overwriting of the archive file if it already exists. */
  force?: boolean;
  /** Set the archive extract directory name. Defaults to project directory name. */
  pluginDirname?: string;
  /** Choose the format for the archive. */
  format?: "zip" | "targz";
  /** Use a custom format for archive filename. Available substitutions: {name}, {version}. This is ignored if the <target> parameter is provided or the version cannot be determined. */
  filenameFormat?: string;
}

export interface CacheDecrOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CacheAddOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CachePatchOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Method for grouping data within the cache which allows the same key to be used across groups. */
  group?: string;
  expiration?: string;
  /** The serialization format for the value. */
  format?: "plaintext" | "json";
}

export interface CacheFlushGroupOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CacheTypeOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CachePluckOptions
  extends Record<string, string | number | boolean | undefined> {
  /** Method for grouping data within the cache which allows the same key to be used across groups. */
  group?: string;
  /** The output format of the value. */
  format?: "plaintext" | "json" | "yaml";
}

export interface CacheSetOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CacheSupportsOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CacheGetOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CacheFlushOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CacheIncrOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CacheReplaceOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface CacheDeleteOptions
  extends Record<string, string | number | boolean | undefined> {}

export interface HelpOptions
  extends Record<string, string | number | boolean | undefined> {}

// #endregion

// #region Command Classes

class ThemeCommand extends WpCliCommand {
  /**
   * Gets a list of themes.
   *
   * @example
   * // List inactive themes.
   * WpCli.list.run(...);
   * ```sh
   * wp theme list --status=inactive --format=csv
   * ```
   */
  async list(
    options: ThemeListOptions & { format: "json" }
  ): Promise<WpThemeList[]>;
  async list(options?: Omit<ThemeListOptions, "format">): Promise<string>;
  async list(options?: ThemeListOptions): Promise<string | WpThemeList[]> {
    const command = this.buildCommand("theme list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpThemeList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Checks if a given theme is active.
   *
   * @example
   * // Check whether theme is Active; exit status 0 if active, otherwise 1
   * WpCli.isActive.run(...);
   * ```sh
   * wp theme is-active twentyfifteen
   * ```
   */
  async isActive(): Promise<string> {
    const command = this.buildCommand("theme is-active", []);
    return this.execute<string>(command);
  }

  /**
   * Sets, gets, and removes theme mods.
   *
   * @example
   * // Set the 'background_color' theme mod to '000000'.
   * WpCli.mod.run(...);
   * ```sh
   * wp theme mod set background_color 000000
   * ```
   * @example
   * // Get single theme mod in JSON format.
   * WpCli.mod.run(...);
   * ```sh
   * wp theme mod get background_color --format=json
   * ```
   * @example
   * // Remove all theme mods.
   * WpCli.mod.run(...);
   * ```sh
   * wp theme mod remove --all
   * ```
   */
  async mod(): Promise<string> {
    const command = this.buildCommand("theme mod", []);
    return this.execute<string>(command);
  }

  /**
   * Manages theme auto-updates.
   *
   * @example
   * // Enable the auto-updates for a theme
   * WpCli.autoUpdates.run(...);
   * ```sh
   * wp theme auto-updates enable twentysixteen
   * ```
   * @example
   * // Disable the auto-updates for a theme
   * WpCli.autoUpdates.run(...);
   * ```sh
   * wp theme auto-updates disable twentysixteen
   * ```
   * @example
   * // Get the status of theme auto-updates
   * WpCli.autoUpdates.run(...);
   * ```sh
   * wp theme auto-updates status twentysixteen
   * ```
   */
  async autoUpdates(): Promise<string> {
    const command = this.buildCommand("theme auto-updates", []);
    return this.execute<string>(command);
  }

  /**
   * Updates one or more themes.
   *
   * @example
   * // Update multiple themes
   * WpCli.update.run(...);
   * ```sh
   * wp theme update twentyfifteen twentysixteen
   * ```
   * @example
   * // Exclude themes updates when bulk updating the themes
   * WpCli.update.run(...);
   * ```sh
   * wp theme update --all --exclude=twentyfifteen
   * ```
   * @example
   * // Update all themes
   * WpCli.update.run(...);
   * ```sh
   * wp theme update --all
   * ```
   */
  async update(options?: ThemeUpdateOptions): Promise<string> {
    const command = this.buildCommand("theme update", [], options);
    return this.execute<string>(command);
  }

  /**
   * Reveals the status of one or all themes.
   *
   * @example
   * WpCli.status.run(...);
   * ```sh
   * wp theme status twentysixteen
   * ```
   */
  async status(): Promise<string> {
    const command = this.buildCommand("theme status", []);
    return this.execute<string>(command);
  }

  /**
   * Gets the path to a theme or to the theme directory.
   *
   * @example
   * // Get theme path
   * WpCli.path.run(...);
   * ```sh
   * wp theme path
   * ```
   */
  async path(options?: ThemePathOptions): Promise<string> {
    const command = this.buildCommand("theme path", [], options);
    return this.execute<string>(command);
  }

  /**
   * Enables a theme on a WordPress multisite install.
   *
   * @example
   * // Enable theme
   * WpCli.enable.run(...);
   * ```sh
   * wp theme enable twentysixteen
   * ```
   * @example
   * // Network enable theme
   * WpCli.enable.run(...);
   * ```sh
   * wp theme enable twentysixteen --network
   * ```
   * @example
   * // Network enable and activate theme for current site
   * WpCli.enable.run(...);
   * ```sh
   * wp theme enable twentysixteen --activate
   * ```
   */
  async enable(options?: ThemeEnableOptions): Promise<string> {
    const command = this.buildCommand("theme enable", [], options);
    return this.execute<string>(command);
  }

  /**
   * Disables a theme on a WordPress multisite install.
   *
   * @example
   * // Disable theme
   * WpCli.disable.run(...);
   * ```sh
   * wp theme disable twentysixteen
   * ```
   * @example
   * // Disable theme in network level
   * WpCli.disable.run(...);
   * ```sh
   * wp theme disable twentysixteen --network
   * ```
   */
  async disable(options?: ThemeDisableOptions): Promise<string> {
    const command = this.buildCommand("theme disable", [], options);
    return this.execute<string>(command);
  }

  /**
   * Gets details about a theme.
   *
   * @example
   * WpCli.get.run(...);
   * ```sh
   * wp theme get twentysixteen --fields=name,title,version
   * ```
   */
  async get(options?: ThemeGetOptions): Promise<string> {
    const command = this.buildCommand("theme get", [], options);
    return this.execute<string>(command);
  }

  /**
   * Searches the WordPress.org theme directory.
   *
   * @example
   * WpCli.search.run(...);
   * ```sh
   * wp theme search photo --per-page=6
   * ```
   */
  async search(options?: ThemeSearchOptions): Promise<string> {
    const command = this.buildCommand("theme search", [], options);
    return this.execute<string>(command);
  }

  /**
   * Checks if a given theme is installed.
   *
   * @example
   * // Check whether theme is installed; exit status 0 if installed, otherwise 1
   * WpCli.isInstalled.run(...);
   * ```sh
   * wp theme is-installed hello
   * ```
   */
  async isInstalled(): Promise<string> {
    const command = this.buildCommand("theme is-installed", []);
    return this.execute<string>(command);
  }

  /**
   * Activates a theme.
   *
   * @example
   * WpCli.activate.run(...);
   * ```sh
   * wp theme activate twentysixteen
   * ```
   */
  async activate(themeName: string): Promise<string> {
    const command = this.buildCommand("theme activate", [themeName]);
    return this.execute<string>(command);
  }

  /**
   * Installs one or more themes.
   *
   * @example
   * // Install the latest version from wordpress.org and activate
   * WpCli.install.run(...);
   * ```sh
   * wp theme install twentysixteen --activate
   * ```
   * @example
   * // Install from a local zip file
   * WpCli.install.run(...);
   * ```sh
   * wp theme install ../my-theme.zip
   * ```
   * @example
   * // Install from a remote zip file
   * WpCli.install.run(...);
   * ```sh
   * wp theme install http://s3.amazonaws.com/bucketname/my-theme.zip?AWSAccessKeyId=123&amp;Expires=456&amp;Signature=abcdef
   * ```
   */
  async install(
    themes: string | string[],
    options?: ThemeInstallOptions
  ): Promise<string> {
    const command = this.buildCommand("theme install", [themes], options);
    return this.execute<string>(command);
  }

  /**
   * Deletes one or more themes.
   *
   * @example
   * WpCli.delete.run(...);
   * ```sh
   * wp theme delete twentytwelve
   * ```
   */
  async deleteThemes(
    themes: string | string[],
    options?: ThemeDeleteOptions
  ): Promise<string> {
    const command = this.buildCommand("theme delete", [themes], options);
    return this.execute<string>(command);
  }
}

class PostTypeCommand extends WpCliCommand {
  /**
   * Lists registered post types.
   *
   * @example
   * // List registered post types
   * WpCli.list.run(...);
   * ```sh
   * wp post-type list --format=csv
   * ```
   * @example
   * // List post types with 'post' capability type
   * WpCli.list.run(...);
   * ```sh
   * wp post-type list --capability_type=post --fields=name,public
   * ```
   */
  async list(
    options: PostTypeListOptions & { format: "json" }
  ): Promise<WpPostTypeList[]>;
  async list(options?: Omit<PostTypeListOptions, "format">): Promise<string>;
  async list(
    options?: PostTypeListOptions
  ): Promise<string | WpPostTypeList[]> {
    const command = this.buildCommand("post-type list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpPostTypeList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Gets details about a registered post type.
   *
   * @example
   * // Get details about the 'page' post type.
   * WpCli.get.run(...);
   * ```sh
   * wp post-type get page --fields=name,label,hierarchical --format=json
   * ```
   */
  async get(
    options: PostTypeGetOptions & { format: "json" }
  ): Promise<WpPostTypeGet[]>;
  async get(options?: Omit<PostTypeGetOptions, "format">): Promise<string>;
  async get(options?: PostTypeGetOptions): Promise<string | WpPostTypeGet[]> {
    const command = this.buildCommand("post-type get", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpPostTypeGet[]>(command);
    }
    return this.execute<string>(command);
  }
}

class SearchReplaceCommand extends WpCliCommand {
  /**
   * Searches/replaces strings in the database.
   *
   * @example
   * // Search and replace but skip one column
   * WpCli.searchReplace.run(...);
   * ```sh
   * wp search-replace 'http://example.test' 'http://example.com' --skip-columns=guid
   * ```
   * @example
   * // Run search/replace operation but dont save in database
   * WpCli.searchReplace.run(...);
   * ```sh
   * wp search-replace 'foo' 'bar' wp_posts wp_postmeta wp_terms --dry-run
   * ```
   * @example
   * // Run case-insensitive regex search/replace operation (slow)
   * WpCli.searchReplace.run(...);
   * ```sh
   * wp search-replace '\[foo id="([0-9]+)"' '[bar id="\1"' --regex --regex-flags='i'
   * ```
   * @example
   * // Turn your production multisite database into a local dev database
   * WpCli.searchReplace.run(...);
   * ```sh
   * wp search-replace --url=example.com example.com example.test 'wp_*options' wp_blogs wp_site --network
   * ```
   * @example
   * // Search/replace to a SQL file without transforming the database
   * WpCli.searchReplace.run(...);
   * ```sh
   * wp search-replace foo bar --export=database.sql
   * ```
   */
  async run(
    oldStr: string,
    newStr: string,
    tables?: string[],
    options?: SearchReplaceOptions
  ): Promise<string> {
    const args = [oldStr, newStr, tables];
    const command = this.buildCommand("search-replace", args, options);
    return this.execute<string>(command);
  }
}

class PluginCommand extends WpCliCommand {
  /**
   * Gets a list of plugins.
   *
   * @example
   * // List active plugins on the site.
   * WpCli.list.run(...);
   * ```sh
   * wp plugin list --status=active --format=json
   * ```
   * @example
   * // List plugins on each site in a network.
   * WpCli.list.run(...);
   * ```sh
   * wp site list --field=url | xargs -I % wp plugin list --url=%
   * ```
   * @example
   * // Check whether plugins are still active on WordPress.org
   * WpCli.list.run(...);
   * ```sh
   * wp plugin list --fields=name,wporg_status,wporg_last_updated
   * ```
   * @example
   * // List recently active plugins on the site.
   * WpCli.list.run(...);
   * ```sh
   * wp plugin list --recently-active --field=name --format=json
   * ```
   */
  async list(
    options: PluginListOptions & { format: "json" }
  ): Promise<WpPluginList[]>;
  async list(options?: Omit<PluginListOptions, "format">): Promise<string>;
  async list(options?: PluginListOptions): Promise<string | WpPluginList[]> {
    const command = this.buildCommand("plugin list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpPluginList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Deactivates one or more plugins.
   *
   * @example
   * // Deactivate plugin
   * WpCli.deactivate.run(...);
   * ```sh
   * wp plugin deactivate hello
   * ```
   * @example
   * // Deactivate all plugins with exclusion
   * WpCli.deactivate.run(...);
   * ```sh
   * wp plugin deactivate --all --exclude=hello,wordpress-seo
   * ```
   */
  async deactivate(
    plugins: string | string[],
    options?: PluginDeactivateOptions
  ): Promise<string> {
    const command = this.buildCommand(
      "plugin deactivate",
      Array.isArray(plugins) ? plugins : [plugins],
      options
    );
    return this.execute<string>(command);
  }

  /**
   * Checks if a given plugin is active.
   *
   * @example
   * // Check whether plugin is Active; exit status 0 if active, otherwise 1
   * WpCli.isActive.run(...);
   * ```sh
   * wp plugin is-active hello
   * ```
   */
  async isActive(options?: PluginIsActiveOptions): Promise<string> {
    const command = this.buildCommand("plugin is-active", [], options);
    return this.execute<string>(command);
  }

  /**
   * Manages plugin auto-updates.
   *
   * @example
   * // Enable the auto-updates for a plugin
   * WpCli.autoUpdates.run(...);
   * ```sh
   * wp plugin auto-updates enable hello
   * ```
   * @example
   * // Disable the auto-updates for a plugin
   * WpCli.autoUpdates.run(...);
   * ```sh
   * wp plugin auto-updates disable hello
   * ```
   * @example
   * // Get the status of plugin auto-updates
   * WpCli.autoUpdates.run(...);
   * ```sh
   * wp plugin auto-updates status hello
   * ```
   */
  async autoUpdates(): Promise<string> {
    const command = this.buildCommand("plugin auto-updates", []);
    return this.execute<string>(command);
  }

  /**
   * Uninstalls one or more plugins.
   *
   * @example
   * WpCli.uninstall.run(...);
   * ```sh
   * wp plugin uninstall hello
   * ```
   * @example
   * // Uninstall all plugins excluding specified ones
   * WpCli.uninstall.run(...);
   * ```sh
   * wp plugin uninstall --all --exclude=hello-dolly,jetpack
   * ```
   */
  async uninstall(options?: PluginUninstallOptions): Promise<string> {
    const command = this.buildCommand("plugin uninstall", [], options);
    return this.execute<string>(command);
  }

  /**
   * Updates one or more plugins.
   *
   * @example
   * WpCli.update.run(...);
   * ```sh
   * wp plugin update bbpress --version=dev
   * ```
   * @example
   * WpCli.update.run(...);
   * ```sh
   * wp plugin update --all
   * ```
   * @example
   * WpCli.update.run(...);
   * ```sh
   * wp plugin update --all --exclude=akismet
   * ```
   */
  async update(options?: PluginUpdateOptions): Promise<string> {
    const command = this.buildCommand("plugin update", [], options);
    return this.execute<string>(command);
  }

  /**
   * Verifies plugin files against WordPress.org's checksums.
   *
   * @example
   * // Verify the checksums of all installed plugins
   * WpCli.verifyChecksums.run(...);
   * ```sh
   * wp plugin verify-checksums --all
   * ```
   * @example
   * // Verify the checksums of a single plugin, Akismet in this case
   * WpCli.verifyChecksums.run(...);
   * ```sh
   * wp plugin verify-checksums akismet
   * ```
   */
  async verifyChecksums(
    options?: PluginVerifyChecksumsOptions
  ): Promise<string> {
    const command = this.buildCommand("plugin verify-checksums", [], options);
    return this.execute<string>(command);
  }

  /**
   * Reveals the status of one or all plugins.
   *
   * @example
   * // Displays status of all plugins
   * WpCli.status.run(...);
   * ```sh
   * wp plugin status
   * ```
   * @example
   * // Displays status of a plugin
   * WpCli.status.run(...);
   * ```sh
   * wp plugin status theme-check
   * ```
   */
  async status(): Promise<string> {
    const command = this.buildCommand("plugin status", []);
    return this.execute<string>(command);
  }

  /**
   * Gets the path to a plugin or to the plugin directory.
   */
  async path(options?: PluginPathOptions): Promise<string> {
    const command = this.buildCommand("plugin path", [], options);
    return this.execute<string>(command);
  }

  /**
   * Gets details about an installed plugin.
   *
   * @example
   * // Get plugin details.
   * WpCli.get.run(...);
   * ```sh
   * wp plugin get bbpress --format=json
   * ```
   */
  async get(
    options: PluginGetOptions & { format: "json" }
  ): Promise<WpPluginGet[]>;
  async get(options?: Omit<PluginGetOptions, "format">): Promise<string>;
  async get(options?: PluginGetOptions): Promise<string | WpPluginGet[]> {
    const command = this.buildCommand("plugin get", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpPluginGet[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Searches the WordPress.org plugin directory.
   *
   * @example
   * WpCli.search.run(...);
   * ```sh
   * wp plugin search dsgnwrks --per-page=20 --format=json
   * ```
   * @example
   * WpCli.search.run(...);
   * ```sh
   * wp plugin search dsgnwrks --fields=name,version,slug,rating,num_ratings
   * ```
   */
  async search(options?: PluginSearchOptions): Promise<string> {
    const command = this.buildCommand("plugin search", [], options);
    return this.execute<string>(command);
  }

  /**
   * Toggles a plugin's activation state.
   *
   * @example
   * // Akismet is currently activated
   * WpCli.toggle.run(...);
   * ```sh
   * wp plugin toggle akismet
   * ```
   * @example
   * // Akismet is currently deactivated
   * WpCli.toggle.run(...);
   * ```sh
   * wp plugin toggle akismet
   * ```
   */
  async toggle(options?: PluginToggleOptions): Promise<string> {
    const command = this.buildCommand("plugin toggle", [], options);
    return this.execute<string>(command);
  }

  /**
   * Checks if a given plugin is installed.
   *
   * @example
   * // Check whether plugin is installed; exit status 0 if installed, otherwise 1
   * WpCli.isInstalled.run(...);
   * ```sh
   * wp plugin is-installed hello
   * ```
   */
  async isInstalled(): Promise<string> {
    const command = this.buildCommand("plugin is-installed", []);
    return this.execute<string>(command);
  }

  /**
   * Activates one or more plugins.
   *
   * @example
   * // Activate plugin
   * WpCli.activate.run(...);
   * ```sh
   * wp plugin activate hello
   * ```
   * @example
   * // Activate plugin in entire multisite network
   * WpCli.activate.run(...);
   * ```sh
   * wp plugin activate hello --network
   * ```
   * @example
   * // Activate plugins that were recently active.
   * WpCli.activate.run(...);
   * ```sh
   * wp plugin activate $(wp plugin list --recently-active --field=name)
   * ```
   * @example
   * // Activate plugins that were recently active on a multisite.
   * WpCli.activate.run(...);
   * ```sh
   * wp plugin activate $(wp plugin list --recently-active --field=name) --network
   * ```
   */
  async activate(
    plugins: string | string[],
    options?: PluginActivateOptions
  ): Promise<string> {
    const command = this.buildCommand(
      "plugin activate",
      Array.isArray(plugins) ? plugins : [plugins],
      options
    );
    return this.execute<string>(command);
  }

  /**
   * Installs one or more plugins.
   *
   * @example
   * // Install the latest version from wordpress.org and activate
   * WpCli.install.run(...);
   * ```sh
   * wp plugin install bbpress --activate
   * ```
   * @example
   * // Install the development version from wordpress.org
   * WpCli.install.run(...);
   * ```sh
   * wp plugin install bbpress --version=dev
   * ```
   * @example
   * // Install from a local zip file
   * WpCli.install.run(...);
   * ```sh
   * wp plugin install ../my-plugin.zip
   * ```
   * @example
   * // Install from a remote zip file
   * WpCli.install.run(...);
   * ```sh
   * wp plugin install http://s3.amazonaws.com/bucketname/my-plugin.zip?AWSAccessKeyId=123&amp;Expires=456&amp;Signature=abcdef
   * ```
   * @example
   * // Update from a remote zip file
   * WpCli.install.run(...);
   * ```sh
   * wp plugin install https://github.com/envato/wp-envato-market/archive/master.zip --force
   * ```
   * @example
   * // Forcefully re-install all installed plugins
   * WpCli.install.run(...);
   * ```sh
   * wp plugin install $(wp plugin list --field=name) --force
   * ```
   */
  async install(
    plugins: string | string[],
    options?: PluginInstallOptions
  ): Promise<string> {
    const command = this.buildCommand(
      "plugin install",
      Array.isArray(plugins) ? plugins : [plugins],
      options
    );
    return this.execute<string>(command);
  }

  /**
   * Deletes plugin files without deactivating or uninstalling.
   *
   * @example
   * // Delete plugin
   * WpCli.delete.run(...);
   * ```sh
   * wp plugin delete hello
   * ```
   * @example
   * // Delete inactive plugins
   * WpCli.delete.run(...);
   * ```sh
   * wp plugin delete $(wp plugin list --status=inactive --field=name)
   * ```
   * @example
   * // Delete all plugins excluding specified ones
   * WpCli.delete.run(...);
   * ```sh
   * wp plugin delete --all --exclude=hello-dolly,jetpack
   * ```
   */
  async deletePlugins(
    plugins: string | string[],
    options?: PluginDeleteOptions
  ): Promise<string> {
    const command = this.buildCommand(
      "plugin delete",
      Array.isArray(plugins) ? plugins : [plugins],
      options
    );
    return this.execute<string>(command);
  }
}

class WidgetCommand extends WpCliCommand {
  /**
   * Lists widgets associated with a sidebar.
   *
   * @example
   * WpCli.list.run(...);
   * ```sh
   * wp widget list sidebar-1 --fields=name,id --format=csv
   * ```
   */
  async list(
    options: WidgetListOptions & { format: "json" }
  ): Promise<WpWidgetList[]>;
  async list(options?: Omit<WidgetListOptions, "format">): Promise<string>;
  async list(options?: WidgetListOptions): Promise<string | WpWidgetList[]> {
    const command = this.buildCommand("widget list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpWidgetList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Deactivates one or more widgets from an active sidebar.
   *
   * @example
   * // Deactivate the recent-comments-2 widget.
   * WpCli.deactivate.run(...);
   * ```sh
   * wp widget deactivate recent-comments-2
   * ```
   */
  async deactivate(): Promise<string> {
    const command = this.buildCommand("widget deactivate", []);
    return this.execute<string>(command);
  }

  /**
   * Adds a widget to a sidebar.
   *
   * @example
   * // Add a new calendar widget to sidebar-1 with title "Calendar"
   * WpCli.add.run(...);
   * ```sh
   * wp widget add calendar sidebar-1 2 --title="Calendar"
   * ```
   */
  async add(): Promise<string> {
    const command = this.buildCommand("widget add", []);
    return this.execute<string>(command);
  }

  /**
   * Updates options for an existing widget.
   *
   * @example
   * // Change calendar-1 widget title to "Our Calendar"
   * WpCli.update.run(...);
   * ```sh
   * wp widget update calendar-1 --title="Our Calendar"
   * ```
   */
  async update(): Promise<string> {
    const command = this.buildCommand("widget update", []);
    return this.execute<string>(command);
  }

  /**
   * Moves the position of a widget.
   *
   * @example
   * // Change position of widget
   * WpCli.move.run(...);
   * ```sh
   * wp widget move recent-comments-2 --position=2
   * ```
   * @example
   * // Move widget to Inactive Widgets
   * WpCli.move.run(...);
   * ```sh
   * wp widget move recent-comments-2 --sidebar-id=wp_inactive_widgets
   * ```
   */
  async move(options?: WidgetMoveOptions): Promise<string> {
    const command = this.buildCommand("widget move", [], options);
    return this.execute<string>(command);
  }

  /**
   * Resets sidebar.
   *
   * @example
   * // Reset a sidebar
   * WpCli.reset.run(...);
   * ```sh
   * wp widget reset sidebar-1
   * ```
   * @example
   * // Reset multiple sidebars
   * WpCli.reset.run(...);
   * ```sh
   * wp widget reset sidebar-1 sidebar-2
   * ```
   * @example
   * // Reset all sidebars
   * WpCli.reset.run(...);
   * ```sh
   * wp widget reset --all
   * ```
   */
  async reset(options?: WidgetResetOptions): Promise<string> {
    const command = this.buildCommand("widget reset", [], options);
    return this.execute<string>(command);
  }

  /**
   * Deletes one or more widgets from a sidebar.
   *
   * @example
   * // Delete the recent-comments-2 widget from its sidebar.
   * WpCli.delete.run(...);
   * ```sh
   * wp widget delete recent-comments-2
   * ```
   */
  async deleteDelete(): Promise<string> {
    const command = this.buildCommand("widget delete", []);
    return this.execute<string>(command);
  }
}

class PostCommand extends WpCliCommand {
  /**
   * Gets a list of posts.
   *
   * @example
   * // List post
   * WpCli.list.run(...);
   * ```sh
   * wp post list --field=ID
   * ```
   * @example
   * // List posts in JSON
   * WpCli.list.run(...);
   * ```sh
   * wp post list --post_type=post --posts_per_page=5 --format=json
   * ```
   * @example
   * // List all pages
   * WpCli.list.run(...);
   * ```sh
   * wp post list --post_type=page --fields=post_title,post_status
   * ```
   * @example
   * // List ids of all pages and posts
   * WpCli.list.run(...);
   * ```sh
   * wp post list --post_type=page,post --format=ids
   * ```
   * @example
   * // List given posts
   * WpCli.list.run(...);
   * ```sh
   * wp post list --post__in=1,3
   * ```
   * @example
   * // List given post by a specific author
   * WpCli.list.run(...);
   * ```sh
   * wp post list --author=2
   * ```
   */
  async list(
    options: PostListOptions & { format: "json" }
  ): Promise<WpPostList[]>;
  async list(options?: Omit<PostListOptions, "format">): Promise<string>;
  async list(options?: PostListOptions): Promise<string | WpPostList[]> {
    const command = this.buildCommand("post list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpPostList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Gets the post ID for a given URL.
   *
   * @example
   * // Get post ID by URL
   * WpCli.urlToId.run(...);
   * ```sh
   * wp post url-to-id https://example.com/?p=1
   * ```
   */
  async urlToId(): Promise<string> {
    const command = this.buildCommand("post url-to-id", []);
    return this.execute<string>(command);
  }

  /**
   * Updates one or more existing posts.
   *
   * @example
   * WpCli.update.run(...);
   * ```sh
   * wp post update 123 --post_name=something --post_status=draft
   * ```
   * @example
   * // Update a post with multiple meta values.
   * WpCli.update.run(...);
   * ```sh
   * wp post update 123 --meta_input='{"key1":"value1","key2":"value2"}'
   * ```
   * @example
   * // Update multiple posts at once.
   * WpCli.update.run(...);
   * ```sh
   * wp post update 123 456 --post_author=789
   * ```
   * @example
   * // Update all posts of a given post type at once.
   * WpCli.update.run(...);
   * ```sh
   * wp post update $(wp post list --post_type=page --format=ids) --post_author=123
   * ```
   */
  async update(
    postIds: number | number[],
    options?: PostUpdateOptions
  ): Promise<string> {
    const command = this.buildCommand(
      "post update",
      Array.isArray(postIds) ? postIds : [postIds],
      options
    );
    return this.execute<string>(command);
  }

  /**
   * Adds, updates, removes, and lists post terms.
   *
   * @example
   * // Set category post term `test` to the post ID 123
   * WpCli.term.run(...);
   * ```sh
   * wp post term set 123 test category
   * ```
   * @example
   * // Set category post terms `test` and `apple` to the post ID 123
   * WpCli.term.run(...);
   * ```sh
   * wp post term set 123 test apple category
   * ```
   * @example
   * // List category post terms for the post ID 123
   * WpCli.term.run(...);
   * ```sh
   * wp post term list 123 category --fields=term_id,slug
   * ```
   * @example
   * // Remove category post terms `test` and `apple` for the post ID 123
   * WpCli.term.run(...);
   * ```sh
   * wp post term remove 123 category test apple
   * ```
   */
  async term(): Promise<string> {
    const command = this.buildCommand("post term", []);
    return this.execute<string>(command);
  }

  /**
   * Generates some posts.
   *
   * @example
   * // Generate posts.
   * WpCli.generate.run(...);
   * ```sh
   * wp post generate --count=10 --post_type=page --post_date=1999-01-04
   * ```
   * @example
   * // Add meta to every generated posts.
   * WpCli.generate.run(...);
   * ```sh
   * wp post generate --format=ids | xargs -d ' ' -I % wp post meta add % foo bar
   * ```
   */
  async generate(options?: PostGenerateOptions): Promise<string> {
    const command = this.buildCommand("post generate", [], options);
    return this.execute<string>(command);
  }

  /**
   * Launches system editor to edit post content.
   *
   * @example
   * // Launch system editor to edit post
   * WpCli.edit.run(...);
   * ```sh
   * wp post edit 123
   * ```
   */
  async edit(): Promise<string> {
    const command = this.buildCommand("post edit", []);
    return this.execute<string>(command);
  }

  /**
   * Gets details about a post.
   *
   * @example
   * // Save the post content to a file
   * WpCli.get.run(...);
   * ```sh
   * wp post get 123 --field=content > file.txt
   * ```
   */
  async get(options?: PostGetOptions): Promise<string> {
    const command = this.buildCommand("post get", [], options);
    return this.execute<string>(command);
  }

  /**
   * Verifies whether a post exists.
   *
   * @example
   * // The post exists.
   * WpCli.exists.run(...);
   * ```sh
   * wp post exists 1337
   * ```
   * @example
   * // The post does not exist.
   * WpCli.exists.run(...);
   * ```sh
   * wp post exists 10000
   * ```
   */
  async exists(): Promise<string> {
    const command = this.buildCommand("post exists", []);
    return this.execute<string>(command);
  }

  /**
   * Creates a new post.
   *
   * @example
   * // Create post and schedule for future
   * WpCli.create.run(...);
   * ```sh
   * wp post create --post_type=post --post_title='A future post' --post_status=future --post_date='2030-12-01 07:00:00'
   * ```
   * @example
   * // Create post with content from given file
   * WpCli.create.run(...);
   * ```sh
   * wp post create ./post-content.txt --post_category=201,345 --post_title='Post from file'
   * ```
   * @example
   * // Create a post with multiple meta values.
   * WpCli.create.run(...);
   * ```sh
   * wp post create --post_title='A post' --post_content='Just a small post.' --meta_input='{"key1":"value1","key2":"value2"}'
   * ```
   * @example
   * // Create a duplicate post from existing posts.
   * WpCli.create.run(...);
   * ```sh
   * wp post create --from-post=123 --post_title='Different Title'
   * ```
   */
  async create(
    options: PostCreateOptions & { porcelain: true }
  ): Promise<number>;
  async create(options?: Omit<PostCreateOptions, "porcelain">): Promise<string>;
  async create(options?: PostCreateOptions): Promise<string | number> {
    const command = this.buildCommand("post create", [], options);
    if ((options as { porcelain?: boolean })?.porcelain) {
      const result = await this.execute<string>(command);
      return Number.parseInt(result.trim(), 10);
    }
    return this.execute<string>(command);
  }

  /**
   * Adds, updates, deletes, and lists post custom fields.
   *
   * @example
   * // Set post meta
   * WpCli.meta.run(...);
   * ```sh
   * wp post meta set 123 _wp_page_template about.php
   * ```
   * @example
   * // Get post meta
   * WpCli.meta.run(...);
   * ```sh
   * wp post meta get 123 _wp_page_template
   * ```
   * @example
   * // Update post meta
   * WpCli.meta.run(...);
   * ```sh
   * wp post meta update 123 _wp_page_template contact.php
   * ```
   * @example
   * // Delete post meta
   * WpCli.meta.run(...);
   * ```sh
   * wp post meta delete 123 _wp_page_template
   * ```
   */
  async meta(): Promise<string> {
    const command = this.buildCommand("post meta", []);
    return this.execute<string>(command);
  }

  /**
   * Deletes an existing post.
   *
   * @example
   * // Delete post skipping trash
   * WpCli.delete.run(...);
   * ```sh
   * wp post delete 123 --force
   * ```
   * @example
   * // Delete multiple posts
   * WpCli.delete.run(...);
   * ```sh
   * wp post delete 123 456 789
   * ```
   * @example
   * // Delete all pages
   * WpCli.delete.run(...);
   * ```sh
   * wp post delete $(wp post list --post_type='page' --format=ids)
   * ```
   * @example
   * // Delete all posts in the trash
   * WpCli.delete.run(...);
   * ```sh
   * wp post delete $(wp post list --post_status=trash --format=ids)
   * ```
   */
  async deletePosts(
    postIds: number | number[],
    options?: PostDeleteOptions
  ): Promise<string> {
    const command = this.buildCommand(
      "post delete",
      Array.isArray(postIds) ? postIds : [postIds],
      options
    );
    return this.execute<string>(command);
  }
}

class ConfigCommand extends WpCliCommand {
  /**
   * Lists variables, constants, and file includes defined in wp-config.php file.
   *
   * @example
   * // List constants and variables defined in wp-config.php file.
   * WpCli.list.run(...);
   * ```sh
   * wp config list
   * ```
   * @example
   * // List only database user and password from wp-config.php file.
   * WpCli.list.run(...);
   * ```sh
   * wp config list DB_USER DB_PASSWORD --strict
   * ```
   * @example
   * // List all salts from wp-config.php file.
   * WpCli.list.run(...);
   * ```sh
   * wp config list _SALT
   * ```
   */
  async list(options?: ConfigListOptions): Promise<string> {
    const command = this.buildCommand("config list", [], options);
    return this.execute<string>(command);
  }

  /**
   * Checks whether a specific constant or variable exists in the wp-config.php file.
   *
   * @example
   * // Check whether the DB_PASSWORD constant exists in the wp-config.php file.
   * WpCli.has.run(...);
   * ```sh
   * wp config has DB_PASSWORD
   * ```
   */
  async has(options?: ConfigHasOptions): Promise<string> {
    const command = this.buildCommand("config has", [], options);
    return this.execute<string>(command);
  }

  /**
   * Launches system editor to edit the wp-config.php file.
   *
   * @example
   * // Launch system editor to edit wp-config.php file
   * WpCli.edit.run(...);
   * ```sh
   * wp config edit
   * ```
   */
  async edit(options?: ConfigEditOptions): Promise<string> {
    const command = this.buildCommand("config edit", [], options);
    return this.execute<string>(command);
  }

  /**
   * Gets the path to wp-config.php file.
   *
   * @example
   * // Get wp-config.php file path
   * WpCli.path.run(...);
   * ```sh
   * wp config path
   * ```
   */
  async path(): Promise<string> {
    const command = this.buildCommand("config path", []);
    return this.execute<string>(command);
  }

  /**
   * Sets the value of a specific constant or variable defined in wp-config.php file.
   *
   * @example
   * // Set the WP_DEBUG constant to true.
   * WpCli.set.run(...);
   * ```sh
   * wp config set WP_DEBUG true --raw
   * ```
   */
  async set(options?: ConfigSetOptions): Promise<string> {
    const command = this.buildCommand("config set", [], options);
    return this.execute<string>(command);
  }

  /**
   * Gets the value of a specific constant or variable defined in wp-config.php file.
   *
   * @example
   * // Get the table_prefix as defined in wp-config.php file.
   * WpCli.get.run(...);
   * ```sh
   * wp config get table_prefix
   * ```
   */
  async get(options?: ConfigGetOptions): Promise<string> {
    const command = this.buildCommand("config get", [], options);
    return this.execute<string>(command);
  }

  /**
   * Determines whether value of a specific defined constant or variable is truthy.
   *
   * @example
   * // Assert if MULTISITE is true
   * WpCli.isTrue.run(...);
   * ```sh
   * wp config is-true MULTISITE
   * ```
   */
  async isTrue(options?: ConfigIsTrueOptions): Promise<string> {
    const command = this.buildCommand("config is-true", [], options);
    return this.execute<string>(command);
  }

  /**
   * Refreshes the salts defined in the wp-config.php file.
   *
   * @example
   * // Get new salts for your wp-config.php file
   * WpCli.shuffleSalts.run(...);
   * ```sh
   * wp config shuffle-salts
   * ```
   * @example
   * // Add a cache key salt to the wp-config.php file
   * WpCli.shuffleSalts.run(...);
   * ```sh
   * wp config shuffle-salts WP_CACHE_KEY_SALT --force
   * ```
   */
  async shuffleSalts(options?: ConfigShuffleSaltsOptions): Promise<string> {
    const command = this.buildCommand("config shuffle-salts", [], options);
    return this.execute<string>(command);
  }

  /**
   * Generates a wp-config.php file.
   *
   * @example
   * // Standard wp-config.php file
   * WpCli.create.run(...);
   * ```sh
   * wp config create --dbname=testing --dbuser=wp --dbpass=securepswd --locale=ro_RO
   * ```
   * @example
   * // Enable WP_DEBUG and WP_DEBUG_LOG
   * WpCli.create.run(...);
   * ```sh
   * wp config create --dbname=testing --dbuser=wp --dbpass=securepswd --extra-php <<PHP
   * ```
   * @example
   * // Using --prompt=dbpass will prompt for the 'dbpass' argument
   * WpCli.create.run(...);
   * ```sh
   * wp config create --dbname=testing --dbuser=wp --prompt=dbpass < password.txt
   * ```
   */
  async create(options: ConfigCreateOptions): Promise<string> {
    const command = this.buildCommand("config create", [], options);
    return this.execute<string>(command);
  }

  /**
   * Deletes a specific constant or variable from the wp-config.php file.
   *
   * @example
   * // Delete the COOKIE_DOMAIN constant from the wp-config.php file.
   * WpCli.delete.run(...);
   * ```sh
   * wp config delete COOKIE_DOMAIN
   * ```
   */
  async deleteDelete(options?: ConfigDeleteOptions): Promise<string> {
    const command = this.buildCommand("config delete", [], options);
    return this.execute<string>(command);
  }
}

class EvalFileCommand extends WpCliCommand {
  /**
   * Loads and executes a PHP file.
   */
  async run(options?: EvalFileOptions): Promise<string> {
    const args: string[] = [];
    const command = this.buildCommand("eval-file", args, options);
    return this.execute<string>(command);
  }
}

class MediaCommand extends WpCliCommand {
  /**
   * Creates attachments from local files or URLs.
   *
   * @example
   * // Import all jpgs in the current user's "Pictures" directory, not attached to any post.
   * WpCli.import.run(...);
   * ```sh
   * wp media import ~/Pictures/**\/*.jpg
   * ```
   * @example
   * // Import a local image and set it to be the post thumbnail for a post.
   * WpCli.import.run(...);
   * ```sh
   * wp media import ~/Downloads/image.png --post_id=123 --title="A downloaded picture" --featured_image
   * ```
   * @example
   * WpCli.import.run(...);
   * ```sh
   * wp post list --post_type=post --format=ids | xargs -d ' ' -I % wp post meta add % _thumbnail_id $ATTACHMENT_ID
   * ```
   * @example
   * // Import an image from the web.
   * WpCli.import.run(...);
   * ```sh
   * wp media import http://s.wordpress.org/style/images/wp-header-logo.png --title='The WordPress logo' --alt="Semantic personal publishing"
   * ```
   * @example
   * // Get the URL for an attachment after import.
   * WpCli.import.run(...);
   * ```sh
   * wp media import http://s.wordpress.org/style/images/wp-header-logo.png --porcelain | xargs -I {} wp post list --post__in={} --field=url --post_type=attachment
   * ```
   */
  async import(
    options: MediaImportOptions & { porcelain: true }
  ): Promise<number>;
  async import(
    options?: Omit<MediaImportOptions, "porcelain">
  ): Promise<string>;
  async import(options?: MediaImportOptions): Promise<string | number> {
    const command = this.buildCommand("media import", [], options);
    if ((options as { porcelain?: boolean })?.porcelain) {
      const result = await this.execute<string>(command);
      return Number.parseInt(result.trim(), 10);
    }
    return this.execute<string>(command);
  }

  /**
   * Fix image orientation for one or more attachments.
   *
   * @example
   * // Fix orientation for all images.
   * WpCli.fixOrientation.run(...);
   * ```sh
   * wp media fix-orientation
   * ```
   * @example
   * // Fix orientation dry run.
   * WpCli.fixOrientation.run(...);
   * ```sh
   * wp media fix-orientation 63 --dry-run
   * ```
   * @example
   * // Fix orientation for specific images.
   * WpCli.fixOrientation.run(...);
   * ```sh
   * wp media fix-orientation 63
   * ```
   */
  async fixOrientation(options?: MediaFixOrientationOptions): Promise<string> {
    const command = this.buildCommand("media fix-orientation", [], options);
    return this.execute<string>(command);
  }

  /**
   * Regenerates thumbnails for one or more attachments.
   *
   * @example
   * // Regenerate thumbnails for given attachment IDs.
   * WpCli.regenerate.run(...);
   * ```sh
   * wp media regenerate 123 124 125
   * ```
   * @example
   * // Regenerate all thumbnails, without confirmation.
   * WpCli.regenerate.run(...);
   * ```sh
   * wp media regenerate --yes
   * ```
   * @example
   * // Re-generate only the thumbnails of "large" image size for all images.
   * WpCli.regenerate.run(...);
   * ```sh
   * wp media regenerate --image_size=large
   * ```
   */
  async regenerate(options?: MediaRegenerateOptions): Promise<string> {
    const command = this.buildCommand("media regenerate", [], options);
    return this.execute<string>(command);
  }

  /**
   * Lists image sizes registered with WordPress.
   *
   * @example
   * // List all registered image sizes
   * WpCli.imageSize.run(...);
   * ```sh
   * wp media image-size
   * ```
   */
  async imageSize(
    options: MediaImageSizeOptions & { format: "json" }
  ): Promise<WpMediaImageSize[]>;
  async imageSize(
    options?: Omit<MediaImageSizeOptions, "format">
  ): Promise<string>;
  async imageSize(
    options?: MediaImageSizeOptions
  ): Promise<string | WpMediaImageSize[]> {
    const command = this.buildCommand("media image-size", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpMediaImageSize[]>(command);
    }
    return this.execute<string>(command);
  }
}

class DbCommand extends WpCliCommand {
  /**
   * Imports a database from a file or from STDIN.
   *
   * @example
   * // Import MySQL from a file.
   * WpCli.import.run(...);
   * ```sh
   * wp db import wordpress_dbase.sql
   * ```
   */
  async import(file: string, options?: DbImportOptions): Promise<string> {
    const command = this.buildCommand("db import", [file], options);
    return this.execute<string>(command);
  }

  /**
   * Opens a MySQL console using credentials from wp-config.php
   *
   * @example
   * // Open MySQL console
   * WpCli.cli.run(...);
   * ```sh
   * wp db cli
   * ```
   */
  async cli(options?: DbCliOptions): Promise<string> {
    const command = this.buildCommand("db cli", [], options);
    return this.execute<string>(command);
  }

  /**
   * Lists the database tables.
   *
   * @example
   * // List tables for a single site, without shared tables like 'wp_users'
   * WpCli.tables.run(...);
   * ```sh
   * wp db tables --scope=blog --url=sub.example.com
   * ```
   * @example
   * // Export only tables for a single site
   * WpCli.tables.run(...);
   * ```sh
   * wp db export --tables=$(wp db tables --url=sub.example.com --format=csv)
   * ```
   */
  async tables(options?: DbTablesOptions): Promise<string> {
    const command = this.buildCommand("db tables", [], options);
    return this.execute<string>(command);
  }

  /**
   * Exports the database to a file or to STDOUT.
   *
   * @example
   * // Export database with drop query included
   * WpCli.export.run(...);
   * ```sh
   * wp db export --add-drop-table
   * ```
   * @example
   * // Export certain tables
   * WpCli.export.run(...);
   * ```sh
   * wp db export --tables=wp_options,wp_users
   * ```
   * @example
   * // Export all tables matching a wildcard
   * WpCli.export.run(...);
   * ```sh
   * wp db export --tables=$(wp db tables 'wp_user*' --format=csv)
   * ```
   * @example
   * // Export all tables matching prefix
   * WpCli.export.run(...);
   * ```sh
   * wp db export --tables=$(wp db tables --all-tables-with-prefix --format=csv)
   * ```
   * @example
   * // Export certain posts without create table statements
   * WpCli.export.run(...);
   * ```sh
   * wp db export --no-create-info=true --tables=wp_posts --where="ID in (100,101,102)"
   * ```
   * @example
   * // Export relating meta for certain posts without create table statements
   * WpCli.export.run(...);
   * ```sh
   * wp db export --no-create-info=true --tables=wp_postmeta --where="post_id in (100,101,102)"
   * ```
   * @example
   * // Skip certain tables from the exported database
   * WpCli.export.run(...);
   * ```sh
   * wp db export --exclude_tables=wp_options,wp_users
   * ```
   * @example
   * // Skip all tables matching a wildcard from the exported database
   * WpCli.export.run(...);
   * ```sh
   * wp db export --exclude_tables=$(wp db tables 'wp_user*' --format=csv)
   * ```
   * @example
   * // Skip all tables matching prefix from the exported database
   * WpCli.export.run(...);
   * ```sh
   * wp db export --exclude_tables=$(wp db tables --all-tables-with-prefix --format=csv)
   * ```
   * @example
   * // Export database to STDOUT.
   * WpCli.export.run(...);
   * ```sh
   * wp db export -
   * ```
   */
  async export(
    outputFile?: string,
    options?: DbExportOptions & { porcelain: true }
  ): Promise<number>;
  async export(
    outputFile?: string,
    options?: Omit<DbExportOptions, "porcelain">
  ): Promise<string>;
  async export(
    outputFile?: string,
    options?: DbExportOptions
  ): Promise<string | number> {
    const command = this.buildCommand("db export", [outputFile], options);
    if ((options as { porcelain?: boolean })?.porcelain) {
      const result = await this.execute<string>(command);
      return Number.parseInt(result.trim(), 10);
    }
    return this.execute<string>(command);
  }

  /**
   * Removes all tables with `$table_prefix` from the database.
   *
   * @example
   * // Delete all tables that match the current site prefix.
   * WpCli.clean.run(...);
   * ```sh
   * wp db clean --yes
   * ```
   */
  async clean(options?: DbCleanOptions): Promise<string> {
    const command = this.buildCommand("db clean", [], options);
    return this.execute<string>(command);
  }

  /**
   * Deletes the existing database.
   *
   * @example
   * WpCli.drop.run(...);
   * ```sh
   * wp db drop --yes
   * ```
   */
  async drop(options?: DbDropOptions): Promise<string> {
    const command = this.buildCommand("db drop", [], options);
    return this.execute<string>(command);
  }

  /**
   * Optimizes the database.
   *
   * @example
   * WpCli.optimize.run(...);
   * ```sh
   * wp db optimize
   * ```
   */
  async optimize(options?: DbOptimizeOptions): Promise<string> {
    const command = this.buildCommand("db optimize", [], options);
    return this.execute<string>(command);
  }

  /**
   * Executes a SQL query against the database.
   *
   * @example
   * // Execute a query stored in a file
   * WpCli.query.run(...);
   * ```sh
   * wp db query < debug.sql
   * ```
   * @example
   * // Query for a specific value in the database (pipe the result to remove the ASCII table borders)
   * WpCli.query.run(...);
   * ```sh
   * wp db query 'SELECT option_value FROM wp_options WHERE option_name="home"' --skip-column-names
   * ```
   * @example
   * // Check all tables in the database
   * WpCli.query.run(...);
   * ```sh
   * wp db query "CHECK TABLE $(wp db tables | paste -s -d, -);"
   * ```
   * @example
   * // Pass extra arguments through to MySQL
   * WpCli.query.run(...);
   * ```sh
   * wp db query 'SELECT * FROM wp_options WHERE option_name="home"' --skip-column-names
   * ```
   */
  async query(sql: string, options?: DbQueryOptions): Promise<string> {
    const command = this.buildCommand("db query", [sql], options);
    return this.execute<string>(command);
  }

  /**
   * Displays information about a given table.
   *
   * @example
   * WpCli.columns.run(...);
   * ```sh
   * wp db columns wp_posts
   * ```
   */
  async columns(options?: DbColumnsOptions): Promise<string> {
    const command = this.buildCommand("db columns", [], options);
    return this.execute<string>(command);
  }

  /**
   * Repairs the database.
   *
   * @example
   * WpCli.repair.run(...);
   * ```sh
   * wp db repair
   * ```
   */
  async repair(options?: DbRepairOptions): Promise<string> {
    const command = this.buildCommand("db repair", [], options);
    return this.execute<string>(command);
  }

  /**
   * Finds a string in the database.
   *
   * @example
   * // Search through the database for the 'wordpress-develop' string
   * WpCli.search.run(...);
   * ```sh
   * wp db search wordpress-develop
   * ```
   * @example
   * // Search through a multisite database on the subsite 'foo' for the 'example.com' string
   * WpCli.search.run(...);
   * ```sh
   * wp db search example.com --url=example.com/foo
   * ```
   * @example
   * // Search through the database for the 'https?://' regular expression, printing stats.
   * WpCli.search.run(...);
   * ```sh
   * wp db search 'https?://' --regex --stats
   * ```
   * @example
   * // Search for a string and print the result as a table
   * WpCli.search.run(...);
   * ```sh
   * wp db search https://localhost:8889 --format=table --fields=table,column,match
   * ```
   * @example
   * // Search for a string and get only the IDs (only works for a single table)
   * WpCli.search.run(...);
   * ```sh
   * wp db search https://localhost:8889 wp_options --format=ids
   * ```
   */
  async search(
    options: DbSearchOptions & { format: "json" }
  ): Promise<WpDbSearch[]>;
  async search(options?: Omit<DbSearchOptions, "format">): Promise<string>;
  async search(options?: DbSearchOptions): Promise<string | WpDbSearch[]> {
    const command = this.buildCommand("db search", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpDbSearch[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Checks the current status of the database.
   *
   * @example
   * WpCli.check.run(...);
   * ```sh
   * wp db check
   * ```
   */
  async check(options?: DbCheckOptions): Promise<string> {
    const command = this.buildCommand("db check", [], options);
    return this.execute<string>(command);
  }

  /**
   * Displays the database name and size.
   *
   * @example
   * WpCli.size.run(...);
   * ```sh
   * wp db size
   * ```
   * @example
   * WpCli.size.run(...);
   * ```sh
   * wp db size --tables
   * ```
   * @example
   * WpCli.size.run(...);
   * ```sh
   * wp db size --size_format=b
   * ```
   * @example
   * WpCli.size.run(...);
   * ```sh
   * wp db size --size_format=kb
   * ```
   * @example
   * WpCli.size.run(...);
   * ```sh
   * wp db size --size_format=mb
   * ```
   */
  async size(options?: DbSizeOptions): Promise<string> {
    const command = this.buildCommand("db size", [], options);
    return this.execute<string>(command);
  }

  /**
   * Displays the database table prefix.
   *
   * @example
   * WpCli.prefix.run(...);
   * ```sh
   * wp db prefix
   * ```
   */
  async prefix(): Promise<string> {
    const command = this.buildCommand("db prefix", []);
    return this.execute<string>(command);
  }

  /**
   * Creates a new database.
   *
   * @example
   * WpCli.create.run(...);
   * ```sh
   * wp db create
   * ```
   */
  async create(options?: DbCreateOptions): Promise<string> {
    const command = this.buildCommand("db create", [], options);
    return this.execute<string>(command);
  }

  /**
   * Removes all tables from the database.
   *
   * @example
   * WpCli.reset.run(...);
   * ```sh
   * wp db reset --yes
   * ```
   */
  async reset(options?: DbResetOptions): Promise<string> {
    const command = this.buildCommand("db reset", [], options);
    return this.execute<string>(command);
  }
}

class ProfileCommand extends WpCliCommand {
  /**
   * Profile execution of an arbitrary file.
   *
   * @example
   * // Profile from a file `request.php` containing `<?php wp_remote_get( "https://www.apple.com/" );`.
   * WpCli.evalFile.run(...);
   * ```sh
   * wp profile eval-file request.php --fields=time,cache_ratio,request_count
   * ```
   */
  async evalFile(options?: ProfileEvalFileOptions): Promise<string> {
    const command = this.buildCommand("profile eval-file", [], options);
    return this.execute<string>(command);
  }

  /**
   * Profile each stage of the WordPress load process (bootstrap, main_query, template).
   *
   * @example
   * // See an overview for each stage of the load process.
   * WpCli.stage.run(...);
   * ```sh
   * wp profile stage --fields=stage,time,cache_ratio
   * ```
   * @example
   * // Dive into hook performance for a given stage.
   * WpCli.stage.run(...);
   * ```sh
   * wp profile stage bootstrap --fields=hook,time,cache_ratio --spotlight
   * ```
   */
  async stage(options?: ProfileStageOptions): Promise<string> {
    const command = this.buildCommand("profile stage", [], options);
    return this.execute<string>(command);
  }

  /**
   * Profile arbitrary code execution.
   *
   * @example
   * // Profile a function that makes one HTTP request.
   * WpCli.eval.run(...);
   * ```sh
   * wp profile eval 'wp_remote_get( "https://www.apple.com/" );' --fields=time,cache_ratio,request_count
   * ```
   */
  async eval(options?: ProfileEvalOptions): Promise<string> {
    const command = this.buildCommand("profile eval", [], options);
    return this.execute<string>(command);
  }

  /**
   * Profile key metrics for WordPress hooks (actions and filters).
   *
   * @example
   * // Profile a hook.
   * WpCli.hook.run(...);
   * ```sh
   * wp profile hook template_redirect --fields=callback,cache_hits,cache_misses
   * ```
   */
  async hook(options?: ProfileHookOptions): Promise<string> {
    const command = this.buildCommand("profile hook", [], options);
    return this.execute<string>(command);
  }
}

class NetworkCommand extends WpCliCommand {
  /**
   * Gets, adds, updates, deletes, and lists network custom fields.
   *
   * @example
   * // Get a list of super-admins
   * WpCli.meta.run(...);
   * ```sh
   * wp network meta get 1 site_admins
   * ```
   */
  async meta(): Promise<string> {
    const command = this.buildCommand("network meta", []);
    return this.execute<string>(command);
  }
}

class MenuCommand extends WpCliCommand {
  /**
   * Gets a list of menus.
   *
   * @example
   * WpCli.list.run(...);
   * ```sh
   * wp menu list
   * ```
   */
  async list(
    options: MenuListOptions & { format: "json" }
  ): Promise<WpMenuList[]>;
  async list(options?: Omit<MenuListOptions, "format">): Promise<string>;
  async list(options?: MenuListOptions): Promise<string | WpMenuList[]> {
    const command = this.buildCommand("menu list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpMenuList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * List, add, and delete items associated with a menu.
   *
   * @example
   * // Add an existing post to an existing menu
   * WpCli.item.run(...);
   * ```sh
   * wp menu item add-post sidebar-menu 33 --title="Custom Test Post"
   * ```
   * @example
   * // Create a new menu link item
   * WpCli.item.run(...);
   * ```sh
   * wp menu item add-custom sidebar-menu Apple http://apple.com
   * ```
   * @example
   * // Delete menu item
   * WpCli.item.run(...);
   * ```sh
   * wp menu item delete 45
   * ```
   */
  async item(): Promise<string> {
    const command = this.buildCommand("menu item", []);
    return this.execute<string>(command);
  }

  /**
   * Assigns, removes, and lists a menu's locations.
   *
   * @example
   * // List available menu locations
   * WpCli.location.run(...);
   * ```sh
   * wp menu location list
   * ```
   * @example
   * // Assign the 'primary-menu' menu to the 'primary' location
   * WpCli.location.run(...);
   * ```sh
   * wp menu location assign primary-menu primary
   * ```
   * @example
   * // Remove the 'primary-menu' menu from the 'primary' location
   * WpCli.location.run(...);
   * ```sh
   * wp menu location remove primary-menu primary
   * ```
   */
  async location(): Promise<string> {
    const command = this.buildCommand("menu location", []);
    return this.execute<string>(command);
  }

  /**
   * Creates a new menu.
   *
   * @example
   * WpCli.create.run(...);
   * ```sh
   * wp menu create "My Menu"
   * ```
   */
  async create(
    options: MenuCreateOptions & { porcelain: true }
  ): Promise<number>;
  async create(options?: Omit<MenuCreateOptions, "porcelain">): Promise<string>;
  async create(options?: MenuCreateOptions): Promise<string | number> {
    const command = this.buildCommand("menu create", [], options);
    if ((options as { porcelain?: boolean })?.porcelain) {
      const result = await this.execute<string>(command);
      return Number.parseInt(result.trim(), 10);
    }
    return this.execute<string>(command);
  }

  /**
   * Deletes one or more menus.
   *
   * @example
   * WpCli.delete.run(...);
   * ```sh
   * wp menu delete "My Menu"
   * ```
   */
  async deleteDelete(): Promise<string> {
    const command = this.buildCommand("menu delete", []);
    return this.execute<string>(command);
  }
}

class ImportCommand extends WpCliCommand {
  /**
   * Imports content from a given WXR file.
   *
   * @example
   * // Import content from a WXR file
   * WpCli.import.run(...);
   * ```sh
   * wp import example.wordpress.2016-06-21.xml --authors=create
   * ```
   */
  async run(options: ImportOptions): Promise<string> {
    const args: string[] = [];
    const command = this.buildCommand("import", args, options);
    return this.execute<string>(command);
  }
}

class CoreCommand extends WpCliCommand {
  /**
   * Updates WordPress to a newer version.
   *
   * @example
   * // Update WordPress
   * WpCli.update.run(...);
   * ```sh
   * wp core update
   * ```
   * @example
   * // Update WordPress using zip file.
   * WpCli.update.run(...);
   * ```sh
   * wp core update ../latest.zip
   * ```
   * @example
   * // Update WordPress to 3.1 forcefully
   * WpCli.update.run(...);
   * ```sh
   * wp core update --version=3.1 --force
   * ```
   */
  async update(zipPath?: string, options?: CoreUpdateOptions): Promise<string> {
    const command = this.buildCommand("core update", [zipPath], options);
    return this.execute<string>(command);
  }

  /**
   * Verifies WordPress files against WordPress.org's checksums.
   *
   * @example
   * // Verify checksums
   * WpCli.verifyChecksums.run(...);
   * ```sh
   * wp core verify-checksums
   * ```
   * @example
   * // Verify checksums for given WordPress version
   * WpCli.verifyChecksums.run(...);
   * ```sh
   * wp core verify-checksums --version=4.0
   * ```
   * @example
   * // Verify checksums for given locale
   * WpCli.verifyChecksums.run(...);
   * ```sh
   * wp core verify-checksums --locale=en_US
   * ```
   * @example
   * // Verify checksums for given locale
   * WpCli.verifyChecksums.run(...);
   * ```sh
   * wp core verify-checksums --locale=ja
   * ```
   * @example
   * // Verify checksums and exclude files
   * WpCli.verifyChecksums.run(...);
   * ```sh
   * wp core verify-checksums --exclude="readme.html"
   * ```
   */
  async verifyChecksums(options?: CoreVerifyChecksumsOptions): Promise<string> {
    const command = this.buildCommand("core verify-checksums", [], options);
    return this.execute<string>(command);
  }

  /**
   * Displays the WordPress version.
   *
   * @example
   * // Display the WordPress version
   * WpCli.version.run(...);
   * ```sh
   * wp core version
   * ```
   * @example
   * // Display WordPress version along with other information
   * WpCli.version.run(...);
   * ```sh
   * wp core version --extra
   * ```
   */
  async version(options?: CoreVersionOptions): Promise<string> {
    const command = this.buildCommand("core version", [], options);
    return this.execute<string>(command);
  }

  /**
   * Installs WordPress multisite from scratch.
   *
   * @example
   * WpCli.multisiteInstall.run(...);
   * ```sh
   * wp core multisite-install --title="Welcome to the WordPress" \
   * ```
   */
  async multisiteInstall(
    options: CoreMultisiteInstallOptions
  ): Promise<string> {
    const command = this.buildCommand("core multisite-install", [], options);
    return this.execute<string>(command);
  }

  /**
   * Checks for WordPress updates via Version Check API.
   *
   * @example
   * WpCli.checkUpdate.run(...);
   * ```sh
   * wp core check-update
   * ```
   */
  async checkUpdate(options?: CoreCheckUpdateOptions): Promise<string> {
    const command = this.buildCommand("core check-update", [], options);
    return this.execute<string>(command);
  }

  /**
   * Transforms an existing single-site installation into a multisite installation.
   *
   * @example
   * WpCli.multisiteConvert.run(...);
   * ```sh
   * wp core multisite-convert
   * ```
   */
  async multisiteConvert(
    options?: CoreMultisiteConvertOptions
  ): Promise<string> {
    const command = this.buildCommand("core multisite-convert", [], options);
    return this.execute<string>(command);
  }

  /**
   * Downloads core WordPress files.
   *
   * @example
   * WpCli.download.run(...);
   * ```sh
   * wp core download --locale=nl_NL
   * ```
   */
  async download(options?: CoreDownloadOptions): Promise<string> {
    const command = this.buildCommand("core download", [], options);
    return this.execute<string>(command);
  }

  /**
   * Runs the WordPress database update procedure.
   *
   * @example
   * // Update the WordPress database.
   * WpCli.updateDb.run(...);
   * ```sh
   * wp core update-db
   * ```
   * @example
   * // Update databases for all sites on a network.
   * WpCli.updateDb.run(...);
   * ```sh
   * wp core update-db --network
   * ```
   */
  async updateDb(options?: CoreUpdateDbOptions): Promise<string> {
    const command = this.buildCommand("core update-db", [], options);
    return this.execute<string>(command);
  }

  /**
   * Checks if WordPress is installed.
   */
  async isInstalled(options?: CoreIsInstalledOptions): Promise<string> {
    const command = this.buildCommand("core is-installed", [], options);
    return this.execute<string>(command);
  }

  /**
   * Runs the standard WordPress installation process.
   *
   * @example
   * // Install WordPress in 5 seconds
   * WpCli.install.run(...);
   * ```sh
   * wp core install --url=example.com --title=Example --admin_user=supervisor --admin_password=strongpassword --admin_email=info@example.com
   * ```
   * @example
   * // Install WordPress without disclosing admin_password to bash history
   * WpCli.install.run(...);
   * ```sh
   * wp core install --url=example.com --title=Example --admin_user=supervisor --admin_email=info@example.com --prompt=admin_password < admin_password.txt
   * ```
   */
  async install(url: string, options: CoreInstallOptions): Promise<string> {
    const command = this.buildCommand("core install", [url], options);
    return this.execute<string>(command);
  }
}

class CliCommand extends WpCliCommand {
  /**
   * Prints various details about the WP-CLI environment.
   *
   * @example
   * // Display various data about the CLI environment.
   * WpCli.info.run(...);
   * ```sh
   * wp cli info
   * ```
   */
  async info(options?: CliInfoOptions): Promise<string> {
    const command = this.buildCommand("cli info", [], options);
    return this.execute<string>(command);
  }

  /**
   * Dumps the list of global parameters, as JSON or in var_export format.
   *
   * @example
   * // Dump the list of global parameters.
   * WpCli.paramDump.run(...);
   * ```sh
   * wp cli param-dump --format=var_export
   * ```
   */
  async paramDump(options?: CliParamDumpOptions): Promise<string> {
    const command = this.buildCommand("cli param-dump", [], options);
    return this.execute<string>(command);
  }

  /**
   * Updates WP-CLI to the latest release.
   *
   * @example
   * // Update CLI.
   * WpCli.update.run(...);
   * ```sh
   * wp cli update
   * ```
   */
  async update(options?: CliUpdateOptions): Promise<string> {
    const command = this.buildCommand("cli update", [], options);
    return this.execute<string>(command);
  }

  /**
   * Prints WP-CLI version.
   *
   * @example
   * // Display CLI version.
   * WpCli.version.run(...);
   * ```sh
   * wp cli version
   * ```
   */
  async version(): Promise<string> {
    const command = this.buildCommand("cli version", []);
    return this.execute<string>(command);
  }

  /**
   * Retrieves, sets and updates aliases for WordPress Installations.
   *
   * @example
   * // List alias information.
   * WpCli.alias.run(...);
   * ```sh
   * wp cli alias list
   * ```
   * @example
   * // Get alias information.
   * WpCli.alias.run(...);
   * ```sh
   * wp cli alias get @dev
   * ```
   * @example
   * // Add alias.
   * WpCli.alias.run(...);
   * ```sh
   * wp cli alias add @prod --set-ssh=login@host --set-path=/path/to/wordpress/install/ --set-user=wpcli
   * ```
   * @example
   * // Update alias.
   * WpCli.alias.run(...);
   * ```sh
   * wp cli alias update @prod --set-user=newuser --set-path=/new/path/to/wordpress/install/
   * ```
   * @example
   * // Delete alias.
   * WpCli.alias.run(...);
   * ```sh
   * wp cli alias delete @prod
   * ```
   */
  async alias(): Promise<string> {
    const command = this.buildCommand("cli alias", []);
    return this.execute<string>(command);
  }

  /**
   * Detects if a command exists
   *
   * @example
   * // The "site delete" command is registered.
   * WpCli.hasCommand.run(...);
   * ```sh
   * wp cli has-command "site delete"
   * ```
   * @example
   * // The "foo bar" command is not registered.
   * WpCli.hasCommand.run(...);
   * ```sh
   * wp cli has-command "foo bar"
   * ```
   */
  async hasCommand(): Promise<string> {
    const command = this.buildCommand("cli has-command", []);
    return this.execute<string>(command);
  }

  /**
   * Checks to see if there is a newer version of WP-CLI available.
   *
   * @example
   * // Check for update.
   * WpCli.checkUpdate.run(...);
   * ```sh
   * wp cli check-update
   * ```
   * @example
   * // Check for update and new version is available.
   * WpCli.checkUpdate.run(...);
   * ```sh
   * wp cli check-update
   * ```
   */
  async checkUpdate(options?: CliCheckUpdateOptions): Promise<string> {
    const command = this.buildCommand("cli check-update", [], options);
    return this.execute<string>(command);
  }

  /**
   * Dumps the list of installed commands, as JSON.
   *
   * @example
   * // Dump the list of installed commands.
   * WpCli.cmdDump.run(...);
   * ```sh
   * wp cli cmd-dump
   * ```
   */
  async cmdDump(): Promise<string> {
    const command = this.buildCommand("cli cmd-dump", []);
    return this.execute<string>(command);
  }

  /**
   * Generates tab completion strings.
   *
   * @example
   * // Generate tab completion strings.
   * WpCli.completions.run(...);
   * ```sh
   * wp cli completions --line='wp eva' --point=100
   * ```
   */
  async completions(options: CliCompletionsOptions): Promise<string> {
    const command = this.buildCommand("cli completions", [], options);
    return this.execute<string>(command);
  }

  /**
   * Manages the internal WP-CLI cache,.
   *
   * @example
   * // Remove all cached files.
   * WpCli.cache.run(...);
   * ```sh
   * wp cli cache clear
   * ```
   * @example
   * // Remove all cached files except for the newest version of each one.
   * WpCli.cache.run(...);
   * ```sh
   * wp cli cache prune
   * ```
   */
  async cache(): Promise<string> {
    const command = this.buildCommand("cli cache", []);
    return this.execute<string>(command);
  }
}

class UserCommand extends WpCliCommand {
  /**
   * Lists users.
   *
   * @example
   * // List user IDs
   * WpCli.list.run(...);
   * ```sh
   * wp user list --field=ID
   * ```
   * @example
   * // List users with administrator role
   * WpCli.list.run(...);
   * ```sh
   * wp user list --role=administrator --format=csv
   * ```
   * @example
   * // List users with only given fields
   * WpCli.list.run(...);
   * ```sh
   * wp user list --fields=display_name,user_email --format=json
   * ```
   * @example
   * // List users ordered by the 'last_activity' meta value.
   * WpCli.list.run(...);
   * ```sh
   * wp user list --meta_key=last_activity --orderby=meta_value_num
   * ```
   */
  async list(
    options: UserListOptions & { format: "json" }
  ): Promise<WpUserList[]>;
  async list(options?: Omit<UserListOptions, "format">): Promise<string>;
  async list(options?: UserListOptions): Promise<string | WpUserList[]> {
    const command = this.buildCommand("user list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpUserList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Removes a user's capability.
   *
   * @example
   * WpCli.removeCap.run(...);
   * ```sh
   * wp user remove-cap 11 publish_newsletters
   * ```
   * @example
   * WpCli.removeCap.run(...);
   * ```sh
   * wp user remove-cap 11 publish_posts
   * ```
   * @example
   * WpCli.removeCap.run(...);
   * ```sh
   * wp user remove-cap 11 nonexistent_cap
   * ```
   * @example
   * WpCli.removeCap.run(...);
   * ```sh
   * wp user remove-cap 11 publish_newsletters --force
   * ```
   */
  async removeCap(options?: UserRemoveCapOptions): Promise<string> {
    const command = this.buildCommand("user remove-cap", [], options);
    return this.execute<string>(command);
  }

  /**
   * Destroys and lists a user's sessions.
   *
   * @example
   * // List a user's sessions.
   * WpCli.session.run(...);
   * ```sh
   * wp user session list admin@example.com --format=csv
   * ```
   * @example
   * // Destroy the most recent session of the given user.
   * WpCli.session.run(...);
   * ```sh
   * wp user session destroy admin
   * ```
   */
  async session(): Promise<string> {
    const command = this.buildCommand("user session", []);
    return this.execute<string>(command);
  }

  /**
   * Updates an existing user.
   *
   * @example
   * // Update user
   * WpCli.update.run(...);
   * ```sh
   * wp user update 123 --display_name=Mary --user_pass=marypass
   * ```
   */
  async update(
    userIds: number | number[],
    options?: UserUpdateOptions
  ): Promise<string> {
    const command = this.buildCommand(
      "user update",
      Array.isArray(userIds) ? userIds : [userIds],
      options
    );
    return this.execute<string>(command);
  }

  /**
   * Adds, updates, removes, and lists user terms.
   *
   * @example
   * // Set user terms
   * WpCli.term.run(...);
   * ```sh
   * wp user term set 123 test category
   * ```
   */
  async term(): Promise<string> {
    const command = this.buildCommand("user term", []);
    return this.execute<string>(command);
  }

  /**
   * Removes a user's role.
   *
   * @example
   * WpCli.removeRole.run(...);
   * ```sh
   * wp user remove-role 12 author
   * ```
   * @example
   * WpCli.removeRole.run(...);
   * ```sh
   * wp user remove-role 12 author editor
   * ```
   */
  async removeRole(): Promise<string> {
    const command = this.buildCommand("user remove-role", []);
    return this.execute<string>(command);
  }

  /**
   * Generates some users.
   *
   * @example
   * // Add meta to every generated users.
   * WpCli.generate.run(...);
   * ```sh
   * wp user generate --format=ids --count=3 | xargs -d ' ' -I % wp user meta add % foo bar
   * ```
   */
  async generate(options?: UserGenerateOptions): Promise<string> {
    const command = this.buildCommand("user generate", [], options);
    return this.execute<string>(command);
  }

  /**
   * Imports users from a CSV file.
   *
   * @example
   * // Import users from local CSV file
   * WpCli.importCsv.run(...);
   * ```sh
   * wp user import-csv /path/to/users.csv
   * ```
   * @example
   * // Import users from remote CSV file
   * WpCli.importCsv.run(...);
   * ```sh
   * wp user import-csv http://example.com/users.csv
   * ```
   */
  async importCsv(options?: UserImportCsvOptions): Promise<string> {
    const command = this.buildCommand("user import-csv", [], options);
    return this.execute<string>(command);
  }

  /**
   * Lists all capabilities for a user.
   *
   * @example
   * WpCli.listCaps.run(...);
   * ```sh
   * wp user list-caps 21
   * ```
   */
  async listCaps(options?: UserListCapsOptions): Promise<string> {
    const command = this.buildCommand("user list-caps", [], options);
    return this.execute<string>(command);
  }

  /**
   * Creates, updates, deletes, lists and retrieves application passwords.
   *
   * @example
   * // List user application passwords and only show app name and password hash
   * WpCli.applicationPassword.run(...);
   * ```sh
   * wp user application-password list 123 --fields=name,password
   * ```
   * @example
   * // Get a specific application password and only show app name and created timestamp
   * WpCli.applicationPassword.run(...);
   * ```sh
   * wp user application-password get 123 6633824d-c1d7-4f79-9dd5-4586f734d69e --fields=name,created
   * ```
   * @example
   * // Create user application password
   * WpCli.applicationPassword.run(...);
   * ```sh
   * wp user application-password create 123 myapp
   * ```
   * @example
   * // Only print the password without any chrome
   * WpCli.applicationPassword.run(...);
   * ```sh
   * wp user application-password create 123 myapp --porcelain
   * ```
   * @example
   * // Update an existing application password
   * WpCli.applicationPassword.run(...);
   * ```sh
   * wp user application-password update 123 6633824d-c1d7-4f79-9dd5-4586f734d69e --name=newappname
   * ```
   * @example
   * // Delete an existing application password
   * WpCli.applicationPassword.run(...);
   * ```sh
   * wp user application-password delete 123 6633824d-c1d7-4f79-9dd5-4586f734d69e
   * ```
   * @example
   * // Check if an application password for a given application exists
   * WpCli.applicationPassword.run(...);
   * ```sh
   * wp user application-password exists 123 myapp
   * ```
   */
  async applicationPassword(): Promise<string> {
    const command = this.buildCommand("user application-password", []);
    return this.execute<string>(command);
  }

  /**
   * Resets the password for one or more users.
   *
   * @example
   * // Reset the password for two users and send them the change email.
   * WpCli.resetPassword.run(...);
   * ```sh
   * wp user reset-password admin editor
   * ```
   * @example
   * // Reset and display the password.
   * WpCli.resetPassword.run(...);
   * ```sh
   * wp user reset-password editor --show-password
   * ```
   * @example
   * // Reset the password for one user, displaying only the new password, and not sending the change email.
   * WpCli.resetPassword.run(...);
   * ```sh
   * wp user reset-password admin --skip-email --porcelain
   * ```
   * @example
   * // Reset password for all users.
   * WpCli.resetPassword.run(...);
   * ```sh
   * wp user reset-password $(wp user list --format=ids)
   * ```
   * @example
   * // Reset password for all users with a particular role.
   * WpCli.resetPassword.run(...);
   * ```sh
   * wp user reset-password $(wp user list --format=ids --role=administrator)
   * ```
   */
  async resetPassword(
    options: UserResetPasswordOptions & { porcelain: true }
  ): Promise<number>;
  async resetPassword(
    options?: Omit<UserResetPasswordOptions, "porcelain">
  ): Promise<string>;
  async resetPassword(
    options?: UserResetPasswordOptions
  ): Promise<string | number> {
    const command = this.buildCommand("user reset-password", [], options);
    if ((options as { porcelain?: boolean })?.porcelain) {
      const result = await this.execute<string>(command);
      return Number.parseInt(result.trim(), 10);
    }
    return this.execute<string>(command);
  }

  /**
   * Adds a capability to a user.
   *
   * @example
   * // Add a capability for a user
   * WpCli.addCap.run(...);
   * ```sh
   * wp user add-cap john create_premium_item
   * ```
   * @example
   * // Add a capability for a user
   * WpCli.addCap.run(...);
   * ```sh
   * wp user add-cap 15 edit_product
   * ```
   */
  async addCap(): Promise<string> {
    const command = this.buildCommand("user add-cap", []);
    return this.execute<string>(command);
  }

  /**
   * Removes one or more users from spam on multisite.
   *
   * @example
   * // Remove user from spam.
   * WpCli.unspam.run(...);
   * ```sh
   * wp user unspam 123
   * ```
   */
  async unspam(): Promise<string> {
    const command = this.buildCommand("user unspam", []);
    return this.execute<string>(command);
  }

  /**
   * Sets the user role.
   *
   * @example
   * WpCli.setRole.run(...);
   * ```sh
   * wp user set-role 12 author
   * ```
   */
  async setRole(): Promise<string> {
    const command = this.buildCommand("user set-role", []);
    return this.execute<string>(command);
  }

  /**
   * Marks one or more users as spam on multisite.
   *
   * @example
   * // Mark user as spam.
   * WpCli.spam.run(...);
   * ```sh
   * wp user spam 123
   * ```
   */
  async spam(): Promise<string> {
    const command = this.buildCommand("user spam", []);
    return this.execute<string>(command);
  }

  /**
   * Checks if a user's password is valid or not.
   *
   * @example
   * // Check whether given credentials are valid; exit status 0 if valid, otherwise 1
   * WpCli.checkPassword.run(...);
   * ```sh
   * wp user check-password admin adminpass
   * ```
   */
  async checkPassword(options?: UserCheckPasswordOptions): Promise<string> {
    const command = this.buildCommand("user check-password", [], options);
    return this.execute<string>(command);
  }

  /**
   * Manages signups on a multisite installation.
   *
   * @example
   * // List signups.
   * WpCli.signup.run(...);
   * ```sh
   * wp user signup list
   * ```
   * @example
   * // Activate signup.
   * WpCli.signup.run(...);
   * ```sh
   * wp user signup activate 2
   * ```
   * @example
   * // Delete signup.
   * WpCli.signup.run(...);
   * ```sh
   * wp user signup delete 3
   * ```
   */
  async signup(): Promise<string> {
    const command = this.buildCommand("user signup", []);
    return this.execute<string>(command);
  }

  /**
   * Gets details about a user.
   *
   * @example
   * // Get user
   * WpCli.get.run(...);
   * ```sh
   * wp user get 12 --field=login
   * ```
   * @example
   * // Get user and export to JSON file
   * WpCli.get.run(...);
   * ```sh
   * wp user get bob --format=json > bob.json
   * ```
   */
  async get(options?: UserGetOptions): Promise<string> {
    const command = this.buildCommand("user get", [], options);
    return this.execute<string>(command);
  }

  /**
   * Verifies whether a user exists.
   *
   * @example
   * // The user exists.
   * WpCli.exists.run(...);
   * ```sh
   * wp user exists 1337
   * ```
   * @example
   * // The user does not exist.
   * WpCli.exists.run(...);
   * ```sh
   * wp user exists 10000
   * ```
   */
  async exists(): Promise<string> {
    const command = this.buildCommand("user exists", []);
    return this.execute<string>(command);
  }

  /**
   * Creates a new user.
   *
   * @example
   * // Create user
   * WpCli.create.run(...);
   * ```sh
   * wp user create bob bob@example.com --role=author
   * ```
   * @example
   * // Create user without showing password upon success
   * WpCli.create.run(...);
   * ```sh
   * wp user create ann ann@example.com --porcelain
   * ```
   */
  async create(
    userLogin: string,
    userEmail: string,
    options: UserCreateOptions & { porcelain: true }
  ): Promise<number>;
  async create(
    userLogin: string,
    userEmail: string,
    options?: Omit<UserCreateOptions, "porcelain">
  ): Promise<string>;
  async create(
    userLogin: string,
    userEmail: string,
    options?: UserCreateOptions
  ): Promise<string | number> {
    const command = this.buildCommand(
      "user create",
      [userLogin, userEmail],
      options
    );
    if ((options as { porcelain?: boolean })?.porcelain) {
      const result = await this.execute<string>(command);
      return Number.parseInt(result.trim(), 10);
    }
    return this.execute<string>(command);
  }

  /**
   * Adds a role for a user.
   *
   * @example
   * WpCli.addRole.run(...);
   * ```sh
   * wp user add-role 12 author
   * ```
   * @example
   * WpCli.addRole.run(...);
   * ```sh
   * wp user add-role 12 author editor
   * ```
   */
  async addRole(): Promise<string> {
    const command = this.buildCommand("user add-role", []);
    return this.execute<string>(command);
  }

  /**
   * Adds, updates, deletes, and lists user custom fields.
   *
   * @example
   * // Add user meta
   * WpCli.meta.run(...);
   * ```sh
   * wp user meta add 123 bio "Mary is an WordPress developer."
   * ```
   * @example
   * // List user meta
   * WpCli.meta.run(...);
   * ```sh
   * wp user meta list 123 --keys=nickname,description,wp_capabilities
   * ```
   * @example
   * // Update user meta
   * WpCli.meta.run(...);
   * ```sh
   * wp user meta update 123 bio "Mary is an awesome WordPress developer."
   * ```
   * @example
   * // Delete user meta
   * WpCli.meta.run(...);
   * ```sh
   * wp user meta delete 123 bio
   * ```
   */
  async meta(): Promise<string> {
    const command = this.buildCommand("user meta", []);
    return this.execute<string>(command);
  }

  /**
   * Deletes one or more users from the current site.
   *
   * @example
   * // Delete user 123 and reassign posts to user 567
   * WpCli.delete.run(...);
   * ```sh
   * wp user delete 123 --reassign=567
   * ```
   * @example
   * // Delete all contributors and reassign their posts to user 2
   * WpCli.delete.run(...);
   * ```sh
   * wp user delete $(wp user list --role=contributor --field=ID) --reassign=2
   * ```
   * @example
   * // Delete all contributors in batches of 100 (avoid error: argument list too long: wp)
   * WpCli.delete.run(...);
   * ```sh
   * wp user delete $(wp user list --role=contributor --field=ID | head -n 100)
   * ```
   */
  async deleteUsers(
    userIds: number | number[],
    options?: UserDeleteOptions
  ): Promise<string> {
    const command = this.buildCommand(
      "user delete",
      Array.isArray(userIds) ? userIds : [userIds],
      options
    );
    return this.execute<string>(command);
  }
}

class ShellCommand extends WpCliCommand {
  /**
   * Opens an interactive PHP console for running and testing PHP code.
   *
   * @example
   * // Call get_bloginfo() to get the name of the site.
   * WpCli.shell.run(...);
   * ```sh
   * wp shell
   * ```
   */
  async run(options?: ShellOptions): Promise<string> {
    const args: string[] = [];
    const command = this.buildCommand("shell", args, options);
    return this.execute<string>(command);
  }
}

class RewriteCommand extends WpCliCommand {
  /**
   * Gets a list of the current rewrite rules.
   *
   * @example
   * WpCli.list.run(...);
   * ```sh
   * wp rewrite list --format=csv
   * ```
   */
  async list(options?: RewriteListOptions): Promise<string> {
    const command = this.buildCommand("rewrite list", [], options);
    return this.execute<string>(command);
  }

  /**
   * Updates the permalink structure.
   *
   * @example
   * WpCli.structure.run(...);
   * ```sh
   * wp rewrite structure '/%year%/%monthnum%/%postname%/'
   * ```
   */
  async structure(options?: RewriteStructureOptions): Promise<string> {
    const command = this.buildCommand("rewrite structure", [], options);
    return this.execute<string>(command);
  }

  /**
   * Flushes rewrite rules.
   *
   * @example
   * WpCli.flush.run(...);
   * ```sh
   * wp rewrite flush
   * ```
   */
  async flush(options?: RewriteFlushOptions): Promise<string> {
    const command = this.buildCommand("rewrite flush", [], options);
    return this.execute<string>(command);
  }
}

class TermCommand extends WpCliCommand {
  /**
   * Lists terms in a taxonomy.
   *
   * @example
   * // List post categories
   * WpCli.list.run(...);
   * ```sh
   * wp term list category --format=csv
   * ```
   * @example
   * // List post tags
   * WpCli.list.run(...);
   * ```sh
   * wp term list post_tag --fields=name,slug
   * ```
   */
  async list(
    options: TermListOptions & { format: "json" }
  ): Promise<WpTermList[]>;
  async list(options?: Omit<TermListOptions, "format">): Promise<string>;
  async list(options?: TermListOptions): Promise<string | WpTermList[]> {
    const command = this.buildCommand("term list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpTermList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Updates an existing term.
   *
   * @example
   * // Change category with id 15 to use the name "Apple"
   * WpCli.update.run(...);
   * ```sh
   * wp term update category 15 --name=Apple
   * ```
   * @example
   * // Change category with slug apple to use the name "Apple"
   * WpCli.update.run(...);
   * ```sh
   * wp term update category apple --by=slug --name=Apple
   * ```
   */
  async update(options?: TermUpdateOptions): Promise<string> {
    const command = this.buildCommand("term update", [], options);
    return this.execute<string>(command);
  }

  /**
   * Migrate a term of a taxonomy to another taxonomy.
   *
   * @example
   * // Migrate a category's term (video) to tag taxonomy.
   * WpCli.migrate.run(...);
   * ```sh
   * wp term migrate 9190 --from=category --to=post_tag
   * ```
   */
  async migrate(options?: TermMigrateOptions): Promise<string> {
    const command = this.buildCommand("term migrate", [], options);
    return this.execute<string>(command);
  }

  /**
   * Generates some terms.
   *
   * @example
   * // Generate post categories.
   * WpCli.generate.run(...);
   * ```sh
   * wp term generate category --count=10
   * ```
   * @example
   * // Add meta to every generated term.
   * WpCli.generate.run(...);
   * ```sh
   * wp term generate category --format=ids --count=3 | xargs -d ' ' -I % wp term meta add % foo bar
   * ```
   */
  async generate(options?: TermGenerateOptions): Promise<string> {
    const command = this.buildCommand("term generate", [], options);
    return this.execute<string>(command);
  }

  /**
   * Recalculates number of posts assigned to each term.
   *
   * @example
   * // Recount posts assigned to each categories and tags
   * WpCli.recount.run(...);
   * ```sh
   * wp term recount category post_tag
   * ```
   * @example
   * // Recount all listed taxonomies
   * WpCli.recount.run(...);
   * ```sh
   * wp taxonomy list --field=name | xargs wp term recount
   * ```
   */
  async recount(): Promise<string> {
    const command = this.buildCommand("term recount", []);
    return this.execute<string>(command);
  }

  /**
   * Gets details about a term.
   *
   * @example
   * // Get details about a category with id 199.
   * WpCli.get.run(...);
   * ```sh
   * wp term get category 199 --format=json
   * ```
   * @example
   * // Get details about a category with slug apple.
   * WpCli.get.run(...);
   * ```sh
   * wp term get category apple --by=slug --format=json
   * ```
   */
  async get(options?: TermGetOptions): Promise<string> {
    const command = this.buildCommand("term get", [], options);
    return this.execute<string>(command);
  }

  /**
   * Creates a new term.
   *
   * @example
   * // Create a new category "Apple" with a description.
   * WpCli.create.run(...);
   * ```sh
   * wp term create category Apple --description="A type of fruit"
   * ```
   */
  async create(
    options: TermCreateOptions & { porcelain: true }
  ): Promise<number>;
  async create(options?: Omit<TermCreateOptions, "porcelain">): Promise<string>;
  async create(options?: TermCreateOptions): Promise<string | number> {
    const command = this.buildCommand("term create", [], options);
    if ((options as { porcelain?: boolean })?.porcelain) {
      const result = await this.execute<string>(command);
      return Number.parseInt(result.trim(), 10);
    }
    return this.execute<string>(command);
  }

  /**
   * Adds, updates, deletes, and lists term custom fields.
   *
   * @example
   * // Set term meta
   * WpCli.meta.run(...);
   * ```sh
   * wp term meta set 123 bio "Mary is a WordPress developer."
   * ```
   * @example
   * // Get term meta
   * WpCli.meta.run(...);
   * ```sh
   * wp term meta get 123 bio
   * ```
   * @example
   * // Update term meta
   * WpCli.meta.run(...);
   * ```sh
   * wp term meta update 123 bio "Mary is an awesome WordPress developer."
   * ```
   * @example
   * // Delete term meta
   * WpCli.meta.run(...);
   * ```sh
   * wp term meta delete 123 bio
   * ```
   */
  async meta(): Promise<string> {
    const command = this.buildCommand("term meta", []);
    return this.execute<string>(command);
  }

  /**
   * Deletes an existing term.
   *
   * @example
   * // Delete post category by id
   * WpCli.delete.run(...);
   * ```sh
   * wp term delete category 15
   * ```
   * @example
   * // Delete post category by slug
   * WpCli.delete.run(...);
   * ```sh
   * wp term delete category apple --by=slug
   * ```
   * @example
   * // Delete all post tags
   * WpCli.delete.run(...);
   * ```sh
   * wp term list post_tag --field=term_id | xargs wp term delete post_tag
   * ```
   */
  async deleteDelete(options?: TermDeleteOptions): Promise<string> {
    const command = this.buildCommand("term delete", [], options);
    return this.execute<string>(command);
  }
}

class CommentCommand extends WpCliCommand {
  /**
   * Gets a list of comments.
   *
   * @example
   * // List comment IDs.
   * WpCli.list.run(...);
   * ```sh
   * wp comment list --field=ID
   * ```
   * @example
   * // List comments of a post.
   * WpCli.list.run(...);
   * ```sh
   * wp comment list --post_id=1 --fields=ID,comment_date,comment_author
   * ```
   * @example
   * // List approved comments.
   * WpCli.list.run(...);
   * ```sh
   * wp comment list --number=3 --status=approve --fields=ID,comment_date,comment_author
   * ```
   * @example
   * // List unapproved comments.
   * WpCli.list.run(...);
   * ```sh
   * wp comment list --number=3 --status=hold --fields=ID,comment_date,comment_author
   * ```
   * @example
   * // List comments marked as spam.
   * WpCli.list.run(...);
   * ```sh
   * wp comment list --status=spam --fields=ID,comment_date,comment_author
   * ```
   * @example
   * // List comments in trash.
   * WpCli.list.run(...);
   * ```sh
   * wp comment list --status=trash --fields=ID,comment_date,comment_author
   * ```
   */
  async list(
    options: CommentListOptions & { format: "json" }
  ): Promise<WpCommentList[]>;
  async list(options?: Omit<CommentListOptions, "format">): Promise<string>;
  async list(options?: CommentListOptions): Promise<string | WpCommentList[]> {
    const command = this.buildCommand("comment list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpCommentList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Updates one or more comments.
   *
   * @example
   * // Update comment.
   * WpCli.update.run(...);
   * ```sh
   * wp comment update 123 --comment_author='That Guy'
   * ```
   */
  async update(): Promise<string> {
    const command = this.buildCommand("comment update", []);
    return this.execute<string>(command);
  }

  /**
   * Approves a comment.
   *
   * @example
   * // Approve comment.
   * WpCli.approve.run(...);
   * ```sh
   * wp comment approve 1337
   * ```
   */
  async approve(): Promise<string> {
    const command = this.buildCommand("comment approve", []);
    return this.execute<string>(command);
  }

  /**
   * Generates some number of new dummy comments.
   *
   * @example
   * // Generate comments for the given post.
   * WpCli.generate.run(...);
   * ```sh
   * wp comment generate --format=ids --count=3 --post_id=123
   * ```
   * @example
   * // Add meta to every generated comment.
   * WpCli.generate.run(...);
   * ```sh
   * wp comment generate --format=ids --count=3 | xargs -d ' ' -I % wp comment meta add % foo bar
   * ```
   */
  async generate(options?: CommentGenerateOptions): Promise<string> {
    const command = this.buildCommand("comment generate", [], options);
    return this.execute<string>(command);
  }

  /**
   * Gets the status of a comment.
   *
   * @example
   * // Get status of comment.
   * WpCli.status.run(...);
   * ```sh
   * wp comment status 1337
   * ```
   */
  async status(): Promise<string> {
    const command = this.buildCommand("comment status", []);
    return this.execute<string>(command);
  }

  /**
   * Unapproves a comment.
   *
   * @example
   * // Unapprove comment.
   * WpCli.unapprove.run(...);
   * ```sh
   * wp comment unapprove 1337
   * ```
   */
  async unapprove(): Promise<string> {
    const command = this.buildCommand("comment unapprove", []);
    return this.execute<string>(command);
  }

  /**
   * Trashes a comment.
   *
   * @example
   * // Trash comment.
   * WpCli.trash.run(...);
   * ```sh
   * wp comment trash 1337
   * ```
   */
  async trash(): Promise<string> {
    const command = this.buildCommand("comment trash", []);
    return this.execute<string>(command);
  }

  /**
   * Unmarks a comment as spam.
   *
   * @example
   * // Unspam comment.
   * WpCli.unspam.run(...);
   * ```sh
   * wp comment unspam 1337
   * ```
   */
  async unspam(): Promise<string> {
    const command = this.buildCommand("comment unspam", []);
    return this.execute<string>(command);
  }

  /**
   * Recalculates the comment_count value for one or more posts.
   *
   * @example
   * // Recount comment for the post.
   * WpCli.recount.run(...);
   * ```sh
   * wp comment recount 123
   * ```
   */
  async recount(): Promise<string> {
    const command = this.buildCommand("comment recount", []);
    return this.execute<string>(command);
  }

  /**
   * Marks a comment as spam.
   *
   * @example
   * // Spam comment.
   * WpCli.spam.run(...);
   * ```sh
   * wp comment spam 1337
   * ```
   */
  async spam(): Promise<string> {
    const command = this.buildCommand("comment spam", []);
    return this.execute<string>(command);
  }

  /**
   * Gets the data of a single comment.
   *
   * @example
   * // Get comment.
   * WpCli.get.run(...);
   * ```sh
   * wp comment get 21 --field=content
   * ```
   */
  async get(options?: CommentGetOptions): Promise<string> {
    const command = this.buildCommand("comment get", [], options);
    return this.execute<string>(command);
  }

  /**
   * Untrashes a comment.
   *
   * @example
   * // Untrash comment.
   * WpCli.untrash.run(...);
   * ```sh
   * wp comment untrash 1337
   * ```
   */
  async untrash(): Promise<string> {
    const command = this.buildCommand("comment untrash", []);
    return this.execute<string>(command);
  }

  /**
   * Verifies whether a comment exists.
   *
   * @example
   * // Check whether comment exists.
   * WpCli.exists.run(...);
   * ```sh
   * wp comment exists 1337
   * ```
   */
  async exists(): Promise<string> {
    const command = this.buildCommand("comment exists", []);
    return this.execute<string>(command);
  }

  /**
   * Creates a new comment.
   *
   * @example
   * // Create comment.
   * WpCli.create.run(...);
   * ```sh
   * wp comment create --comment_post_ID=15 --comment_content="hello blog" --comment_author="wp-cli"
   * ```
   */
  async create(
    options: CommentCreateOptions & { porcelain: true }
  ): Promise<number>;
  async create(
    options?: Omit<CommentCreateOptions, "porcelain">
  ): Promise<string>;
  async create(options?: CommentCreateOptions): Promise<string | number> {
    const command = this.buildCommand("comment create", [], options);
    if ((options as { porcelain?: boolean })?.porcelain) {
      const result = await this.execute<string>(command);
      return Number.parseInt(result.trim(), 10);
    }
    return this.execute<string>(command);
  }

  /**
   * Counts comments, on whole blog or on a given post.
   *
   * @example
   * // Count comments on whole blog.
   * WpCli.count.run(...);
   * ```sh
   * wp comment count
   * ```
   * @example
   * // Count comments in a post.
   * WpCli.count.run(...);
   * ```sh
   * wp comment count 42
   * ```
   */
  async count(): Promise<string> {
    const command = this.buildCommand("comment count", []);
    return this.execute<string>(command);
  }

  /**
   * Adds, updates, deletes, and lists comment custom fields.
   *
   * @example
   * // Set comment meta
   * WpCli.meta.run(...);
   * ```sh
   * wp comment meta set 123 description "Mary is a WordPress developer."
   * ```
   * @example
   * // Get comment meta
   * WpCli.meta.run(...);
   * ```sh
   * wp comment meta get 123 description
   * ```
   * @example
   * // Update comment meta
   * WpCli.meta.run(...);
   * ```sh
   * wp comment meta update 123 description "Mary is an awesome WordPress developer."
   * ```
   * @example
   * // Delete comment meta
   * WpCli.meta.run(...);
   * ```sh
   * wp comment meta delete 123 description
   * ```
   */
  async meta(): Promise<string> {
    const command = this.buildCommand("comment meta", []);
    return this.execute<string>(command);
  }

  /**
   * Deletes a comment.
   *
   * @example
   * // Delete comment.
   * WpCli.delete.run(...);
   * ```sh
   * wp comment delete 1337 --force
   * ```
   * @example
   * // Delete multiple comments.
   * WpCli.delete.run(...);
   * ```sh
   * wp comment delete 1337 2341 --force
   * ```
   */
  async deleteDelete(options?: CommentDeleteOptions): Promise<string> {
    const command = this.buildCommand("comment delete", [], options);
    return this.execute<string>(command);
  }
}

class MaintenanceModeCommand extends WpCliCommand {
  /**
   * Deactivates maintenance mode.
   *
   * @example
   * WpCli.deactivate.run(...);
   * ```sh
   * wp maintenance-mode deactivate
   * ```
   */
  async deactivate(): Promise<string> {
    const command = this.buildCommand("maintenance-mode deactivate", []);
    return this.execute<string>(command);
  }

  /**
   * Detects maintenance mode status.
   *
   * @example
   * WpCli.isActive.run(...);
   * ```sh
   * wp maintenance-mode is-active
   * ```
   */
  async isActive(): Promise<string> {
    const command = this.buildCommand("maintenance-mode is-active", []);
    return this.execute<string>(command);
  }

  /**
   * Displays maintenance mode status.
   *
   * @example
   * WpCli.status.run(...);
   * ```sh
   * wp maintenance-mode status
   * ```
   */
  async status(): Promise<string> {
    const command = this.buildCommand("maintenance-mode status", []);
    return this.execute<string>(command);
  }

  /**
   * Activates maintenance mode.
   *
   * @example
   * WpCli.activate.run(...);
   * ```sh
   * wp maintenance-mode activate
   * ```
   */
  async activate(options?: MaintenanceModeActivateOptions): Promise<string> {
    const command = this.buildCommand("maintenance-mode activate", [], options);
    return this.execute<string>(command);
  }
}

class TaxonomyCommand extends WpCliCommand {
  /**
   * Lists registered taxonomies.
   *
   * @example
   * // List all taxonomies.
   * WpCli.list.run(...);
   * ```sh
   * wp taxonomy list --format=csv
   * ```
   * @example
   * // List all taxonomies with 'post' object type.
   * WpCli.list.run(...);
   * ```sh
   * wp taxonomy list --object_type=post --fields=name,public
   * ```
   */
  async list(
    options: TaxonomyListOptions & { format: "json" }
  ): Promise<WpTaxonomyList[]>;
  async list(options?: Omit<TaxonomyListOptions, "format">): Promise<string>;
  async list(
    options?: TaxonomyListOptions
  ): Promise<string | WpTaxonomyList[]> {
    const command = this.buildCommand("taxonomy list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpTaxonomyList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Gets details about a registered taxonomy.
   *
   * @example
   * // Get details of `category` taxonomy.
   * WpCli.get.run(...);
   * ```sh
   * wp taxonomy get category --fields=name,label,object_type
   * ```
   * @example
   * // Get capabilities of 'post_tag' taxonomy.
   * WpCli.get.run(...);
   * ```sh
   * wp taxonomy get post_tag --field=cap
   * ```
   */
  async get(
    options: TaxonomyGetOptions & { format: "json" }
  ): Promise<WpTaxonomyGet[]>;
  async get(options?: Omit<TaxonomyGetOptions, "format">): Promise<string>;
  async get(options?: TaxonomyGetOptions): Promise<string | WpTaxonomyGet[]> {
    const command = this.buildCommand("taxonomy get", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpTaxonomyGet[]>(command);
    }
    return this.execute<string>(command);
  }
}

class ExportCommand extends WpCliCommand {
  /**
   * Exports WordPress content to a WXR file.
   *
   * @example
   * // Export posts published by the user between given start and end date
   * WpCli.export.run(...);
   * ```sh
   * wp export --dir=/tmp/ --user=admin --post_type=post --start_date=2011-01-01 --end_date=2011-12-31
   * ```
   * @example
   * // Export posts by IDs
   * WpCli.export.run(...);
   * ```sh
   * wp export --dir=/tmp/ --post__in=123,124,125
   * ```
   * @example
   * // Export a random subset of content
   * WpCli.export.run(...);
   * ```sh
   * wp export --post__in="$(wp post list --post_type=post --orderby=rand --posts_per_page=8 --format=ids)"
   * ```
   */
  async run(options?: ExportOptions): Promise<string> {
    const args: string[] = [];
    const command = this.buildCommand("export", args, options);
    return this.execute<string>(command);
  }
}

class SidebarCommand extends WpCliCommand {
  /**
   * Lists registered sidebars.
   *
   * @example
   * WpCli.list.run(...);
   * ```sh
   * wp sidebar list --fields=name,id --format=csv
   * ```
   */
  async list(
    options: SidebarListOptions & { format: "json" }
  ): Promise<WpSidebarList[]>;
  async list(options?: Omit<SidebarListOptions, "format">): Promise<string>;
  async list(options?: SidebarListOptions): Promise<string | WpSidebarList[]> {
    const command = this.buildCommand("sidebar list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpSidebarList[]>(command);
    }
    return this.execute<string>(command);
  }
}

class ScaffoldCommand extends WpCliCommand {
  /**
   * Generates PHP code for registering a custom post type.
   *
   * @example
   * // Generate a 'movie' post type for the 'simple-life' theme
   * WpCli.postType.run(...);
   * ```sh
   * wp scaffold post-type movie --label=Movie --theme=simple-life
   * ```
   */
  async postType(options?: ScaffoldPostTypeOptions): Promise<string> {
    const command = this.buildCommand("scaffold post-type", [], options);
    return this.execute<string>(command);
  }

  /**
   * Generates PHP, JS and CSS code for registering a Gutenberg block for a plugin or theme.
   */
  async block(options?: ScaffoldBlockOptions): Promise<string> {
    const command = this.buildCommand("scaffold block", [], options);
    return this.execute<string>(command);
  }

  /**
   * Generates starter code for a plugin.
   *
   * @example
   * WpCli.plugin.run(...);
   * ```sh
   * wp scaffold plugin sample-plugin
   * ```
   */
  async plugin(options?: ScaffoldPluginOptions): Promise<string> {
    const command = this.buildCommand("scaffold plugin", [], options);
    return this.execute<string>(command);
  }

  /**
   * Generates files needed for running PHPUnit tests in a plugin.
   *
   * @example
   * // Generate unit test files for plugin 'sample-plugin'.
   * WpCli.pluginTests.run(...);
   * ```sh
   * wp scaffold plugin-tests sample-plugin
   * ```
   */
  async pluginTests(options?: ScaffoldPluginTestsOptions): Promise<string> {
    const command = this.buildCommand("scaffold plugin-tests", [], options);
    return this.execute<string>(command);
  }

  /**
   * Generates child theme based on an existing theme.
   *
   * @example
   * // Generate a 'sample-theme' child theme based on TwentySixteen
   * WpCli.childTheme.run(...);
   * ```sh
   * wp scaffold child-theme sample-theme --parent_theme=twentysixteen
   * ```
   */
  async childTheme(options: ScaffoldChildThemeOptions): Promise<string> {
    const command = this.buildCommand("scaffold child-theme", [], options);
    return this.execute<string>(command);
  }

  /**
   * Generates starter code for a theme based on _s.
   *
   * @example
   * // Generate a theme with name "Sample Theme" and author "John Doe"
   * WpCli.underscores.run(...);
   * ```sh
   * wp scaffold _s sample-theme --theme_name="Sample Theme" --author="John Doe"
   * ```
   */
  async underscores(options?: ScaffoldUnderscoresOptions): Promise<string> {
    const command = this.buildCommand("scaffold underscores", [], options);
    return this.execute<string>(command);
  }

  /**
   * Generates PHP code for registering a custom taxonomy.
   *
   * @example
   * // Generate PHP code for registering a custom taxonomy and save in a file
   * WpCli.taxonomy.run(...);
   * ```sh
   * wp scaffold taxonomy venue --post_types=event,presentation > taxonomy.php
   * ```
   */
  async taxonomy(options?: ScaffoldTaxonomyOptions): Promise<string> {
    const command = this.buildCommand("scaffold taxonomy", [], options);
    return this.execute<string>(command);
  }

  /**
   * Generates files needed for running PHPUnit tests in a theme.
   *
   * @example
   * // Generate unit test files for theme 'twentysixteenchild'.
   * WpCli.themeTests.run(...);
   * ```sh
   * wp scaffold theme-tests twentysixteenchild
   * ```
   */
  async themeTests(options?: ScaffoldThemeTestsOptions): Promise<string> {
    const command = this.buildCommand("scaffold theme-tests", [], options);
    return this.execute<string>(command);
  }
}

class SuperAdminCommand extends WpCliCommand {
  /**
   * Lists users with super admin capabilities.
   *
   * @example
   * // List user with super-admin capabilities.
   * WpCli.list.run(...);
   * ```sh
   * wp super-admin list
   * ```
   */
  async list(options?: SuperAdminListOptions): Promise<string> {
    const command = this.buildCommand("super-admin list", [], options);
    return this.execute<string>(command);
  }

  /**
   * Grants super admin privileges to one or more users.
   *
   * @example
   * // Grant super-admin privileges to the user.
   * WpCli.add.run(...);
   * ```sh
   * wp super-admin add superadmin2
   * ```
   */
  async add(): Promise<string> {
    const command = this.buildCommand("super-admin add", []);
    return this.execute<string>(command);
  }

  /**
   * Removes super admin privileges from one or more users.
   *
   * @example
   * // Revoke super-admin privileges from the user.
   * WpCli.remove.run(...);
   * ```sh
   * wp super-admin remove superadmin2
   * ```
   */
  async remove(): Promise<string> {
    const command = this.buildCommand("super-admin remove", []);
    return this.execute<string>(command);
  }
}

class CapCommand extends WpCliCommand {
  /**
   * Lists capabilities for a given role.
   *
   * @example
   * // Display alphabetical list of Contributor capabilities.
   * WpCli.list.run(...);
   * ```sh
   * wp cap list 'contributor' | sort
   * ```
   */
  async list(options?: CapListOptions): Promise<string> {
    const command = this.buildCommand("cap list", [], options);
    return this.execute<string>(command);
  }

  /**
   * Adds capabilities to a given role.
   *
   * @example
   * // Add 'spectate' capability to 'author' role.
   * WpCli.add.run(...);
   * ```sh
   * wp cap add author spectate
   * ```
   */
  async add(options?: CapAddOptions): Promise<string> {
    const command = this.buildCommand("cap add", [], options);
    return this.execute<string>(command);
  }

  /**
   * Removes capabilities from a given role.
   *
   * @example
   * // Remove 'spectate' capability from 'author' role.
   * WpCli.remove.run(...);
   * ```sh
   * wp cap remove author spectate
   * ```
   */
  async remove(): Promise<string> {
    const command = this.buildCommand("cap remove", []);
    return this.execute<string>(command);
  }
}

class RoleCommand extends WpCliCommand {
  /**
   * Lists all roles.
   *
   * @example
   * // List roles.
   * WpCli.list.run(...);
   * ```sh
   * wp role list --fields=role --format=csv
   * ```
   */
  async list(
    options: RoleListOptions & { format: "json" }
  ): Promise<WpRoleList[]>;
  async list(options?: Omit<RoleListOptions, "format">): Promise<string>;
  async list(options?: RoleListOptions): Promise<string | WpRoleList[]> {
    const command = this.buildCommand("role list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpRoleList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Checks if a role exists.
   *
   * @example
   * // Check if a role exists.
   * WpCli.exists.run(...);
   * ```sh
   * wp role exists editor
   * ```
   */
  async exists(): Promise<string> {
    const command = this.buildCommand("role exists", []);
    return this.execute<string>(command);
  }

  /**
   * Creates a new role.
   *
   * @example
   * // Create role for Approver.
   * WpCli.create.run(...);
   * ```sh
   * wp role create approver Approver
   * ```
   * @example
   * // Create role for Product Administrator.
   * WpCli.create.run(...);
   * ```sh
   * wp role create productadmin "Product Administrator"
   * ```
   */
  async create(options?: RoleCreateOptions): Promise<string> {
    const command = this.buildCommand("role create", [], options);
    return this.execute<string>(command);
  }

  /**
   * Resets any default role to default capabilities.
   *
   * @example
   * // Reset three roles.
   * WpCli.reset.run(...);
   * ```sh
   * wp role reset administrator author contributor
   * ```
   * @example
   * // Reset a custom role.
   * WpCli.reset.run(...);
   * ```sh
   * wp role reset custom_role
   * ```
   * @example
   * // Reset all default roles.
   * WpCli.reset.run(...);
   * ```sh
   * wp role reset --all
   * ```
   */
  async reset(options?: RoleResetOptions): Promise<string> {
    const command = this.buildCommand("role reset", [], options);
    return this.execute<string>(command);
  }

  /**
   * Deletes an existing role.
   *
   * @example
   * // Delete approver role.
   * WpCli.delete.run(...);
   * ```sh
   * wp role delete approver
   * ```
   * @example
   * // Delete productadmin role.
   * WpCli.delete.run(...);
   * ```sh
   * wp role delete productadmin
   * ```
   */
  async deleteDelete(): Promise<string> {
    const command = this.buildCommand("role delete", []);
    return this.execute<string>(command);
  }
}

class OptionCommand extends WpCliCommand {
  /**
   * Lists options and their values.
   *
   * @example
   * // Get the total size of all autoload options.
   * WpCli.list.run(...);
   * ```sh
   * wp option list --autoload=on --format=total_bytes
   * ```
   * @example
   * // Find biggest transients.
   * WpCli.list.run(...);
   * ```sh
   * wp option list --search="*_transient_*" --fields=option_name,size_bytes | sort -n -k 2 | tail
   * ```
   * @example
   * // List all options beginning with "i2f_".
   * WpCli.list.run(...);
   * ```sh
   * wp option list --search="i2f_*"
   * ```
   * @example
   * // Delete all options beginning with "theme_mods_".
   * WpCli.list.run(...);
   * ```sh
   * wp option list --search="theme_mods_*" --field=option_name | xargs -I % wp option delete %
   * ```
   */
  async list(
    options: OptionListOptions & { format: "json" }
  ): Promise<WpOptionList[]>;
  async list(options?: Omit<OptionListOptions, "format">): Promise<string>;
  async list(options?: OptionListOptions): Promise<string | WpOptionList[]> {
    const command = this.buildCommand("option list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpOptionList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Sets the 'autoload' value for an option.
   *
   * @example
   * // Set the 'autoload' value for an option.
   * WpCli.setAutoload.run(...);
   * ```sh
   * wp option set-autoload abc_options no
   * ```
   */
  async setAutoload(options: OptionSetAutoloadOptions): Promise<string> {
    const command = this.buildCommand("option set-autoload", [], options);
    return this.execute<string>(command);
  }

  /**
   * Adds a new option value.
   *
   * @example
   * // Create an option by reading a JSON file.
   * WpCli.add.run(...);
   * ```sh
   * wp option add my_option --format=json < config.json
   * ```
   */
  async add(options?: OptionAddOptions): Promise<string> {
    const command = this.buildCommand("option add", [], options);
    return this.execute<string>(command);
  }

  /**
   * Updates a nested value in an option.
   *
   * @example
   * // Add 'bar' to the 'foo' key on an option with name 'option_name'
   * WpCli.patch.run(...);
   * ```sh
   * wp option patch insert option_name foo bar
   * ```
   * @example
   * // Update the value of 'foo' key to 'new' on an option with name 'option_name'
   * WpCli.patch.run(...);
   * ```sh
   * wp option patch update option_name foo new
   * ```
   * @example
   * // Set nested value of 'bar' key to value we have in the patch file on an option with name 'option_name'.
   * WpCli.patch.run(...);
   * ```sh
   * wp option patch update option_name foo bar < patch
   * ```
   * @example
   * // Update the value for the key 'not-a-key' which is not exist on an option with name 'option_name'.
   * WpCli.patch.run(...);
   * ```sh
   * wp option patch update option_name foo not-a-key new-value
   * ```
   * @example
   * // Update the value for the key 'foo' without passing value on an option with name 'option_name'.
   * WpCli.patch.run(...);
   * ```sh
   * wp option patch update option_name foo
   * ```
   * @example
   * // Delete the nested key 'bar' under 'foo' key on an option with name 'option_name'.
   * WpCli.patch.run(...);
   * ```sh
   * wp option patch delete option_name foo bar
   * ```
   */
  async patch(options: OptionPatchOptions): Promise<string> {
    const command = this.buildCommand("option patch", [], options);
    return this.execute<string>(command);
  }

  /**
   * Updates an option value.
   *
   * @example
   * // Update an option by reading from a file.
   * WpCli.update.run(...);
   * ```sh
   * wp option update my_option < value.txt
   * ```
   * @example
   * // Update one option on multiple sites using xargs.
   * WpCli.update.run(...);
   * ```sh
   * wp site list --field=url | xargs -n1 -I {} sh -c 'wp --url={} option update my_option my_value'
   * ```
   * @example
   * // Update site blog name.
   * WpCli.update.run(...);
   * ```sh
   * wp option update blogname "Random blog name"
   * ```
   * @example
   * // Update site blog description.
   * WpCli.update.run(...);
   * ```sh
   * wp option update blogdescription "Some random blog description"
   * ```
   * @example
   * // Update admin email address.
   * WpCli.update.run(...);
   * ```sh
   * wp option update admin_email someone@example.com
   * ```
   * @example
   * // Set the default role.
   * WpCli.update.run(...);
   * ```sh
   * wp option update default_role author
   * ```
   * @example
   * // Set the timezone string.
   * WpCli.update.run(...);
   * ```sh
   * wp option update timezone_string "America/New_York"
   * ```
   */
  async update(options?: OptionUpdateOptions): Promise<string> {
    const command = this.buildCommand("option update", [], options);
    return this.execute<string>(command);
  }

  /**
   * Gets a nested value from an option.
   */
  async pluck(options?: OptionPluckOptions): Promise<string> {
    const command = this.buildCommand("option pluck", [], options);
    return this.execute<string>(command);
  }

  /**
   * Gets the 'autoload' value for an option.
   *
   * @example
   * // Get the 'autoload' value for an option.
   * WpCli.getAutoload.run(...);
   * ```sh
   * wp option get-autoload blogname
   * ```
   */
  async getAutoload(): Promise<string> {
    const command = this.buildCommand("option get-autoload", []);
    return this.execute<string>(command);
  }

  /**
   * Gets the value for an option.
   *
   * @example
   * // Get option.
   * WpCli.get.run(...);
   * ```sh
   * wp option get home
   * ```
   * @example
   * // Get blog description.
   * WpCli.get.run(...);
   * ```sh
   * wp option get blogdescription
   * ```
   * @example
   * // Get blog name
   * WpCli.get.run(...);
   * ```sh
   * wp option get blogname
   * ```
   * @example
   * // Get admin email.
   * WpCli.get.run(...);
   * ```sh
   * wp option get admin_email
   * ```
   * @example
   * // Get option in JSON format.
   * WpCli.get.run(...);
   * ```sh
   * wp option get active_plugins --format=json
   * ```
   */
  async get(options?: OptionGetOptions): Promise<string> {
    const command = this.buildCommand("option get", [], options);
    return this.execute<string>(command);
  }

  /**
   * Deletes an option.
   *
   * @example
   * // Delete an option.
   * WpCli.delete.run(...);
   * ```sh
   * wp option delete my_option
   * ```
   * @example
   * // Delete multiple options.
   * WpCli.delete.run(...);
   * ```sh
   * wp option delete option_one option_two option_three
   * ```
   */
  async deleteDelete(): Promise<string> {
    const command = this.buildCommand("option delete", []);
    return this.execute<string>(command);
  }
}

class SiteCommand extends WpCliCommand {
  /**
   * Lists all sites in a multisite installation.
   *
   * @example
   * // Output a simple list of site URLs
   * WpCli.list.run(...);
   * ```sh
   * wp site list --field=url
   * ```
   */
  async list(
    options: SiteListOptions & { format: "json" }
  ): Promise<WpSiteList[]>;
  async list(options?: Omit<SiteListOptions, "format">): Promise<string>;
  async list(options?: SiteListOptions): Promise<string | WpSiteList[]> {
    const command = this.buildCommand("site list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpSiteList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Deactivates one or more sites.
   *
   * @example
   * WpCli.deactivate.run(...);
   * ```sh
   * wp site deactivate 123
   * ```
   * @example
   * WpCli.deactivate.run(...);
   * ```sh
   * wp site deactivate --slug=demo
   * ```
   */
  async deactivate(options?: SiteDeactivateOptions): Promise<string> {
    const command = this.buildCommand("site deactivate", [], options);
    return this.execute<string>(command);
  }

  /**
   * Generate some sites.
   */
  async generate(options?: SiteGenerateOptions): Promise<string> {
    const command = this.buildCommand("site generate", [], options);
    return this.execute<string>(command);
  }

  /**
   * Archives one or more sites.
   *
   * @example
   * WpCli.archive.run(...);
   * ```sh
   * wp site archive 123
   * ```
   * @example
   * WpCli.archive.run(...);
   * ```sh
   * wp site archive --slug=demo
   * ```
   */
  async archive(options?: SiteArchiveOptions): Promise<string> {
    const command = this.buildCommand("site archive", [], options);
    return this.execute<string>(command);
  }

  /**
   * Empties a site of its content (posts, comments, terms, and meta).
   *
   * @example
   * WpCli.empty.run(...);
   * ```sh
   * wp site empty
   * ```
   */
  async empty(options?: SiteEmptyOptions): Promise<string> {
    const command = this.buildCommand("site empty", [], options);
    return this.execute<string>(command);
  }

  /**
   * Sets one or more sites as private.
   *
   * @example
   * WpCli.private.run(...);
   * ```sh
   * wp site private 123
   * ```
   * @example
   * WpCli.private.run(...);
   * ```sh
   * wp site private --slug=demo
   * ```
   */
  async private(options?: SitePrivateOptions): Promise<string> {
    const command = this.buildCommand("site private", [], options);
    return this.execute<string>(command);
  }

  /**
   * Activates a given language.
   *
   * @example
   * WpCli.switchLanguage.run(...);
   * ```sh
   * wp site switch-language ja
   * ```
   */
  async switchLanguage(): Promise<string> {
    const command = this.buildCommand("site switch-language", []);
    return this.execute<string>(command);
  }

  /**
   * Adds, updates, deletes, and lists site options in a multisite installation.
   *
   * @example
   * // Get site registration
   * WpCli.option.run(...);
   * ```sh
   * wp site option get registration
   * ```
   * @example
   * // Add site option
   * WpCli.option.run(...);
   * ```sh
   * wp site option add my_option foobar
   * ```
   * @example
   * // Update site option
   * WpCli.option.run(...);
   * ```sh
   * wp site option update my_option '{"foo": "bar"}' --format=json
   * ```
   * @example
   * // Delete site option
   * WpCli.option.run(...);
   * ```sh
   * wp site option delete my_option
   * ```
   */
  async option(): Promise<string> {
    const command = this.buildCommand("site option", []);
    return this.execute<string>(command);
  }

  /**
   * Removes one or more sites from spam.
   *
   * @example
   * WpCli.unspam.run(...);
   * ```sh
   * wp site unspam 123
   * ```
   */
  async unspam(options?: SiteUnspamOptions): Promise<string> {
    const command = this.buildCommand("site unspam", [], options);
    return this.execute<string>(command);
  }

  /**
   * Marks one or more sites as spam.
   *
   * @example
   * WpCli.spam.run(...);
   * ```sh
   * wp site spam 123
   * ```
   */
  async spam(options?: SiteSpamOptions): Promise<string> {
    const command = this.buildCommand("site spam", [], options);
    return this.execute<string>(command);
  }

  /**
   * Sets one or more sites as public.
   *
   * @example
   * WpCli.public.run(...);
   * ```sh
   * wp site public 123
   * ```
   */
  async public(options?: SitePublicOptions): Promise<string> {
    const command = this.buildCommand("site public", [], options);
    return this.execute<string>(command);
  }

  /**
   * Unarchives one or more sites.
   *
   * @example
   * WpCli.unarchive.run(...);
   * ```sh
   * wp site unarchive 123
   * ```
   * @example
   * WpCli.unarchive.run(...);
   * ```sh
   * wp site unarchive --slug=demo
   * ```
   */
  async unarchive(options?: SiteUnarchiveOptions): Promise<string> {
    const command = this.buildCommand("site unarchive", [], options);
    return this.execute<string>(command);
  }

  /**
   * Sets one or more sites as mature.
   *
   * @example
   * WpCli.mature.run(...);
   * ```sh
   * wp site mature 123
   * ```
   * @example
   * WpCli.mature.run(...);
   * ```sh
   * wp site mature --slug=demo
   * ```
   */
  async mature(options?: SiteMatureOptions): Promise<string> {
    const command = this.buildCommand("site mature", [], options);
    return this.execute<string>(command);
  }

  /**
   * Activates one or more sites.
   *
   * @example
   * WpCli.activate.run(...);
   * ```sh
   * wp site activate 123
   * ```
   */
  async activate(options?: SiteActivateOptions): Promise<string> {
    const command = this.buildCommand("site activate", [], options);
    return this.execute<string>(command);
  }

  /**
   * Creates a site in a multisite installation.
   *
   * @example
   * WpCli.create.run(...);
   * ```sh
   * wp site create --slug=example
   * ```
   */
  async create(
    options: SiteCreateOptions & { porcelain: true }
  ): Promise<number>;
  async create(options?: Omit<SiteCreateOptions, "porcelain">): Promise<string>;
  async create(options: SiteCreateOptions): Promise<string | number> {
    const command = this.buildCommand("site create", [], options);
    if ((options as { porcelain?: boolean })?.porcelain) {
      const result = await this.execute<string>(command);
      return Number.parseInt(result.trim(), 10);
    }
    return this.execute<string>(command);
  }

  /**
   * Sets one or more sites as immature.
   *
   * @example
   * WpCli.unmature.run(...);
   * ```sh
   * wp site unmature 123
   * ```
   * @example
   * WpCli.unmature.run(...);
   * ```sh
   * wp site unmature --slug=demo
   * ```
   */
  async unmature(options?: SiteUnmatureOptions): Promise<string> {
    const command = this.buildCommand("site unmature", [], options);
    return this.execute<string>(command);
  }

  /**
   * Adds, updates, deletes, and lists site custom fields.
   *
   * @example
   * // Set site meta
   * WpCli.meta.run(...);
   * ```sh
   * wp site meta set 123 bio "Mary is a WordPress developer."
   * ```
   * @example
   * // Get site meta
   * WpCli.meta.run(...);
   * ```sh
   * wp site meta get 123 bio
   * ```
   * @example
   * // Update site meta
   * WpCli.meta.run(...);
   * ```sh
   * wp site meta update 123 bio "Mary is an awesome WordPress developer."
   * ```
   * @example
   * // Delete site meta
   * WpCli.meta.run(...);
   * ```sh
   * wp site meta delete 123 bio
   * ```
   */
  async meta(): Promise<string> {
    const command = this.buildCommand("site meta", []);
    return this.execute<string>(command);
  }

  /**
   * Deletes a site in a multisite installation.
   *
   * @example
   * WpCli.delete.run(...);
   * ```sh
   * wp site delete 123
   * ```
   */
  async deleteDelete(options?: SiteDeleteOptions): Promise<string> {
    const command = this.buildCommand("site delete", [], options);
    return this.execute<string>(command);
  }
}

class EmbedCommand extends WpCliCommand {
  /**
   * Retrieves embed handlers.
   *
   * @example
   * // List id,regex,priority fields of available handlers.
   * WpCli.handler.run(...);
   * ```sh
   * wp embed handler list --fields=priority,id
   * ```
   */
  async handler(): Promise<string> {
    const command = this.buildCommand("embed handler", []);
    return this.execute<string>(command);
  }

  /**
   * Retrieves oEmbed providers.
   *
   * @example
   * // List format,endpoint fields of available providers.
   * WpCli.provider.run(...);
   * ```sh
   * wp embed provider list
   * ```
   * @example
   * // Get the matching provider for the URL.
   * WpCli.provider.run(...);
   * ```sh
   * wp embed provider match https://www.youtube.com/watch?v=dQw4w9WgXcQ
   * ```
   */
  async provider(): Promise<string> {
    const command = this.buildCommand("embed provider", []);
    return this.execute<string>(command);
  }

  /**
   * Attempts to convert a URL into embed HTML.
   *
   * @example
   * // Get embed HTML for a given URL.
   * WpCli.fetch.run(...);
   * ```sh
   * wp embed fetch https://www.youtube.com/watch?v=dQw4w9WgXcQ
   * ```
   * @example
   * // Get raw oEmbed data for a given URL.
   * WpCli.fetch.run(...);
   * ```sh
   * wp embed fetch https://www.youtube.com/watch?v=dQw4w9WgXcQ --raw
   * ```
   */
  async fetch(options?: EmbedFetchOptions): Promise<string> {
    const command = this.buildCommand("embed fetch", [], options);
    return this.execute<string>(command);
  }

  /**
   * Finds, triggers, and deletes oEmbed caches.
   *
   * @example
   * // Find cache post ID for a given URL.
   * WpCli.cache.run(...);
   * ```sh
   * wp embed cache find https://www.youtube.com/watch?v=dQw4w9WgXcQ --width=500
   * ```
   * @example
   * // Clear cache for a post.
   * WpCli.cache.run(...);
   * ```sh
   * wp embed cache clear 123
   * ```
   * @example
   * // Triggers cache for a post.
   * WpCli.cache.run(...);
   * ```sh
   * wp embed cache trigger 456
   * ```
   */
  async cache(): Promise<string> {
    const command = this.buildCommand("embed cache", []);
    return this.execute<string>(command);
  }
}

class CronCommand extends WpCliCommand {
  /**
   * Gets WP-Cron schedules.
   *
   * @example
   * // List available cron schedules
   * WpCli.schedule.run(...);
   * ```sh
   * wp cron schedule list
   * ```
   */
  async schedule(): Promise<string> {
    const command = this.buildCommand("cron schedule", []);
    return this.execute<string>(command);
  }

  /**
   * Schedules, runs, and deletes WP-Cron events.
   *
   * @example
   * // Schedule a new cron event
   * WpCli.event.run(...);
   * ```sh
   * wp cron event schedule cron_test
   * ```
   * @example
   * // Run all cron events due right now
   * WpCli.event.run(...);
   * ```sh
   * wp cron event run --due-now
   * ```
   * @example
   * // Delete all scheduled cron events for the given hook
   * WpCli.event.run(...);
   * ```sh
   * wp cron event delete cron_test
   * ```
   * @example
   * // List scheduled cron events in JSON
   * WpCli.event.run(...);
   * ```sh
   * wp cron event list --fields=hook,next_run --format=json
   * ```
   */
  async event(): Promise<string> {
    const command = this.buildCommand("cron event", []);
    return this.execute<string>(command);
  }

  /**
   * Tests the WP Cron spawning system and reports back its status.
   *
   * @example
   * // Cron test runs successfully.
   * WpCli.test.run(...);
   * ```sh
   * wp cron test
   * ```
   */
  async test(): Promise<string> {
    const command = this.buildCommand("cron test", []);
    return this.execute<string>(command);
  }
}

class FindCommand extends WpCliCommand {
  /**
   * Find WordPress installations on the filesystem.
   *
   * @example
   * // Find WordPress installations.
   * WpCli.find.run(...);
   * ```sh
   * wp find ./
   * ```
   */
  async run(options?: FindOptions): Promise<string> {
    const args: string[] = [];
    const command = this.buildCommand("find", args, options);
    return this.execute<string>(command);
  }
}

class ServerCommand extends WpCliCommand {
  /**
   * Launches PHP's built-in web server for a specific WordPress installation.
   *
   * @example
   * // Make the instance available on any address (with port 8080)
   * WpCli.server.run(...);
   * ```sh
   * wp server --host=0.0.0.0
   * ```
   * @example
   * // Run on port 80 (for multisite)
   * WpCli.server.run(...);
   * ```sh
   * wp server --host=localhost.localdomain --port=80
   * ```
   * @example
   * // Configure the server with a specific .ini file
   * WpCli.server.run(...);
   * ```sh
   * wp server --config=development.ini
   * ```
   */
  async run(options?: ServerOptions): Promise<string> {
    const args: string[] = [];
    const command = this.buildCommand("server", args, options);
    return this.execute<string>(command);
  }
}

class I18nCommand extends WpCliCommand {
  /**
   * Update PO files from a POT file.
   *
   * @example
   * // Update all PO files from a POT file in the current directory.
   * WpCli.updatePo.run(...);
   * ```sh
   * wp i18n update-po example-plugin.pot
   * ```
   * @example
   * // Update a PO file from a POT file.
   * WpCli.updatePo.run(...);
   * ```sh
   * wp i18n update-po example-plugin.pot example-plugin-de_DE.po
   * ```
   * @example
   * // Update all PO files in a given directory from a POT file.
   * WpCli.updatePo.run(...);
   * ```sh
   * wp i18n update-po example-plugin.pot languages
   * ```
   */
  async updatePo(): Promise<string> {
    const command = this.buildCommand("i18n update-po", []);
    return this.execute<string>(command);
  }

  /**
   * Create PHP files from PO files.
   *
   * @example
   * // Create PHP files for all PO files in the current directory.
   * WpCli.makePhp.run(...);
   * ```sh
   * wp i18n make-php .
   * ```
   * @example
   * // Create a PHP file from a single PO file in a specific directory.
   * WpCli.makePhp.run(...);
   * ```sh
   * wp i18n make-php example-plugin-de_DE.po languages
   * ```
   */
  async makePhp(): Promise<string> {
    const command = this.buildCommand("i18n make-php", []);
    return this.execute<string>(command);
  }

  /**
   * Extract JavaScript strings from PO files and add them to individual JSON files.
   *
   * @example
   * // Create JSON files for all PO files in the languages directory
   * WpCli.makeJson.run(...);
   * ```sh
   * wp i18n make-json languages
   * ```
   * @example
   * // Create JSON files for my-plugin-de_DE.po and leave the PO file untouched.
   * WpCli.makeJson.run(...);
   * ```sh
   * wp i18n make-json my-plugin-de_DE.po /tmp --no-purge
   * ```
   * @example
   * // Create JSON files with mapping
   * WpCli.makeJson.run(...);
   * ```sh
   * wp i18n make-json languages --use-map=build/map.json
   * ```
   * @example
   * // Create JSON files with multiple mappings
   * WpCli.makeJson.run(...);
   * ```sh
   * wp i18n make-json languages '--use-map=["build/map.json","build/map2.json"]'
   * ```
   * @example
   * // Create JSON files with object mapping
   * WpCli.makeJson.run(...);
   * ```sh
   * wp i18n make-json languages '--use-map={"source/index.js":"build/index.js"}'
   * ```
   */
  async makeJson(options?: I18nMakeJsonOptions): Promise<string> {
    const command = this.buildCommand("i18n make-json", [], options);
    return this.execute<string>(command);
  }

  /**
   * Create MO files from PO files.
   *
   * @example
   * // Create MO files for all PO files in the current directory.
   * WpCli.makeMo.run(...);
   * ```sh
   * wp i18n make-mo .
   * ```
   * @example
   * // Create a MO file from a single PO file in a specific directory.
   * WpCli.makeMo.run(...);
   * ```sh
   * wp i18n make-mo example-plugin-de_DE.po languages
   * ```
   * @example
   * // Create a MO file from a single PO file to a specific file destination
   * WpCli.makeMo.run(...);
   * ```sh
   * wp i18n make-mo example-plugin-de_DE.po languages/bar.mo
   * ```
   */
  async makeMo(): Promise<string> {
    const command = this.buildCommand("i18n make-mo", []);
    return this.execute<string>(command);
  }

  /**
   * Create a POT file for a WordPress project.
   *
   * @example
   * // Create a POT file for the WordPress plugin/theme in the current directory.
   * WpCli.makePot.run(...);
   * ```sh
   * wp i18n make-pot . languages/my-plugin.pot
   * ```
   * @example
   * // Create a POT file for the continents and cities list in WordPress core.
   * WpCli.makePot.run(...);
   * ```sh
   * wp i18n make-pot . continents-and-cities.pot --include="wp-admin/includes/continents-cities.php" --ignore-domain
   * ```
   * @example
   * // Create a POT file for the WordPress theme in the current directory with custom headers.
   * WpCli.makePot.run(...);
   * ```sh
   * wp i18n make-pot . languages/my-theme.pot --headers='{"Report-Msgid-Bugs-To":"https://github.com/theme-author/my-theme/","POT-Creation-Date":""}'
   * ```
   */
  async makePot(options?: I18nMakePotOptions): Promise<string> {
    const command = this.buildCommand("i18n make-pot", [], options);
    return this.execute<string>(command);
  }
}

class LanguageCommand extends WpCliCommand {
  /**
   * Installs, activates, and manages theme language packs.
   *
   * @example
   * // Install the Dutch theme language pack for Twenty Ten.
   * WpCli.theme.run(...);
   * ```sh
   * wp language theme install twentyten nl_NL
   * ```
   * @example
   * // Uninstall the Dutch theme language pack for Twenty Ten.
   * WpCli.theme.run(...);
   * ```sh
   * wp language theme uninstall twentyten nl_NL
   * ```
   * @example
   * // List installed theme language packs for Twenty Ten.
   * WpCli.theme.run(...);
   * ```sh
   * wp language theme list twentyten --status=installed
   * ```
   */
  async theme(): Promise<string> {
    const command = this.buildCommand("language theme", []);
    return this.execute<string>(command);
  }

  /**
   * Installs, activates, and manages plugin language packs.
   *
   * @example
   * // Install the Dutch plugin language pack for Hello Dolly.
   * WpCli.plugin.run(...);
   * ```sh
   * wp language plugin install hello-dolly nl_NL
   * ```
   * @example
   * // Uninstall the Dutch plugin language pack for Hello Dolly.
   * WpCli.plugin.run(...);
   * ```sh
   * wp language plugin uninstall hello-dolly nl_NL
   * ```
   * @example
   * // List installed plugin language packs for Hello Dolly.
   * WpCli.plugin.run(...);
   * ```sh
   * wp language plugin list hello-dolly --status=installed
   * ```
   */
  async plugin(
    plugin: string,
    language: `${string[0]}${string[0]}_${string[0]}${string[0]}`
  ): Promise<string> {
    const command = this.buildCommand(
      `language plugin install ${plugin} ${language}`,
      []
    );
    return this.execute<string>(command);
  }

  /**
   * Installs, activates, and manages core language packs.
   *
   * @example
   * // Install the Dutch core language pack.
   * WpCli.core.run(...);
   * ```sh
   * wp language core install nl_NL
   * ```
   * @example
   * // Activate the Dutch core language pack.
   * WpCli.core.run(...);
   * ```sh
   * wp site switch-language nl_NL
   * ```
   * @example
   * // Uninstall the Dutch core language pack.
   * WpCli.core.run(...);
   * ```sh
   * wp language core uninstall nl_NL
   * ```
   * @example
   * // List installed core language packs.
   * WpCli.core.run(...);
   * ```sh
   * wp language core list --status=installed
   * ```
   */
  async core(): Promise<string> {
    const command = this.buildCommand("language core", []);
    return this.execute<string>(command);
  }
}

class AdminCommand extends WpCliCommand {
  /**
   * Open /wp-admin/ in a browser.
   */
  async run(options?: AdminOptions): Promise<string> {
    const args: string[] = [];
    const command = this.buildCommand("admin", args, options);
    return this.execute<string>(command);
  }
}

class TransientCommand extends WpCliCommand {
  /**
   * Lists transients and their values.
   *
   * @example
   * // List all transients
   * WpCli.list.run(...);
   * ```sh
   * wp transient list
   * ```
   */
  async list(
    options: TransientListOptions & { format: "json" }
  ): Promise<WpTransientList[]>;
  async list(options?: Omit<TransientListOptions, "format">): Promise<string>;
  async list(
    options?: TransientListOptions
  ): Promise<string | WpTransientList[]> {
    const command = this.buildCommand("transient list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpTransientList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Update a nested value from a transient.
   */
  async patch(options: TransientPatchOptions): Promise<string> {
    const command = this.buildCommand("transient patch", [], options);
    return this.execute<string>(command);
  }

  /**
   * Determines the type of transients implementation.
   *
   * @example
   * WpCli.type.run(...);
   * ```sh
   * wp transient type
   * ```
   */
  async type(): Promise<string> {
    const command = this.buildCommand("transient type", []);
    return this.execute<string>(command);
  }

  /**
   * Get a nested value from a transient.
   */
  async pluck(options?: TransientPluckOptions): Promise<string> {
    const command = this.buildCommand("transient pluck", [], options);
    return this.execute<string>(command);
  }

  /**
   * Sets a transient value.
   *
   * @example
   * WpCli.set.run(...);
   * ```sh
   * wp transient set sample_key "test data" 3600
   * ```
   */
  async set(options?: TransientSetOptions): Promise<string> {
    const command = this.buildCommand("transient set", [], options);
    return this.execute<string>(command);
  }

  /**
   * Gets a transient value.
   *
   * @example
   * WpCli.get.run(...);
   * ```sh
   * wp transient get sample_key
   * ```
   * @example
   * WpCli.get.run(...);
   * ```sh
   * wp transient get random_key
   * ```
   */
  async get(options?: TransientGetOptions): Promise<string> {
    const command = this.buildCommand("transient get", [], options);
    return this.execute<string>(command);
  }

  /**
   * Deletes a transient value.
   *
   * @example
   * // Delete transient.
   * WpCli.delete.run(...);
   * ```sh
   * wp transient delete sample_key
   * ```
   * @example
   * // Delete expired transients.
   * WpCli.delete.run(...);
   * ```sh
   * wp transient delete --expired
   * ```
   * @example
   * // Delete expired site transients.
   * WpCli.delete.run(...);
   * ```sh
   * wp transient delete --expired --network
   * ```
   * @example
   * // Delete all transients.
   * WpCli.delete.run(...);
   * ```sh
   * wp transient delete --all
   * ```
   * @example
   * // Delete all site transients.
   * WpCli.delete.run(...);
   * ```sh
   * wp transient delete --all --network
   * ```
   * @example
   * // Delete all transients in a multisite.
   * WpCli.delete.run(...);
   * ```sh
   * wp transient delete --all --network && wp site list --field=url | xargs -n1 -I % wp --url=% transient delete --all
   * ```
   */
  async deleteDelete(options?: TransientDeleteOptions): Promise<string> {
    const command = this.buildCommand("transient delete", [], options);
    return this.execute<string>(command);
  }
}

class PackageCommand extends WpCliCommand {
  /**
   * Lists installed WP-CLI packages.
   *
   * @example
   * // List installed packages.
   * WpCli.list.run(...);
   * ```sh
   * wp package list
   * ```
   */
  async list(
    options: PackageListOptions & { format: "json" }
  ): Promise<WpPackageList[]>;
  async list(options?: Omit<PackageListOptions, "format">): Promise<string>;
  async list(options?: PackageListOptions): Promise<string | WpPackageList[]> {
    const command = this.buildCommand("package list", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpPackageList[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Uninstalls a WP-CLI package.
   *
   * @example
   * // Uninstall package.
   * WpCli.uninstall.run(...);
   * ```sh
   * wp package uninstall wp-cli/server-command
   * ```
   */
  async uninstall(options?: PackageUninstallOptions): Promise<string> {
    const command = this.buildCommand("package uninstall", [], options);
    return this.execute<string>(command);
  }

  /**
   * Updates all installed WP-CLI packages to their latest version.
   *
   * @example
   * WpCli.update.run(...);
   * ```sh
   * wp package update
   * ```
   */
  async update(): Promise<string> {
    const command = this.buildCommand("package update", []);
    return this.execute<string>(command);
  }

  /**
   * Gets the path to an installed WP-CLI package, or the package directory.
   *
   * @example
   * // Get package path.
   * WpCli.path.run(...);
   * ```sh
   * wp package path
   * ```
   * @example
   * // Get path to an installed package.
   * WpCli.path.run(...);
   * ```sh
   * wp package path wp-cli/server-command
   * ```
   */
  async path(): Promise<string> {
    const command = this.buildCommand("package path", []);
    return this.execute<string>(command);
  }

  /**
   * Browses WP-CLI packages available for installation.
   *
   * @example
   * WpCli.browse.run(...);
   * ```sh
   * wp package browse --format=yaml
   * ```
   */
  async browse(
    options: PackageBrowseOptions & { format: "json" }
  ): Promise<WpPackageBrowse[]>;
  async browse(options?: Omit<PackageBrowseOptions, "format">): Promise<string>;
  async browse(
    options?: PackageBrowseOptions
  ): Promise<string | WpPackageBrowse[]> {
    const command = this.buildCommand("package browse", [], options);
    if ((options as { format?: string })?.format === "json") {
      return this.execute<WpPackageBrowse[]>(command);
    }
    return this.execute<string>(command);
  }

  /**
   * Installs a WP-CLI package.
   *
   * @example
   * // Install a package hosted at a git URL.
   * WpCli.install.run(...);
   * ```sh
   * wp package install runcommand/hook
   * ```
   * @example
   * // Install the latest stable version.
   * WpCli.install.run(...);
   * ```sh
   * wp package install wp-cli/server-command:@stable
   * ```
   * @example
   * // Install a package hosted at a GitLab.com URL.
   * WpCli.install.run(...);
   * ```sh
   * wp package install https://gitlab.com/foo/wp-cli-bar-command.git
   * ```
   * @example
   * // Install a package in a .zip file.
   * WpCli.install.run(...);
   * ```sh
   * wp package install google-sitemap-generator-cli.zip
   * ```
   */
  async install(options?: PackageInstallOptions): Promise<string> {
    const command = this.buildCommand("package install", [], options);
    return this.execute<string>(command);
  }
}

class EvalCommand extends WpCliCommand {
  /**
   * Executes arbitrary PHP code.
   *
   * @example
   * // Display WordPress content directory.
   * WpCli.eval.run(...);
   * ```sh
   * wp eval 'echo WP_CONTENT_DIR;'
   * ```
   * @example
   * // Generate a random number.
   * WpCli.eval.run(...);
   * ```sh
   * wp eval 'echo rand();' --skip-wordpress
   * ```
   */
  async run(options?: EvalOptions): Promise<string> {
    const args: string[] = [];
    const command = this.buildCommand("eval", args, options);
    return this.execute<string>(command);
  }
}

class DistArchiveCommand extends WpCliCommand {
  /**
   * Create a distribution archive based on a project's .distignore file.
   */
  async run(options?: DistArchiveOptions): Promise<string> {
    const args: string[] = [];
    const command = this.buildCommand("dist-archive", args, options);
    return this.execute<string>(command);
  }
}

class CacheCommand extends WpCliCommand {
  /**
   * Decrements a value in the object cache.
   *
   * @example
   * // Decrease cache value.
   * WpCli.decr.run(...);
   * ```sh
   * wp cache decr my_key 2 my_group
   * ```
   */
  async decr(options: CacheDecrOptions): Promise<string> {
    const command = this.buildCommand("cache decr", [], options);
    return this.execute<string>(command);
  }

  /**
   * Adds a value to the object cache.
   *
   * @example
   * // Add cache.
   * WpCli.add.run(...);
   * ```sh
   * wp cache add my_key my_group my_value 300
   * ```
   */
  async add(options: CacheAddOptions): Promise<string> {
    const command = this.buildCommand("cache add", [], options);
    return this.execute<string>(command);
  }

  /**
   * Update a nested value from the cache.
   */
  async patch(options: CachePatchOptions): Promise<string> {
    const command = this.buildCommand("cache patch", [], options);
    return this.execute<string>(command);
  }

  /**
   * Removes all cache items in a group, if the object cache implementation supports it.
   *
   * @example
   * // Clear cache group.
   * WpCli.flushGroup.run(...);
   * ```sh
   * wp cache flush-group my_group
   * ```
   */
  async flushGroup(): Promise<string> {
    const command = this.buildCommand("cache flush-group", []);
    return this.execute<string>(command);
  }

  /**
   * Attempts to determine which object cache is being used.
   *
   * @example
   * // Check cache type.
   * WpCli.type.run(...);
   * ```sh
   * wp cache type
   * ```
   */
  async type(): Promise<string> {
    const command = this.buildCommand("cache type", []);
    return this.execute<string>(command);
  }

  /**
   * Get a nested value from the cache.
   */
  async pluck(options?: CachePluckOptions): Promise<string> {
    const command = this.buildCommand("cache pluck", [], options);
    return this.execute<string>(command);
  }

  /**
   * Sets a value to the object cache, regardless of whether it already exists.
   *
   * @example
   * // Set cache.
   * WpCli.set.run(...);
   * ```sh
   * wp cache set my_key my_value my_group 300
   * ```
   */
  async set(options: CacheSetOptions): Promise<string> {
    const command = this.buildCommand("cache set", [], options);
    return this.execute<string>(command);
  }

  /**
   * Determines whether the object cache implementation supports a particular feature.
   *
   * @example
   * // Check whether is add_multiple supported.
   * WpCli.supports.run(...);
   * ```sh
   * wp cache supports add_multiple
   * ```
   */
  async supports(): Promise<string> {
    const command = this.buildCommand("cache supports", []);
    return this.execute<string>(command);
  }

  /**
   * Gets a value from the object cache.
   *
   * @example
   * // Get cache.
   * WpCli.get.run(...);
   * ```sh
   * wp cache get my_key my_group
   * ```
   */
  async get(options: CacheGetOptions): Promise<string> {
    const command = this.buildCommand("cache get", [], options);
    return this.execute<string>(command);
  }

  /**
   * Flushes the object cache.
   *
   * @example
   * // Flush cache.
   * WpCli.flush.run(...);
   * ```sh
   * wp cache flush
   * ```
   */
  async flush(): Promise<string> {
    const command = this.buildCommand("cache flush", []);
    return this.execute<string>(command);
  }

  /**
   * Increments a value in the object cache.
   *
   * @example
   * // Increase cache value.
   * WpCli.incr.run(...);
   * ```sh
   * wp cache incr my_key 2 my_group
   * ```
   */
  async incr(options: CacheIncrOptions): Promise<string> {
    const command = this.buildCommand("cache incr", [], options);
    return this.execute<string>(command);
  }

  /**
   * Replaces a value in the object cache, if the value already exists.
   *
   * @example
   * // Replace cache.
   * WpCli.replace.run(...);
   * ```sh
   * wp cache replace my_key new_value my_group
   * ```
   */
  async replace(options: CacheReplaceOptions): Promise<string> {
    const command = this.buildCommand("cache replace", [], options);
    return this.execute<string>(command);
  }

  /**
   * Removes a value from the object cache.
   *
   * @example
   * // Delete cache.
   * WpCli.delete.run(...);
   * ```sh
   * wp cache delete my_key my_group
   * ```
   */
  async deleteDelete(options: CacheDeleteOptions): Promise<string> {
    const command = this.buildCommand("cache delete", [], options);
    return this.execute<string>(command);
  }
}

class HelpCommand extends WpCliCommand {
  /**
   * Gets help on WP-CLI, or on a specific command.
   */
  async run(options?: HelpOptions): Promise<string> {
    const args: string[] = [];
    const command = this.buildCommand("help", args, options);
    return this.execute<string>(command);
  }
}

// #endregion

/**
 * Main WP-CLI API Wrapper Class
 * This class provides a structured and type-safe way to interact with wp-cli.
 */
export class WpCliApi {
  public readonly theme: ThemeCommand;
  public readonly postType: PostTypeCommand;
  public readonly searchReplace: SearchReplaceCommand;
  public readonly plugin: PluginCommand;
  public readonly widget: WidgetCommand;
  public readonly post: PostCommand;
  public readonly config: ConfigCommand;
  public readonly evalFile: EvalFileCommand;
  public readonly media: MediaCommand;
  public readonly db: DbCommand;
  public readonly profile: ProfileCommand;
  public readonly network: NetworkCommand;
  public readonly menu: MenuCommand;
  public readonly import_: ImportCommand;
  public readonly core: CoreCommand;
  public readonly cli: CliCommand;
  public readonly user: UserCommand;
  public readonly shell: ShellCommand;
  public readonly rewrite: RewriteCommand;
  public readonly term: TermCommand;
  public readonly comment: CommentCommand;
  public readonly maintenanceMode: MaintenanceModeCommand;
  public readonly taxonomy: TaxonomyCommand;
  public readonly export: ExportCommand;
  public readonly sidebar: SidebarCommand;
  public readonly scaffold: ScaffoldCommand;
  public readonly superAdmin: SuperAdminCommand;
  public readonly cap: CapCommand;
  public readonly role: RoleCommand;
  public readonly option: OptionCommand;
  public readonly site: SiteCommand;
  public readonly embed: EmbedCommand;
  public readonly cron: CronCommand;
  public readonly find: FindCommand;
  public readonly server: ServerCommand;
  public readonly i18n: I18nCommand;
  public readonly language: LanguageCommand;
  public readonly admin: AdminCommand;
  public readonly transient: TransientCommand;
  public readonly package: PackageCommand;
  public readonly eval: EvalCommand;
  public readonly distArchive: DistArchiveCommand;
  public readonly cache: CacheCommand;
  public readonly help: HelpCommand;

  constructor(public readonly instanceId?: number) {
    this.theme = new ThemeCommand(instanceId);
    this.postType = new PostTypeCommand(instanceId);
    this.searchReplace = new SearchReplaceCommand(instanceId);
    this.plugin = new PluginCommand(instanceId);
    this.widget = new WidgetCommand(instanceId);
    this.post = new PostCommand(instanceId);
    this.config = new ConfigCommand(instanceId);
    this.evalFile = new EvalFileCommand(instanceId);
    this.media = new MediaCommand(instanceId);
    this.db = new DbCommand(instanceId);
    this.profile = new ProfileCommand(instanceId);
    this.network = new NetworkCommand(instanceId);
    this.menu = new MenuCommand(instanceId);
    this.import_ = new ImportCommand(instanceId);
    this.core = new CoreCommand(instanceId);
    this.cli = new CliCommand(instanceId);
    this.user = new UserCommand(instanceId);
    this.shell = new ShellCommand(instanceId);
    this.rewrite = new RewriteCommand(instanceId);
    this.term = new TermCommand(instanceId);
    this.comment = new CommentCommand(instanceId);
    this.maintenanceMode = new MaintenanceModeCommand(instanceId);
    this.taxonomy = new TaxonomyCommand(instanceId);
    this.export = new ExportCommand(instanceId);
    this.sidebar = new SidebarCommand(instanceId);
    this.scaffold = new ScaffoldCommand(instanceId);
    this.superAdmin = new SuperAdminCommand(instanceId);
    this.cap = new CapCommand(instanceId);
    this.role = new RoleCommand(instanceId);
    this.option = new OptionCommand(instanceId);
    this.site = new SiteCommand(instanceId);
    this.embed = new EmbedCommand(instanceId);
    this.cron = new CronCommand(instanceId);
    this.find = new FindCommand(instanceId);
    this.server = new ServerCommand(instanceId);
    this.i18n = new I18nCommand(instanceId);
    this.language = new LanguageCommand(instanceId);
    this.admin = new AdminCommand(instanceId);
    this.transient = new TransientCommand(instanceId);
    this.package = new PackageCommand(instanceId);
    this.eval = new EvalCommand(instanceId);
    this.distArchive = new DistArchiveCommand(instanceId);
    this.cache = new CacheCommand(instanceId);
    this.help = new HelpCommand(instanceId);
  }
}

/**
 * Singleton instance of the WpCliApi.
 *
 * @example
 * import WpCliApi from './path/to/this/file';
 *
 * async function getPlugins() {
 * const WpCli = new WpCliApi(2);
 * const plugins = await WpCli.plugin.list({ status: 'active', format: 'json' });
 * // `plugins` is now strongly typed
 * plugins.forEach(plugin => console.log(plugin.name, plugin.version));
 * }
 */
export default WpCliApi;
