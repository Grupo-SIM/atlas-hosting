# wp profile eval

Profile arbitrary code execution.

Code execution happens after WordPress has loaded entirely, which means you can use any utilities defined in WordPress, active plugins, or the current theme.

### OPTIONS

<php-code>
: The code to execute, as a string.

[--hook[=<hook>]]
: Focus on key metrics for all hooks, or callbacks on a specific hook.

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

    # Profile a function that makes one HTTP request.
    $ wp profile eval 'wp_remote_get( "https://www.apple.com/" );' --fields=time,cache_ratio,request_count
    +---------+-------------+---------------+
    | time    | cache_ratio | request_count |
    +---------+-------------+---------------+
    | 0.1009s | 100%        | 1             |
    +---------+-------------+---------------+


