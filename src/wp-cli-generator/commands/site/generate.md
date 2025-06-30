# wp site generate

Generate some sites.

Creates a specified number of new sites.

### OPTIONS

[--count=<number>]
: How many sites to generates?
---
default: 100
---

[--slug=<slug>]
: Path for the new site. Subdomain on subdomain installs, directory on subdirectory installs.

[--email=<email>]
: Email for admin user. User will be created if none exists. Assignment to super admin if not included.

[--network_id=<network-id>]
: Network to associate new site with. Defaults to current network (typically 1).

[--private]
: If set, the new site will be non-public (not indexed)

[--format=<format>]
: Render output in a particular format.
---
default: progress
options:
 - progress
 - ids
---

### EXAMPLES

   # Generate 10 sites.
   $ wp site generate --count=10
   Generating sites  100% [================================================] 0:01 / 0:04


