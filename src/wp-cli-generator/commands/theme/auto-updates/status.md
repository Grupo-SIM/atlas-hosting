# wp theme auto-updates status

Shows the status of auto-updates for a theme.

### OPTIONS

[<theme>...]
: One or more themes to show the status of the auto-updates of.

[--all]
: If set, the status of auto-updates for all themes will be shown.

[--enabled-only]
: If set, filters list of themes to only include the ones that have auto-updates enabled.

[--disabled-only]
: If set, filters list of themes to only include the ones that have auto-updates disabled.

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

    # Get the status of theme auto-updates
    $ wp theme auto-updates status twentysixteen
    +---------------+----------+
    | name          | status   |
    +---------------+----------+
    | twentysixteen | disabled |
    +---------------+----------+

    # Get the list of themes that have auto-updates enabled
    $ wp theme auto-updates status --all --enabled-only --field=name
    twentysixteen
    twentyseventeen


