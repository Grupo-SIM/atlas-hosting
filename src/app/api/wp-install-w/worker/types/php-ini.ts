/**
 * PHP Configuration Interface based on php.ini settings
 */
export interface PhpConfiguration {
  // Language Options
  /** Enable the PHP scripting language engine under Apache */
  engine: boolean;

  /** Allow ASP-style <% %> tags */
  asp_tags: boolean;

  /** The number of significant digits displayed in floating point numbers */
  precision: number;

  /** Enforce year 2000 compliance (will cause problems with non-compliant browsers) */
  y2k_compliance: boolean;

  /** Output buffering mechanism for controlling output data */
  output_buffering: number | boolean;

  /** Redirect all output to a function */
  output_handler?: string;

  /** Transparent output compression using the zlib library */
  zlib_output_compression: boolean | number;

  /** Compression level for zlib output compression */
  zlib_output_compression_level: number;

  /** Implicit flush tells PHP to flush output automatically after every output block */
  implicit_flush: boolean;

  /** The unserialize callback function for undefined classes */
  unserialize_callback_func?: string;

  /** Precision for serializing floats & doubles */
  serialize_precision: number;

  /** Enable/disable warnings for passing values by reference at function call time */
  allow_call_time_pass_reference: boolean;

  // Safe Mode (deprecated)
  /** Enable Safe Mode */
  safe_mode: boolean;

  /** Relax UID compare to GID compare in Safe Mode */
  safe_mode_gid: boolean;

  /** Directory for bypassing UID/GID checks in Safe Mode */
  safe_mode_include_dir?: string;

  /** Directory for allowed executables in Safe Mode */
  safe_mode_exec_dir?: string;

  /** Allowed environment variable prefixes in Safe Mode */
  safe_mode_allowed_env_vars: string;

  /** Protected environment variables in Safe Mode */
  safe_mode_protected_env_vars: string;

  // File System
  /** Limit file operations to defined directory and below */
  open_basedir?: string;

  /** Disable certain functions for security reasons */
  disable_functions: string;

  /** Disable certain classes for security reasons */
  disable_classes: string;

  // Resource Limits
  /** Maximum execution time of each script, in seconds */
  max_execution_time: number;

  /** Maximum time for parsing request data */
  max_input_time: number;

  /** Maximum input variable nesting level */
  max_input_nesting_level: number;

  /** Maximum number of input variables */
  max_input_vars: number;

  /** Maximum memory a script may consume */
  memory_limit: string;

  // Error Handling and Logging
  /** Which errors, warnings and notices to report */
  error_reporting: number;

  /** Whether to display errors */
  display_errors: boolean;

  /** Display errors during PHP's startup sequence */
  display_startup_errors: boolean;

  /** Log errors to locations such as server log, STDERR, or file */
  log_errors: boolean;

  /** Maximum length of log_errors */
  log_errors_max_len: number;

  /** Do not log repeated messages */
  ignore_repeated_errors: boolean;

  /** Ignore source when ignoring repeated messages */
  ignore_repeated_source: boolean;

  /** Show memory leaks in debug compile */
  report_memleaks: boolean;

  /** Store last error/warning message in $php_errormsg */
  track_errors: boolean;

  /** Insert HTML links in error messages */
  html_errors: boolean;

  /** Base URL for error documentation links */
  docref_root?: string;

  /** File extension for error documentation */
  docref_ext?: string;

  /** String to output before error message */
  error_prepend_string?: string;

  /** String to output after error message */
  error_append_string?: string;

  /** Log errors to specified file */
  error_log?: string;

  // Data Handling
  /** Separator for PHP generated URLs */
  arg_separator_output: string;

  /** Separator for parsing input URLs */
  arg_separator_input: string;

  /** Which super global arrays are registered */
  variables_order: string;

  /** Order for REQUEST super global registration */
  request_order: string;

  /** Register EGPCS variables as global variables */
  register_globals: boolean;

  /** Register deprecated long $HTTP_*_VARS variables */
  register_long_arrays: boolean;

  /** Register $argv & $argc on each run */
  register_argc_argv: boolean;

  /** Create ENV, REQUEST and SERVER variables just in time */
  auto_globals_jit: boolean;

  /** Maximum size of POST data */
  post_max_size: string;

  /** Magic quotes for GET, POST, COOKIE and ENV data */
  magic_quotes_gpc: boolean;

  /** Magic quotes for runtime-generated data */
  magic_quotes_runtime: boolean;

  /** Use Sybase-style magic quotes */
  magic_quotes_sybase: boolean;

  /** Automatically prepend files before PHP document */
  auto_prepend_file?: string;

  /** Automatically append files after PHP document */
  auto_append_file?: string;

  /** Default MIME type */
  default_mimetype: string;

  /** Default character set */
  default_charset?: string;

  // Paths and Directories
  /** Paths for include/require */
  include_path: string;

  /** Root of PHP pages */
  doc_root?: string;

  /** Directory for /~username */
  user_dir?: string;

  /** Directory for loadable extensions */
  extension_dir: string;

  /** Enable the dl() function */
  enable_dl: boolean;

  // CGI
  /** Force redirect for CGI security */
  cgi_force_redirect: boolean;

  /** Force CGI to send Status: 200 */
  cgi_nph: boolean;

  /** Environment variable for redirect status */
  cgi_redirect_status_env?: string;

  /** Fix PATH_INFO/PATH_TRANSLATED for CGI */
  cgi_fix_pathinfo: boolean;

  /** Impersonate security tokens under IIS */
  fastcgi_impersonate: boolean;

  /** Disable logging through FastCGI connection */
  fastcgi_logging: boolean;

  /** HTTP response header type */
  cgi_rfc2616_headers: boolean;

  // File Uploads
  /** Allow HTTP file uploads */
  file_uploads: boolean;

  /** Temporary directory for uploaded files */
  upload_tmp_dir?: string;

  /** Maximum size for uploaded files */
  upload_max_filesize: string;

  /** Maximum number of files per upload */
  max_file_uploads: number;

  // Fopen Wrappers
  /** Allow URLs as files */
  allow_url_fopen: boolean;

  /** Allow include/require of URLs */
  allow_url_include: boolean;

  /** Anonymous FTP password */
  from?: string;

  /** User-Agent string */
  user_agent?: string;

  /** Default timeout for socket streams */
  default_socket_timeout: number;

  /** Auto-detect line endings for cross-platform files */
  auto_detect_line_endings: boolean;

  // Dynamic Extensions
  /** List of loaded extensions */
  extensions?: string[];

  // Date
  /** Default timezone */
  'date.timezone'?: string;

  /** Default latitude */
  'date.default_latitude'?: number;

  /** Default longitude */
  'date.default_longitude'?: number;

  /** Sunrise zenith */
  'date.sunrise_zenith'?: number;

  /** Sunset zenith */
  'date.sunset_zenith'?: number;

  // Filter
  /** Default filter */
  'filter.default'?: string;

  /** Default filter flags */
  'filter.default_flags'?: string;

  // Mail Function
  /** SMTP server */
  SMTP?: string;

  /** SMTP port */
  smtp_port?: number;

  /** From address for Windows */
  sendmail_from?: string;

  /** Path to sendmail program */
  sendmail_path?: string;

  /** Force extra parameters for mail() */
  mail_force_extra_parameters?: string;

  /** Add X-PHP-Originating-Script header */
  mail_add_x_header: boolean;

  /** Log all mail() calls */
  mail_log?: string;

  // SQL
  /** SQL safe mode */
  'sql.safe_mode': boolean;

  // MySQL
  /** Allow local file access with LOAD DATA */
  'mysql.allow_local_infile': boolean;

  /** Allow persistent MySQL connections */
  'mysql.allow_persistent': boolean;

  /** MySQL cache size */
  'mysql.cache_size': number;

  /** Maximum persistent MySQL connections */
  'mysql.max_persistent': number;

  /** Maximum MySQL connections */
  'mysql.max_links': number;

  /** Default MySQL port */
  'mysql.default_port': number;

  /** Default MySQL socket */
  'mysql.default_socket'?: string;

  /** Default MySQL host */
  'mysql.default_host'?: string;

  /** Default MySQL user */
  'mysql.default_user'?: string;

  /** Default MySQL password */
  'mysql.default_password'?: string;

  /** MySQL connect timeout */
  'mysql.connect_timeout': number;

  /** MySQL trace mode */
  'mysql.trace_mode': boolean;

  // MySQLi
  /** Maximum persistent MySQLi connections */
  'mysqli.max_persistent': number;

  /** Allow local file access with MySQLi LOAD DATA */
  'mysqli.allow_local_infile': boolean;

  /** Allow persistent MySQLi connections */
  'mysqli.allow_persistent': boolean;

  /** Maximum MySQLi connections */
  'mysqli.max_links': number;

  /** MySQLi cache size */
  'mysqli.cache_size': number;

  /** Default MySQLi port */
  'mysqli.default_port': number;

  /** Default MySQLi socket */
  'mysqli.default_socket'?: string;

  /** Default MySQLi host */
  'mysqli.default_host'?: string;

  /** Default MySQLi user */
  'mysqli.default_user'?: string;

  /** Default MySQLi password */
  'mysqli.default_pw'?: string;

  // Session
  /** Session save handler */
  'session.save_handler': string;

  /** Session save path */
  'session.save_path'?: string;

  /** Use cookies for sessions */
  'session.use_cookies': boolean;

  /** Use only cookies for sessions */
  'session.use_only_cookies': boolean;

  /** Session name */
  'session.name': string;

  /** Auto-start sessions */
  'session.auto_start': boolean;

  /** Session cookie lifetime */
  'session.cookie_lifetime': number;

  /** Session cookie path */
  'session.cookie_path': string;

  /** Session cookie domain */
  'session.cookie_domain'?: string;

  /** Session cookie httpOnly flag */
  'session.cookie_httponly': boolean;

  /** Session serialize handler */
  'session.serialize_handler': string;

  /** Session garbage collection probability */
  'session.gc_probability': number;

  /** Session garbage collection divisor */
  'session.gc_divisor': number;

  /** Session garbage collection max lifetime */
  'session.gc_maxlifetime': number;

  /** Session referer check */
  'session.referer_check'?: string;

  /** Session entropy length */
  'session.entropy_length': number;

  /** Session entropy file */
  'session.entropy_file'?: string;

  /** Session cache limiter */
  'session.cache_limiter': string;

  /** Session cache expire */
  'session.cache_expire': number;

  /** Use transparent session ID */
  'session.use_trans_sid': boolean;

  /** Session hash function */
  'session.hash_function': number;

  /** Session hash bits per character */
  'session.hash_bits_per_character': number;
}