# wp site option patch

Updates a nested value in an option.

### OPTIONS

<action>
: Patch action to perform.
---
options:
  - insert
  - update
  - delete
---

<key>
: The option name.

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


