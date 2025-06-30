# wp eval-file

Loads and executes a PHP file.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

Note: because code is executed within a method, global variables need to be explicitly globalized.

### OPTIONS

<file>
: The path to the PHP file to execute.  Use '-' to run code from STDIN.

[<arg>...]
: One or more positional arguments to pass to the file. They are placed in the $args variable.

[--skip-wordpress]
: Load and execute file without loading WordPress.

[--use-include]
: Process the provided file via include instead of evaluating its contents.


