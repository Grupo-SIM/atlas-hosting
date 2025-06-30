# wp i18n update-po

Update PO files from a POT file.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

This behaves similarly to the [msgmerge](https://www.gnu.org/software/gettext/manual/html_node/msgmerge-Invocation.html) command.

### OPTIONS

<source>
: Path to an existing POT file to use for updating.

[<destination>]
: PO file to update or a directory containing multiple PO files.
  Defaults to all PO files in the source directory.

### EXAMPLES

    # Update all PO files from a POT file in the current directory.
    $ wp i18n update-po example-plugin.pot
    Success: Updated 3 files.

    # Update a PO file from a POT file.
    $ wp i18n update-po example-plugin.pot example-plugin-de_DE.po
    Success: Updated 1 file.

    # Update all PO files in a given directory from a POT file.
    $ wp i18n update-po example-plugin.pot languages
    Success: Updated 2 files.


