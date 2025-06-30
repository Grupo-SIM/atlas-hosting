# wp db reset

Removes all tables from the database.

This command runs on the `after_wp_config_load` hook, after wp-config.php has been loaded into scope.

Runs `DROP_DATABASE` and `CREATE_DATABASE` SQL statements using `DB_HOST`, `DB_NAME`, `DB_USER` and `DB_PASSWORD` database credentials specified in wp-config.php.

### OPTIONS

[--dbuser=<value>]
: Username to pass to mysql. Defaults to DB_USER.

[--dbpass=<value>]
: Password to pass to mysql. Defaults to DB_PASSWORD.

[--yes]
: Answer yes to the confirmation message.

[--defaults]
: Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration.

### EXAMPLES

    $ wp db reset --yes
    Success: Database reset.


