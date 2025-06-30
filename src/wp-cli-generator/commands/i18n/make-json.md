# wp i18n make-json

Extract JavaScript strings from PO files and add them to individual JSON files.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

For JavaScript internationalization purposes, WordPress requires translations to be split up into one Jed-formatted JSON file per JavaScript source file.

See https://make.wordpress.org/core/2018/11/09/new-javascript-i18n-support-in-wordpress/ to learn more about WordPress JavaScript internationalization.

### OPTIONS

<source>
: Path to an existing PO file or a directory containing multiple PO files.

[<destination>]
: Path to the destination directory for the resulting JSON files. Defaults to the source directory.

[--domain=<domain>]
: Text domain to use for the JSON file name. Overrides the default one extracted from the PO file.

[--extensions=<extensions>]
: Additional custom JS extensions, comma separated list. By default searches for .min.js and .js extensions.

[--purge]
: Whether to purge the strings that were extracted from the original source file. Defaults to true, use `--no-purge` to skip the removal.

[--update-mo-files]
: Whether MO files should be updated as well after updating PO files. Only has an effect when used in combination with `--purge`.

[--pretty-print]
: Pretty-print resulting JSON files.

[--use-map=<paths_or_maps>]
: Whether to use a mapping file for the strings, as a JSON value, array to specify multiple. Each element can either be a string (file path) or object (map).

### EXAMPLES

    # Create JSON files for all PO files in the languages directory
    $ wp i18n make-json languages

    # Create JSON files for my-plugin-de_DE.po and leave the PO file untouched.
    $ wp i18n make-json my-plugin-de_DE.po /tmp --no-purge

    # Create JSON files with mapping
    $ wp i18n make-json languages --use-map=build/map.json

    # Create JSON files with multiple mappings
    $ wp i18n make-json languages '--use-map=["build/map.json","build/map2.json"]'

    # Create JSON files with object mapping
    $ wp i18n make-json languages '--use-map={"source/index.js":"build/index.js"}'


