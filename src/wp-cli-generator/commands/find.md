# wp find

Find WordPress installations on the filesystem.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

Recursively iterates subdirectories of provided <path> to find and report WordPress installations. A WordPress installation is a wp-includes directory with a version.php file.

Avoids recursing some known paths (e.g. /node_modules/, hidden sys dirs) to significantly improve performance.

Indicates depth at which the WordPress installations was found, and its alias, if it has one.

### OPTIONS

<path>
: Path to search the subdirectories of.

[--skip-ignored-paths]
: Skip the paths that are ignored by default.

[--include_ignored_paths=<paths>]
: Include additional ignored paths as CSV (e.g. '/sys-backup/,/temp/').

[--max_depth=<max-depth>]
: Only recurse to a specified depth, inclusive.

[--fields=<fields>]
: Limit the output to specific row fields.

[--field=<field>]
: Output a specific field for each row.

[--format=<format>]
: Render output in a specific format.
---
default: table
options:
  - table
  - json
  - csv
  - yaml
  - count
---

[--verbose]
: Log useful information to STDOUT.

### AVAILABLE FIELDS

These fields will be displayed by default for each installation:

* version_path - Path to the version.php file.
* version - WordPress version.
* depth - Directory depth at which the installation was found.
* alias - WP-CLI alias, if one is registered.

These fields are optionally available:

* wp_path - Path that can be passed to `--path=<path>` global parameter.
* db_host - Host name for the database.
* db_user - User name for the database.
* db_name - Database name for the database.

### EXAMPLES

    # Find WordPress installations.
    $ wp find ./
    +--------------------------------------+---------------------+-------+--------+
    | version_path                         | version             | depth | alias  |
    +--------------------------------------+---------------------+-------+--------+
    | /Users/wpcli/wp-includes/version.php | 4.8-alpha-39357-src | 2     | @wpcli |
    +--------------------------------------+---------------------+-------+--------+


