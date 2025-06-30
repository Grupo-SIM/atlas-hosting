# wp user signup get

Gets details about a signup.

### OPTIONS

<signup>
: The signup ID, user login, user email, or activation key.

[--field=<field>]
: Instead of returning the whole signup, returns the value of a single field.

[--fields=<fields>]
: Limit the output to specific fields. Defaults to all fields.

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

    # Get signup.
    $ wp user signup get 1 --field=user_login
    bobuser

    # Get signup and export to JSON file.
    $ wp user signup get bobuser --format=json > bobuser.json


