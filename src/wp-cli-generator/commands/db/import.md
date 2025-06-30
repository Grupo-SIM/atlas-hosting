# wp db import

Imports a database from a file or from STDIN.

This command runs on the `after_wp_config_load` hook, after wp-config.php has been loaded into scope.

Runs SQL queries using `DB_HOST`, `DB_NAME`, `DB_USER` and `DB_PASSWORD` database credentials specified in wp-config.php. This does not create database by itself and only performs whatever tasks are defined in the SQL.

### OPTIONS

[<file>]
: The name of the SQL file to import. If '-', then reads from STDIN. If omitted, it will look for '{dbname}.sql'.

[--dbuser=<value>]
: Username to pass to mysql. Defaults to DB_USER.

[--dbpass=<value>]
: Password to pass to mysql. Defaults to DB_PASSWORD.

[--<field>=<value>]
: Extra arguments to pass to mysql. [Refer to mysql binary docs](https://dev.mysql.com/doc/refman/8.0/en/mysql-command-options.html).

[--skip-optimization]
: When using an SQL file, do not include speed optimization such as disabling auto-commit and key checks.

[--defaults]
: Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration.

### EXAMPLES

    # Import MySQL from a file.
    $ wp db import wordpress_dbase.sql
    Success: Imported from 'wordpress_dbase.sql'.


