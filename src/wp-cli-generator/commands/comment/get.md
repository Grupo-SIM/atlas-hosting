# wp comment get

Gets the data of a single comment.

### OPTIONS

<id>
: The comment to get.

[--field=<field>]
: Instead of returning the whole comment, returns the value of a single field.

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

    # Get comment.
    $ wp comment get 21 --field=content
    Thanks for all the comments, everyone!


