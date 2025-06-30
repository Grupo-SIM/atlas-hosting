# wp db cli

Opens a MySQL console using credentials from wp-config.php

This command runs on the `after_wp_config_load` hook, after wp-config.php has been loaded into scope.

### OPTIONS

[--database=<database>]
: Use a specific database. Defaults to DB_NAME.

[--default-character-set=<character-set>]
: Use a specific character set. Defaults to DB_CHARSET when defined.

[--dbuser=<value>]
: Username to pass to mysql. Defaults to DB_USER.

[--dbpass=<value>]
: Password to pass to mysql. Defaults to DB_PASSWORD.

[--<field>=<value>]
: Extra arguments to pass to mysql. [Refer to mysql docs](https://dev.mysql.com/doc/en/mysql-command-options.html).

[--defaults]
: Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration.

### EXAMPLES

    # Open MySQL console
    $ wp db cli
    mysql>


