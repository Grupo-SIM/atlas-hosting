Usage: subscription  command <subscription_name> [options]

    Available commands:
    --create or -c <subscription_name> Creates a subscription.
    --update or -u <subscription_name> Updates an existing subscription.
    --remove or -r <subscription_name> Removes an existing subscription.
    --info or -i  <subscription_name>  Retrieves information on a
                                       subscription.
    --suspend   <subscription_name>    Suspends the domain.
    --webspace-on <subscription_name>  Activates a whole subscription.
    --webspace-off <subscription_name> Suspends a whole subscription.
    --lock-subscription <subscription_name>
                                       Locks the subscription for syncing,
                                       the subscription properties will not
                                       change when an associated plan is
                                       modified.
    --unlock-subscription <subscription_name>
                                       Unlocks the subscription and enables
                                       synchronization with the associated
                                       service plans.
    --no-subscription <subscription_name>
                                       Unbinds the subscription from the
                                       associated service plans and makes it
                                       custom.
    --switch-subscription <subscription_name>
                                       Associates the subscription with the
                                       specified hosting plan.
    --sync-subscription <subscription_name>
                                       Synchronizes a subscription with the
                                       associated plans.
    --add-subscription <subscription_name>
                                       Associates the subscription with the
                                       specified hosting plan add-on.
    --remove-subscription <subscription_name>
                                       Removes the subscription association
                                       with the specified hosting plan
                                       add-on.
    --change-owner <subscription_name> Changes a subscription owner.
    --help or -h                       Displays this help page.
    --list or -l                       Displays the list of subscriptions.
    --merge    <subscription_name>     Merges a subscription into another
                                       subscription specified with the
                                       \"-webspace-name\" option.
    --shells or -s                     Displays the list of available system
                                       shells.
    --add-aps-filter-item <subscription_name>
                                       Adds an APS applications filter item.
    --remove-aps-filter-item <subscription_name>
                                       Removes an APS applications filter
                                       item.
    --disable-aps-filter <subscription_name>
                                       Disables the APS applications filter
                                       and removes all its items.
    --enable-aps-filter <subscription_name>
                                       Enables the APS applications filter
                                       for the specified hosting plan or
                                       subscription.
    --show-aps-filter-info <subscription_name>
                                       Shows information on the active APS
                                       applications filter.
    --add-custom-plan-item <subscription_name>
                                       Adds a hosting plan item for an
                                       additional service.
    --remove-custom-plan-item <subscription_name>
                                       Removes a service plan item.
    --remove-all-custom-plan-items <subscription_name>
                                       Removes all service plan items.
    --show-custom-plan-items <subscription_name>
                                       Shows a list of service plan items.
    --update-php-settings <subscription_name>
                                       Updates PHP settings.
    --show-php-settings <subscription_name>
                                       Displays the current PHP settings.
    --update-web-server-settings <subscription_name>
                                       Updates the web server settings.
    --show-web-server-settings <subscription_name>
                                       Shows the current web server settings.
    --update-web-app-firewall <subscription_name>
                                       Updates the web application firewall
                                       settings.
    --show-web-app-firewall <subscription_name>
                                       Shows the current web application
                                       firewall settings.

    Available options:
    -new_name   <subscription_name>    Specifies a new subscription name (may
                                       be used only with \"update\" command).
    -dns               <true|false>    Switches on/off the domain DNS zone
                                       (default: DNS template status).
    -www               <true|false>    Adds www prefix (default: true).
    -hosting           <true|false>    Switches on/off web hosting for domain
                                       (default: false).
    -hst_type          <phys|std|frm>  Sets up the specified hosting type
                                       (default: phys).
    -http_code         <301|302>       Specifies the HTTP response status
                                       code to be used for standard
                                       forwarding.
    -target_url        <URL>           Sets up target URL (required if
                                       hst_type is \"std\" or \"frm\").
    -service-plan      <name>          Specifies service plan for
                                       subscription creation (can be used
                                       only with the \"--create\" or
                                       \"--*-subsription\" command).
    -force                             Forces creating subscription to the
                                       specified hosting plan even if the
                                       actual system state does not
                                       correspond to the plan properties.
    -force-lock                        Forces creating the subscription even
                                       if the actual system state does not
                                       correspond to the service plan
                                       properties. This will create the
                                       subscription and lock it for syncing.
    -ip <IP address>[,<IP address>,..] Sets list of IPv4 and IPv6 addresses.
    -mail-service-ip <IP address>[,<IP address>,..]
                                       Sets list of IPv4 and IPv6 addresses.
    -login             <login>         Username of system user account
                                       associated with the subscription
                                       (required if web hosting is
                                       configured)
    -passwd            <password>      Password of system user account
                                       associated with the subscription (no
                                       password is set by default)
    -creation-date     <YYYY-MM-DD>    Specifies arbitrary creation date
    -www-root          <path>          Specifies website home directory
                                       (relative to the subscription root).
    -webspace-name <subscription_name> Specifies the name of the target
                                       subscription (the same as the name of
                                       the main domain in the subscription).
    -parent-domain-name <parent_domain_name>
                                       Use to specify the parent domain when
                                       creating a subdomain
    -hard_quota  <number>[B|K|M|G|T]   hard disk quota (0 for unlimited)
    -ssi               <true|false>    SSI support (default: false)
    -php               <true|false>    PHP support (default: false)
    -php_handler_id  <php handler id>  Associates the PHP handler with the
                                       site. Specify the handler's identifier
                                       (default: cgi).
    -php_handler_type <php type> [deprecated] use php_handler_id
                                       PHP support mode (default: cgi)
    -php_safe_mode     <true|false>    PHP safe mode (default: false)
                                       [deprecated]
    -cgi               <true|false>    CGI support (default: false)
    -cgi-mode   <webspace|www-root>    cgi-bin directory placement mode
                                       (default: www-root)
    -perl              <true|false>    Perl support (default: false)
    -asp               <true|false>    ASP support (default: false)
    -python            <true|false>    Python support (default: false)
    -fastcgi           <true|false>    FastCGI support (default: false)
    -ssl               <true|false>    SSL/TLS support (default: true)
    -ssl-redirect      <true|false>    Redirection to HTTPS (default: true)
    -err_docs          <true|false>    Custom error documents support
                                       (default: false)
    -log-rotate        <true|false>    Log rotation status (default: true)
    -log-bysize   <number>[B|K|M|G]    Log rotation by size in bytes
    -log-bytime <daily|weekly|monthly> Enables log rotation by time (default:
                                       daily)
    -log-max-num-files <number>        Maximum number of log file instances
                                       (default: 3)
    -log-compress      <true|false>    Log files compression (default: true)
    -log-email         <email>         Switches on sending log files to email
    -owner             <login>         Specifies login of an existing user to
                                       whom the subscription should belong
                                       (required for domain creation and
                                       domain owner change, default: admin).
    -vendor            <login>         Specifies the login of the
                                       subscription provider - an existing
                                       user (admin or reseller) whose
                                       resources will be used.
    -mail_service <true|false|disabled>
                                       Switches on/off the mail service
                                       (default: true)
    -mail_service_node_ip <IP address | local>
                                       Specifies a service node which will
                                       provide mail services for a
                                       subscription. Allowed values: IP
                                       address or \"local\" if the service is
                                       provided by the Plesk server.
    -maillist_service  <true|false>    Turns on/off the mailing list service
                                       (default: false)
    -mail_autodiscover <true|false>    Switches mail autodiscover on/off
                                       (default: true).
    -mail_dkim         <true|false>    Switches signing outgoing mail
                                       messages using DKIM on/off (default:
                                       true if mail service is enabled and
                                       DNS type is master).
    -notify            <true|false>    Switches on/off notification of domain
                                       creation
    -map_ip <IP address>[,<IP address>]
                                       Specifies new IP addresses that should
                                       be assigned to a subscription after a
                                       subscriber is changed.
    -seo-redirect  <non-www|www|none>  Turns on the search engine-friendly
                                       HTTP 301 redirection. Use 'non-www' to
                                       redirect from www.domain to domain,
                                       'www' to redirect from domain to
                                       www.domain, and 'none' to turn off the
                                       redirection (default: non-www).
    -unpaid-website-status <disabled|suspended|active>
                                       Sets the status of websites if the
                                       subscription is suspended (default:
                                       suspended).
    -description       <string>        Specifies a description of the
                                       subscription to be displayed in Plesk.
    -admin-description <string>        Specifies a description of the
                                       subscription for the administrator. It
                                       is displayed in Plesk only to the
                                       administrator.
    -reseller-description   <string>   Specifies a description of the
                                       subscription for the reseller. It is
                                       displayed in Plesk to the reseller and
                                       administrator.
    -shell     <shell_name|false>      The shell that a subscriber can use
                                       for SSH access to the server. Use the
                                       --shells command to see available
                                       shells
    -webstat <none|awstats|webalizer>  Statistics support (default: none)
    -webstat-protdir-access <true|false>
                                       Allows accessing web statistics
                                       through the password protected
                                       directory \"/plesk-stat/\" (default:
                                       true)
    -certificate-name <SSL certificate name>
                                       SSL/TLS certificate name
    -empty-document-root <true|false>  Creates a domain with the document
                                       root directory empty (skips promo
                                       pages creation).
    -aps-filter-item-name  <name|uri>  Specifies identifier of APS
                                       applications filter item: whether the
                                       filtered app is identified by name or
                                       URI.
    -aps-filter-item-value   <value>   Specifies the actual name or URI of
                                       the filtered APS app.
    -custom-plan-item-name   <name>    Service plan item name.
    -settings          <filename>      Sets the path to the file with PHP
                                       settings.
    -additional-settings  <filename>   Sets the path to the file with
                                       additional PHP directives.
    -apache-mime-types <value>         Sets MIME types for the specified
                                       website replacing the currently
                                       configured MIME types. For example:
                                       'text/plain .txt image/jpeg .jpeg'.
                                       Applies to:
                                       --update-web-server-settings

    -apache-handlers   <value>         Sets Apache handlers for the specified
                                       website. For example: 'php-script
                                       .html cgi-script .cgi'.
                                       Applies to:
                                       --update-web-server-settings

    -ip-allow          <value>         Sets a list of IP addresses that will
                                       be allowed access to the specified
                                       website. Use spaces to separate IP
                                       addresses. For example:
                                       '192.168.0.0/16 10.1.1.21'.
                                       Applies to:
                                       --update-web-server-settings

    -ip-deny           <value>         Sets a list of IP addresses that will
                                       be denied access to the specified
                                       website. Use spaces to separate IP
                                       addresses. For example: '10.1.0.0/16
                                       192.168.1.110'.
                                       Applies to:
                                       --update-web-server-settings

    -apache-directory-index  <value>   Sets index pages for the specified
                                       website. For example: 'index.html
                                       index.htm index.text
                                       /cgi-bin/index.pl'.
                                       Applies to:
                                       --update-web-server-settings

    -apache-restrict-follow-sym-links <value>
                                       Restricts the ability to follow
                                       symbolic links.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-proxy-mode  <value>         Turns on/off proxy mode for the nginx
                                       reverse proxy server.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-transparent-mode  <value>   Turns on/off transparent mode for the
                                       nginx reverse proxy server. In this
                                       mode, Apache handles both static and
                                       dynamic content, while nginx only
                                       passes HTTP requests and responses
                                       without modification.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-serve-static    <value>     Turns on/off serving static content by
                                       the nginx reverse proxy server.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-static-extensions  <value>  Sets static files extensions that
                                       should be served directly by nginx. If
                                       you specify an empty value, the static
                                       files extensions from the default
                                       nginx configuration
                                       (/var/www/vhosts/domain1.tld/.plesk/conf/last_nginx.conf)
                                       will be used. Use this option with the
                                       -nginx-serve-static command.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-serve-php   <value>         Turns on/off processing PHP files by
                                       the nginx reverse proxy server.
                                       Applies to:
                                       --update-web-server-settings

    -web-server-expires    <value>     Sets \"Expires\" response headers. The
                                       time is computed as a sum of the
                                       request time and the specified in the
                                       directive. For example: 86400 (1 day)
                                       Applies to:
                                       --update-web-server-settings

    -web-server-expires-static-only <value>
                                       Turns on/off response with \"Expires\"
                                       headers for static files only.
                                       Applies to:
                                       --update-web-server-settings

    -web-server-headers    <value>     Sets a list of additional HTTP
                                       response headers.
                                       Applies to:
                                       --update-web-server-settings

    -add-web-server-header   <value>   Adds a header to the list of
                                       additional HTTP response headers.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-cache-enabled    <value>    Enable nginx caching. Caching may
                                       reduce website response time and
                                       server load, but should be used with
                                       care.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-cache-size  <value>         Cache size (in bytes).
                                       Applies to:
                                       --update-web-server-settings

    -nginx-cache-timeout    <value>    Cache timeout (in seconds).
                                       Applies to:
                                       --update-web-server-settings

    -nginx-cache-key   <value>         Cache key.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-cache-cookies    <value>    Cache requests with cookies.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-cache-bypass-locations <value>
                                       Disable caching for locations.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-cache-bypass-header-nocache <value>
                                       Bypass cache when HTTP no-cache
                                       headers are received in request.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-cache-bypass-header-auth <value>
                                       Bypass cache when HTTP authorization
                                       headers are received in request.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-cache-bypass-get-nocache <value>
                                       Bypass cache when GET nocache
                                       parameter is received in request.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-cache-use-stale-5xx <value> Return stale cached records when
                                       upstream returns 5xx server error.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-cache-use-stale-4xx <value> Return stale cached records when
                                       upstream returns 4xx client error.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-cache-use-stale-updating <value>
                                       Return stale cached records when cache
                                       is being updated.
                                       Applies to:
                                       --update-web-server-settings

    -nginx-client-max-body-size <value>
                                       Requests with body above the limit (in
                                       bytes) will be discarded with HTTP 413
                                       Payload Too Large.
                                       Applies to:
                                       --update-web-server-settings

    -waf-rule-engine <on|off|detection-only>
                                       Sets the web application firewall
                                       mode.

Note:
 * For security reasons, we recommend that you pass non-encrypted passwords
 using the environment variable PSA_PASSWORD. To do so, specify an empty value
 in the command line for the argument(s) passwd (like ' -passwd \"\"') and specify
 the password in the variable PSA_PASSWORD.
 

Version: 18.0.69_build1800250502.08 os_Ubuntu 22.04