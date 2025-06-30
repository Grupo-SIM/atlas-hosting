# wp theme update

Updates one or more themes.

### OPTIONS

[<theme>...]
: One or more themes to update.

[--all]
: If set, all themes that have updates will be updated.

[--exclude=<theme-names>]
: Comma separated list of theme names that should be excluded from updating.

[--minor]
: Only perform updates for minor releases (e.g. from 1.3 to 1.4 instead of 2.0)

[--patch]
: Only perform updates for patch releases (e.g. from 1.3 to 1.3.3 instead of 1.4)

[--format=<format>]
: Render output in a particular format.
---
default: table
options:
  - table
  - csv
  - json
  - summary
---

[--version=<version>]
: If set, the theme will be updated to the specified version.

[--dry-run]
: Preview which themes would be updated.

[--insecure]
: Retry downloads without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack.

### EXAMPLES

    # Update multiple themes
    $ wp theme update twentyfifteen twentysixteen
    Downloading update from https://downloads.wordpress.org/theme/twentyfifteen.1.5.zip...
    Unpacking the update...
    Installing the latest version...
    Removing the old version of the theme...
    Theme updated successfully.
    Downloading update from https://downloads.wordpress.org/theme/twentysixteen.1.2.zip...
    Unpacking the update...
    Installing the latest version...
    Removing the old version of the theme...
    Theme updated successfully.
    +---------------+-------------+-------------+---------+
    | name          | old_version | new_version | status  |
    +---------------+-------------+-------------+---------+
    | twentyfifteen | 1.4         | 1.5         | Updated |
    | twentysixteen | 1.1         | 1.2         | Updated |
    +---------------+-------------+-------------+---------+
    Success: Updated 2 of 2 themes.

    # Exclude themes updates when bulk updating the themes
    $ wp theme update --all --exclude=twentyfifteen
    Downloading update from https://downloads.wordpress.org/theme/astra.1.0.5.1.zip...
    Unpacking the update...
    Installing the latest version...
    Removing the old version of the theme...
    Theme updated successfully.
    Downloading update from https://downloads.wordpress.org/theme/twentyseventeen.1.2.zip...
    Unpacking the update...
    Installing the latest version...
    Removing the old version of the theme...
    Theme updated successfully.
    +-----------------+----------+---------+----------------+
    | name            | status   | version | update_version |
    +-----------------+----------+---------+----------------+
    | astra           | inactive | 1.0.1   | 1.0.5.1        |
    | twentyseventeen | inactive | 1.1     | 1.2            |
    +-----------------+----------+---------+----------------+
    Success: Updated 2 of 2 themes.

    # Update all themes
    $ wp theme update --all


