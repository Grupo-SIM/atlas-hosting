# wp cli param-dump

Dumps the list of global parameters, as JSON or in var_export format.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

### OPTIONS

[--with-values]
: Display current values also.

[--format=<format>]
: Render output in a particular format.
---
default: json
options:
  - var_export
  - json
---

### EXAMPLES

    # Dump the list of global parameters.
    $ wp cli param-dump --format=var_export
    array (
      'path' =>
      array (
        'runtime' => '=<path>',
        'file' => '<path>',
        'synopsis' => '',
        'default' => NULL,
        'multiple' => false,
        'desc' => 'Path to the WordPress files.',
      ),
      'url' =>
      array (


