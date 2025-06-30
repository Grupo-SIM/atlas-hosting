# wp plugin delete

Deletes plugin files without deactivating or uninstalling.

### OPTIONS

[<plugin>...]
: One or more plugins to delete.

[--all]
: If set, all plugins will be deleted.

[--exclude=<name>]
: Comma separated list of plugin slugs to be excluded from deletion.

### EXAMPLES

    # Delete plugin
    $ wp plugin delete hello
    Deleted 'hello' plugin.
    Success: Deleted 1 of 1 plugins.

    # Delete inactive plugins
    $ wp plugin delete $(wp plugin list --status=inactive --field=name)
    Deleted 'tinymce-templates' plugin.
    Success: Deleted 1 of 1 plugins.

    # Delete all plugins excluding specified ones
    $ wp plugin delete --all --exclude=hello-dolly,jetpack
    Deleted 'akismet' plugin.
    Deleted 'tinymce-templates' plugin.
    Success: Deleted 2 of 2 plugins.


