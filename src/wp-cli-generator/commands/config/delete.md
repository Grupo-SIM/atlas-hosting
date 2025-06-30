# wp config delete

Deletes a specific constant or variable from the wp-config.php file.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

### OPTIONS

<name>
: Name of the wp-config.php constant or variable.

[--type=<type>]
: Type of the config value to delete. Defaults to 'all'.
---
default: all
options:
  - constant
  - variable
  - all
---

[--config-file=<path>]
: Specify the file path to the config file to be modified. Defaults to the root of the WordPress installation and the filename "wp-config.php".

### EXAMPLES

    # Delete the COOKIE_DOMAIN constant from the wp-config.php file.
    $ wp config delete COOKIE_DOMAIN
    Success: Deleted the constant 'COOKIE_DOMAIN' from the 'wp-config.php' file.


