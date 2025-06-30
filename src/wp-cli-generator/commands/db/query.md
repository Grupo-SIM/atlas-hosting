# wp db query

Executes a SQL query against the database.

This command runs on the `after_wp_config_load` hook, after wp-config.php has been loaded into scope.

Executes an arbitrary SQL query using `DB_HOST`, `DB_NAME`, `DB_USER`
 and `DB_PASSWORD` database credentials specified in wp-config.php.

Use the `--skip-column-names` MySQL argument to exclude the headers from a SELECT query. Pipe the output to remove the ASCII table entirely.

### OPTIONS

[<sql>]
: A SQL query. If not passed, will try to read from STDIN.

[--dbuser=<value>]
: Username to pass to mysql. Defaults to DB_USER.

[--dbpass=<value>]
: Password to pass to mysql. Defaults to DB_PASSWORD.

[--<field>=<value>]
: Extra arguments to pass to mysql. [Refer to mysql docs](https://dev.mysql.com/doc/en/mysql-command-options.html).

[--defaults]
: Loads the environment's MySQL option files. Default behavior is to skip loading them to avoid failures due to misconfiguration.

### EXAMPLES

    # Execute a query stored in a file
    $ wp db query < debug.sql

    # Query for a specific value in the database (pipe the result to remove the ASCII table borders)
    $ wp db query 'SELECT option_value FROM wp_options WHERE option_name="home"' --skip-column-names
    +---------------------+
    | https://example.com |
    +---------------------+

    # Check all tables in the database
    $ wp db query "CHECK TABLE $(wp db tables | paste -s -d, -);"
    +---------------------------------------+-------+----------+----------+
    | Table                                 | Op    | Msg_type | Msg_text |
    +---------------------------------------+-------+----------+----------+
    | wordpress_dbase.wp_users              | check | status   | OK       |
    | wordpress_dbase.wp_usermeta           | check | status   | OK       |
    | wordpress_dbase.wp_posts              | check | status   | OK       |
    | wordpress_dbase.wp_comments           | check | status   | OK       |
    | wordpress_dbase.wp_links              | check | status   | OK       |
    | wordpress_dbase.wp_options            | check | status   | OK       |
    | wordpress_dbase.wp_postmeta           | check | status   | OK       |
    | wordpress_dbase.wp_terms              | check | status   | OK       |
    | wordpress_dbase.wp_term_taxonomy      | check | status   | OK       |
    | wordpress_dbase.wp_term_relationships | check | status   | OK       |
    | wordpress_dbase.wp_termmeta           | check | status   | OK       |
    | wordpress_dbase.wp_commentmeta        | check | status   | OK       |
    +---------------------------------------+-------+----------+----------+

    # Pass extra arguments through to MySQL
    $ wp db query 'SELECT * FROM wp_options WHERE option_name="home"' --skip-column-names
    +---+------+------------------------------+-----+
    | 2 | home | http://wordpress-develop.dev | yes |
    +---+------+------------------------------+-----+

### MULTISITE USAGE

Please note that the global `--url` parameter will have no effect on this command. In order to query for data in a site other than your primary site, you will need to manually modify the table names to use the prefix that includes the site's ID.

For example, to get the `home` option for your second site, modify the example above like so:

    $ wp db query 'SELECT option_value FROM wp_2_options WHERE option_name="home"' --skip-column-names
    +----------------------+
    | https://example2.com |
    +----------------------+

To confirm the ID for the site you want to query, you can use the `wp site list` command:

    # wp site list --fields=blog_id,url
    +---------+-----------------------+
    | blog_id | url                   |
    +---------+-----------------------+
    | 1       | https://example1.com/ |
    | 2       | https://example2.com/ |
    +---------+-----------------------+


