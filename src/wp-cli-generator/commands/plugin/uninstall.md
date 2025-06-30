# wp plugin uninstall

Uninstalls one or more plugins.

### OPTIONS

[<plugin>...]
: One or more plugins to uninstall.

[--deactivate]
: Deactivate the plugin before uninstalling. Default behavior is to warn and skip if the plugin is active.

[--skip-delete]
: If set, the plugin files will not be deleted. Only the uninstall procedure will be run.

[--all]
: If set, all plugins will be uninstalled.

[--exclude=<name>]
: Comma separated list of plugin slugs to be excluded from uninstall.

### EXAMPLES

    $ wp plugin uninstall hello
    Uninstalled and deleted 'hello' plugin.
    Success: Uninstalled 1 of 1 plugins.

    # Uninstall all plugins excluding specified ones
    $ wp plugin uninstall --all --exclude=hello-dolly,jetpack
    Uninstalled and deleted 'akismet' plugin.
    Uninstalled and deleted 'tinymce-templates' plugin.
    Success: Uninstalled 2 of 2 plugins.


