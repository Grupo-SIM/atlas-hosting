# wp plugin auto-updates status

Shows the status of auto-updates for a plugin.

### OPTIONS

[<plugin>...]
: One or more plugins to show the status of the auto-updates of.

[--all]
: If set, the status of auto-updates for all plugins will be shown.

[--enabled-only]
: If set, filters list of plugins to only include the ones that have auto-updates enabled.

[--disabled-only]
: If set, filters list of plugins to only include the ones that have auto-updates disabled.

[--field=<field>]
: Only show the provided field.

[--format=<format>]
: Render output in a particular format.
---
default: table
options:
  - table
  - csv
  - json
  - yaml
  - count
---

### EXAMPLES

    # Get the status of plugin auto-updates
    $ wp plugin auto-updates status hello
    +-------+----------+
    | name  | status   |
    +-------+----------+
    | hello | disabled |
    +-------+----------+

    # Get the list of plugins that have auto-updates enabled
    $ wp plugin auto-updates status --all --enabled-only --field=name
    akismet
    duplicate-post


