# wp site list

Lists all sites in a multisite installation.

### OPTIONS

[--network=<id>]
: The network to which the sites belong.

[--<field>=<value>]
: Filter by one or more fields (see "Available Fields" section). However,
'url' isn't an available filter, as it comes from 'home' in wp_options.

[--site__in=<value>]
: Only list the sites with these blog_id values (comma-separated).

[--site_user=<value>]
: Only list the sites with this user.

[--field=<field>]
: Prints the value of a single field for each site.

[--fields=<fields>]
: Comma-separated list of fields to show.

[--format=<format>]
: Render output in a particular format.
---
default: table
options:
  - table
  - csv
  - count
  - ids
  - json
  - yaml
---

### AVAILABLE FIELDS

These fields will be displayed by default for each site:

* blog_id
* url
* last_updated
* registered

These fields are optionally available:

* site_id
* domain
* path
* public
* archived
* mature
* spam
* deleted
* lang_id

### EXAMPLES

    # Output a simple list of site URLs
    $ wp site list --field=url
    http://www.example.com/
    http://www.example.com/subdir/


