# wp config has

Checks whether a specific constant or variable exists in the wp-config.php file.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

### OPTIONS

<name>
: Name of the wp-config.php constant or variable.

[--type=<type>]
: Type of the config value to set. Defaults to 'all'.
---
default: all
options:
  - constant
  - variable
  - all
---

[--config-file=<path>]
: Specify the file path to the config file to be checked. Defaults to the root of the WordPress installation and the filename "wp-config.php".

### EXAMPLES

    # Check whether the DB_PASSWORD constant exists in the wp-config.php file.
    $ wp config has DB_PASSWORD


