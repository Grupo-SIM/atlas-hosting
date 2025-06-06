/**
 * Shell options for SSH access
 */
type ShellType = 
  | "/bin/false"
  | "/bin/sh" 
  | "/bin/bash"
  | "/usr/bin/bash"
  | "/bin/rbash"
  | "/usr/bin/rbash"
  | "/usr/bin/sh"
  | "/bin/dash"
  | "/usr/bin/dash"
  | "/usr/bin/tmux"
  | "/usr/bin/screen"
  | "/opt/psa/bin/chrootsh";

/**
 * PHP handler options
 */
type PhpHandlerType =
  | "cgi"
  | "fastcgi"
  | "fpm"
  | "fpm-dedicated"
  | "module"
  | "plesk-php70-cgi"
  | "plesk-php70-fastcgi"
  | "plesk-php70-fpm"
  | "plesk-php71-cgi"
  | "plesk-php71-fastcgi"
  | "plesk-php71-fpm"
  | "plesk-php72-cgi"
  | "plesk-php72-fastcgi"
  | "plesk-php72-fpm"
  | "plesk-php73-cgi"
  | "plesk-php73-fastcgi"
  | "plesk-php73-fpm"
  | "plesk-php73-fpm-dedicated"
  | "plesk-php74-cgi"
  | "plesk-php74-fastcgi"
  | "plesk-php74-fpm"
  | "plesk-php74-fpm-dedicated"
  | "plesk-php80-cgi"
  | "plesk-php80-fastcgi"
  | "plesk-php80-fpm"
  | "plesk-php80-fpm-dedicated"
  | "plesk-php81-cgi"
  | "plesk-php81-fastcgi"
  | "plesk-php81-fpm"
  | "plesk-php81-fpm-dedicated"
  | "plesk-php82-cgi"
  | "plesk-php82-fastcgi"
  | "plesk-php82-fpm"
  | "plesk-php82-fpm-dedicated"
  | "plesk-php83-cgi"
  | "plesk-php83-fastcgi"
  | "plesk-php83-fpm"
  | "plesk-php83-fpm-dedicated"
  | "plesk-php84-cgi"
  | "plesk-php84-fastcgi"
  | "plesk-php84-fpm"
  | "plesk-php84-fpm-dedicated";

/**
 * CGI mode options
 */
type CgiModeType = "webspace" | "www-root";

/**
 * SEO redirect options
 */
type SeoRedirectType = "none" | "non-www" | "www";

/**
 * Website status options
 */
type WebsiteStatusType = "disabled" | "suspended" | "active";

/**
 * WAF rule engine options
 */
type WafRuleEngineType = "on" | "detection-only" | "off";

/**
 * Web statistics options
 */
type WebstatType = "none" | "webalizer" | "awstats";

/**
 * Hosting descriptor properties interface
 */
export interface HostingDescriptor {
  /** FTP Username */
  ftp_login: string;

  /** FTP Password */
  ftp_password: string;

  /** Hard disk quota */
  ftp_quota: number;

  /** SSH access to the server shell under the subscription's system user */
  shell: ShellType;

  /** SSL/TLS support */
  ssl: boolean;

  /** run PHP as */
  php_handler_id: PhpHandlerType;

  /** WWW Root Directory */
  www_root: string;

  /** cgi-bin directory is located in */
  cgi_mode: CgiModeType;

  /** Configure the preferred domain as */
  "seo-redirect": SeoRedirectType;

  /** MIME types */
  "apache-mime-types": string;

  /** Apache handlers */
  "apache-handlers": string;

  /** Deny access to the site for specified hosts and networks */
  "ip-deny": string;

  /** Allow access to the site for specified hosts and networks (excluding the denied ones) */
  "ip-allow": string;

  /** Index files */
  "apache-directory-index": string;

  /** The mode when Apache handles both static and dynamic content, while nginx only passes HTTP requests and responses without modification. */
  "nginx-transparent-mode": boolean;

  /** Serve static files directly by nginx */
  "nginx-serve-static": boolean;

  /** Static files extensions which must be handled by nginx */
  "nginx-static-extensions": string;

  /** Process PHP files by nginx */
  "nginx-serve-php": boolean;

  /** Status of websites in suspended subscriptions */
  unpaid_website_status: WebsiteStatusType;

  /** Web application firewall mode */
  "waf-rule-engine": WafRuleEngineType;

  /** PHP memory limit */
  memory_limit: string;

  /** PHP max execution time */
  max_execution_time: string;

  /** PHP max input time */
  max_input_time: string;

  /** PHP post max size */
  post_max_size: string;

  /** PHP upload max filesize - VERY IMPORTANT FOR ELEMENTOR */
  upload_max_filesize: string;

  /** OPcache enable */
  "opcache.enable": string;

  /** WinCache OC enabled */
  "wincache.ocenabled": string;

  /** APC enabled */
  "apc.enabled": string;

  /** XCache cacher */
  "xcache.cacher": string;

  /** PHP disabled functions */
  disable_functions: string;

  /** PHP safe mode */
  safe_mode: string;

  /** PHP safe mode include directory */
  safe_mode_include_dir: string;

  /** PHP safe mode exec directory */
  safe_mode_exec_dir: string;

  /** PHP include path */
  include_path: string;

  /** PHP session save path */
  "session.save_path": string;

  /** PHP mail force extra parameters */
  "mail.force_extra_parameters": string;

  /** PHP register globals */
  register_globals: string;

  /** PHP open basedir */
  open_basedir: string;

  /** PHP error reporting */
  error_reporting: string;

  /** PHP display errors */
  display_errors: string;

  /** PHP log errors */
  log_errors: string;

  /** PHP allow URL fopen */
  allow_url_fopen: string;

  /** PHP file uploads */
  file_uploads: string;

  /** PHP short open tag */
  short_open_tag: string;

  /** PHP magic quotes GPC */
  magic_quotes_gpc: string;

  /** FastCGI enable */
  enableFastcgi: string;

  /** FastCGI max instances */
  maxInstances: string;

  /** FastCGI activity timeout */
  activityTimeout: string;

  /** FastCGI request timeout */
  requestTimeout: string;

  /** FastCGI instance max requests */
  instanceMaxRequests: string;

  /** FastCGI queue length */
  queueLength: string;

  /** FastCGI rapid fails per minute */
  rapidFailsPerMinute: string;

  /** PHP-FPM max children */
  "pm.max_children": string;

  /** PHP-FPM max requests */
  "pm.max_requests": string;

  /** PHP-FPM process manager */
  pm: string;

  /** PHP-FPM start servers */
  "pm.start_servers": string;

  /** PHP-FPM min spare servers */
  "pm.min_spare_servers": string;

  /** PHP-FPM max spare servers */
  "pm.max_spare_servers": string;

  /** Additional directives */
  "additional-directives": string;

  /** Web statistics */
  webstat: WebstatType;

  /** Custom error documents */
  errdocs: boolean;

  /** SSI support */
  ssi: boolean;

  /** PHP support */
  php: boolean;

  /** CGI support */
  cgi: boolean;

  /** Perl support */
  perl: boolean;

  /** Python support */
  python: boolean;

  /** FastCGI support */
  fastcgi: boolean;

  /** Protect access to web statistics with the user's FTP username and password */
  webstat_protected: boolean;

  /** SSL certificate name */
  certificate_name: string;
}
