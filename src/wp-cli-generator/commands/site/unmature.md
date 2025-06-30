# wp site unmature

Sets one or more sites as immature.

### OPTIONS

[<id>...]
: One or more IDs of sites to set as unmature. If not provided, you must set the --slug parameter.

[--slug=<slug>]
: Path of the site to be set as unmature. Subdomain on subdomain installs, directory on subdirectory installs.

### EXAMPLES

    $ wp site unmature 123
    Success: Site 123 marked as unmature.

    $ wp site unmature --slug=demo
    Success: Site 123 marked as unmature.


