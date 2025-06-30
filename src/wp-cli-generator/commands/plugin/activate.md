# wp plugin activate

Activates one or more plugins.

### OPTIONS

[<plugin>...]
: One or more plugins to activate.

[--all]
: If set, all plugins will be activated.

[--exclude=<name>]
: Comma separated list of plugin slugs to be excluded from activation.

[--network]
: If set, the plugin will be activated for the entire multisite network.

### EXAMPLES

    # Activate plugin
    $ wp plugin activate hello
    Plugin 'hello' activated.
    Success: Activated 1 of 1 plugins.

    # Activate plugin in entire multisite network
    $ wp plugin activate hello --network
    Plugin 'hello' network activated.
    Success: Network activated 1 of 1 plugins.

    # Activate plugins that were recently active.
    $ wp plugin activate $(wp plugin list --recently-active --field=name)
    Plugin 'bbpress' activated.
    Plugin 'buddypress' activated.
    Success: Activated 2 of 2 plugins.

    # Activate plugins that were recently active on a multisite.
    $ wp plugin activate $(wp plugin list --recently-active --field=name) --network
    Plugin 'bbpress' network activated.
    Plugin 'buddypress' network activated.
    Success: Activated 2 of 2 plugins.
