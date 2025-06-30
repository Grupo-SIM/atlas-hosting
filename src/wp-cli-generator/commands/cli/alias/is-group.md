# wp cli alias is-group

Check whether an alias is a group.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

### OPTIONS

<key>
: Key for the alias.

### EXAMPLES

    # Checks whether the alias is a group; exit status 0 if it is, otherwise 1.
    $ wp cli alias is-group @prod
    $ echo $?
    1


