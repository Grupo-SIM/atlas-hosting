# wp option set-autoload

Sets the 'autoload' value for an option.

### OPTIONS

<key>
: The name of the option to set 'autoload' for.

<autoload>
: Should this option be automatically loaded.
---
options:
  - 'on'
  - 'off'
  - 'yes'
  - 'no'
---

### EXAMPLES

    # Set the 'autoload' value for an option.
    $ wp option set-autoload abc_options no
    Success: Updated autoload value for 'abc_options' option.


