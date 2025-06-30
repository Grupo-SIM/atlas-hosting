# wp core version

Displays the WordPress version.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

### OPTIONS

[--extra]
: Show extended version information.

### EXAMPLES

    # Display the WordPress version
    $ wp core version
    4.5.2

    # Display WordPress version along with other information
    $ wp core version --extra
    WordPress version: 4.5.2
    Database revision: 36686
    TinyMCE version:   4.310 (4310-20160418)
    Package language:  en_US


