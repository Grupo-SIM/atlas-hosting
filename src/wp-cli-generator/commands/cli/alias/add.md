# wp cli alias add

Creates an alias.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

### OPTIONS

<key>
: Key for the alias.

[--set-user=<user>]
: Set user for alias.

[--set-url=<url>]
: Set url for alias.

[--set-path=<path>]
: Set path for alias.

[--set-ssh=<ssh>]
: Set ssh for alias.

[--set-http=<http>]
: Set http for alias.

[--grouping=<grouping>]
: For grouping multiple aliases.

[--config=<config>]
: Config file to be considered for operations.
---
default: global
options:
  - global
  - project
---

### EXAMPLES

    # Add alias to global config.
    $ wp cli alias add @prod  --set-ssh=login@host --set-path=/path/to/wordpress/install/ --set-user=wpcli
    Success: Added '@prod' alias.

    # Add alias to project config.
    $ wp cli alias add @prod --set-ssh=login@host --set-path=/path/to/wordpress/install/ --set-user=wpcli --config=project
    Success: Added '@prod' alias.

    # Add group of aliases.
    $ wp cli alias add @multiservers --grouping=servera,serverb
    Success: Added '@multiservers' alias.


