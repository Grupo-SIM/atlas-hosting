# wp language plugin update

Updates installed languages for one or more plugins.

### OPTIONS

[<plugin>...]
: One or more plugins to update languages for.

[--all]
: If set, languages for all plugins will be updated.

[--dry-run]
: Preview which translations would be updated.

### EXAMPLES

    # Update all installed language packs for all plugins.
    $ wp language plugin update --all
    Updating 'Japanese' translation for Akismet 3.1.11...
    Downloading translation from https://downloads.wordpress.org/translation/plugin/akismet/3.1.11/ja.zip...
    Translation updated successfully.
    Success: Updated 1/1 translation.


