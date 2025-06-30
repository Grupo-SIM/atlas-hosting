# wp site delete

Deletes a site in a multisite installation.

### OPTIONS

[<site-id>]
: The id of the site to delete. If not provided, you must set the --slug parameter.

[--slug=<slug>]
: Path of the site to be deleted. Subdomain on subdomain installs, directory on subdirectory installs.

[--yes]
: Answer yes to the confirmation message.

[--keep-tables]
: Delete the blog from the list, but don't drop its tables.

### EXAMPLES

    $ wp site delete 123
    Are you sure you want to delete the http://www.example.com/example site? [y/n] y
    Success: The site at 'http://www.example.com/example' was deleted.


