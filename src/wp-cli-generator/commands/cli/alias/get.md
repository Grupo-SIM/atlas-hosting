# wp cli alias get

Gets the value for an alias.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

### OPTIONS

<key>
: Key for the alias.

### EXAMPLES

    # Get alias.
    $ wp cli alias get @prod
    ssh: dev@somedeve.env:12345/home/dev/


