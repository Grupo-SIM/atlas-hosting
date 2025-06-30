# wp language core list

Lists all available languages.

### OPTIONS

[--field=<field>]
: Display the value of a single field

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

* language
* english_name
* native_name
* status
* update
* updated

### EXAMPLES

    # List language,english_name,status fields of available languages.
    $ wp language core list --fields=language,english_name,status
    +----------------+-------------------------+-------------+
    | language       | english_name            | status      |
    +----------------+-------------------------+-------------+
    | ar             | Arabic                  | uninstalled |
    | ary            | Moroccan Arabic         | uninstalled |
    | az             | Azerbaijani             | uninstalled |


