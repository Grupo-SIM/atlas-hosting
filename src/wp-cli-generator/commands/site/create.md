# wp site create

Creates a site in a multisite installation.

### OPTIONS

--slug=<slug>
: Path for the new site. Subdomain on subdomain installs, directory on subdirectory installs.

[--title=<title>]
: Title of the new site. Default: prettified slug.

[--email=<email>]
: Email for admin user. User will be created if none exists. Assignment to super admin if not included.

[--network_id=<network-id>]
: Network to associate new site with. Defaults to current network (typically 1).

[--private]
: If set, the new site will be non-public (not indexed)

[--porcelain]
: If set, only the site id will be output on success.

### EXAMPLES

    $ wp site create --slug=example
    Success: Site 3 created: http://www.example.com/example/


