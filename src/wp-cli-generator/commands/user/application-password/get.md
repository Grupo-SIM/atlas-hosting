# wp user application-password get

Gets a specific application password.

### OPTIONS

<user>
: The user login, user email, or user ID of the user to get the application password for.

<uuid>
: The universally unique ID of the application password.

[--field=<field>]
: Prints the value of a single field for the application password.

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
  - yaml
---

### EXAMPLES

    # Get a specific application password and only show app name and created timestamp
    $ wp user application-password get 123 6633824d-c1d7-4f79-9dd5-4586f734d69e --fields=name,created
    +--------+------------+
    | name   | created    |
    +--------+------------+
    | myapp  | 1638395611 |
    +--------+------------+


