# wp package uninstall

Uninstalls a WP-CLI package.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

### OPTIONS

<name>
: Name of the package to uninstall.

[--insecure]
: Retry downloads without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack.

### EXAMPLES

    # Uninstall package.
    $ wp package uninstall wp-cli/server-command
    Removing require statement for package 'wp-cli/server-command' from /home/person/.wp-cli/packages/composer.json
    Removing repository details from /home/person/.wp-cli/packages/composer.json
    Removing package directories and regenerating autoloader...
    Success: Uninstalled package.


