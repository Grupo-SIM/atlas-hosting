# wp network meta patch

Update a nested value for a meta field.

### OPTIONS

<action>
: Patch action to perform.
---
options:
  - insert
  - update
  - delete
---

<id>
: The ID of the object.

<key>
: The name of the meta field to update.

<key-path>...
: The name(s) of the keys within the value to locate the value to patch.

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


