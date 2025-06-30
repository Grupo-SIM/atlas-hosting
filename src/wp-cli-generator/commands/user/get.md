# wp user get

Gets details about a user.

### OPTIONS

<user>
: User ID, user email, or user login.

[--field=<field>]
: Instead of returning the whole user, returns the value of a single field.

[--fields=<fields>]
: Get a specific subset of the user's fields.

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

    # Get user
    $ wp user get 12 --field=login
    supervisor

    # Get user and export to JSON file
    $ wp user get bob --format=json > bob.json


