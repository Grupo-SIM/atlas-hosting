# wp site private

Sets one or more sites as private.

### OPTIONS

[<id>...]
: One or more IDs of sites to set as private. If not provided, you must set the --slug parameter.

[--slug=<slug>]
: Path of the site to be set as private. Subdomain on subdomain installs, directory on subdirectory installs.

### EXAMPLES

    $ wp site private 123
    Success: Site 123 marked as private.

    $ wp site private --slug=demo
    Success: Site 123 marked as private.


