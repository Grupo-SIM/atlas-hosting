# wp user list-caps

Lists all capabilities for a user.

### OPTIONS

<user>
: User ID, user email, or login.

[--format=<format>]
: Render output in a particular format.
---
default: list
options:
  - list
  - table
  - csv
  - json
  - count
  - yaml
---

[--origin=<origin>]
: Render output in a particular format.
---
default: all
options:
  - all
  - user
  - role
---

[--exclude-role-names]
: Exclude capabilities that match role names from output.

### EXAMPLES

    $ wp user list-caps 21
    edit_product
    create_premium_item


