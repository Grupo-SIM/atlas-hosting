# wp user meta get

Gets meta field value.

### OPTIONS

<user>
: The user login, user email, or user ID of the user to get metadata for.

<key>
: The metadata key.

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

    # Get user meta
    $ wp user meta get 123 bio
    Mary is an WordPress developer.

    # Get the primary site of a user (for multisite)
    $ wp user meta get 2 primary_blog
    3


