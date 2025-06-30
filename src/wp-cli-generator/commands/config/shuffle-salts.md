# wp config shuffle-salts

Refreshes the salts defined in the wp-config.php file.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

### OPTIONS

[<keys>...]
: One ore more keys to shuffle. If none are provided, this falls back to the default WordPress Core salt keys.

[--force]
: If an unknown key is requested to be shuffled, add it instead of throwing a warning.

[--config-file=<path>]
: Specify the file path to the config file to be modified. Defaults to the root of the WordPress installation and the filename "wp-config.php".

[--insecure]
: Retry API download without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack.

### EXAMPLES

    # Get new salts for your wp-config.php file
    $ wp config shuffle-salts
    Success: Shuffled the salt keys.

    # Add a cache key salt to the wp-config.php file
    $ wp config shuffle-salts WP_CACHE_KEY_SALT --force
    Success: Shuffled the salt keys.


