# wp site option get

Gets a site option.

### OPTIONS

<key>
: Key for the site option.

[--format=<format>]
: Get value in a particular format.
---
default: var_export
options:
  - var_export
  - json
  - yaml
---

### EXAMPLES

    # Get site upload filetypes
    $ wp site option get upload_filetypes
    jpg jpeg png gif mov avi mpg


