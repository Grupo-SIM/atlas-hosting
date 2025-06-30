# wp language theme list

Lists all available languages for one or more themes.

### OPTIONS

[<theme>...]
: One or more themes to list languages for.

[--all]
: If set, available languages for all themes will be listed.

[--field=<field>]
: Display the value of a single field.

[--<field>=<value>]
: Filter results by key=value pairs.

[--fields=<fields>]
: Limit the output to specific fields.

[--format=<format>]
: Render output in a particular format.
---
default: table
options:
  - table
  - csv
  - json
  - count
---

### AVAILABLE FIELDS

These fields will be displayed by default for each translation:

* theme
* language
* english_name
* native_name
* status
* update
* updated

### EXAMPLES

    # List available language packs for the theme.
    $ wp language theme list twentyten --fields=language,english_name,status
    +----------------+-------------------------+-------------+
    | language       | english_name            | status      |
    +----------------+-------------------------+-------------+
    | ar             | Arabic                  | uninstalled |
    | ary            | Moroccan Arabic         | uninstalled |
    | az             | Azerbaijani             | uninstalled |


