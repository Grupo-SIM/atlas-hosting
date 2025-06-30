# wp cli completions

Generates tab completion strings.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

### OPTIONS

--line=<line>
: The current command line to be executed.

--point=<point>
: The index to the current cursor position relative to the beginning of the command.

### EXAMPLES

    # Generate tab completion strings.
    $ wp cli completions --line='wp eva' --point=100
    eval
    eval-file


