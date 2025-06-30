# wp db check

Checks the current status of the database.

This command runs on the `after_wp_config_load` hook, after wp-config.php has been loaded into scope.

Runs `mysqlcheck` utility with `--check` using `DB_HOST`, `DB_NAME`, `DB_USER` and `DB_PASSWORD` database credentials specified in wp-config.php.

[See docs](http://dev.mysql.com/doc/refman/5.7/en/check-table.html) for more details on the `CHECK TABLE` statement.

This command does not check whether WordPress is installed; to do that run `wp core is-installed`.

### OPTIONS

[--dbuser=<value>]
: Username to pass to mysqlcheck. Defaults to DB_USER.

[--dbpass=<value>]
: Password to pass to mysqlcheck. Defaults to DB_PASSWORD.

[--<field>=<value>]
: Extra arguments to pass to mysqlcheck. [Refer to mysqlcheck docs](https://dev.mysql.com/doc/en/mysqlcheck.html).

[--defaults]
: Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration.

### EXAMPLES

    $ wp db check
    Success: Database checked.


