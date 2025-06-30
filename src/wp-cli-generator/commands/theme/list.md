# wp theme list

Gets a list of themes.

### OPTIONS

[--<field>=<value>]
: Filter results based on the value of a field.

[--field=<field>]
: Prints the value of a single field for each theme.

[--fields=<fields>]
: Limit the output to specific object fields.

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

[--status=<status>]
: Filter the output by theme status.
---
options:
  - active
  - parent
  - inactive
---

[--skip-update-check]
: If set, the theme update check will be skipped.

### AVAILABLE FIELDS

These fields will be displayed by default for each theme:

* name
* status
* update
* version
* update_version
* auto_update

These fields are optionally available:

* update_package
* update_id
* title
* description

### EXAMPLES

    # List inactive themes.
    $ wp theme list --status=inactive --format=csv
    name,status,update,version,update_version,auto_update
    twentyfourteen,inactive,none,3.8,,off
    twentysixteen,inactive,available,3.0,3.1,off


