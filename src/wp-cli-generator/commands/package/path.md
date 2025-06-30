# wp package path

Gets the path to an installed WP-CLI package, or the package directory.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

If you want to contribute to a package, this is a great way to jump to it.

### OPTIONS

[<name>]
: Name of the package to get the directory for.

### EXAMPLES

    # Get package path.
    $ wp package path
    /home/person/.wp-cli/packages/

    # Get path to an installed package.
    $ wp package path wp-cli/server-command
    /home/person/.wp-cli/packages/vendor/wp-cli/server-command

    # Change directory to package path.
    $ cd $(wp package path) && pwd
    /home/vagrant/.wp-cli/packages


