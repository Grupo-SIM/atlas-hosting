# wp user signup list

Lists signups.

### OPTIONS

[--<field>=<value>]
: Filter the list by a specific field.

[--field=<field>]
: Prints the value of a single field for each signup.

[--fields=<fields>]
: Limit the output to specific object fields.

[--format=<format>]
: Render output in a particular format.
---
default: table
options:
  - table
  - csv
  - ids
  - json
  - count
  - yaml
---

[--per_page=<per_page>]
: Limits the signups to the given number. Defaults to none.

### AVAILABLE FIELDS

These fields will be displayed by default for each signup:

* signup_id
* user_login
* user_email
* registered
* active
* activation_key

These fields are optionally available:

* domain
* path
* title
* activated
* meta

### EXAMPLES

    # List signup IDs.
    $ wp user signup list --field=signup_id
    1

    # List all signups.
    $ wp user signup list
    +-----------+------------+---------------------+---------------------+--------+------------------+
    | signup_id | user_login | user_email          | registered          | active | activation_key   |
    +-----------+------------+---------------------+---------------------+--------+------------------+
    | 1         | bobuser    | bobuser@example.com | 2024-03-13 05:46:53 | 1      | 7320b2f009266618 |
    | 2         | johndoe    | johndoe@example.com | 2024-03-13 06:24:44 | 0      | 9068d859186cd0b5 |
    +-----------+------------+---------------------+---------------------+--------+------------------+


