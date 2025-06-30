# wp profile hook

Profile key metrics for WordPress hooks (actions and filters).

This command runs on the `before_wp_load` hook, just before the WP load process begins.

In order to profile callbacks on a specific hook, the action or filter will need to execute during the course of the request.

### OPTIONS

[<hook>]
: Drill into key metrics of callbacks on a specific WordPress hook.

[--all]
: Profile callbacks for all WordPress hooks.

[--spotlight]
: Filter out logs with zero-ish values from the set.

[--url=<url>]
: Execute a request against a specified URL. Defaults to the home URL.

[--fields=<fields>]
: Display one or more fields.

[--format=<format>]
: Render output in a particular format.
---
default: table
options:
  - table
  - json
  - yaml
  - csv
---

[--order=<order>]
: Ascending or Descending order.
---
default: ASC
options:
  - ASC
  - DESC
---

[--orderby=<fields>]
: Set orderby which field.

### EXAMPLES

    # Profile a hook.
    $ wp profile hook template_redirect --fields=callback,cache_hits,cache_misses
    +--------------------------------+------------+--------------+
    | callback                       | cache_hits | cache_misses |
    +--------------------------------+------------+--------------+
    | _wp_admin_bar_init()           | 0          | 0            |
    | wp_old_slug_redirect()         | 0          | 0            |
    | redirect_canonical()           | 5          | 0            |
    | WP_Sitemaps->render_sitemaps() | 0          | 0            |
    | rest_output_link_header()      | 3          | 0            |
    | wp_shortlink_header()          | 0          | 0            |
    | wp_redirect_admin_locations()  | 0          | 0            |
    +--------------------------------+------------+--------------+
    | total (7)                      | 8          | 0            |
    +--------------------------------+------------+--------------+


