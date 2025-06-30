# wp cli has-command

Detects if a command exists

This commands checks if a command is registered with WP-CLI. If the command is found then it returns with exit status 0. If the command doesn't exist, then it will exit with status 1.

### OPTIONS
<command_name>...
: The command

### EXAMPLES

    # The "site delete" command is registered.
    $ wp cli has-command "site delete"
    $ echo $?
    0

    # The "foo bar" command is not registered.
    $ wp cli has-command "foo bar"
    $ echo $?
    1

    # Install a WP-CLI package if not already installed
    $ if ! $(wp cli has-command doctor); then wp package install wp-cli/doctor-command; fi
    Installing package wp-cli/doctor-command (dev-main || dev-master || dev-trunk)
    Updating /home/person/.wp-cli/packages/composer.json to require the package...
    Using Composer to install the package...
    ---
    Success: Package installed.


