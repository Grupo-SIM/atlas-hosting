# wp cli cache prune

Prunes the internal cache.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

Removes all cached files except for the newest version of each one.

### EXAMPLES

    $ wp cli cache prune
    Success: Cache pruned.


