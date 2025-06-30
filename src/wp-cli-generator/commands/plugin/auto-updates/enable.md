# wp plugin auto-updates enable

Enables the auto-updates for a plugin.

### OPTIONS

[<plugin>...]
: One or more plugins to enable auto-updates for.

[--all]
: If set, auto-updates will be enabled for all plugins.

[--disabled-only]
: If set, filters list of plugins to only include the ones that have auto-updates disabled.

### EXAMPLES

    # Enable the auto-updates for a plugin
    $ wp plugin auto-updates enable hello
    Plugin auto-updates for 'hello' enabled.
    Success: Enabled 1 of 1 plugin auto-updates.


