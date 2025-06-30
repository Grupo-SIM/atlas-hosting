# wp config edit

Launches system editor to edit the wp-config.php file.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

### OPTIONS

[--config-file=<path>]
: Specify the file path to the config file to be edited. Defaults to the root of the WordPress installation and the filename "wp-config.php".

### EXAMPLES

    # Launch system editor to edit wp-config.php file
    $ wp config edit

    # Edit wp-config.php file in a specific editor
    $ EDITOR=vim wp config edit


