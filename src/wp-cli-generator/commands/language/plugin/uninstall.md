# wp language plugin uninstall

Uninstalls a given language for a plugin.

### OPTIONS

[<plugin>]
: Plugin to uninstall language for.

[--all]
: If set, languages for all plugins will be uninstalled.

<language>...
: Language code to uninstall.

[--format=<format>]
: Render output in a particular format. Used when installing languages for all plugins.
---
default: table
options:
  - table
  - csv
  - json
  - summary
---

### EXAMPLES

    # Uninstall the Japanese plugin language pack for Hello Dolly.
    $ wp language plugin uninstall hello-dolly ja
    Language 'ja' for 'hello-dolly' uninstalled.
    +-------------+--------+-------------+
    | name        | locale | status      |
    +-------------+--------+-------------+
    | hello-dolly | ja     | uninstalled |
    +-------------+--------+-------------+
    Success: Uninstalled 1 of 1 languages.


