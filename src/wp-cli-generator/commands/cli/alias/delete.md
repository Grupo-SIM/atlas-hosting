# wp cli alias delete

Deletes an alias.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

### OPTIONS

<key>
: Key for the alias.

[--config=<config>]
: Config file to be considered for operations.
---
options:
  - global
  - project
---

### EXAMPLES

    # Delete alias.
    $ wp cli alias delete @prod
    Success: Deleted '@prod' alias.

    # Delete project alias.
    $ wp cli alias delete @prod --config=project
    Success: Deleted '@prod' alias.


