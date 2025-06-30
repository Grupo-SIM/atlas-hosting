# wp db create

Creates a new database.

This command runs on the `after_wp_config_load` hook, after wp-config.php has been loaded into scope.

Runs `CREATE_DATABASE` SQL statement using `DB_HOST`, `DB_NAME`, `DB_USER` and `DB_PASSWORD` database credentials specified in wp-config.php.

### OPTIONS

[--dbuser=<value>]
: Username to pass to mysql. Defaults to DB_USER.

[--dbpass=<value>]
: Password to pass to mysql. Defaults to DB_PASSWORD.

[--defaults]
: Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration.

### EXAMPLES

    $ wp db create
    Success: Database created.


