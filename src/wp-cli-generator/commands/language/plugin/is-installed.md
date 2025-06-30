# wp language plugin is-installed

Checks if a given language is installed.

Returns exit code 0 when installed, 1 when uninstalled.

### OPTIONS

<plugin>
: Plugin to check for.

<language>...
: The language code to check.

### EXAMPLES

    # Check whether the German language is installed for Akismet; exit status 0 if installed, otherwise 1.
    $ wp language plugin is-installed akismet de_DE
    $ echo $?
    1


