# wp i18n make-php

Create PHP files from PO files.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

### OPTIONS

<source>
: Path to an existing PO file or a directory containing multiple PO files.

[<destination>]
: Path to the destination directory for the resulting PHP files. Defaults to the source directory.

### EXAMPLES

    # Create PHP files for all PO files in the current directory.
    $ wp i18n make-php .
    Success: Created 3 files.

    # Create a PHP file from a single PO file in a specific directory.
    $ wp i18n make-php example-plugin-de_DE.po languages
    Success: Created 1 file.


