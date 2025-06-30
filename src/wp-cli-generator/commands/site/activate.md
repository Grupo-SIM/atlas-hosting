# wp site activate

Activates one or more sites.

### OPTIONS

[<id>...]
: One or more IDs of sites to activate. If not provided, you must set the --slug parameter.

[--slug=<slug>]
: Path of the site to be activated. Subdomain on subdomain installs, directory on subdirectory installs.

### EXAMPLES

    $ wp site activate 123
    Success: Site 123 activated.

     $ wp site activate --slug=demo
     Success: Site 123 marked as activated.


