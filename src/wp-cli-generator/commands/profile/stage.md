# wp profile stage

Profile each stage of the WordPress load process (bootstrap, main_query, template).

This command runs on the `before_wp_load` hook, just before the WP load process begins.

When WordPress handles a request from a browser, it’s essentially executing as one long PHP script. `wp profile stage` breaks the script into three stages:

* **bootstrap** is where WordPress is setting itself up, loading plugins and the main theme, and firing the `init` hook.
* **main_query** is how WordPress transforms the request (e.g. `/2016/10/21/moms-birthday/`) into the primary WP_Query.
* **template** is where WordPress determines which theme template to render based on the main query, and renders it.

### OPTIONS

[<stage>]
: Drill down into a specific stage.

[--all]
: Expand upon all stages.

[--spotlight]
: Filter out logs with zero-ish values from the set.

[--url=<url>]
: Execute a request against a specified URL. Defaults to the home URL.

[--fields=<fields>]
: Limit the output to specific fields. Default is all fields.

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

    # See an overview for each stage of the load process.
    $ wp profile stage --fields=stage,time,cache_ratio
    +------------+---------+-------------+
    | stage      | time    | cache_ratio |
    +------------+---------+-------------+
    | bootstrap  | 0.7994s | 93.21%      |
    | main_query | 0.0123s | 94.29%      |
    | template   | 0.792s  | 91.23%      |
    +------------+---------+-------------+
    | total (3)  | 1.6037s | 92.91%      |
    +------------+---------+-------------+

    # Dive into hook performance for a given stage.
    $ wp profile stage bootstrap --fields=hook,time,cache_ratio --spotlight
    +--------------------------+---------+-------------+
    | hook                     | time    | cache_ratio |
    +--------------------------+---------+-------------+
    | muplugins_loaded:before  | 0.2335s | 40%         |
    | muplugins_loaded         | 0.0007s | 50%         |
    | plugins_loaded:before    | 0.2792s | 77.63%      |
    | plugins_loaded           | 0.1502s | 100%        |
    | after_setup_theme:before | 0.068s  | 100%        |
    | init                     | 0.2643s | 96.88%      |
    | wp_loaded:after          | 0.0377s |             |
    +--------------------------+---------+-------------+
    | total (7)                | 1.0335s | 77.42%      |
    +--------------------------+---------+-------------+


