# wp theme is-installed

Checks if a given theme is installed.

Returns exit code 0 when installed, 1 when uninstalled.

### OPTIONS

<theme>
: The theme to check.

### EXAMPLES

    # Check whether theme is installed; exit status 0 if installed, otherwise 1
    $ wp theme is-installed hello
    $ echo $?
    1


