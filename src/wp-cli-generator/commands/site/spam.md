# wp site spam

Marks one or more sites as spam.

### OPTIONS

[<id>...]
: One or more IDs of sites to be marked as spam. If not provided, you must set the --slug parameter.

[--slug=<slug>]
: Path of the site to be marked as spam. Subdomain on subdomain installs, directory on subdirectory installs.

### EXAMPLES

    $ wp site spam 123
    Success: Site 123 marked as spam.


