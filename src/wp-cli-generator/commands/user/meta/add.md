# wp user meta add

Adds a meta field.

### OPTIONS

<user>
: The user login, user email, or user ID of the user to add metadata for.

<key>
: The metadata key.

<value>
: The new metadata value.

[--format=<format>]
: The serialization format for the value.
---
default: plaintext
options:
  - plaintext
  - json
---

### EXAMPLES

    # Add user meta
    $ wp user meta add 123 bio "Mary is an WordPress developer."
    Success: Added custom field.


