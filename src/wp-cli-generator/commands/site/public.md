# wp site public

Sets one or more sites as public.

### OPTIONS

[<id>...]
: One or more IDs of sites to set as public. If not provided, you must set the --slug parameter.

[--slug=<slug>]
: Path of the site to be set as public. Subdomain on subdomain installs, directory on subdirectory installs.

### EXAMPLES

    $ wp site public 123
    Success: Site 123 marked as public.

     $ wp site public --slug=demo
     Success: Site 123 marked as public.


