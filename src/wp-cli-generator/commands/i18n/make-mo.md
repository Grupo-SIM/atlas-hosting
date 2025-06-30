# wp i18n make-mo

Create MO files from PO files.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

### OPTIONS

<source>
: Path to an existing PO file or a directory containing multiple PO files.

[<destination>]
: Path to the destination file or directory for the resulting MO files. Defaults to the source directory.

### EXAMPLES

    # Create MO files for all PO files in the current directory.
    $ wp i18n make-mo .

    # Create a MO file from a single PO file in a specific directory.
    $ wp i18n make-mo example-plugin-de_DE.po languages

    # Create a MO file from a single PO file to a specific file destination
    $ wp i18n make-mo example-plugin-de_DE.po languages/bar.mo


