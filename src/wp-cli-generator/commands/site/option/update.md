# wp site option update

Updates a site option.

### OPTIONS

<key>
: The name of the site option to update.

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

### EXAMPLES

    # Update a site option by reading from a file
    $ wp site option update my_option < value.txt
    Success: Updated 'my_option' site option.


