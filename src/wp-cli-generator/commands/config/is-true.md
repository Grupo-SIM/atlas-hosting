# wp config is-true

Determines whether value of a specific defined constant or variable is truthy.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

This determination is made by evaluating the retrieved value via boolval().

### OPTIONS

<name>
: Name of the wp-config.php constant or variable.

[--type=<type>]
: Type of config value to retrieve. Defaults to 'all'.
---
default: all
options:
  - constant
  - variable
  - all
---

[--config-file=<path>]
: Specify the file path to the config file to be read. Defaults to the root of the WordPress installation and the filename "wp-config.php".

### EXAMPLES

    # Assert if MULTISITE is true
    $ wp config is-true MULTISITE
    $ echo $?
    0


