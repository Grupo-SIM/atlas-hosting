# wp language theme uninstall

Uninstalls a given language for a theme.

### OPTIONS

[<theme>]
: Theme to uninstall language for.

[--all]
: If set, languages for all themes will be uninstalled.

<language>...
: Language code to uninstall.

[--format=<format>]
: Render output in a particular format. Used when installing languages for all themes.
---
default: table
options:
  - table
  - csv
  - json
  - summary
---

### EXAMPLES

    # Uninstall the Japanese theme language pack for Twenty Ten.
    $ wp language theme uninstall twentyten ja
    Language 'ja' for 'twentyten' uninstalled.
    +-----------+--------+-------------+
    | name      | locale | status      |
    +-----------+--------+-------------+
    | twentyten | ja     | uninstalled |
    +-----------+--------+-------------+
    Success: Uninstalled 1 of 1 languages.


