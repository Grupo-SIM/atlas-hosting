# wp network meta update

Update a meta field.

### OPTIONS

<id>
: The ID of the object.

<key>
: The name of the meta field to update.

[<value>]
: The new value. If omitted, the value is read from STDIN.

[--format=<format>]
: The serialization format for the value.
---
default: plaintext
options:
  - plaintext
  - json
---


