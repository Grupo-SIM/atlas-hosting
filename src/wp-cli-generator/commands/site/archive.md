# wp site archive

Archives one or more sites.

### OPTIONS

[<id>...]
: One or more IDs of sites to archive. If not provided, you must set the --slug parameter.

[--slug=<slug>]
: Path of the site to archive. Subdomain on subdomain installs, directory on subdirectory installs.

### EXAMPLES

    $ wp site archive 123
    Success: Site 123 archived.

    $ wp site archive --slug=demo
    Success: Site 123 archived.


