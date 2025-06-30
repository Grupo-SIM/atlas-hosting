# wp user application-password list

Lists all application passwords associated with a user.

### OPTIONS

<user>
: The user login, user email, or user ID of the user to get application passwords for.

[--<field>=<value>]
: Filter the list by a specific field.

[--field=<field>]
: Prints the value of a single field for each application password.

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
  - yaml
  - ids
---

[--orderby=<fields>]
: Set orderby which field.
---
default: created
options:
 - uuid
 - app_id
 - name
 - password
 - created
 - last_used
 - last_ip
---

[--order=<order>]
: Set ascending or descending order.
---
default: desc
options:
 - asc
 - desc
---

### EXAMPLES

    # List user application passwords and only show app name and password hash
    $ wp user application-password list 123 --fields=name,password
    +--------+------------------------------------+
    | name   | password                           |
    +--------+------------------------------------+
    | myapp  | $P$BVGeou1CUot114YohIemgpwxQCzb8O/ |
    +--------+------------------------------------+


