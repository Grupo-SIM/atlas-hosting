# wp plugin auto-updates disable

Disables the auto-updates for a plugin.

### OPTIONS

[<plugin>...]
: One or more plugins to disable auto-updates for.

[--all]
: If set, auto-updates will be disabled for all plugins.

[--enabled-only]
: If set, filters list of plugins to only include the ones that have auto-updates enabled.

### EXAMPLES

    # Disable the auto-updates for a plugin
    $ wp plugin auto-updates disable hello
    Plugin auto-updates for 'hello' disabled.
    Success: Disabled 1 of 1 plugin auto-updates.


