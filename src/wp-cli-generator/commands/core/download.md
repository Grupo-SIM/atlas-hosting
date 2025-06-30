# wp core download

Downloads core WordPress files.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

Downloads and extracts WordPress core files to the specified path. Uses current directory when no path is specified. Downloaded build is verified to have the correct md5 and then cached to the local filesystem. Subsequent uses of command will use the local cache if it still exists.

### OPTIONS

[<download-url>]
: Download directly from a provided URL instead of fetching the URL from the wordpress.org servers.

[--path=<path>]
: Specify the path in which to install WordPress. Defaults to current directory.

[--locale=<locale>]
: Select which language you want to download.

[--version=<version>]
: Select which version you want to download. Accepts a version number, 'latest' or 'nightly'.

[--skip-content]
: Download WP without the default themes and plugins.

[--force]
: Overwrites existing files, if present.

[--insecure]
: Retry download without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack.

[--extract]
: Whether to extract the downloaded file. Defaults to true.

### EXAMPLES

    $ wp core download --locale=nl_NL
    Downloading WordPress 4.5.2 (nl_NL)...
    md5 hash verified: c5366d05b521831dd0b29dfc386e56a5
    Success: WordPress downloaded.


