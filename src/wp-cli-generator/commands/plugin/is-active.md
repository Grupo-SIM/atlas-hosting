# wp plugin is-active

Checks if a given plugin is active.

Returns exit code 0 when active, 1 when not active.

### OPTIONS

<plugin>
: The plugin to check.

[--network]
: If set, check if plugin is network-activated.

### EXAMPLES

    # Check whether plugin is Active; exit status 0 if active, otherwise 1
    $ wp plugin is-active hello
    $ echo $?
    1


