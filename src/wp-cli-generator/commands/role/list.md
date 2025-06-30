# wp role list

Lists all roles.

### OPTIONS

[--fields=<fields>]
: Limit the output to specific object fields.

[--field=<field>]
: Prints the value of a single field.

[--format=<format>]
: Render output in a particular format.
---
default: table
options:
  - table
  - csv
  - json
  - count
  - yaml
---

### AVAILABLE FIELDS

These fields will be displayed by default for each role:

* name
* role

There are no optional fields.

### EXAMPLES

    # List roles.
    $ wp role list --fields=role --format=csv
    role
    administrator
    editor
    author
    contributor
    subscriber


